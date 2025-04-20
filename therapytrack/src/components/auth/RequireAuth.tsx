import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/SupabaseAuthContext';

interface RequireAuthProps {
  children: JSX.Element;
}

/**
 * RequireAuth component that protects routes requiring authentication
 * Redirects to login page if user is not authenticated
 */
const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Add debug logging
  useEffect(() => {
    console.log('[AUTH-ROUTE] RequireAuth rendering with state:', { 
      loading, 
      userExists: !!currentUser, 
      isAuthenticated,
      pathname: location.pathname 
    });
  }, [loading, currentUser, isAuthenticated, location]);

  // If still loading auth state, show spinner but with a max timeout
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        <div className="ml-4 text-gray-500">Loading authentication state...</div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!currentUser) {
    console.log('[AUTH-ROUTE] No current user, redirecting to login');
    // Save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected component
  console.log('[AUTH-ROUTE] User authenticated, rendering component');
  return children;
};

export default RequireAuth; 