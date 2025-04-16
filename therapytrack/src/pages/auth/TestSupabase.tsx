import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const TestSupabase: React.FC = () => {
  const [result, setResult] = useState<string>('Testing...');

  useEffect(() => {
    const testConnection = async () => {
      // Log configuration values
      console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
      console.log('Anon Key Length:', process.env.REACT_APP_SUPABASE_ANON_KEY?.length || 0);
      
      try {
        // Create a client directly using environment variables
        const supabase = createClient(
          process.env.REACT_APP_SUPABASE_URL || '',
          process.env.REACT_APP_SUPABASE_ANON_KEY || ''
        );
        
        // Test a simple query
        const { data, error } = await supabase.from('profiles').select('count', { count: 'exact' }).limit(1);
        
        if (error) {
          setResult(`Connection ERROR: ${JSON.stringify(error)}`);
        } else {
          setResult(`Connection SUCCESS: ${JSON.stringify(data)}`);
          
          // Try simple signup
          const email = `test${Math.floor(Math.random() * 100000)}@gmail.com`;
          const password = 'Test123!@#';
          
          const { data: signupData, error: signupError } = await supabase.auth.signUp({
            email,
            password,
          });
          
          if (signupError) {
            setResult(prev => `${prev}\n\nSignup ERROR: ${JSON.stringify(signupError)}`);
          } else {
            setResult(prev => `${prev}\n\nSignup SUCCESS: ${JSON.stringify({
              user: signupData.user ? { 
                id: signupData.user.id,
                email: signupData.user.email 
              } : null,
              session: signupData.session ? 'Created' : 'Not created'
            })}`);
          }
        }
      } catch (err: any) {
        setResult(`Exception: ${err.message}`);
      }
    };
    
    testConnection();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      <div className="bg-gray-100 p-4 rounded-md">
        <pre className="whitespace-pre-wrap overflow-auto max-h-96 text-sm">
          {result}
        </pre>
      </div>
    </div>
  );
};

export default TestSupabase; 