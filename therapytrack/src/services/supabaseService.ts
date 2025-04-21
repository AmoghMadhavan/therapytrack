import { supabase } from '../lib/supabase/config';
import { PostgrestError } from '@supabase/supabase-js';

// Timestamp utility functions
export const createTimestamp = () => new Date().toISOString();
export const dateToTimestamp = (date: Date) => date.toISOString();
export const timestampToDate = (timestamp: string) => new Date(timestamp);

// Client operations
export const getClients = async (therapistId: string) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('therapist_id', therapistId);
  
  if (error) throw error;
  return data;
};

export const getClient = async (id: string) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createClient = async (clientData: any) => {
  // Convert camelCase to snake_case for database compatibility
  const mappedData: Record<string, any> = {
    therapist_id: clientData.therapistId,
    user_id: clientData.userId,
    first_name: clientData.firstName,
    last_name: clientData.lastName,
    date_of_birth: clientData.dateOfBirth,
    gender: clientData.gender,
    email: clientData.contactInfo?.email,
    phone: clientData.contactInfo?.phone,
    guardian_name: clientData.contactInfo?.guardianName,
    guardian_relationship: clientData.contactInfo?.guardianRelationship,
    guardian_phone: clientData.contactInfo?.guardianPhone,
    guardian_email: clientData.contactInfo?.guardianEmail,
    address_street: clientData.contactInfo?.address?.street,
    address_city: clientData.contactInfo?.address?.city,
    address_state: clientData.contactInfo?.address?.state,
    address_zip: clientData.contactInfo?.address?.zip,
    diagnosis: clientData.diagnosis || [],
    notes: clientData.notes,
    status: clientData.status || 'active',
    created_at: clientData.createdAt,
    updated_at: clientData.updatedAt,
    goal_areas: clientData.goalAreas || []
  };

  // Remove any undefined values to avoid database constraint issues
  Object.keys(mappedData).forEach(key => {
    if (mappedData[key] === undefined) {
      delete mappedData[key];
    }
  });

  const { data, error } = await supabase
    .from('clients')
    .insert([mappedData])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating client:', error);
    throw error;
  }
  return data;
};

export const updateClient = async (id: string, clientData: any) => {
  // Convert camelCase to snake_case for database compatibility
  const mappedData: Record<string, any> = {
    therapist_id: clientData.therapistId,
    user_id: clientData.userId,
    first_name: clientData.firstName,
    last_name: clientData.lastName,
    date_of_birth: clientData.dateOfBirth,
    gender: clientData.gender,
    email: clientData.contactInfo?.email,
    phone: clientData.contactInfo?.phone,
    guardian_name: clientData.contactInfo?.guardianName,
    guardian_relationship: clientData.contactInfo?.guardianRelationship,
    guardian_phone: clientData.contactInfo?.guardianPhone,
    guardian_email: clientData.contactInfo?.guardianEmail,
    address_street: clientData.contactInfo?.address?.street,
    address_city: clientData.contactInfo?.address?.city,
    address_state: clientData.contactInfo?.address?.state,
    address_zip: clientData.contactInfo?.address?.zip,
    diagnosis: clientData.diagnosis || [],
    notes: clientData.notes,
    status: clientData.status || 'active',
    updated_at: clientData.updatedAt,
    goal_areas: clientData.goalAreas || []
  };

  // Remove any undefined values to avoid database constraint issues
  Object.keys(mappedData).forEach(key => {
    if (mappedData[key] === undefined) {
      delete mappedData[key];
    }
  });

  const { data, error } = await supabase
    .from('clients')
    .update(mappedData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating client:', error);
    throw error;
  }
  return data;
};

export const deleteClient = async (id: string) => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

// Session operations
export const getSessions = async (clientId: string) => {
  try {
    console.log(`Fetching sessions for clientId: ${clientId}`);
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('clientId', clientId);
    
    if (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
    
    console.log(`Successfully retrieved ${data?.length || 0} sessions`);
    return data || [];
  } catch (error) {
    console.error('Exception in getSessions:', error);
    throw error;
  }
};

export const getSession = async (id: string) => {
  try {
    console.log(`Fetching session with id: ${id}`);
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      // Don't throw on 'not found' errors - just return null
      if (error.code === 'PGRST116') {
        console.warn(`Session with id ${id} not found`);
        return null;
      }
      console.error('Error fetching session:', error);
      throw error;
    }
    
    console.log('Session data retrieved successfully');
    return data;
  } catch (error) {
    console.error('Exception in getSession:', error);
    throw error;
  }
};

export const createSession = async (sessionData: any) => {
  try {
    console.log('Creating new session with data:', 
      JSON.stringify({
        clientId: sessionData.clientId,
        date: sessionData.date,
        status: sessionData.status
      })
    );
    
    const { data, error } = await supabase
      .from('sessions')
      .insert([sessionData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating session:', error);
      throw error;
    }
    
    console.log('Session created successfully with id:', data?.id);
    return data;
  } catch (error) {
    console.error('Exception in createSession:', error);
    throw error;
  }
};

export const updateSession = async (id: string, sessionData: any) => {
  try {
    console.log(`Updating session with id: ${id}`);
    
    const { data, error } = await supabase
      .from('sessions')
      .update(sessionData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating session:', error);
      throw error;
    }
    
    console.log('Session updated successfully');
    return data;
  } catch (error) {
    console.error('Exception in updateSession:', error);
    throw error;
  }
};

export const deleteSession = async (id: string) => {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

// Task operations
export const getTasks = async (clientId: string) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('clientId', clientId);
  
  if (error) throw error;
  return data;
};

export const getTask = async (id: string) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createTask = async (taskData: any) => {
  // Convert camelCase to snake_case for database compatibility
  const mappedData: Record<string, any> = {
    therapist_id: taskData.therapist_id || taskData.therapistId,
    client_id: taskData.client_id || taskData.clientId,
    title: taskData.title,
    description: taskData.description,
    assigned_date: taskData.assigned_date || taskData.assignedDate || new Date(),
    due_date: taskData.due_date || taskData.dueDate,
    status: taskData.status || 'assigned',
    priority: taskData.priority || 'medium',
    goal_areas: taskData.goal_areas || taskData.goalAreas || [],
    frequency: taskData.frequency || 'once',
    created_at: taskData.created_at || taskData.createdAt || new Date(),
    updated_at: taskData.updated_at || taskData.updatedAt || new Date(),
    session_id: taskData.session_id || taskData.sessionId
  };

  // Remove any undefined values to avoid database constraint issues
  Object.keys(mappedData).forEach(key => {
    if (mappedData[key] === undefined) {
      delete mappedData[key];
    }
  });

  const { data, error } = await supabase
    .from('tasks')
    .insert([mappedData])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating task:', error);
    throw error;
  }
  return data;
};

