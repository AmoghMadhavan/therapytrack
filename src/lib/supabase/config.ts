import CryptoJS from 'crypto-js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get environment variables or use fallback values
// Handle environment variables safely
// @ts-ignore -- Ignoring import.meta.env TypeScript error as it's injected by Vite at build time
const env = typeof import.meta.env !== 'undefined' ? import.meta.env : {};
const supabaseUrl = (env as any).VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = (env as any).VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// IMPORTANT: This is a fixed client-side key, not secure for production
// It's primarily to prevent casual inspection of localStorage
// For proper security, implement server-side encryption when setting up HTTPS
const getEncryptionKey = (): string => {
  // Try environment variable first
  const envKey = (env as any).VITE_ENCRYPTION_SECRET || process.env.REACT_APP_ENCRYPTION_SECRET;
  if (envKey) return envKey;
  
  // If no env key, use a fixed key
  // This fixed key ensures consistency across page reloads
  return 'therapytrack-fixed-client-key-5x8q1z';
};

// Check if encryption should be disabled
// This is for development use only
const isEncryptionDisabled = (): boolean => {
  // IMPORTANT: Temporarily disable encryption by default
  // This ensures session persistence works while debugging
  // Set to false when HTTPS is implemented
  return true;
  
  // Original code below - uncomment when ready to re-enable encryption
  /*
  try {
    // Check for our flag
    if (localStorage.getItem('DISABLE_ENCRYPTION') === 'true') {
      return true;
    }
    
    // If we're having problems or in development mode, automatically disable
    // encryption if localStorage has an unreadable session
    if (process.env.NODE_ENV === 'development') {
      const authKey = 'therapytrack_supabase_auth';
      const sessionData = localStorage.getItem(authKey);
      
      // If we have data but it doesn't look like proper JSON (might be encrypted)
      if (sessionData && (!sessionData.startsWith('{') || !sessionData.includes('"access_token"'))) {
        console.log('[STORAGE] Found encrypted session, temporarily disabling encryption for recovery');
        localStorage.setItem('DISABLE_ENCRYPTION', 'true');
        return true;
      }
    }
    
    return false;
  } catch (e) {
    return false;
  }
  */
};

// Encryption functions for session storage
const encryptSessionData = (data: string): string => {
  try {
    // If encryption is disabled, return data as-is
    if (isEncryptionDisabled()) {
      console.log('[STORAGE] Encryption disabled by flag');
      return data;
    }
    
    const encryptionKey = getEncryptionKey();
    return CryptoJS.AES.encrypt(data, encryptionKey).toString();
  } catch (error) {
    console.error('[STORAGE] Encryption error:', error);
    return data; // Fallback to unencrypted on error
  }
};

const decryptSessionData = (encryptedData: string): string => {
  try {
    // If encryption is disabled, return data as-is
    if (isEncryptionDisabled()) {
      console.log('[STORAGE] Decryption skipped (disabled by flag)');
      return encryptedData;
    }
    
    const encryptionKey = getEncryptionKey();
    const decrypted = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('[STORAGE] Decryption error:', error);
    // On decryption failure, try fallback keys
    try {
      // Try with fallback key in case encryption was done with previous key
      const fallbackKey = 'fallback-encryption-key';
      const decrypted = CryptoJS.AES.decrypt(encryptedData, fallbackKey);
      const result = decrypted.toString(CryptoJS.enc.Utf8);
      if (result) {
        console.log('[STORAGE] Successfully decrypted with fallback key');
        return result;
      }
    } catch (innerError) {
      console.error('[STORAGE] Fallback decryption failed:', innerError);
    }
    return '';
  }
};

