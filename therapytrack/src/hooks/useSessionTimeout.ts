import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';

type TimeoutOptions = {
  /**
   * Timeout duration in minutes
   * Default is 30 minutes
   */
  timeoutMinutes?: number;
  
  /**
   * Whether to show a warning before timeout
   * Default is true
   */
  showWarning?: boolean;
  
  /**
   * Minutes before timeout to show warning
   * Default is 1 minute
   */
  warningMinutes?: number;
  
  /**
   * Callback to run when session is about to timeout
   */
  onWarning?: () => void;
  
  /**
   * Callback to run when session times out
   */
  onTimeout?: () => void;
};

/**
 * Hook to automatically logout user after a period of inactivity
 */
export const useSessionTimeout = (options: TimeoutOptions = {}) => {
  const {
    timeoutMinutes = 30,
    showWarning = true,
    warningMinutes = 1,
    onWarning,
    onTimeout
  } = options;
  
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  // Use refs to hold timers so they persist across renders
  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Setup the session timeout
  useEffect(() => {
    // Don't set up timers if timeout is disabled (0 minutes)
    if (timeoutMinutes === 0) {
      return;
    }
    
    // Convert minutes to milliseconds
    const timeoutMs = timeoutMinutes * 60 * 1000;
    const warningMs = warningMinutes * 60 * 1000;
    
    // Function to reset timers when user activity is detected
    const resetTimers = () => {
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current);
      }
      
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
      
      // Set warning timer (if enabled)
      if (showWarning) {
        warningTimerRef.current = setTimeout(() => {
          if (onWarning) {
            onWarning();
          } else {
            // Default warning implementation
            const confirmed = window.confirm(
              `Your session will expire in ${warningMinutes} minute${warningMinutes !== 1 ? 's' : ''} due to inactivity. Do you want to stay logged in?`
            );
            
            if (confirmed) {
              // User wants to stay logged in, reset timers
              resetTimers();
            }
          }
        }, timeoutMs - warningMs);
      }
      
      // Set main timeout timer
      timeoutTimerRef.current = setTimeout(async () => {
        if (onTimeout) {
          onTimeout();
        }
        
        // Log out the user
        await signOut();
        
        // Navigate to login
        navigate('/login', { 
          state: { 
            message: 'Your session expired due to inactivity. Please log in again.' 
          } 
        });
      }, timeoutMs);
    };
    
    // Set up event listeners for user activity
    const activityEvents = [
      'mousedown', 'mousemove', 'keypress',
      'scroll', 'touchstart', 'click', 'keydown'
    ];
    
    // Add throttling to avoid resetting the timer too frequently
    let throttleTimer: ReturnType<typeof setTimeout> | null = null;
    
    const throttledResetTimers = () => {
      if (!throttleTimer) {
        throttleTimer = setTimeout(() => {
          resetTimers();
          throttleTimer = null;
        }, 30000); // Only reset once per 30 seconds of activity
      }
    };
    
    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, throttledResetTimers);
    });
    
    // Initial setup of timers
    resetTimers();
    
    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, throttledResetTimers);
      });
      
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current);
      }
      
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
      
      if (throttleTimer) {
        clearTimeout(throttleTimer);
      }
    };
  }, [timeoutMinutes, warningMinutes, showWarning, signOut, navigate, onWarning, onTimeout]);
  
  // Return functions to manually reset or trigger timeout
  return {
    resetTimeout: () => {
      // Clear existing timers
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current);
        timeoutTimerRef.current = null;
      }
      
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
        warningTimerRef.current = null;
      }
    },
    forceTimeout: async () => {
      if (onTimeout) {
        onTimeout();
      }
      
      await signOut();
      navigate('/login');
    }
  };
}; 