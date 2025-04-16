import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get environment variables or use fallbacks for development
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Less verbose logging in production
if (process.env.NODE_ENV === 'development') {
  console.log('[SUPABASE] URL:', supabaseUrl ? 'Configured' : 'MISSING');
  console.log('[SUPABASE] Anon Key:', supabaseAnonKey ? 'Configured' : 'MISSING');
}

// Use fallback values for development if needed
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[SUPABASE] Configuration missing.');
  
  // Hardcoded values for development ONLY
  if (process.env.NODE_ENV === 'development') {
    console.warn('[SUPABASE] Using fallback values for development');
  }
}

// Ensure localStorage is available
const isLocalStorageAvailable = () => {
  try {
    const testKey = '__test_storage__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.error('[SUPABASE] localStorage not available:', e);
    return false;
  }
};

// Create a custom storage implementation with better error handling
const createCustomStorage = () => {
  // Check if localStorage is available
  if (!isLocalStorageAvailable()) {
    // Return a memory-based implementation if localStorage isn't available
    const memoryStorage: Record<string, string> = {};
    return {
      getItem: (key: string) => memoryStorage[key] || null,
      setItem: (key: string, value: string) => { memoryStorage[key] = value },
      removeItem: (key: string) => { delete memoryStorage[key] }
    };
  }

  // Use localStorage with error handling
  return {
    getItem: (key: string) => {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.error('[SUPABASE] Error getting item from localStorage', e);
        return null;
      }
    },
    setItem: (key: string, value: string) => {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.error('[SUPABASE] Error setting item in localStorage', e);
      }
    },
    removeItem: (key: string) => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error('[SUPABASE] Error removing item from localStorage', e);
      }
    }
  };
};

// Initialize Supabase client with auto-refresh sessions
let supabase: SupabaseClient;

try {
  // Configure client with all authentication options explicitly set
  const customStorage = createCustomStorage();
  
  const options = {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: customStorage,
      storageKey: 'therapytrack_supabase_auth', // Custom storage key for easier debugging
      flowType: 'pkce' as const // More secure authentication flow
    },
    global: {
      fetch: fetch.bind(globalThis) // Ensure fetch is properly bound
    },
    // Set reasonable timeouts
    realtime: {
      timeout: 60000 // 60 seconds
    },
    // Improve default headers to avoid CORS issues
    headers: {
      'X-Client-Info': 'supabase-js/2.43.0'
    }
  };
  
  console.log('[SUPABASE] Creating client with enhanced auth options');
  
  // Create the client
  supabase = createClient(
    supabaseUrl || 'https://htxyguarhbgtethhptvr.supabase.co', 
    supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eHlndWFyaGJndGV0aGhwdHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0OTcwMjUsImV4cCI6MjA2MDA3MzAyNX0.Cit7sdMgHzQULokJ9qtMt-RgKcQwIodemaXGNODv258',
    options
  );
  
  // Only verify in development mode
  if (process.env.NODE_ENV === 'development') {
    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (error) {
          console.error('[SUPABASE] Session check failed:', error.message);
        } else {
          console.log('[SUPABASE] Session check:', data.session ? 'Active session found' : 'No active session');
        }
      })
      .catch(err => {
        console.error('[SUPABASE] Failed to check session:', err);
      });
  }
} catch (error) {
  console.error('[SUPABASE] Failed to initialize client:', error);
  // Create a fallback client that will fail gracefully
  supabase = createClient('https://placeholder.supabase.co', 'placeholder');
}

// Export the initialized client
export { supabase }; 