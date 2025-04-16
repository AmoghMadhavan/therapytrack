import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../lib/supabase/config';

interface SessionDebuggerProps {
  visible?: boolean;
}

/**
 * A hidden component that helps debug session persistence issues
 * Only renders output to console, not to the UI unless visible=true
 */
const SessionDebugger: React.FC<SessionDebuggerProps> = ({ visible = false }) => {
  const { currentUser, session } = useAuth();
  const [localStorageAvailable, setLocalStorageAvailable] = useState<boolean | null>(null);
  const [cookiesEnabled, setCookiesEnabled] = useState<boolean | null>(null);
  const [storedSession, setStoredSession] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if localStorage is available
    try {
      const testKey = '__test_storage__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      setLocalStorageAvailable(true);
      
      // Check for existing session in localStorage
      const keys = Object.keys(localStorage);
      const sessionKeys = keys.filter(k => 
        k.includes('supabase') || 
        k.includes('auth') || 
        k.includes('session') ||
        k.includes('token')
      );
      
      if (sessionKeys.length > 0) {
        setStoredSession(JSON.stringify(sessionKeys));
      }
    } catch (e) {
      setLocalStorageAvailable(false);
      console.error('[DEBUG] localStorage not available:', e);
    }
    
    // Check if cookies are enabled
    setCookiesEnabled(navigator.cookieEnabled);
    
    // Debug log
    console.log('[DEBUG] SessionDebugger mounted');
    console.log('[DEBUG] Auth Context User:', currentUser ? `ID: ${currentUser.id}` : 'null');
    console.log('[DEBUG] Auth Context Session:', session ? `Expires: ${new Date(session.expires_at! * 1000).toLocaleString()}` : 'null');
    
    // Direct session check
    const checkDirectSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      console.log('[DEBUG] Direct getSession result:', 
        error ? `Error: ${error.message}` : 
        (data.session ? `Session exists, user: ${data.session.user.id}` : 'No session found')
      );
    };
    
    checkDirectSession();
    
    return () => {
      console.log('[DEBUG] SessionDebugger unmounted');
    };
  }, [currentUser, session]);
  
  // Effect to log auth changes
  useEffect(() => {
    console.log('[DEBUG] Auth state changed, user:', currentUser ? `ID: ${currentUser.id}` : 'null');
  }, [currentUser, session]);
  
  if (!visible) return null;
  
  return (
    <div className="fixed bottom-0 right-0 bg-gray-800 text-white p-2 text-xs z-50 opacity-80">
      <h3>Session Debug</h3>
      <div>
        <div>localStorage: {localStorageAvailable ? '✅' : '❌'}</div>
        <div>Cookies: {cookiesEnabled ? '✅' : '❌'}</div>
        <div>User: {currentUser ? '✅' : '❌'}</div>
        <div>Session: {session ? '✅' : '❌'}</div>
        <div>Stored keys: {storedSession || 'none'}</div>
      </div>
    </div>
  );
};

export default SessionDebugger; 