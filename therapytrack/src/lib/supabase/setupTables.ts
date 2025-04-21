import { supabase, tableFrom } from './config';

export const checkAndSetupTables = async () => {
  console.log('Checking and setting up necessary database tables...');
  
  try {
    // Check if profiles table exists and has data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: profilesData, error: profilesError } = await supabase
      .from(tableFrom('profiles'))
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
      .from(tableFrom('clients'))
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
      .from(tableFrom('sessions'))
      .select('*')
      .limit(1);
      
    if (sessionsError && sessionsError.code === '42P01') { // Table doesn't exist
      console.log('Sessions table does not exist, creating it...');
      await createSessionsTable();
    } else {
      console.log('Sessions table exists');
    }
    
    // Check if tasks table exists
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: tasksData, error: tasksError } = await supabase
      .from(tableFrom('tasks'))
      .select('*')
      .limit(1);
      
    if (tasksError && tasksError.code === '42P01') { // Table doesn't exist
      console.log('Tasks table does not exist, creating it...');
      await createTasksTable();
    } else {
      console.log('Tasks table exists');
    }
    
    // Check if goals table exists
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: goalsData, error: goalsError } = await supabase
      .from(tableFrom('goals'))
      .select('*')
      .limit(1);
      
    if (goalsError && goalsError.code === '42P01') { // Table doesn't exist
      console.log('Goals table does not exist, creating it...');
      await createGoalsTable();
    } else {
      console.log('Goals table exists');
    }
    
    return { success: true, message: 'Table check/setup completed successfully' };
  } catch (error) {
    console.error('Error in table setup:', error);
    return { success: false, message: 'Error in table setup', error };
  }
};

const createProfilesTable = async () => {
  console.log('The profiles table should have been created with the SQL schema. This is a fallback only.');
  // This is now using the therapy schema, but this won't be called normally
  // as the tables are already created with the SQL script
};

const createClientsTable = async () => {
  console.log('The clients table should have been created with the SQL schema. This is a fallback only.');
};

const createSessionsTable = async () => {
  console.log('The sessions table should have been created with the SQL schema. This is a fallback only.');
};

const createTasksTable = async () => {
  console.log('The tasks table should have been created with the SQL schema. This is a fallback only.');
};

const createGoalsTable = async () => {
  console.log('The goals table should have been created with the SQL schema. This is a fallback only.');
};

export const initializeDefaultData = async (userId: string) => {
  if (!userId) return { success: false, message: 'No user ID provided' };
  
  try {
    // Check if user has a profile, create if not
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: profileData, error: profileError } = await supabase
      .from(tableFrom('profiles'))
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError && profileError.code === 'PGRST116') { // Not found
      // Create default profile
      const { error: insertError } = await supabase
        .from(tableFrom('profiles'))
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