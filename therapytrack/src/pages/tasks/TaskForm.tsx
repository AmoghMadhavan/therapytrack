import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { createTask, getTaskById, updateTask, Task } from '../../services/taskService';
import { getTodayAsISODate, addDaysToDate } from '../../utils/dateUtils';
import Spinner from '../../components/Spinner';

const TaskForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const { currentUser: user } = useAuth();
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [task, setTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    client_id: '',
    due_date: addDaysToDate(1),
    status: 'assigned',
    priority: 'medium',
    goal_areas: [],
    frequency: 'once'
  });

  // Fetch clients data for the dropdown
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        if (!user?.id) return;
        
        const { data, error } = await fetch('/api/clients').then(res => res.json());
        
        if (error) throw error;
        if (data) {
          setClients(data);
          // Set first client as default if no client is selected and there are clients
          if (!task.client_id && data.length > 0) {
            setTask(prev => ({ ...prev, client_id: data[0].id }));
          }
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
        setErrorMessage('Failed to load clients. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [user]);

  // Fetch task data if in edit mode
  useEffect(() => {
    const fetchTask = async () => {
      if (!isEditMode || !id || !user?.id) return;
      
      try {
        setLoading(true);
        const taskData = await getTaskById(id, user.id);
        if (taskData) {
          // Format dates properly for form inputs
          setTask({
            ...taskData,
            due_date: taskData.due_date ? taskData.due_date.split('T')[0] : '',
            assigned_date: taskData.assigned_date ? taskData.assigned_date.split('T')[0] : getTodayAsISODate()
          });
        } else {
          setErrorMessage('Task not found.');
          navigate('/tasks');
        }
      } catch (error) {
        console.error('Error fetching task:', error);
        setErrorMessage('Failed to load task details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id, isEditMode, user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!user?.id) {
      setErrorMessage('You must be logged in to create or edit tasks.');
      return;
    }

    if (!task.title || !task.client_id || !task.due_date) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      const finalTask = {
        ...task,
        therapist_id: user.id
      } as Task;

      if (isEditMode && id) {
        await updateTask(id, finalTask);
      } else {
        await createTask(finalTask);
      }
      
      navigate('/tasks');
    } catch (error) {
      console.error('Error saving task:', error);
      setErrorMessage('Failed to save the task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? 'Edit Task' : 'Create New Task'}
      </h1>
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
            Title*
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="title"
            name="title"
            type="text"
            placeholder="Task title"
            value={task.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="description"
            name="description"
            placeholder="Description"
            value={task.description || ''}
            onChange={handleChange}
            rows={4}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="client_id">
            Client*
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="client_id"
            name="client_id"
            value={task.client_id}
            onChange={handleChange}
            required
          >
            <option value="">Select a client</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="due_date">
            Due Date*
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="due_date"
            name="due_date"
            type="date"
            value={task.due_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
            Status
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="status"
            name="status"
            value={task.status}
            onChange={handleChange}
          >
            <option value="assigned">Assigned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="priority">
            Priority
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="priority"
            name="priority"
            value={task.priority}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="frequency">
            Frequency
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="frequency"
            name="frequency"
            value={task.frequency}
            onChange={handleChange}
          >
            <option value="once">Once</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {/* Goal Areas Field */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="goal_areas">
            Goal Areas
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="goal_areas"
            name="goal_areas"
            multiple
            value={task.goal_areas || []}
            onChange={(e) => {
              const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
              setTask(prev => ({ ...prev, goal_areas: selectedOptions }));
            }}
          >
            <option value="anxiety">Anxiety</option>
            <option value="depression">Depression</option>
            <option value="stress">Stress Management</option>
            <option value="relationships">Relationships</option>
            <option value="self-esteem">Self-esteem</option>
            <option value="trauma">Trauma</option>
            <option value="behavior">Behavior</option>
            <option value="communication">Communication</option>
            <option value="coping">Coping Skills</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple areas</p>
        </div>

        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditMode ? 'Update Task' : 'Create Task'}
          </button>
          <button
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={() => navigate('/tasks')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm; 