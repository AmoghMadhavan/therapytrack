import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get environment variables or use fallbacks for development
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Database schema configuration
export const DB_SCHEMA = 'therapy';

// Table name utility function
export const tableFrom = (tableName: string) => `${DB_SCHEMA}.${tableName}`;

// Less verbose logging in production
if (process.env.NODE_ENV === 'development') {
  console.log('[SUPABASE] URL:', supabaseUrl ? 'Configured' : 'MISSING');
  console.log('[SUPABASE] Anon Key:', supabaseAnonKey ? 'Configured' : 'MISSING');
  console.log('[SUPABASE] Using database schema:', DB_SCHEMA);
}

// Use fallback values for development if needed
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[SUPABASE] Configuration missing.');
  
  // Hardcoded values for development ONLY
  if (process.env.NODE_ENV === 'development') {
    console.warn('[SUPABASE] Using fallback values for development');
  }
}

// Initialize Supabase client with standard configuration
let supabase: SupabaseClient;

try {
  // Basic configuration that should work reliably
  const options = {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  };
  
  console.log('[SUPABASE] Creating client with standard options');
  
  // Create the client
  supabase = createClient(
    supabaseUrl || 'https://htxyguarhbgtethhptvr.supabase.co', 
    supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eHlndWFyaGJndGV0aGhwdHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0OTcwMjUsImV4cCI6MjA2MDA3MzAyNX0.Cit7sdMgHzQULokJ9qtMt-RgKcQwIodemaXGNODv258',
    options
  );
  
  // Check session in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('[SUPABASE] Verifying client setup');
  }
} catch (error) {
  console.error('[SUPABASE] Failed to initialize client:', error);
  // Create a fallback client that will fail gracefully
  supabase = createClient('https://placeholder.supabase.co', 'placeholder');
}

// Export the initialized client
export { supabase }; 