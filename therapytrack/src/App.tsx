import React, { lazy, Suspense, useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { AuthProvider } from './contexts/SupabaseAuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import RequireAuth from './components/auth/RequireAuth';
import RedirectIfAuthenticated from './components/auth/RedirectIfAuthenticated';
import SessionDebugger from './components/auth/SessionDebugger';

// Only import test dashboard in development mode
const TestDashboard = lazy(() => import('./components/Dashboard'));

// Lazy loaded components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Clients = lazy(() => import('./pages/clients/Clients'));
const ClientDetail = lazy(() => import('./pages/clients/ClientDetail'));
const ClientForm = lazy(() => import('./pages/clients/ClientForm'));
const Sessions = lazy(() => import('./pages/sessions/Sessions'));
const SessionForm = lazy(() => import('./pages/sessions/SessionForm'));
const Account = lazy(() => import('./pages/auth/Account'));
const Profile = lazy(() => import('./pages/auth/Profile'));
const About = lazy(() => import('./pages/About'));
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'));

// Development/debug routes - only include in development
const Debug = lazy(() => import('./pages/auth/Debug'));
const TestSupabase = lazy(() => import('./pages/auth/TestSupabase'));
const TestDatabaseConnection = lazy(() => import('./pages/TestDatabaseConnection'));

// Loading fallback with timeout to prevent infinite loading
const LoadingFallback = () => {
  const [showTimeoutMessage, setShowTimeoutMessage] = React.useState(false);
  
  // If loading takes more than 5 seconds, show additional message
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeoutMessage(true);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
      <div className="text-gray-700">Loading application...</div>
      
      {showTimeoutMessage && (
        <div className="mt-4 max-w-md text-center text-gray-500">
          <p>It's taking longer than expected to load.</p>
          <p className="mt-2">If this continues, try refreshing the page or check your internet connection.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Refresh Page
          </button>
        </div>
      )}
    </div>
  );
};

function App() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const [showDebugger, setShowDebugger] = useState(false);
  
  // Add keyboard shortcut for debug panel - Ctrl+Shift+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setShowDebugger(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return (
    <ErrorBoundary>
      <HashRouter>
        <AuthProvider>
          {/* Include the session debugger component */}
          <SessionDebugger visible={showDebugger} />
          
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public Routes - eagerly loaded for fast initial experience */}
              <Route path="/" element={
                <RedirectIfAuthenticated>
                  <LandingPage />
                </RedirectIfAuthenticated>
              } />
              <Route path="/login" element={
                <RedirectIfAuthenticated>
                  <Login />
                </RedirectIfAuthenticated>
              } />
              <Route path="/register" element={
                <RedirectIfAuthenticated>
                  <Register />
                </RedirectIfAuthenticated>
              } />
              <Route path="/about" element={<About />} />
              
              {/* Development/Debug Routes - only included in development */}
              {isDevelopment && (
                <>
                  <Route path="/debug" element={<Debug />} />
                  <Route path="/debug-auth" element={<Debug />} />
                  <Route path="/test-supabase" element={<TestSupabase />} />
                  <Route path="/test-db" element={<TestDatabaseConnection />} />
                  <Route path="/test-subscription" element={
                    <RequireAuth>
                      <TestDashboard />
                    </RequireAuth>
                  } />
                </>
              )}
              
              {/* Auth-Protected Routes - lazy loaded */}
              <Route path="/dashboard" element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              } />
              <Route path="/clients" element={
                <RequireAuth>
                  <Clients />
                </RequireAuth>
              } />
              <Route path="/clients/new" element={
                <RequireAuth>
                  <ClientForm />
                </RequireAuth>
              } />
              <Route path="/clients/:id" element={
                <RequireAuth>
                  <ClientDetail />
                </RequireAuth>
              } />
              <Route path="/clients/:id/edit" element={
                <RequireAuth>
                  <ClientForm />
                </RequireAuth>
              } />
              <Route path="/sessions" element={
                <RequireAuth>
                  <Sessions />
                </RequireAuth>
              } />
              <Route path="/sessions/new" element={
                <RequireAuth>
                  <SessionForm />
                </RequireAuth>
              } />
              <Route path="/sessions/:id/edit" element={
                <RequireAuth>
                  <SessionForm />
                </RequireAuth>
              } />
              <Route path="/account" element={
                <RequireAuth>
                  <Account />
                </RequireAuth>
              } />
              <Route path="/profile" element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              } />
              
              {/* Admin Route - available in all environments but password protected */}
              <Route path="/admin" element={
                <RequireAuth>
                  <AdminPanel />
                </RequireAuth>
              } />
              
              {/* Fallback for unknown routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </HashRouter>
    </ErrorBoundary>
  );
}

export default App; 