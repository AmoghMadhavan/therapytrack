import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get environment variables or use fallback values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Check if localStorage is available (handles SSR environments)
const isLocalStorageAvailable = () => {
  try {
    const testKey = '__supabase_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.warn('[SUPABASE] localStorage is not available:', e);
    return false;
  }
};

// Initialize Supabase client with enhanced auth options
let supabase: SupabaseClient;

try {
  // Configure client with explicit authentication options
  const options = {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: isLocalStorageAvailable() ? localStorage : undefined,
      storageKey: 'therapytrack_supabase_auth',
      flowType: 'pkce' as const, // More secure authentication flow
      debug: process.env.NODE_ENV === 'development' // Enable auth debugging in development
    },
    global: {
      fetch: fetch.bind(globalThis) // Ensure fetch is properly bound
    },
    // Set reasonable timeouts
    realtime: {
      timeout: 60000 // 60 seconds
    },
    // Better error handling
    db: {
      schema: 'public'
    }
  };
  
  console.log('[SUPABASE] Creating client with production-ready auth options');
  
  // Create the client
  supabase = createClient(
    supabaseUrl || 'https://htxyguarhbgtethhptvr.supabase.co', 
    supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eHlndWFyaGJndGV0aGhwdHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0OTcwMjUsImV4cCI6MjA2MDA3MzAyNX0.Cit7sdMgHzQULokJ9qtMt-RgKcQwIodemaXGNODv258',
    options
  );
  
  // Verify session in development mode
  if (process.env.NODE_ENV === 'development') {
    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (error) {
          console.error('[SUPABASE] Session check failed:', error.message, error);
        } else {
          console.log(
            '[SUPABASE] Session check:',
            data.session ? `Active session found for user ${data.session.user.id}` : 'No active session'
          );
          if (data.session) {
            console.log('[SUPABASE] Session expires at:', new Date(data.session.expires_at! * 1000).toLocaleString());
          }
        }
      })
      .catch(err => {
        console.error('[SUPABASE] Failed to check session:', err);
      });

    // Listen for auth changes in development
    supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[SUPABASE] Auth state changed: ${event}`, session ? `User: ${session.user.id}` : 'No session');
    });
  }
} catch (error) {
  console.error('[SUPABASE] Failed to initialize client:', error);
  // Create a fallback client that will fail gracefully
  supabase = createClient('https://placeholder.supabase.co', 'placeholder');
}

// Export the initialized client
export { supabase }; 