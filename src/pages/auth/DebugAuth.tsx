import React from 'react';
import { Link } from 'react-router-dom';
import DebugLogin from '../../components/auth/DebugLogin';

const DebugAuth: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Auth Debugging</h1>
          <div className="space-x-4">
            <Link to="/debug" className="text-blue-600 hover:text-blue-800">
              General Debug
            </Link>
            <Link to="/login" className="text-blue-600 hover:text-blue-800">
              Login Page
            </Link>
            <Link to="/" className="text-blue-600 hover:text-blue-800">
              Home
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Auth Environment:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Supabase URL:</p>
              <p className="text-gray-600 break-all">{process.env.REACT_APP_SUPABASE_URL || 'Not set'}</p>
            </div>
            <div>
              <p className="font-medium">Supabase Key Present:</p>
              <p className="text-gray-600">{process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
        
        <DebugLogin />
      </div>
    </div>
  );
};

export default DebugAuth; 