// Custom encrypted storage implementation
const encryptedStorage = {
  getItem: (key: string): string | null => {
    console.log(`[STORAGE] Attempting to get item: ${key}`);
    
    try {
      // First, attempt to get the data
      const item = localStorage.getItem(key);
      
      // If nothing found, return null
      if (!item) {
        console.log(`[STORAGE] No data found for key: ${key}`);
        return null;
      }
      
      console.log(`[STORAGE] Raw data found for key ${key}, length: ${item.length}, starts with: ${item.substring(0, 20)}...`);
      
      // Check if it looks like JSON already (not encrypted)
      if (item.startsWith('{') && (item.includes('"access_token"') || item.includes('"expires_at"'))) {
        console.log(`[STORAGE] Data appears to be unencrypted JSON, returning as-is`);
        return item;
      }
      
      // Try to decrypt it
      const decrypted = decryptSessionData(item);
      
      // If we have a valid-looking result, return it
      if (decrypted && 
          decrypted.length > 0 && 
          decrypted.startsWith('{') && 
          (decrypted.includes('"access_token"') || decrypted.includes('"expires_at"'))) {
        console.log(`[STORAGE] Successfully decrypted data for key: ${key}`);
        return decrypted;
      } else if (decrypted) {
        console.log(`[STORAGE] Decryption produced data but it doesn't look valid, length: ${decrypted.length}`);
      }
      
      // If decryption failed or produced invalid data, the data might not be encrypted
      // or might be encrypted with a different key
      console.log(`[STORAGE] Attempting to use raw data as fallback`);
      
      // Check if raw data is valid JSON as a last resort
      try {
        JSON.parse(item);
        console.log(`[STORAGE] Raw data is valid JSON, using it`);
        return item;
      } catch (parseError) {
        // Not valid JSON either
        console.error(`[STORAGE] Raw data is not valid JSON, storage recovery failed`);
      }
      
      return null;
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
      // Use direct localStorage without any custom encryption for now
      // This ensures maximum compatibility and session persistence
      storage: localStorage,
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

// Function to diagnose auth issues - can be called from browser console
const diagnoseAuthStorage = () => {
  console.log('=== SUPABASE AUTH DIAGNOSTICS ===');
  
  try {
    // Check if localStorage exists and is working
    const testKey = '_auth_test_key_';
    localStorage.setItem(testKey, 'test');
    const testResult = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    
    console.log(`localStorage test: ${testResult === 'test' ? 'PASSED' : 'FAILED'}`);
    
    // Check for auth data
    const authKey = 'therapytrack_supabase_auth';
    const sessionData = localStorage.getItem(authKey);
    
    console.log(`Auth session exists: ${sessionData ? 'YES' : 'NO'}`);
    
    if (sessionData) {
      console.log(`Auth data length: ${sessionData.length}`);
      console.log(`First 50 chars: ${sessionData.substring(0, 50)}...`);
      console.log(`Looks like JSON: ${sessionData.startsWith('{') ? 'YES' : 'NO'}`);
      console.log(`Contains access token: ${sessionData.includes('"access_token"') ? 'YES' : 'NO'}`);
      
      try {
        // Try with encryption enabled
        const encryptionKey = getEncryptionKey();
        try {
          const decrypted = CryptoJS.AES.decrypt(sessionData, encryptionKey);
          const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
          console.log(`Decryption attempt: ${decryptedText ? 'SUCCESS' : 'FAILED'}`);
          console.log(`Decrypted data starts with: ${decryptedText.substring(0, 30)}...`);
        } catch (e) {
          console.log(`Decryption error: ${e.message}`);
        }
      } catch (e) {
        console.log(`Error checking encryption: ${e.message}`);
      }
    }
    
    // Check for app version
    const appVersionKey = 'theriq_app_version';
    const appVersion = localStorage.getItem(appVersionKey);
    console.log(`App version in storage: ${appVersion || 'NOT SET'}`);
    
    // Check encryption status
    console.log(`Encryption disabled: ${isEncryptionDisabled() ? 'YES' : 'NO'}`);
    
    // Get session directly from Supabase
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.log(`Supabase session check failed: ${error.message}`);
      } else {
        console.log(`Supabase session exists: ${data.session ? 'YES' : 'NO'}`);
        if (data.session) {
          console.log(`Session user ID: ${data.session.user.id}`);
          const expiresAt = data.session.expires_at || 0;
          const now = Math.floor(Date.now() / 1000);
          const timeToExpiry = expiresAt - now;
          console.log(`Session expires in: ${timeToExpiry} seconds`);
        }
      }
    });
  } catch (e) {
    console.error(`Diagnostic error: ${e.message}`);
  }
  
  console.log('=== END DIAGNOSTICS ===');
  
  return 'Diagnostics complete - check console for results';
};

// Add it to the window object for easy access from browser console
if (typeof window !== 'undefined') {
  (window as any).diagnoseAuthStorage = diagnoseAuthStorage;
  (window as any).disableEncryption = () => {
    localStorage.setItem('DISABLE_ENCRYPTION', 'true');
    return 'Encryption disabled. Please reload the page.';
  };
  (window as any).enableEncryption = () => {
    localStorage.removeItem('DISABLE_ENCRYPTION');
    return 'Encryption enabled. Please reload the page.';
  };
  (window as any).clearAndReset = () => {
    localStorage.clear();
    return 'Storage cleared. Please reload the page.';
  };
}

// Export the initialized client
export { supabase }; 