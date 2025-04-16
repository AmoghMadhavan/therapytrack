/*
 * Database Reset Utility
 * 
 * This script drops all tables and recreates them from scratch using the initial migration script.
 * WARNING: This will delete all data in your database.
 * 
 * To use this script:
 * 1. Make sure your .env file has REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY set
 * 2. Run: node scripts/reset-database.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Check for required environment variables
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('\x1b[31mERROR: Missing Supabase credentials in .env file\x1b[0m');
  console.error('Make sure your .env file has:');
  console.error('  REACT_APP_SUPABASE_URL=your-supabase-url');
  console.error('  REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// SQL to drop all tables
const dropTablesSQL = `
-- Disable triggers temporarily
SET session_replication_role = 'replica';

-- Drop tables if they exist
DROP TABLE IF EXISTS public.session_attachments CASCADE;
DROP TABLE IF EXISTS public.task_attachments CASCADE;
DROP TABLE IF EXISTS public.message_attachments CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.goals CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.therapists CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Re-enable triggers
SET session_replication_role = 'origin';
`;

// Function to execute SQL
async function executeSQL(sql, description) {
  console.log(`\nAttempting to ${description}...`);
  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error(`\x1b[31mError: ${error.message}\x1b[0m`);
      return false;
    }
    
    console.log(`\x1b[32mSuccess: ${description}\x1b[0m`);
    return true;
  } catch (error) {
    console.error(`\x1b[31mError: ${error.message}\x1b[0m`);
    return false;
  }
}

// Main function
async function resetDatabase() {
  console.log('\x1b[34m=================================\x1b[0m');
  console.log('\x1b[34mTherapyTrack Database Reset Tool\x1b[0m');
  console.log('\x1b[34m=================================\x1b[0m');
  console.log('\x1b[31mWARNING: This will delete all data in your database!\x1b[0m');
  
  // Prompt for confirmation in terminal
  process.stdout.write('\nAre you sure you want to proceed? (yes/no): ');
  process.stdin.once('data', async (data) => {
    const answer = data.toString().trim().toLowerCase();
    
    if (answer !== 'yes' && answer !== 'y') {
      console.log('\nDatabase reset cancelled.');
      process.exit(0);
    }
    
    // Check connection to Supabase
    console.log('\nTesting connection to Supabase...');
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error(`\x1b[31mConnection error: ${error.message}\x1b[0m`);
        process.exit(1);
      }
      
      console.log('\x1b[32mConnection successful!\x1b[0m');
      
      // Create exec_sql function if it doesn't already exist
      const createExecSqlFunction = `
      CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
      RETURNS void AS $$
      BEGIN
        EXECUTE sql_query;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
      `;
      
      // Create the exec_sql function
      console.log('\nCreating exec_sql helper function...');
      
      try {
        const { error: execSqlError } = await supabase.rpc(
          'exec_sql', 
          { sql_query: createExecSqlFunction }
        );
        
        if (execSqlError) {
          console.error('\x1b[31mError creating exec_sql function. This might require superuser privileges.\x1b[0m');
          console.error('\x1b[31mPlease run the SQL reset script directly in the Supabase SQL Editor\x1b[0m');
          process.exit(1);
        }
      } catch (error) {
        console.log('Function might not exist yet, trying direct SQL...');
        // If we get here, the function might not exist yet
        const { error: directError } = await supabase.rpc('exec_sql', { 
          sql_query: createExecSqlFunction 
        }).catch(() => ({ error: null }));
        
        if (directError) {
          console.error('\x1b[31mError creating exec_sql function. This might require superuser privileges.\x1b[0m');
          console.error('\x1b[31mPlease run the SQL reset script directly in the Supabase SQL Editor\x1b[0m');
          process.exit(1);
        }
      }
      
      // Drop all tables
      const droppedTables = await executeSQL(dropTablesSQL, 'drop all tables');
      
      if (!droppedTables) {
        console.error('\x1b[31mFailed to drop tables. You may need to run the SQL manually in the Supabase SQL Editor.\x1b[0m');
        console.log('\x1b[33mHere is the SQL to drop all tables:\x1b[0m');
        console.log(dropTablesSQL);
        process.exit(1);
      }
      
      // Read the initial migration SQL file
      let initialMigrationSQL;
      try {
        initialMigrationSQL = fs.readFileSync(
          path.join(__dirname, '..', 'supabase', 'migrations', '20230101000000_initial_schema.sql'), 
          'utf8'
        );
        console.log('\x1b[32mSuccessfully read initial migration file\x1b[0m');
      } catch (error) {
        console.error('\x1b[31mError reading migration file:\x1b[0m', error.message);
        console.log('\x1b[33mYou will need to run the initial migration SQL manually in the Supabase SQL Editor.\x1b[0m');
        process.exit(1);
      }
      
      // Apply the initial migration
      const appliedMigration = await executeSQL(initialMigrationSQL, 'apply initial migration');
      
      if (!appliedMigration) {
        console.error('\x1b[31mFailed to apply initial migration. You may need to run the SQL manually in the Supabase SQL Editor.\x1b[0m');
        process.exit(1);
      }
      
      console.log('\n\x1b[34m=================================\x1b[0m');
      console.log('\x1b[32mDatabase reset complete!\x1b[0m');
      console.log('\x1b[34m=================================\x1b[0m');
      
    } catch (error) {
      console.error(`\x1b[31mUnexpected error: ${error.message}\x1b[0m`);
    }
    
    process.exit(0);
  });
}

// Run the main function
resetDatabase(); 