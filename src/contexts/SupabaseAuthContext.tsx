import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/config';

interface AuthContextType {
  currentUser: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  refreshSession: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Function to refresh session - can be called manually if needed
  const refreshSession = async () => {
    try {
      console.log('[AUTH] Manually refreshing session');
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('[AUTH] Error refreshing session:', error.message);
        return;
      }
      
      if (data.session) {
        console.log('[AUTH] Session refreshed successfully');
        setSession(data.session);
        setCurrentUser(data.session.user);
        setIsAuthenticated(true);
      } else {
        console.log('[AUTH] No session after refresh');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('[AUTH] Exception during session refresh:', error);
    }
  };

  // This effect runs only once on component mount
  useEffect(() => {
    console.log('[AUTH] AuthProvider initialized');
    
    // Check if localStorage is readable with minimal function
    const testLocalStorage = () => {
      try {
        const testKey = '_auth_test_key_';
        localStorage.setItem(testKey, 'test');
        const value = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        console.log(`[AUTH] localStorage test: ${value === 'test' ? 'PASSED' : 'FAILED'}`);
        return value === 'test';
      } catch (e) {
        console.error('[AUTH] localStorage test failed:', e);
        return false;
      }
    };
    
    // Run a quick localStorage test
    const storageWorks = testLocalStorage();
    if (!storageWorks) {
      console.error('[AUTH] localStorage is not working. Authentication persistence will fail.');
    }
    
    // First, attempt to recover session
    const initializeAuth = async () => {
      try {
        setLoading(true);
        console.log('[AUTH] Getting initial session');
        
        // Try to directly read the auth data from localStorage for debugging
        try {
          const rawStorage = localStorage.getItem('therapytrack_supabase_auth');
          console.log('[AUTH] Raw storage exists:', !!rawStorage);
          if (rawStorage) {
            console.log('[AUTH] Raw storage length:', rawStorage.length);
            console.log('[AUTH] Raw storage excerpt:', rawStorage.substring(0, 50) + '...');
          }
        } catch (e) {
          console.error('[AUTH] Error checking raw storage:', e);
        }
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AUTH] Error getting initial session:', error.message);
          setIsAuthenticated(false);
        } else {
          if (data.session) {
            console.log('[AUTH] Initial session found', data.session.user.id);
            setSession(data.session);
            setCurrentUser(data.session.user);
            setIsAuthenticated(true);
            
            // Check if token is close to expiry and refresh if needed
            const expiresAt = data.session.expires_at || 0;
            const now = Math.floor(Date.now() / 1000);
            const timeToExpiry = expiresAt - now;
            console.log(`[AUTH] Session expires in ${timeToExpiry} seconds`);
            
            if (timeToExpiry < 600) { // Less than 10 minutes
              console.log('[AUTH] Session close to expiry, refreshing');
              await refreshSession();
            }
          } else {
            console.log('[AUTH] No initial session found');
            
            // Check for session directly in localStorage as a fallback
            try {
              const rawStorage = localStorage.getItem('therapytrack_supabase_auth');
              if (rawStorage && rawStorage.includes('access_token')) {
                console.log('[AUTH] Found possible session in localStorage, but Supabase did not detect it');
                console.log('[AUTH] This might be an encryption/decryption issue');
              }
            } catch (e) {
              // Do nothing
            }
            
            setIsAuthenticated(false);
          }
        }
      } catch (e) {
        console.error('[AUTH] Error during initialization:', e);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    // Set up the auth state change listener
    const setupAuthListener = () => {
      console.log('[AUTH] Setting up auth listener');
      
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, sessionData) => {
          console.log('[AUTH] Auth state change event:', event, sessionData ? 'session exists' : 'no session');
          
          if (sessionData) {
            console.log('[AUTH] Setting user and session from auth change event');
            setSession(sessionData);
            setCurrentUser(sessionData.user);
            setIsAuthenticated(true);
            
            // If user just signed in, set up their data
            if (event === 'SIGNED_IN') {
              try {
                console.log('[AUTH] Successfully signed in:', sessionData.user.id);
                // Additional setup can be done here if needed
              } catch (error) {
                console.error('[AUTH] Error after sign in:', error);
              }
            } else if (event === 'TOKEN_REFRESHED') {
              console.log('[AUTH] Token was refreshed automatically');
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('[AUTH] Clearing user and session after SIGNED_OUT event');
            setSession(null);
            setCurrentUser(null);
            setIsAuthenticated(false);
          }
        }
      );
      
      return authListener;
    };
    
    // Run initialization and set up listener
    initializeAuth();
    const authListener = setupAuthListener();
    
    // Set up session refresh every 30 minutes
    const refreshInterval = setInterval(() => {
      if (session) refreshSession();
    }, 30 * 60 * 1000);
    
    // Cleanup function
    return () => {
      console.log('[AUTH] Cleaning up auth listener and refresh interval');
      clearInterval(refreshInterval);
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Debug effect to log state changes
  useEffect(() => {
    console.log(`[AUTH] Auth state updated: ${isAuthenticated ? 'authenticated' : 'not authenticated'}`);
  }, [isAuthenticated, currentUser, session]);

  const signIn = async (email: string, password: string) => {
    console.log('[AUTH] Attempting to sign in with email');
    try {
      const response = await supabase.auth.signInWithPassword({ email, password });
      
      if (response.error) {
        console.error('[AUTH] Sign in error:', response.error.message);
      } else {
        console.log('[AUTH] Sign in successful');
        
        // Manually update state immediately for better UX
        if (response.data.session) {
          setSession(response.data.session);
          setCurrentUser(response.data.user);
          setIsAuthenticated(true);
        }
      }
      
      return response;
    } catch (error) {
      console.error('[AUTH] Exception during sign in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    console.log('[AUTH] Attempting to sign up with email');
    try {
      const response = await supabase.auth.signUp({ email, password });
      
      if (response.error) {
        console.error('[AUTH] Sign up error:', response.error.message);
      } else {
        console.log('[AUTH] Sign up successful');
        
        // Immediately update state if sign up auto-logs in
        if (response.data.session) {
          setSession(response.data.session);
          setCurrentUser(response.data.user);
          setIsAuthenticated(true);
        }
      }
      
      return response;
    } catch (error) {
      console.error('[AUTH] Exception during sign up:', error);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('[AUTH] Attempting to sign out');
    try {
      // First, manually clear session state
      setSession(null);
      setCurrentUser(null);
      setIsAuthenticated(false);
      
      // Clear auth data from localStorage for good measure
      try {
        localStorage.removeItem('therapytrack_supabase_auth');
      } catch (e) {
        console.error('[AUTH] Error clearing localStorage:', e);
      }
      
      // Then call the API to complete server-side sign out
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[AUTH] Error signing out:', error.message);
        // If API sign out fails, still proceed with client-side cleanup
      } else {
        console.log('[AUTH] Successfully signed out, auth state already cleared');
      }
      
      // Force navigation to login page to ensure clean state
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('[AUTH] Exception during sign out:', error);
      // Still try to reset the client state
      setSession(null);
      setCurrentUser(null);
      setIsAuthenticated(false);
      
      // Try to navigate away anyway
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  const signInWithGoogle = async () => {
    console.log('[AUTH] Attempting to sign in with Google');
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        console.error('[AUTH] Google sign in error:', error.message);
      } else {
        console.log('[AUTH] Google sign in initiated');
      }
      
      return { data, error };
    } catch (error) {
      console.error('[AUTH] Exception during Google sign in:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    console.log('[AUTH] Sending password reset email');
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        console.error('[AUTH] Password reset error:', error.message);
      } else {
        console.log('[AUTH] Password reset email sent');
      }
      
      return { data, error };
    } catch (error) {
      console.error('[AUTH] Exception during password reset:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      signInWithGoogle,
      resetPassword,
      refreshSession,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 