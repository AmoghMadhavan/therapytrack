#!/usr/bin/env node

/*
 * Dummy Data Cleanup Script for TherapyTrack
 * 
 * This script:
 * 1. Removes dummy clients that might be causing issues
 * 2. Reports removed items
 * 
 * Note: Must have proper Supabase credentials in environment variables:
 * - REACT_APP_SUPABASE_URL
 * - REACT_APP_SUPABASE_ANON_KEY
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const readline = require('readline');

// Load environment variables from .env file
dotenv.config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('\x1b[31mError: Missing Supabase credentials in environment variables.\x1b[0m');
  console.error('Please ensure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Main function to clean dummy data
async function cleanDummyData() {
  console.log('\x1b[34m=========================================\x1b[0m');
  console.log('\x1b[34m TherapyTrack Dummy Data Cleanup Script \x1b[0m');
  console.log('\x1b[34m=========================================\x1b[0m');
  
  // Verify Supabase connection
  console.log('\nVerifying Supabase connection...');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error(`\x1b[31mConnection error: ${error.message}\x1b[0m`);
      process.exit(1);
    }
    console.log('\x1b[32mConnection successful!\x1b[0m');
  } catch (error) {
    console.error(`\x1b[31mUnexpected connection error: ${error.message}\x1b[0m`);
    process.exit(1);
  }
  
  // Ask for confirmation before proceeding
  rl.question('\n\x1b[33mWARNING: This will delete all dummy clients and their related data.\nAre you sure you want to proceed? (yes/no): \x1b[0m', async (answer) => {
    if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
      console.log('\nCleanup cancelled.');
      rl.close();
      return;
    }
    
    try {
      // Step 1: Find all dummy clients
      console.log('\nSearching for dummy clients...');
      const { data: dummyClients, error: clientsError } = await supabase
        .from('clients')
        .select('id, first_name, last_name, therapist_id')
        .or('first_name.ilike.%dummy%,last_name.ilike.%dummy%,notes.ilike.%dummy%,notes.ilike.%test%');
        
      if (clientsError) {
        console.error(`\x1b[31mError querying clients: ${clientsError.message}\x1b[0m`);
        rl.close();
        return;
      }
      
      if (!dummyClients || dummyClients.length === 0) {
        console.log('\x1b[32mNo dummy clients found!\x1b[0m');
        rl.close();
        return;
      }
      
      console.log(`\nFound ${dummyClients.length} dummy clients:`);
      dummyClients.forEach((client, index) => {
        console.log(`${index + 1}. ${client.first_name} ${client.last_name} (ID: ${client.id})`);
      });
      
      // Step 2: Delete tasks associated with dummy clients
      console.log('\nDeleting tasks associated with dummy clients...');
      const clientIds = dummyClients.map(client => client.id);
      
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .in('client_id', clientIds);
        
      if (tasksError) {
        console.error(`\x1b[31mError deleting tasks: ${tasksError.message}\x1b[0m`);
      } else {
        console.log('\x1b[32mAssociated tasks deleted successfully.\x1b[0m');
      }
      
      // Step 3: Delete goals associated with dummy clients
      console.log('\nDeleting goals associated with dummy clients...');
      const { error: goalsError } = await supabase
        .from('goals')
        .delete()
        .in('client_id', clientIds);
        
      if (goalsError) {
        console.error(`\x1b[31mError deleting goals: ${goalsError.message}\x1b[0m`);
      } else {
        console.log('\x1b[32mAssociated goals deleted successfully.\x1b[0m');
      }
      
      // Step 4: Delete sessions associated with dummy clients
      console.log('\nDeleting sessions associated with dummy clients...');
      const { error: sessionsError } = await supabase
        .from('sessions')
        .delete()
        .in('client_id', clientIds);
        
      if (sessionsError) {
        console.error(`\x1b[31mError deleting sessions: ${sessionsError.message}\x1b[0m`);
      } else {
        console.log('\x1b[32mAssociated sessions deleted successfully.\x1b[0m');
      }
      
      // Step 5: Finally, delete the dummy clients
      console.log('\nDeleting dummy clients...');
      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .in('id', clientIds);
        
      if (deleteError) {
        console.error(`\x1b[31mError deleting clients: ${deleteError.message}\x1b[0m`);
      } else {
        console.log(`\x1b[32mSuccessfully deleted ${dummyClients.length} dummy clients!\x1b[0m`);
      }
      
      console.log('\n\x1b[34m=========================================\x1b[0m');
      console.log('\x1b[32m Cleanup completed successfully! \x1b[0m');
      console.log('\x1b[34m=========================================\x1b[0m');
      
    } catch (error) {
      console.error(`\x1b[31mUnexpected error: ${error.message}\x1b[0m`);
    } finally {
      rl.close();
    }
  });
}

// Handle readline close
rl.on('close', () => {
  console.log('\nExiting...');
  process.exit(0);
});

// Run the main function
cleanDummyData(); 