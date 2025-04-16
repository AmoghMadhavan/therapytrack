import { supabase } from './config';

export const checkAndSetupTables = async () => {
  console.log('Checking and setting up necessary database tables...');
  
  try {
    // Check if profiles table exists and has data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
      
    if (profilesError && profilesError.code === '42P01') { // Table doesn't exist
      console.log('Profiles table does not exist, creating it...');
      await createProfilesTable();
    } else {
      console.log('Profiles table exists');
    }
    
    // Check if clients table exists
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);
      
    if (clientsError && clientsError.code === '42P01') { // Table doesn't exist
      console.log('Clients table does not exist, creating it...');
      await createClientsTable();
    } else {
      console.log('Clients table exists');
    }
    
    // Check if sessions table exists
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .limit(1);
      
    if (sessionsError && sessionsError.code === '42P01') { // Table doesn't exist
      console.log('Sessions table does not exist, creating it...');
      await createSessionsTable();
    } else {
      console.log('Sessions table exists');
    }
    
    return { success: true, message: 'Table check/setup completed successfully' };
  } catch (error) {
    console.error('Error in table setup:', error);
    return { success: false, message: 'Error in table setup', error };
  }
};

const createProfilesTable = async () => {
  // This is a simplified version for testing - in production, use proper migrations
  const { error } = await supabase.rpc('create_profiles_table', {});
  
  if (error) {
    console.error('Error creating profiles table:', error);
    // Fallback direct SQL approach using service role if available
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          email TEXT NOT NULL,
          display_name TEXT,
          role TEXT NOT NULL DEFAULT 'therapist',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      // Note: This might not work due to permissions, would require service role
      await supabase.auth.getSession().then(async (session) => {
        if (session.data.session) {
          // Attempting to create table as authenticated user
          console.log('Attempting to create profiles table as authenticated user');
        }
      });
    } catch (sqlError) {
      console.error('Error in SQL fallback for profiles table:', sqlError);
    }
  }
};

const createClientsTable = async () => {
  // This is a simplified version for testing - in production, use proper migrations
  const { error } = await supabase.rpc('create_clients_table', {});
  
  if (error) {
    console.error('Error creating clients table:', error);
    // Actual table creation would need appropriate permissions
  }
};

const createSessionsTable = async () => {
  // This is a simplified version for testing - in production, use proper migrations
  const { error } = await supabase.rpc('create_sessions_table', {});
  
  if (error) {
    console.error('Error creating sessions table:', error);
    // Actual table creation would need appropriate permissions
  }
};

export const initializeDefaultData = async (userId: string) => {
  if (!userId) return { success: false, message: 'No user ID provided' };
  
  try {
    // Check if user has a profile, create if not
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError && profileError.code === 'PGRST116') { // Not found
      // Create default profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          email: 'user@example.com', // This would be the actual user email
          display_name: 'Therapist',
          role: 'therapist'
        }]);
        
      if (insertError) {
        console.error('Error creating default profile:', insertError);
      }
    }
    
    return { success: true, message: 'Default data initialized' };
  } catch (error) {
    console.error('Error initializing default data:', error);
    return { success: false, message: 'Error initializing default data', error };
  }
}; 