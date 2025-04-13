import React, { useState } from 'react';
import { supabase } from '../../lib/supabase/config';

const DebugLogin: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const testConnection = async () => {
    try {
      setLoading(true);
      setResult('Testing Supabase connection...');
      
      // Simple health check of the Supabase client
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact' }).limit(0);
      
      if (error) {
        setResult({
          success: false,
          message: 'Connection test failed',
          error: error
        });
      } else {
        setResult({
          success: true,
          message: 'Connection test succeeded!',
          data: data
        });
      }
    } catch (err) {
      setResult({
        success: false,
        message: 'Connection test exception',
        error: err
      });
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    try {
      setLoading(true);
      setResult('Testing login...');
      
      // Attempt to login with the provided credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        setResult({
          success: false,
          message: 'Login test failed',
          error: error
        });
      } else {
        setResult({
          success: true,
          message: 'Login succeeded!',
          data: {
            user: data.user?.email,
            session: data.session ? 'Valid session' : 'No session'
          }
        });
      }
    } catch (err) {
      setResult({
        success: false,
        message: 'Login test exception',
        error: err
      });
    } finally {
      setLoading(false);
    }
  };

  const getSession = async () => {
    try {
      setLoading(true);
      setResult('Getting current session...');
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        setResult({
          success: false,
          message: 'Get session failed',
          error: error
        });
      } else {
        setResult({
          success: true,
          message: 'Session check complete',
          data: {
            session: data.session ? 'Active session' : 'No active session',
            sessionDetails: data.session
          }
        });
      }
    } catch (err) {
      setResult({
        success: false,
        message: 'Get session exception',
        error: err
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Supabase Auth Debug Tool</h2>
      
      <div className="mb-6">
        <button 
          onClick={testConnection}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded mr-4 disabled:opacity-50"
        >
          Test Connection
        </button>
        
        <button 
          onClick={getSession}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        >
          Check Session
        </button>
      </div>
      
      <div className="mb-6 p-4 border border-gray-300 rounded">
        <h3 className="font-bold mb-2">Test Login</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="test@example.com"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Password:</label>
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="password"
          />
        </div>
        <button 
          onClick={testLogin}
          disabled={loading || !email || !password}
          className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50"
        >
          Test Login
        </button>
      </div>
      
      <div className="mt-6">
        <h3 className="font-bold mb-2">Result:</h3>
        <pre className="p-4 bg-gray-100 rounded overflow-auto max-h-96">
          {result ? JSON.stringify(result, null, 2) : 'No results yet'}
        </pre>
      </div>
    </div>
  );
};

export default DebugLogin; 