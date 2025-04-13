// Simple script to check environment variables
console.log('Checking environment variables...');
console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL || 'Not set');
console.log('Supabase Anon Key:', process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Set (not displaying for security)' : 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set'); 