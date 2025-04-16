import React from 'react';
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
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // If still loading auth state, show nothing (or could show a spinner)
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!currentUser) {
    // Save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected component
  return children;
};

export default RequireAuth; 