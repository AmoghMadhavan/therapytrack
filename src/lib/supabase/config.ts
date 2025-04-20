import CryptoJS from 'crypto-js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get environment variables or use fallback values
// Handle environment variables safely
// @ts-ignore -- Ignoring import.meta.env TypeScript error as it's injected by Vite at build time
const env = typeof import.meta.env !== 'undefined' ? import.meta.env : {};
const supabaseUrl = (env as any).VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = (env as any).VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Encryption functions for session storage
const encryptSessionData = (data: string): string => {
  try {
    const encryptionKey = (env as any).VITE_ENCRYPTION_SECRET || 'fallback-encryption-key';
    return CryptoJS.AES.encrypt(data, encryptionKey).toString();
  } catch (error) {
    console.error('[STORAGE] Encryption error:', error);
    return data; // Fallback to unencrypted on error
  }
};

const decryptSessionData = (encryptedData: string): string => {
  try {
    const encryptionKey = (env as any).VITE_ENCRYPTION_SECRET || 'fallback-encryption-key';
    const decrypted = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('[STORAGE] Decryption error:', error);
    return ''; // Return empty string on decryption failure
  }
};

// Custom encrypted storage implementation
const encryptedStorage = {
  getItem: (key: string): string | null => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      return decryptSessionData(item);
    } catch (error) {
      console.error('[STORAGE] getItem error:', error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      const encrypted = encryptSessionData(value);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('[STORAGE] setItem error:', error);
      // Fallback to unencrypted storage in case of error
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.error('[STORAGE] Fallback setItem error:', e);
      }
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('[STORAGE] removeItem error:', error);
    }
  }
};

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
      storage: isLocalStorageAvailable() ? encryptedStorage : undefined,
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
      schema: 'public' as const
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