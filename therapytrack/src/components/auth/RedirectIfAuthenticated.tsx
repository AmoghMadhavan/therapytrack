import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/SupabaseAuthContext';

interface RedirectIfAuthenticatedProps {
  children: JSX.Element;
}

/**
 * RedirectIfAuthenticated component that prevents authenticated users from accessing public routes
 * Redirects to dashboard if user is already authenticated
 */
const RedirectIfAuthenticated: React.FC<RedirectIfAuthenticatedProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // If still loading auth state, show nothing (or could show a spinner)
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If authenticated, redirect to dashboard
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, render the public component
  return children;
};

export default RedirectIfAuthenticated; 