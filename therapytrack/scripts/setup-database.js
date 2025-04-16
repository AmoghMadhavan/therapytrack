/*
 * Database Setup Utility
 * 
 * This script helps set up the required tables in Supabase for TherapyTrack.
 * 
 * To use this script:
 * 1. Make sure your .env file has REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY set
 * 2. Run: node scripts/setup-database.js
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

// SQL statements for creating tables
const createProfilesTable = `
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'therapist',
  phone_number TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_tier TEXT DEFAULT 'basic',
  subscription_status TEXT DEFAULT 'trial',
  subscription_expiry TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- Set up RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist (this requires checking)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile" 
      ON public.profiles FOR SELECT 
      USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile" 
      ON public.profiles FOR UPDATE 
      USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile" 
      ON public.profiles FOR INSERT 
      WITH CHECK (auth.uid() = id);
  END IF;
END
$$;
`;

const createClientsTable = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  therapist_id UUID REFERENCES auth.users(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth TIMESTAMP WITH TIME ZONE,
  gender TEXT,
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_session_date TIMESTAMP WITH TIME ZONE
);

-- Set up RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create policy if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Therapists can CRUD their own clients'
  ) THEN
    CREATE POLICY "Therapists can CRUD their own clients" 
      ON public.clients FOR ALL 
      USING (auth.uid() = therapist_id);
  END IF;
END
$$;
`;

const createSessionsTable = `
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  therapist_id UUID REFERENCES auth.users(id) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'scheduled',
  location TEXT NOT NULL DEFAULT 'telehealth',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Create policy if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'sessions' AND policyname = 'Therapists can CRUD their own sessions'
  ) THEN
    CREATE POLICY "Therapists can CRUD their own sessions" 
      ON public.sessions FOR ALL 
      USING (auth.uid() = therapist_id);
  END IF;
END
$$;
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

// Function to check if a table exists
async function checkTable(tableName) {
  console.log(`\nChecking if table '${tableName}' exists...`);
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
      
    if (error) {
      if (error.code === '42P01') { // Table doesn't exist error
        console.log(`\x1b[33mTable '${tableName}' does not exist\x1b[0m`);
        return false;
      } else {
        console.error(`\x1b[31mError checking table '${tableName}': ${error.message}\x1b[0m`);
      }
    } else {
      console.log(`\x1b[32mTable '${tableName}' exists\x1b[0m`);
      return true;
    }
  } catch (error) {
    console.error(`\x1b[31mError checking table '${tableName}': ${error.message}\x1b[0m`);
  }
  
  return false;
}

// Main function
async function setupDatabase() {
  console.log('\x1b[34m=================================\x1b[0m');
  console.log('\x1b[34mTherapyTrack Database Setup Tool\x1b[0m');
  console.log('\x1b[34m=================================\x1b[0m');
  
  // Check connection to Supabase
  console.log('\nTesting connection to Supabase...');
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error(`\x1b[31mConnection error: ${error.message}\x1b[0m`);
      return;
    }
    
    console.log('\x1b[32mConnection successful!\x1b[0m');
    
    // Check and create tables if they don't exist
    const profilesExists = await checkTable('profiles');
    const clientsExists = await checkTable('clients');
    const sessionsExists = await checkTable('sessions');
    
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
    const { error: execSqlError } = await supabase.rpc(
      'exec_sql', 
      { sql_query: createExecSqlFunction }
    ).catch(() => {
      // If the function doesn't exist yet, this will fail, which is expected
      return { error: null };
    });
    
    // We'll try to create the function directly
    if (execSqlError) {
      console.log('Creating exec_sql function directly...');
      const { error: directError } = await supabase.rpc('exec_sql', { 
        sql_query: createExecSqlFunction 
      });
      
      if (directError) {
        console.error('\x1b[31mError creating exec_sql function. This might require superuser privileges.\x1b[0m');
        console.error('\x1b[31mPlease run the SQL setup script directly in the Supabase SQL Editor\x1b[0m');
        return;
      }
    }
    
    // Create tables if they don't exist
    if (!profilesExists) {
      await executeSQL(createProfilesTable, 'create profiles table');
    }
    
    if (!clientsExists) {
      await executeSQL(createClientsTable, 'create clients table');
    }
    
    if (!sessionsExists) {
      await executeSQL(createSessionsTable, 'create sessions table');
    }
    
    console.log('\n\x1b[34m=================================\x1b[0m');
    console.log('\x1b[32mDatabase setup complete!\x1b[0m');
    console.log('\x1b[34m=================================\x1b[0m');
    
    // Final messages
    if (!profilesExists || !clientsExists || !sessionsExists) {
      console.log('\nIf there were any errors, please run the SQL statements manually in the Supabase SQL Editor.');
      console.log('You can find the statements in the file: src/lib/supabase/setupFunctions.sql');
    }
    
  } catch (error) {
    console.error(`\x1b[31mUnexpected error: ${error.message}\x1b[0m`);
  }
}

// Run the main function
setupDatabase(); 