export const updateTask = async (id: string, taskData: any) => {
  // Convert camelCase to snake_case for database compatibility
  const mappedData: Record<string, any> = {
    therapist_id: taskData.therapist_id || taskData.therapistId,
    client_id: taskData.client_id || taskData.clientId,
    title: taskData.title,
    description: taskData.description,
    assigned_date: taskData.assigned_date || taskData.assignedDate,
    due_date: taskData.due_date || taskData.dueDate,
    status: taskData.status,
    priority: taskData.priority,
    goal_areas: taskData.goal_areas || taskData.goalAreas,
    frequency: taskData.frequency,
    updated_at: taskData.updated_at || taskData.updatedAt || new Date(),
    session_id: taskData.session_id || taskData.sessionId
  };

  // Remove any undefined values to avoid database constraint issues
  Object.keys(mappedData).forEach(key => {
    if (mappedData[key] === undefined) {
      delete mappedData[key];
    }
  });

  const { data, error } = await supabase
    .from('tasks')
    .update(mappedData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating task:', error);
    throw error;
  }
  return data;
};

export const deleteTask = async (id: string) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

// Goal operations
export const getGoals = async (clientId: string) => {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('clientId', clientId);
  
  if (error) throw error;
  return data;
};

export const getGoal = async (id: string) => {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createGoal = async (goalData: any) => {
  // Convert camelCase to snake_case for database compatibility
  const mappedData: Record<string, any> = {
    therapist_id: goalData.therapist_id || goalData.therapistId,
    client_id: goalData.client_id || goalData.clientId,
    title: goalData.title,
    description: goalData.description,
    area: goalData.area,
    status: goalData.status || 'active',
    target_date: goalData.target_date || goalData.targetDate,
    baseline_measurement: goalData.baseline_measurement || goalData.baselineMeasurement,
    current_measurement: goalData.current_measurement || goalData.currentMeasurement,
    target_measurement: goalData.target_measurement || goalData.targetMeasurement,
    measurement_unit: goalData.measurement_unit || goalData.measurementUnit,
    notes: goalData.notes,
    created_at: goalData.created_at || goalData.createdAt || new Date(),
    updated_at: goalData.updated_at || goalData.updatedAt || new Date()
  };

  // Remove any undefined values to avoid database constraint issues
  Object.keys(mappedData).forEach(key => {
    if (mappedData[key] === undefined) {
      delete mappedData[key];
    }
  });

  const { data, error } = await supabase
    .from('goals')
    .insert([mappedData])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating goal:', error);
    throw error;
  }
  return data;
};

export const updateGoal = async (id: string, goalData: any) => {
  // Convert camelCase to snake_case for database compatibility
  const mappedData: Record<string, any> = {
    therapist_id: goalData.therapist_id || goalData.therapistId,
    client_id: goalData.client_id || goalData.clientId,
    title: goalData.title,
    description: goalData.description,
    area: goalData.area,
    status: goalData.status,
    target_date: goalData.target_date || goalData.targetDate,
    baseline_measurement: goalData.baseline_measurement || goalData.baselineMeasurement,
    current_measurement: goalData.current_measurement || goalData.currentMeasurement,
    target_measurement: goalData.target_measurement || goalData.targetMeasurement,
    measurement_unit: goalData.measurement_unit || goalData.measurementUnit,
    notes: goalData.notes,
    updated_at: goalData.updated_at || goalData.updatedAt || new Date()
  };

  // Remove any undefined values to avoid database constraint issues
  Object.keys(mappedData).forEach(key => {
    if (mappedData[key] === undefined) {
      delete mappedData[key];
    }
  });

  const { data, error } = await supabase
    .from('goals')
    .update(mappedData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
  return data;
};

export const deleteGoal = async (id: string) => {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

// User profile operations
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId: string, profileData: any) => {
  const { data, error } = await supabase
    .from('users')
    .update(profileData)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// File Storage operations
export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });
  
  if (error) throw error;
  return data;
};

export const getFileUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

export const deleteFile = async (bucket: string, path: string) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  
  if (error) throw error;
  return true;
};

// Add getClientsByTherapist function to retrieve clients for a specific therapist

export const getClientsByTherapist = async (therapistId: string) => {
  if (!therapistId) {
    console.error('getClientsByTherapist: No therapist ID provided');
    return [];
  }
  
  try {
    // Query clients associated with the therapist
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('therapist_id', therapistId);
      
    if (error) {
      console.error('Error fetching clients for therapist:', error);
      return [];
    }
    
    // Log how many clients were found
    console.log(`Found ${data?.length || 0} clients for therapist ${therapistId}`);
    
    return data || [];
  } catch (error) {
    console.error('Error in getClientsByTherapist:', error);
    return [];
  }
}; 