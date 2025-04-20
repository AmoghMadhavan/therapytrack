import { supabase } from '../lib/supabaseClient';

export interface Task {
  id?: string;
  therapist_id: string;
  client_id: string;
  title: string;
  description?: string;
  assigned_date?: string;
  due_date: string;
  status: 'assigned' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  goal_areas?: string[];
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  completion_details?: {
    completed_date: string;
    notes: string;
    rating: number;
  };
  created_at?: string;
  updated_at?: string;
}

// Get all tasks for a therapist
export const getTasksByTherapist = async (therapistId: string) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        clients(id, firstName, lastName)
      `)
      .eq('therapist_id', therapistId);

    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }

    // Format the tasks with client names
    const formattedTasks = data.map(task => ({
      ...task,
      clientName: task.clients ? `${task.clients.firstName} ${task.clients.lastName}` : 'Unknown Client'
    }));

    return formattedTasks;
  } catch (error) {
    console.error('Exception in getTasksByTherapist:', error);
    throw error;
  }
};

// Get all tasks for a specific client
export const getTasksByClient = async (therapistId: string, clientId: string) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('therapist_id', therapistId)
      .eq('client_id', clientId);

    if (error) {
      console.error('Error fetching client tasks:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Exception in getTasksByClient:', error);
    throw error;
  }
};

// Get a single task by ID
export const getTaskById = async (id: string, therapistId: string): Promise<Task | null> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .eq('therapist_id', therapistId)
    .single();

  if (error) {
    console.error('Error fetching task:', error);
    throw new Error(error.message);
  }

  return data;
};

// Create a new task
export const createTask = async (task: Task): Promise<Task> => {
  const { data, error } = await supabase
    .from('tasks')
    .insert([task])
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    throw new Error(error.message);
  }

  return data;
};

// Update an existing task
export const updateTask = async (id: string, task: Partial<Task>): Promise<Task> => {
  const { data, error } = await supabase
    .from('tasks')
    .update(task)
    .eq('id', id)
    .eq('therapist_id', task.therapist_id)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    throw new Error(error.message);
  }

  return data;
};

// Delete a task
export const deleteTask = async (id: string, therapistId: string): Promise<void> => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('therapist_id', therapistId);

  if (error) {
    console.error('Error deleting task:', error);
    throw new Error(error.message);
  }
};

// Update task status
export const updateTaskStatus = async (taskId: string, status: Task['status'], completionDetails?: Task['completion_details']) => {
  try {
    const updates: Partial<Task> = { status };
    
    // If task is completed, add completion details
    if (status === 'completed' && completionDetails) {
      updates.completion_details = completionDetails;
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select();

    if (error) {
      console.error('Error updating task status:', error);
      throw error;
    }

    return data[0];
  } catch (error) {
    console.error('Exception in updateTaskStatus:', error);
    throw error;
  }
};

export const getTasks = async (therapistId: string, filters?: { 
  clientId?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
}): Promise<Task[]> => {
  let query = supabase
    .from('tasks')
    .select('*')
    .eq('therapist_id', therapistId);

  if (filters) {
    if (filters.clientId) {
      query = query.eq('client_id', filters.clientId);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters.dueDate) {
      query = query.eq('due_date', filters.dueDate);
    }
  }

  const { data, error } = await query.order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching tasks:', error);
    throw new Error(error.message);
  }

  return data || [];
}; 