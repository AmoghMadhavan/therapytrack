import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/config';
import PageLayout from '../components/layout/PageLayout';
import { useAuth } from '../contexts/SupabaseAuthContext';

const TestDatabaseConnection: React.FC = () => {
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [clientsData, setClientsData] = useState<any>(null);
  const [sessionsData, setSessionsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing database connection...');
        console.log('Current user:', currentUser);
        
        // Step 1: Test if we can query the profiles table
        console.log('Testing profiles table...');
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .limit(5);
          
        if (profileError) {
          console.error('Error querying profiles:', profileError);
          setError('Error querying profiles: ' + profileError.message);
          setLoading(false);
          return;
        }
        
        setProfileData(profileData);
        console.log('Profiles data:', profileData);
        
        // Step 2: Test if we can query the clients table
        console.log('Testing clients table...');
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('*')
          .limit(5);
          
        if (clientsError) {
          console.error('Error querying clients:', clientsError);
          setError('Error querying clients: ' + clientsError.message);
          setLoading(false);
          return;
        }
        
        setClientsData(clientsData);
        console.log('Clients data:', clientsData);
        
        // Step 3: Test if we can query the sessions table
        console.log('Testing sessions table...');
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('sessions')
          .select('*')
          .limit(5);
          
        if (sessionsError) {
          console.error('Error querying sessions:', sessionsError);
          setError('Error querying sessions: ' + sessionsError.message);
          setLoading(false);
          return;
        }
        
        setSessionsData(sessionsData);
        console.log('Sessions data:', sessionsData);
        
        // All tests successful
        setLoading(false);
        
      } catch (err: any) {
        console.error('Unexpected error testing database connection:', err);
        setError('Unexpected error: ' + (err.message || String(err)));
        setLoading(false);
      }
    };
    
    if (currentUser) {
      testConnection();
    } else {
      setLoading(false);
      setError('No user logged in. Please login first.');
    }
  }, [currentUser]);

  if (loading) {
    return (
      <PageLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold mb-4">Testing Database Connection</h1>
          <div className="flex justify-center items-center mt-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-4">Database Connection Test</h1>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {!error && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">Database connection successful!</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Profiles Data */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Profiles Table</h3>
            </div>
            <div className="border-t border-gray-200 p-4">
              {profileData ? (
                <pre className="text-xs overflow-auto max-h-60">
                  {JSON.stringify(profileData, null, 2)}
                </pre>
              ) : (
                <p className="text-gray-500">No profile data available</p>
              )}
            </div>
          </div>
          
          {/* Clients Data */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Clients Table</h3>
            </div>
            <div className="border-t border-gray-200 p-4">
              {clientsData ? (
                <pre className="text-xs overflow-auto max-h-60">
                  {JSON.stringify(clientsData, null, 2)}
                </pre>
              ) : (
                <p className="text-gray-500">No client data available</p>
              )}
            </div>
          </div>
          
          {/* Sessions Data */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Sessions Table</h3>
            </div>
            <div className="border-t border-gray-200 p-4">
              {sessionsData ? (
                <pre className="text-xs overflow-auto max-h-60">
                  {JSON.stringify(sessionsData, null, 2)}
                </pre>
              ) : (
                <p className="text-gray-500">No session data available</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Debug Information</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Current User</h3>
            </div>
            <div className="border-t border-gray-200 p-4">
              <pre className="text-xs overflow-auto max-h-60">
                {JSON.stringify(currentUser, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default TestDatabaseConnection; 