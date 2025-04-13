import { createClient } from '@supabase/supabase-js';

// Supabase configuration
let supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
let supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// More detailed logging for debugging
console.log('=============================================');
console.log('Supabase Initialization');
console.log('=============================================');
console.log('Environment:', process.env.NODE_ENV);
console.log('Supabase URL:', supabaseUrl ? supabaseUrl : 'MISSING');
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Key exists (not shown)' : 'MISSING');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL ERROR: Supabase configuration is missing!');
  console.error('Please ensure your .env file contains REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY');
  // Instead of failing silently, use hardcoded development values if in development mode
  if (process.env.NODE_ENV === 'development') {
    console.warn('Using hardcoded values for development. DO NOT USE IN PRODUCTION!');
    // Use the values from your .env file that you showed me
    if (!supabaseUrl) {
      supabaseUrl = 'https://htxyguarhbgtethhptvr.supabase.co';
      console.log('Using fallback Supabase URL for development');
    }
    if (!supabaseAnonKey) {
      supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eHlndWFyaGJndGV0aGhwdHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0OTcwMjUsImV4cCI6MjA2MDA3MzAyNX0.Cit7sdMgHzQULokJ9qtMt-RgKcQwIodemaXGNODv258';
      console.log('Using fallback Supabase Anon Key for development');
    }
  }
}

// Initialize Supabase client
console.log('Initializing Supabase client...');
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log('Supabase client initialized');
console.log('============================================='); 