import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import PageLayout from '../../components/layout/PageLayout';
import { SubscriptionTierTester } from '../../components/SubscriptionTierTester';
import { toast } from 'react-hot-toast';
import { clearUserCache } from '../../utils/cache';
import { supabase } from '../../lib/supabase/config';
import { SubscriptionTier } from '../../services/subscriptionService';
import { setTestSubscriptionTier } from '../../utils/testSubscription';

// Admin password - in a real app, this would be stored securely and verified server-side
const ADMIN_PASSWORD = 'therapyTrack2023';

const AdminPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'subscription' | 'logs' | 'cache' | 'database' | 'testaccount' | 'users'>('subscription');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [databaseQuery, setDatabaseQuery] = useState<string>('SELECT * FROM profiles LIMIT 10');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testAccount, setTestAccount] = useState<any>(null);
  const [testEmail, setTestEmail] = useState<string>('test@therapytrack.dev');
  const [testPassword, setTestPassword] = useState<string>('TestAccount123!');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');
  const [searchEmail, setSearchEmail] = useState<string>('');

  // Verify admin password
  const verifyPassword = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast.success('Admin access granted');
      addLog('Admin access granted via password');
    } else {
      toast.error('Incorrect password');
      addLog('Failed admin access attempt - incorrect password');
    }
  };

  // Check if current user has admin privileges
  const checkUserIsAdmin = async () => {
    if (!currentUser) return;
    
    try {
      // Get user's profile
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', currentUser.id)
        .single();
        
      if (error) {
        throw error;
      }
      
      // Simply log the admin status - no automatic setting
      if (data?.is_admin) {
        addLog(`User ${currentUser.email} has admin privileges`);
      } else {
        addLog(`User ${currentUser.email} does not have admin privileges`);
      }
    } catch (error: any) {
      console.error('Error checking admin status:', error);
      addLog(`Admin check error: ${error.message}`);
    }
  };

  // Run database query
  const runQuery = async () => {
    if (!databaseQuery.trim()) {
      toast.error('Please enter a query');
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, this would be restricted to read-only queries or use a secure admin API
      const { data, error } = await supabase.rpc('admin_query', {
        query_text: databaseQuery
      });

      if (error) {
        throw error;
      }

      setQueryResult(data);
      addLog(`Query executed: ${databaseQuery}`);
      toast.success('Query executed successfully');
    } catch (error: any) {
      console.error('Database query error:', error);
      setQueryResult({ error: error.message });
      addLog(`Query error: ${error.message}`);
      toast.error(`Query error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear cache
  const handleClearCache = () => {
    try {
      if (currentUser) {
        clearUserCache(currentUser.id);
        addLog(`Cache cleared for user: ${currentUser.id}`);
        toast.success('Cache cleared successfully');
      } else {
        toast.error('No user logged in');
      }
    } catch (error: any) {
      console.error('Error clearing cache:', error);
      toast.error(`Error clearing cache: ${error.message}`);
    }
  };

  // Clear all local storage
  const handleClearAllStorage = () => {
    try {
      localStorage.clear();
      addLog('All local storage cleared');
      toast.success('All local storage cleared');
    } catch (error: any) {
      console.error('Error clearing storage:', error);
      toast.error(`Error clearing storage: ${error.message}`);
    }
  };

  // Add log entry
  const addLog = (message: string) => {
    const timestamp = new Date().toISOString();
    setLogs(prevLogs => [`[${timestamp}] ${message}`, ...prevLogs]);
  };

  // Create or get a test account
  const setupTestAccount = async () => {
    try {
      setIsLoading(true);
      addLog('Setting up test account...');

      // Create a new test account with signUp
      const { data: authData, error: createError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      if (createError) {
        // If error is about user already existing, we can continue
        if (createError.message.includes('already exists')) {
          addLog('User already exists, fetching data...');
        } else {
          throw createError;
        }
      }

      // Determine user ID (either from the new signup or existing user)
      let userId;
      
      if (authData?.user?.id) {
        // New user created
        userId = authData.user.id;
        addLog(`Created new test account with ID: ${userId}`);
        
        // Set up profile for the user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: testEmail,
            role: 'therapist', // Required field
            subscription_tier: 'basic',
            subscription_status: 'active',
            subscription_expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            is_test_account: true,
          });

        if (profileError) {
          throw profileError;
        }
      } else {
        // User already exists, try to fetch profile
        addLog('Getting existing user profile...');
        
        // Sign in to get the user ID
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword,
        });
        
        if (signInError) {
          throw signInError;
        }
        
        userId = signInData.user.id;
        addLog(`Found existing test account with ID: ${userId}`);
      }

      // Get profile information
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        throw profileError;
      }

      setTestAccount(profile);
      toast.success('Test account is ready');
      addLog('Test account setup complete');
    } catch (error: any) {
      console.error('Error setting up test account:', error);
      toast.error(`Error setting up test account: ${error.message}`);
      addLog(`Test account setup error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Change the subscription tier for the test account
  const changeTestAccountTier = async (tier: SubscriptionTier) => {
    if (!testAccount) {
      toast.error('No test account found');
      return;
    }

    try {
      setIsLoading(true);
      addLog(`Changing test account to ${tier} tier...`);

      const success = await setTestSubscriptionTier(testAccount.id, tier);
      
      if (!success) {
        throw new Error('Failed to update subscription tier');
      }

      // Refresh test account data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testAccount.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      setTestAccount(profile);
      toast.success(`Test account set to ${tier} tier`);
      addLog(`Test account subscription changed to ${tier}`);
    } catch (error: any) {
      console.error('Error changing test account tier:', error);
      toast.error(`Error changing tier: ${error.message}`);
      addLog(`Tier change error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Login to the test account (creates a new browser tab)
  const loginAsTestAccount = () => {
    if (!testAccount) {
      toast.error('No test account found');
      return;
    }

    // Create a login link to the app with the test credentials pre-filled
    const loginUrl = `/login?email=${encodeURIComponent(testEmail)}&autofill=true`;
    window.open(loginUrl, '_blank');
    
    addLog(`Opened login page for test account`);
    toast.success('Test account login page opened in new tab');
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      addLog('Fetching user list...');

      // First check if users exist at all
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error checking profiles count:', countError);
        addLog(`Database error checking profiles: ${countError.code} - ${countError.message}`);
        throw countError;
      }

      addLog(`Found ${count || 0} profiles in database`);

      // Check if the auth schema is accessible
      const { data: authData, error: authError } = await supabase.rpc('admin_query', {
        query_text: 'SELECT email, id FROM auth.users LIMIT 20;'
      });

      if (!authError) {
        addLog(`Found ${authData?.length || 0} auth users`);
      } else {
        addLog(`Unable to access auth schema: ${authError.message}`);
      }

      // Get all profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error details:', error);
        addLog(`Database error: ${error.code} - ${error.message}`);
        throw error;
      }

      if (data && data.length > 0) {
        // Process to make sure data has consistent format
        const processedUsers = data.map(user => ({
          ...user,
          is_admin: user.is_admin === true, // Ensure boolean
          email: user.email || 'No Email',
          // Map any old tier values to the new schema-compliant values
          subscription_tier: (
            user.subscription_tier === 'starter' ? 'basic' : 
            user.subscription_tier === 'pro' ? 'professional' : 
            user.subscription_tier === 'premium' ? 'enterprise' : 
            user.subscription_tier || 'basic'
          ),
          subscription_status: user.subscription_status || 'inactive'
        }));

        addLog(`Data received: ${processedUsers.length} records. First user email: ${processedUsers[0]?.email || 'none'}`);
        setUsers(processedUsers);
        addLog(`Found ${processedUsers.length} users`);
        toast.success(`Found ${processedUsers.length} users`);
      } else {
        addLog('No data received from profiles table. Creating a profile for current user...');
        await ensureUserProfile();
        
        // Try again to fetch after creating profile
        const { data: retryData, error: retryError } = await supabase
          .from('profiles')
          .select('*');
          
        if (retryError) {
          console.error('Error on retry:', retryError);
          addLog(`Retry error: ${retryError.message}`);
          setUsers([]);
        } else if (retryData && retryData.length > 0) {
          setUsers(retryData);
          addLog(`Found ${retryData.length} users on retry`);
          toast.success(`Found ${retryData.length} users`);
        } else {
          setUsers([]);
          addLog('No users found even after retry');
        }
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error(`Error fetching users: ${error.message}`);
      addLog(`User list error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Search for a user by email
  const searchUser = async () => {
    if (!searchEmail) {
      toast.error('Please enter an email to search');
      return;
    }

    try {
      setIsLoading(true);
      addLog(`Searching for user with email: ${searchEmail}`);

      // First check if current user's email matches search
      if (currentUser && currentUser.email && 
          currentUser.email.toLowerCase().includes(searchEmail.toLowerCase())) {
        addLog(`Current user's email matches search criteria. Ensuring profile exists...`);
        await ensureUserProfile();
      }

      // First try searching in auth.users if we have access
      try {
        const { data: authUsers, error: authError } = await supabase.rpc('admin_query', {
          query_text: `SELECT email, id FROM auth.users WHERE email ILIKE '%${searchEmail}%' LIMIT 10;`
        });

        if (!authError && authUsers && authUsers.length > 0) {
          addLog(`Found ${authUsers.length} matching users in auth.users`);
          // Make sure all those users have profiles
          for (const authUser of authUsers) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', authUser.id)
              .single();
              
            if (!profileData) {
              addLog(`Creating profile for auth user: ${authUser.email}`);
              await supabase
                .from('profiles')
                .insert({
                  id: authUser.id,
                  email: authUser.email,
                  role: 'therapist',
                  subscription_tier: 'basic',
                  subscription_status: 'active',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
            }
          }
        }
      } catch (authSearchError: any) {
        addLog(`Unable to search in auth.users: ${authSearchError.message}`);
      }

      // Now try an exact match in profiles
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', searchEmail);

      if (error) {
        console.error('Error details:', error);
        addLog(`Database error: ${error.code} - ${error.message}`);
        throw error;
      }

      // If no exact match found, try a partial match
      if (!data || data.length === 0) {
        addLog(`No exact match found for "${searchEmail}", trying partial match...`);
        
        const { data: partialData, error: partialError } = await supabase
          .from('profiles')
          .select('*')
          .ilike('email', `%${searchEmail}%`)
          .limit(10);
          
        if (partialError) {
          console.error('Error with partial search:', partialError);
          addLog(`Partial search error: ${partialError.message}`);
          throw partialError;
        }
        
        data = partialData;
      }

      if (data && data.length > 0) {
        // Format data for consistency
        const processedUsers = data.map(user => ({
          ...user,
          is_admin: user.is_admin === true, // Ensure boolean
          email: user.email || 'No Email',
          // Map any old tier values to the new schema-compliant values
          subscription_tier: (
            user.subscription_tier === 'starter' ? 'basic' : 
            user.subscription_tier === 'pro' ? 'professional' : 
            user.subscription_tier === 'premium' ? 'enterprise' : 
            user.subscription_tier || 'basic'
          ),
          subscription_status: user.subscription_status || 'inactive'
        }));
        
        addLog(`Data received: ${processedUsers.length} records. First user email: ${processedUsers[0]?.email || 'none'}`);
        setUsers(processedUsers);
        setSelectedUser(processedUsers[0]); // Select the first result
        setUserRole(processedUsers[0].is_admin ? 'admin' : 'user');
        addLog(`Found ${processedUsers.length} users matching "${searchEmail}"`);
        toast.success(`Found ${processedUsers.length} users`);
      } else {
        addLog(`No users found with email containing "${searchEmail}"`);
        setUsers([]);
        setSelectedUser(null);
        toast.error('No users found');
      }
    } catch (error: any) {
      console.error('Error searching for user:', error);
      toast.error(`Error searching: ${error.message}`);
      addLog(`User search error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Select a user from the list
  const selectUser = (user: any) => {
    setSelectedUser(user);
    setUserRole(user.is_admin ? 'admin' : 'user');
    addLog(`Selected user: ${user.email}`);
  };

  // Update user role
  const updateUserRole = async () => {
    if (!selectedUser) {
      toast.error('Please select a user first');
      return;
    }

    try {
      setIsLoading(true);
      addLog(`Updating user ${selectedUser.email} role to ${userRole}...`);

      // First check if the is_admin column exists
      const checkColumn = await checkAndAddIsAdminColumn();
      
      // Update the profile with the is_admin flag
      const updateData: any = {
        is_admin: userRole === 'admin'
      };
      
      // Only add updated_at if it exists in the current record
      if ('updated_at' in selectedUser) {
        updateData.updated_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', selectedUser.id);

      if (error) {
        console.error('Error updating role:', error);
        addLog(`Update error: ${error.code} - ${error.message}`);
        throw error;
      }

      // Update the local user object
      setSelectedUser({
        ...selectedUser,
        is_admin: userRole === 'admin'
      });

      // Update the user in the users list
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser.id 
            ? { ...user, is_admin: userRole === 'admin' } 
            : user
        )
      );

      toast.success(`User role updated to ${userRole}`);
      addLog(`User ${selectedUser.email} role updated to ${userRole}`);

      // If the current user is being made an admin, highlight this
      if (selectedUser.email === currentUser?.email && userRole === 'admin') {
        toast.success('Your account has been given admin privileges!', { duration: 5000 });
      }
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error(`Error updating role: ${error.message}`);
      addLog(`Role update error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Ensure current user profile exists
  const ensureUserProfile = async () => {
    if (!currentUser) return;
    
    try {
      addLog('Checking if current user profile exists...');
      
      // Check if profile exists
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', currentUser.id)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          addLog('User profile not found. Creating profile...');
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: currentUser.id,
              email: currentUser.email,
              role: 'therapist', // Required by the schema
              subscription_tier: 'basic', // Match the schema constraint ('basic', 'professional', 'enterprise')
              subscription_status: 'active',
              subscription_expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (insertError) {
            console.error('Error creating user profile:', insertError);
            addLog(`Error creating profile: ${insertError.message}`);
          } else {
            addLog('User profile created successfully');
          }
        } else {
          console.error('Error checking user profile:', error);
          addLog(`Error checking profile: ${error.message}`);
        }
      } else {
        addLog('User profile exists');
      }
    } catch (error: any) {
      console.error('Error in ensureUserProfile:', error);
      addLog(`Profile check error: ${error.message}`);
    }
  };

  // Check and add is_admin column if it doesn't exist
  const checkAndAddIsAdminColumn = async () => {
    try {
      addLog('Checking if is_admin column exists in profiles table...');
      
      // Try to run a query that uses the is_admin column
      const { error } = await supabase
        .from('profiles')
        .select('is_admin')
        .limit(1);
      
      if (error) {
        // Column doesn't exist, add it
        if (error.message.includes('column "is_admin" does not exist') || error.code === 'PGRST116') {
          addLog('is_admin column does not exist. Adding it to the profiles table...');
          
          // Execute SQL to add the column through RPC
          const { error: rpcError } = await supabase.rpc('admin_query', {
            query_text: 'ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;'
          });
          
          if (rpcError) {
            console.error('Error adding is_admin column:', rpcError);
            addLog(`Failed to add is_admin column: ${rpcError.message}`);
          } else {
            addLog('is_admin column added successfully');
          }
        } else {
          console.error('Error checking is_admin column:', error);
          addLog(`Error checking column: ${error.message}`);
        }
      } else {
        addLog('is_admin column exists');
      }
    } catch (error: any) {
      console.error('Error in checkAndAddIsAdminColumn:', error);
      addLog(`Column check error: ${error.message}`);
    }
  };

  // Run migrations when component loads
  useEffect(() => {
    const checkAndSetAdmin = async () => {
      try {
        if (!currentUser) return;
        
        // Ensure user profile exists
        await ensureUserProfile();
        
        // Check and add is_admin column if needed
        await checkAndAddIsAdminColumn();
        
        // Add a log entry
        addLog('Checking for admin users in the system...');
        
        // Check if the current user is an admin
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', currentUser.id)
          .single();
          
        if (error) {
          console.error('Error checking admin status:', error);
          addLog('Error checking admin status. You may need to use the user management tab to set admin privileges.');
          return;
        }
        
        if (data?.is_admin) {
          addLog(`Admin privileges confirmed for ${currentUser.email}`);
        } else {
          addLog(`Note: ${currentUser.email} is not an admin. Use the user management tab to grant admin privileges if needed.`);
        }
      } catch (error: any) {
        console.error('Error in initial admin check:', error);
      }
    };

    if (isAuthenticated) {
      checkAndSetAdmin();
    }
  }, [isAuthenticated, currentUser]);

  // Load users when the users tab is selected
  useEffect(() => {
    if (isAuthenticated && activeTab === 'users') {
      fetchUsers();
    }
  }, [isAuthenticated, activeTab]);

  // Check if route is accessible
  if (!currentUser) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  You must be logged in to access the admin panel.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Go to Login
          </button>
        </div>
      </PageLayout>
    );
  }

  // Admin authentication form
  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="max-w-md mx-auto mt-10 px-4 py-8 bg-white rounded-lg shadow">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Authentication</h1>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Admin Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter admin password"
              onKeyDown={(e) => e.key === 'Enter' && verifyPassword()}
            />
          </div>
          <button
            onClick={verifyPassword}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium"
          >
            Access Admin Panel
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <h1 className="px-6 py-4 text-2xl font-bold text-gray-900">Admin Panel</h1>
            <div className="flex border-b border-gray-200">
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'subscription'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('subscription')}
              >
                Subscription Tester
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'logs'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('logs')}
              >
                Logs
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'cache'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('cache')}
              >
                Cache Management
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'database'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('database')}
              >
                Database
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'testaccount'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('testaccount')}
              >
                Test Account
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'users'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('users')}
              >
                User Management
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Subscription Tier Tester</h2>
                <p className="text-gray-600 mb-6">
                  Test different subscription tiers to verify functionality and appearance.
                </p>
                {currentUser && (
                  <SubscriptionTierTester userId={currentUser.id} />
                )}
              </div>
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Admin Action Logs</h2>
                <div className="bg-gray-100 p-4 rounded-md h-96 overflow-y-auto font-mono text-sm">
                  {logs.length > 0 ? (
                    logs.map((log, index) => (
                      <div key={index} className="pb-1 border-b border-gray-200 mb-1">
                        {log}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No logs yet. Actions will be recorded here.</p>
                  )}
                </div>
              </div>
            )}

            {/* Cache Management Tab */}
            {activeTab === 'cache' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Cache Management</h2>
                <p className="text-gray-600 mb-6">
                  Manage application cache and local storage.
                </p>
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-md">
                    <h3 className="font-medium mb-2">User Cache</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      Clear cache data specific to the current user.
                    </p>
                    <button
                      onClick={handleClearCache}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm"
                    >
                      Clear User Cache
                    </button>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-md">
                    <h3 className="font-medium mb-2">All Local Storage</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      <span className="text-red-500 font-bold">Warning:</span> This will clear all local storage data, including user preferences.
                    </p>
                    <button
                      onClick={handleClearAllStorage}
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-sm"
                    >
                      Clear All Storage
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Database Tab */}
            {activeTab === 'database' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Database Operations</h2>
                <p className="text-gray-600 mb-6">
                  Run database queries to inspect and debug application data.
                </p>
                <div className="mb-4">
                  <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1">
                    SQL Query
                  </label>
                  <textarea
                    id="query"
                    value={databaseQuery}
                    onChange={(e) => setDatabaseQuery(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter SQL query"
                  />
                </div>
                <div className="mb-6">
                  <button
                    onClick={runQuery}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm disabled:opacity-50"
                  >
                    {isLoading ? 'Running...' : 'Run Query'}
                  </button>
                </div>
                {queryResult && (
                  <div className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                    <h3 className="font-medium mb-2">Query Result:</h3>
                    <pre className="text-sm">
                      {JSON.stringify(queryResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Test Account Tab */}
            {activeTab === 'testaccount' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Test Account</h2>
                <p className="text-gray-600 mb-6">
                  Create and manage a dedicated test account to verify subscription features.
                </p>
                
                {testAccount ? (
                  <>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                      <h3 className="text-md font-semibold mb-2">Test Account Details</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p className="text-gray-600">Email:</p>
                        <p className="font-medium">{testAccount.email}</p>
                        
                        <p className="text-gray-600">Password:</p>
                        <p className="font-medium">TestAccount123!</p>
                        
                        <p className="text-gray-600">Current Tier:</p>
                        <p className="font-medium">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            testAccount.subscription_tier === 'basic' ? 'bg-gray-100 text-gray-800' :
                            testAccount.subscription_tier === 'professional' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {testAccount.subscription_tier === 'basic' ? 'Basic' :
                             testAccount.subscription_tier === 'professional' ? 'Professional' : 'Enterprise'}
                          </span>
                        </p>
                        
                        <p className="text-gray-600">Status:</p>
                        <p className="font-medium">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            {testAccount.subscription_status || 'Active'}
                          </span>
                        </p>
                        
                        <p className="text-gray-600">Expiry:</p>
                        <p className="font-medium">
                          {new Date(testAccount.subscription_expiry).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-md font-semibold mb-3">Change Subscription Tier</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Select a tier to test different subscription features:
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => changeTestAccountTier('starter')}
                          className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                            testAccount.subscription_tier === 'starter'
                              ? 'bg-gray-200 text-gray-800 cursor-default'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                          }`}
                          disabled={testAccount.subscription_tier === 'starter'}
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          Starter Tier
                        </button>
                        
                        <button
                          onClick={() => changeTestAccountTier('pro')}
                          className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                            testAccount.subscription_tier === 'pro'
                              ? 'bg-blue-200 text-blue-800 cursor-default'
                              : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                          }`}
                          disabled={testAccount.subscription_tier === 'pro'}
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          Pro Tier ($39/month)
                        </button>
                        
                        <button
                          onClick={() => changeTestAccountTier('premium')}
                          className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                            testAccount.subscription_tier === 'premium'
                              ? 'bg-purple-200 text-purple-800 cursor-default'
                              : 'bg-purple-100 hover:bg-purple-200 text-purple-800'
                          }`}
                          disabled={testAccount.subscription_tier === 'premium'}
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          Premium Tier ($79/month)
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-md font-semibold mb-3">Test Account Login</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Log in with the test account to explore features available for the current subscription tier:
                      </p>
                      <button
                        onClick={loginAsTestAccount}
                        className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md text-sm font-medium flex items-center"
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                        </svg>
                        Login as Test User
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No test account</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Create a test account to verify subscription features with different tiers.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={setupTestAccount}
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating...
                          </>
                        ) : (
                          <>
                            <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            Create Test Account
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Management Tab */}
            {activeTab === 'users' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">User Management</h2>
                <p className="text-gray-600 mb-6">
                  Manage user roles and permissions.
                </p>
                <div className="space-y-4">
                  {/* Search for users */}
                  <div className="p-4 border border-gray-200 rounded-md">
                    <h3 className="font-medium mb-2">Search User</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      Enter an email to search for a user.
                    </p>
                    <div className="flex space-x-2">
                      <input
                        type="email"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter user email"
                      />
                      <button
                        onClick={searchUser}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm"
                      >
                        {isLoading ? 'Searching...' : 'Search'}
                      </button>
                    </div>
                  </div>

                  {/* User list */}
                  <div className="p-4 border border-gray-200 rounded-md">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">User List</h3>
                      <button
                        onClick={fetchUsers}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md text-xs"
                      >
                        {isLoading ? 'Loading...' : 'Refresh List'}
                      </button>
                    </div>
                    {users.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                              <tr 
                                key={user.id} 
                                className={`hover:bg-gray-50 ${selectedUser?.id === user.id ? 'bg-blue-50' : ''}`}
                              >
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    user.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {user.is_admin ? 'Admin' : 'User'}
                                  </span>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    user.subscription_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {user.subscription_status || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                  <button
                                    onClick={() => selectUser(user)}
                                    className="text-blue-600 hover:text-blue-900 font-medium"
                                  >
                                    Select
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No users found. Use the search or click "Refresh List" to view users.</p>
                    )}
                  </div>

                  {/* User details & role management */}
                  {selectedUser && (
                    <div className="p-4 border border-gray-200 rounded-md">
                      <h3 className="font-medium mb-2">Selected User: {selectedUser.email}</h3>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                        <p className="text-gray-600">User ID:</p>
                        <p className="font-medium">{selectedUser.id}</p>
                        
                        <p className="text-gray-600">Current Role:</p>
                        <p className="font-medium">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            selectedUser.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {selectedUser.is_admin ? 'Admin' : 'User'}
                          </span>
                        </p>
                        
                        <p className="text-gray-600">Subscription:</p>
                        <p className="font-medium">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            selectedUser.subscription_tier === 'starter' ? 'bg-gray-100 text-gray-800' :
                            selectedUser.subscription_tier === 'pro' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {selectedUser.subscription_tier || 'N/A'}
                          </span>
                        </p>
                        
                        <p className="text-gray-600">Created At:</p>
                        <p className="font-medium">
                          {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-medium mb-2">Change User Role</h4>
                        <div className="flex items-center space-x-4 mb-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              className="form-radio h-4 w-4 text-blue-600"
                              name="userRole"
                              value="user"
                              checked={userRole === 'user'}
                              onChange={() => setUserRole('user')}
                            />
                            <span className="ml-2 text-sm text-gray-700">Regular User</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              className="form-radio h-4 w-4 text-blue-600"
                              name="userRole"
                              value="admin"
                              checked={userRole === 'admin'}
                              onChange={() => setUserRole('admin')}
                            />
                            <span className="ml-2 text-sm text-gray-700">Admin</span>
                          </label>
                        </div>
                        
                        <button
                          onClick={updateUserRole}
                          disabled={isLoading || (selectedUser.is_admin && userRole === 'admin') || (!selectedUser.is_admin && userRole === 'user')}
                          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm disabled:opacity-50"
                        >
                          {isLoading ? 'Updating...' : 'Update Role'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AdminPanel; 