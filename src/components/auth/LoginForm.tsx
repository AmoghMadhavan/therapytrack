import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../lib/supabase/config';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (currentUser) {
      console.log('User already logged in, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      console.log('Attempting to sign in with:', email);
      
      // Direct authentication with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('Sign in response:', error ? 'Error' : 'Success');
      
      if (error) {
        setError(`Failed to sign in: ${error.message}`);
        console.error('Sign in error:', error);
      } else if (data && data.session) {
        console.log('Sign in successful, session created');
        // Force a delay before redirecting to ensure session is processed
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        setError('Authentication succeeded but no session was created');
        console.error('No session created');
      }
    } catch (error: any) {
      setError('Failed to sign in. Please check your credentials.');
      console.error('Sign in exception:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      
      // Direct OAuth with Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
      });
      
      console.log('Google sign in response:', error ? 'Error' : 'Success');
      
      if (error) {
        setError(`Failed to sign in with Google: ${error.message}`);
        console.error('Google sign in error:', error);
      } else {
        console.log('Google sign in initiated');
        // The redirect will happen automatically by Supabase
      }
    } catch (error: any) {
      setError('Failed to sign in with Google.');
      console.error('Google sign in exception:', error);
    } finally {
      setLoading(false);
    }
  };

  // Try a debug login with hardcoded credentials
  const handleDebugLogin = async () => {
    try {
      setError('');
      setLoading(true);
      console.log('Attempting debug login...');
      
      // Create a new test user first via sign up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'password123'
      });
      
      if (signUpError) {
        console.log('Debug sign up error:', signUpError.message);
        // If user already exists, try to sign in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'test@example.com',
          password: 'password123'
        });
        
        if (signInError) {
          setError(`Debug login failed: ${signInError.message}`);
          console.error('Debug login error:', signInError);
        } else if (signInData && signInData.session) {
          console.log('Debug login successful!');
          navigate('/dashboard');
        }
      } else {
        console.log('Debug sign up successful!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      setError('Debug login failed with exception');
      console.error('Debug login exception:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-100"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" width="24" height="24">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                  </g>
                </svg>
                Google
              </button>
              
              <button
                type="button"
                onClick={handleDebugLogin}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-100"
              >
                Debug Login (test@example.com)
              </button>
              
              <Link
                to="/debug-auth"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-gray-800 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Auth Debug Tools
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm; 