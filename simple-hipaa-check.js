#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Define critical tables for HIPAA compliance
const CRITICAL_TABLES = ['user_preferences', 'activity_logs'];

async function getCredentials() {
  console.log('HIPAA Compliance Check - Credentials Required');
  console.log('You can find these in your Supabase project settings > API\n');
  
  return new Promise((resolve) => {
    rl.question('Enter your Supabase URL: ', (supabaseUrl) => {
      rl.question('Enter your Supabase anon key: ', (anonKey) => {
        rl.question('Enter your Supabase service role key: ', (serviceKey) => {
          resolve({ supabaseUrl, anonKey, serviceKey });
        });
      });
    });
  });
}

async function checkTableExists(supabase, tableName) {
  try {
    // Use SQL query to check if table exists
    const { data, error } = await supabase.rpc('check_table_exists', { table_name: tableName })
      .catch(async () => {
        // If the function doesn't exist, use direct query instead
        const { data, error } = await supabase.from(tableName)
          .select('*')
          .limit(1);
        
        return { data, error };
      });
    
    return !error || (error.code !== '42P01'); // Not a "relation does not exist" error
  } catch (error) {
    console.log(`Error checking if table ${tableName} exists:`, error.message);
    return false;
  }
}

async function checkRlsEnabled(supabase, tableName) {
  try {
    // Direct SQL query to check RLS status
    const { data, error } = await supabase.rpc('execute_sql', { 
      sql_query: `
        SELECT relrowsecurity
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = '${tableName}';
      `
    }).catch(async () => {
      // Fallback to another method
      return { data: null, error: new Error('RPC method not available') };
    });
    
    if (!error && data && data[0]) {
      return data[0].relrowsecurity === true;
    }
    
    // If direct query fails, use the test method
    return await testAnonymousAccess(tableName, supabase.supabaseUrl, supabase.supabaseKey);
  } catch (error) {
    console.log(`Error checking RLS for ${tableName}:`, error.message);
    return false;
  }
}

async function testAnonymousAccess(tableName, supabaseUrl, anonKey) {
  try {
    // Create a client with anonymous key
    const anonClient = createClient(supabaseUrl, anonKey);
    
    // Try to access data as anonymous user
    const { data, error } = await anonClient
      .from(tableName)
      .select('*')
      .limit(1);
    
    // If we get permission denied error, RLS is working
    if (error && (
      error.code === 'PGRST301' || 
      error.message.includes('permission denied') || 
      error.message.includes('Policies evaluation failed')
    )) {
      return { 
        protected: true,
        error: error.message
      };
    }
    
    // If no error or other error, RLS is not working properly
    return {
      protected: false,
      error: error ? error.message : null
    };
  } catch (error) {
    console.log(`Error testing anonymous access for ${tableName}:`, error.message);
    return { 
      protected: false,
      error: error.message
    };
  }
}

async function simplifiedHipaaCheck(supabaseUrl, anonKey, serviceKey) {
  console.log('\n========= SIMPLIFIED HIPAA COMPLIANCE CHECK =========');
  console.log('Testing anonymous access to sensitive tables...\n');
  
  const serviceClient = createClient(supabaseUrl, serviceKey);
  const anonClient = createClient(supabaseUrl, anonKey);
  
  let allTablesSafe = true;
  
  for (const tableName of CRITICAL_TABLES) {
    console.log(`Checking table: ${tableName}`);
    
    // Check if table exists (using service role which has access to all tables)
    const tableExists = await checkTableExists(serviceClient, tableName);
    console.log(`  Table exists: ${tableExists ? '✅ YES' : '❌ NO'}`);
    
    if (!tableExists) {
      console.log(`  ❌ Table '${tableName}' does not exist - create it for HIPAA compliance\n`);
      allTablesSafe = false;
      continue;
    }
    
    // Test anonymous access directly
    try {
      const { data, error } = await anonClient
        .from(tableName)
        .select('*')
        .limit(1);
      
      // Check if protected
      const isProtected = error && (
        error.code === 'PGRST301' || 
        error.message.includes('permission denied') ||
        error.message.includes('policy')
      );
      
      console.log(`  Protected from anonymous access: ${isProtected ? '✅ YES' : '❌ NO'}`);
      
      if (!isProtected) {
        console.log(`  ❌ Anonymous users can access ${tableName} - this is a HIPAA violation!`);
        allTablesSafe = false;
      } else {
        console.log(`  ✅ Table has proper access controls`);
      }
    } catch (error) {
      console.log(`  Error testing access to ${tableName}:`, error.message);
      allTablesSafe = false;
    }
    
    console.log('');
  }
  
  // Summary
  console.log('========= COMPLIANCE SUMMARY =========');
  if (allTablesSafe) {
    console.log('✅ Tables appear to be protected from unauthorized access.');
    console.log('✅ Basic HIPAA data access controls are in place.');
  } else {
    console.log('❌ Some tables are not properly protected.');
    console.log('❌ Your database may not meet HIPAA compliance requirements.');
    console.log('\nRecommendation:');
    console.log('Run the improved-rls-fix.sql script in your Supabase SQL editor');
    console.log('to automatically configure HIPAA-compliant RLS settings.');
  }
  
  console.log('\nNote: This is a basic check. Full HIPAA compliance requires:');
  console.log('- Additional administrative safeguards');
  console.log('- Complete access logging');
  console.log('- Encryption in transit and at rest');
  console.log('- Regular security assessments');
}

async function main() {
  try {
    console.log('Simplified HIPAA Compliance Test');
    
    const { supabaseUrl, anonKey, serviceKey } = await getCredentials();
    await simplifiedHipaaCheck(supabaseUrl, anonKey, serviceKey);
    
  } catch (error) {
    console.error('Error during compliance check:', error.message);
  } finally {
    rl.close();
  }
}

main(); 