const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to get Supabase credentials
function getCredentials() {
  console.log('Enter your Supabase credentials:');
  
  return new Promise((resolve) => {
    rl.question('Supabase URL: ', (supabaseUrl) => {
      rl.question('Supabase service role key: ', (supabaseServiceKey) => {
        resolve({
          supabaseUrl,
          supabaseServiceKey
        });
      });
    });
  });
}

// Function to check table schema
async function checkTableSchema(client, tableName) {
  try {
    console.log(`\nChecking schema for table: ${tableName}`);
    
    // Get table columns
    const { data: columns, error: columnsError } = await client
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (columnsError) {
      console.error(`Error fetching ${tableName} schema:`, columnsError.message);
      return;
    }
    
    if (columns && columns.length > 0) {
      console.log(`\nColumns in ${tableName}:`);
      const sample = columns[0];
      Object.keys(sample).forEach(column => {
        const value = sample[column];
        const type = typeof value;
        console.log(`- ${column}: ${type} ${value instanceof Array ? '(array)' : ''} ${value instanceof Object && !Array.isArray(value) ? '(object)' : ''}`);
      });
    } else {
      console.log(`No data found in ${tableName} to determine schema.`);
    }
    
    // Check if RLS is enabled
    const checkRlsQuery = `
      SELECT relrowsecurity
      FROM pg_class
      JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
      WHERE pg_namespace.nspname = 'public'
      AND pg_class.relname = '${tableName}';
    `;
    
    try {
      // This is a direct SQL query which might not work in all environments
      // We'll use error handling to gracefully handle this
      const { data: rlsData, error: rlsError } = await client.rpc('pg_query', { query: checkRlsQuery });
      
      if (!rlsError && rlsData) {
        console.log(`\nRow Level Security for ${tableName}: ${rlsData.relrowsecurity ? 'Enabled' : 'Disabled'}`);
      }
    } catch (e) {
      console.log(`\nUnable to check RLS status for ${tableName} directly.`);
    }
    
    // Check for policies
    console.log(`\nNote: To check RLS policies, you'll need to use the Supabase dashboard's SQL editor.`);
  } catch (error) {
    console.error(`Error checking ${tableName} schema:`, error.message);
  }
}

async function main() {
  try {
    const credentials = await getCredentials();
    
    // Create a Supabase client with service role key (needed for admin operations)
    const serviceClient = createClient(credentials.supabaseUrl, credentials.supabaseServiceKey);
    
    // Check schemas for HIPAA-related tables
    await checkTableSchema(serviceClient, 'user_preferences');
    await checkTableSchema(serviceClient, 'activity_logs');
    
    console.log(`\n----- SECURITY RECOMMENDATION -----`);
    console.log(`To secure your tables for HIPAA compliance, run the RLS-only script in your Supabase SQL editor.`);
    
    rl.close();
  } catch (error) {
    console.error('Error:', error.message);
    rl.close();
  }
}

main(); 