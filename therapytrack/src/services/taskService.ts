import { supabase } from '../lib/supabaseClient';
import { tableFrom } from '../lib/supabase/config';

// Define a ClientInfo type to be used in clientsMap
interface ClientInfo {
  id: string;
  first_name: string;
  last_name: string;
}

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
  clientName?: string;
  clients?: { id: string; first_name: string; last_name: string };
  dueDate?: string;
}

// Get all tasks for a therapist
export const getTasksByTherapist = async (therapistId: string) => {
  try {
    // Using a simpler query approach to avoid string interpolation issues
    const { data, error } = await supabase
      .from(tableFrom('tasks'))
      .select('*')
      .eq('therapist_id', therapistId);

    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }

    // If needed, make a separate query for client details
    // or consider using RPC functions for more complex joins
    const taskData = data || [];
    
    // Get client IDs from tasks
    const clientIds = taskData.map(task => task.client_id).filter(Boolean);
    
    // If we have client IDs, fetch client details
    let clientsMap: Record<string, ClientInfo> = {};
    if (clientIds.length > 0) {
      const { data: clientsData } = await supabase
        .from(tableFrom('clients'))
        .select('id, first_name, last_name')
        .in('id', clientIds);
        
      if (clientsData) {
        // Create a map of client ID to client details
        clientsMap = clientsData.reduce<Record<string, ClientInfo>>((map, client) => {
          map[client.id] = client;
          return map;
        }, {});
      }
    }
    
    // Format the tasks with client names
    const formattedTasks = taskData.map(task => {
      const client = clientsMap[task.client_id];
      return {
        ...task,
        clientName: client 
          ? `${client.first_name} ${client.last_name}` 
          : 'Unknown Client'
      };
    });

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
      .from(tableFrom('tasks'))
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
    .from(tableFrom('tasks'))
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
    .from(tableFrom('tasks'))
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
    .from(tableFrom('tasks'))
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
    .from(tableFrom('tasks'))
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
      .from(tableFrom('tasks'))
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
    .from(tableFrom('tasks'))
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