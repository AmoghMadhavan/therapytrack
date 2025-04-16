import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/config';
import { checkAndSetupTables, initializeDefaultData } from '../lib/supabase/setupTables';

interface AuthContextType {
  currentUser: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
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

  // This effect runs only once on component mount
  useEffect(() => {
    console.log('[AUTH] AuthProvider initialized');
    
    // First, attempt to recover session from localStorage
    const initializeAuth = async () => {
      try {
        console.log('[AUTH] Getting initial session');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AUTH] Error getting initial session:', error.message);
        } else {
          if (data.session) {
            console.log('[AUTH] Initial session found', data.session.user.id);
            setSession(data.session);
            setCurrentUser(data.session.user);
            
            // Initialize data if user is authenticated
            try {
              await checkAndSetupTables();
              await initializeDefaultData(data.session.user.id);
            } catch (setupError) {
              console.error('[AUTH] Error setting up initial data:', setupError);
            }
          } else {
            console.log('[AUTH] No initial session found');
          }
        }
        
        setLoading(false);
      } catch (e) {
        console.error('[AUTH] Error during initialization:', e);
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
            
            // If user just signed in, set up their data
            if (event === 'SIGNED_IN') {
              try {
                console.log('[AUTH] Setting up data after SIGNED_IN event');
                await checkAndSetupTables();
                await initializeDefaultData(sessionData.user.id);
              } catch (error) {
                console.error('[AUTH] Error setting up data after sign in:', error);
              }
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('[AUTH] Clearing user and session after SIGNED_OUT event');
            setSession(null);
            setCurrentUser(null);
          }
        }
      );
      
      return authListener;
    };
    
    // Run initialization and set up listener
    initializeAuth();
    const authListener = setupAuthListener();
    
    // Cleanup function
    return () => {
      console.log('[AUTH] Cleaning up auth listener');
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Debug effect to log state changes
  useEffect(() => {
    console.log('[AUTH] Auth state updated, user:', currentUser ? 'exists' : 'null');
  }, [currentUser, session]);

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
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[AUTH] Error signing out:', error.message);
      } else {
        console.log('[AUTH] Successfully signed out, clearing auth state');
        setSession(null);
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('[AUTH] Exception during sign out:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    console.log('[AUTH] Attempting to sign in with Google');
    try {
      const response = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      console.log('[AUTH] Google sign in response:', response.error ? 'error' : 'success');
      return response;
    } catch (error) {
      console.error('[AUTH] Exception during Google sign in:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    console.log('[AUTH] Attempting to reset password');
    try {
      const response = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      console.log('[AUTH] Reset password response:', response.error ? 'error' : 'success');
      return response;
    } catch (error) {
      console.error('[AUTH] Exception during password reset:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 