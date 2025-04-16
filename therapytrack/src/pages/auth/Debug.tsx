import React, { useState } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../lib/supabase/config';
import { Link } from 'react-router-dom';

const Debug: React.FC = () => {
  const auth = useAuth();
  const [testResult, setTestResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const testSupabaseConnection = async () => {
    setLoading(true);
    try {
      // Test basic connection to Supabase
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact' }).limit(0);
      
      if (error) {
        setTestResult(JSON.stringify({ 
          success: false, 
          message: 'Failed to connect to Supabase',
          error: error 
        }, null, 2));
      } else {
        setTestResult(JSON.stringify({ 
          success: true, 
          message: 'Successfully connected to Supabase',
          data: data 
        }, null, 2));
      }
    } catch (err) {
      setTestResult(JSON.stringify({ 
        success: false, 
        message: 'Exception while testing connection',
        error: err 
      }, null, 2));
    } finally {
      setLoading(false);
    }
  };
  
  const testCreateUser = async () => {
    setLoading(true);
    try {
      // Try to create a test user
      const testEmail = `test-${Math.floor(Math.random() * 10000)}@example.com`;
      const testPassword = 'Password123!';
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword
      });
      
      if (error) {
        setTestResult(JSON.stringify({ 
          success: false, 
          message: 'Failed to create test user',
          error: error 
        }, null, 2));
      } else {
        setTestResult(JSON.stringify({ 
          success: true, 
          message: 'Successfully created test user (may require verification)',
          user: {
            email: testEmail,
            password: testPassword
          },
          data: {
            id: data.user?.id,
            email: data.user?.email,
            hasSession: !!data.session
          }
        }, null, 2));
      }
    } catch (err) {
      setTestResult(JSON.stringify({ 
        success: false, 
        message: 'Exception while creating test user',
        error: err 
      }, null, 2));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Auth Debug Page</h1>
          <div>
            <Link to="/" className="text-blue-600 hover:text-blue-800 mr-4">
              Home
            </Link>
            <Link to="/login" className="text-blue-600 hover:text-blue-800">
              Login
            </Link>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Auth State */}
          <div className="bg-gray-50 p-4 rounded border border-gray-200">
            <h2 className="text-lg font-semibold mb-2">Auth State:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60 text-sm">
              {JSON.stringify({
                currentUser: auth.currentUser ? {
                  id: auth.currentUser.id,
                  email: auth.currentUser.email,
                  emailVerified: auth.currentUser.email_confirmed_at ? 'Yes' : 'No',
                  metadata: auth.currentUser.user_metadata,
                } : null,
                session: auth.session ? {
                  expiresAt: auth.session.expires_at ? new Date(auth.session.expires_at * 1000).toLocaleString() : 'No expiration',
                } : null,
                loading: auth.loading
              }, null, 2)}
            </pre>
          </div>
          
          {/* Environment Checks */}
          <div className="bg-gray-50 p-4 rounded border border-gray-200">
            <h2 className="text-lg font-semibold mb-2">Environment:</h2>
            <div className="space-y-2">
              <div>
                <span className="font-medium">NODE_ENV:</span> {process.env.NODE_ENV || 'Not set'}
              </div>
              <div>
                <span className="font-medium">Supabase URL:</span> 
                {process.env.REACT_APP_SUPABASE_URL ? (
                  <span className="text-green-600">Set ✓</span>
                ) : (
                  <span className="text-red-600">Missing ✗</span>
                )}
              </div>
              <div>
                <span className="font-medium">Supabase Anon Key:</span> 
                {process.env.REACT_APP_SUPABASE_ANON_KEY ? (
                  <span className="text-green-600">Set ✓</span>
                ) : (
                  <span className="text-red-600">Missing ✗</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Test Actions */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Test Actions:</h2>
            <div className="flex space-x-4">
              <button 
                onClick={testSupabaseConnection}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Test Supabase Connection
              </button>
              
              <button 
                onClick={testCreateUser}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Create Test User
              </button>
              
              <button 
                onClick={() => auth.signOut()} 
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                Sign Out
              </button>
            </div>
            
            {testResult && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-700 mb-2">Test Result:</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">
                  {testResult}
                </pre>
              </div>
            )}
          </div>
          
          {/* Navigation */}
          <div className="flex space-x-4 mt-6 pt-6 border-t border-gray-200">
            <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Go to Login
            </Link>
            <Link to="/dashboard" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Debug; 