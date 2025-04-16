import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import { useAuth } from '../../contexts/SupabaseAuthContext';

// Mock data - would be replaced with actual database fetches
const mockClients = [
  { id: '1', firstName: 'Jane', lastName: 'Smith' },
  { id: '2', firstName: 'Michael', lastName: 'Johnson' },
  { id: '3', firstName: 'Emma', lastName: 'Wilson' },
  { id: '4', firstName: 'Thomas', lastName: 'Brown' }
];

const mockGoalAreas = [
  'Articulation',
  'Language',
  'Fluency',
  'Voice',
  'Swallowing',
  'Cognition',
  'Social Communication',
  'Fine Motor Skills',
  'Gross Motor Skills',
  'Sensory Processing',
  'Reading Comprehension',
  'Writing'
];

const mockTasks = [
  {
    id: '1',
    clientId: '1',
    title: 'Daily Speech Practice',
    description: 'Practice /s/ sounds in word-initial position for 10 minutes daily.',
    assignedDate: new Date('2023-05-28').toISOString(),
    dueDate: new Date('2023-06-04').toISOString(),
    status: 'assigned',
    priority: 'high',
    goalArea: ['Articulation'],
    frequency: 'daily'
  },
  {
    id: '2',
    clientId: '2',
    title: 'Sensory Integration Exercises',
    description: 'Complete the provided sensory diet activities each morning.',
    assignedDate: new Date('2023-05-30').toISOString(),
    dueDate: new Date('2023-06-06').toISOString(),
    status: 'in-progress',
    priority: 'medium',
    goalArea: ['Sensory Processing'],
    frequency: 'daily'
  }
];

interface FormState {
  clientId: string;
  title: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  status: string;
  priority: string;
  goalArea: string[];
  frequency: string;
}

const TaskForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const clientIdFromQuery = searchParams.get('clientId');

  const initialState: FormState = {
    clientId: clientIdFromQuery || '',
    title: '',
    description: '',
    assignedDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    status: 'assigned',
    priority: 'medium',
    goalArea: [],
    frequency: 'once'
  };

  const [formState, setFormState] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (isEditMode) {
      // This would be replaced with an actual database fetch
      const task = mockTasks.find(task => task.id === id);
      if (task) {
        setFormState({
          clientId: task.clientId,
          title: task.title,
          description: task.description,
          assignedDate: new Date(task.assignedDate).toISOString().slice(0, 10),
          dueDate: new Date(task.dueDate).toISOString().slice(0, 10),
          status: task.status,
          priority: task.priority,
          goalArea: task.goalArea,
          frequency: task.frequency
        });
      } else {
        navigate('/tasks');
      }
    }

    setLoading(false);
  }, [id, currentUser, navigate, isEditMode, clientIdFromQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleGoalAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selectedGoals: string[] = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedGoals.push(options[i].value);
      }
    }
    setFormState(prev => ({ ...prev, goalArea: selectedGoals }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formState.clientId) {
      setError('Please select a client');
      return;
    }

    if (!formState.title.trim()) {
      setError('Please enter a task title');
      return;
    }

    if (!formState.description.trim()) {
      setError('Please enter a task description');
      return;
    }

    if (!formState.dueDate) {
      setError('Please set a due date');
      return;
    }

    if (formState.goalArea.length === 0) {
      setError('Please select at least one goal area');
      return;
    }

    try {
      setSubmitting(true);
      
      // This would be replaced with actual database operations
      if (isEditMode) {
        // Update task in database
        console.log('Updating task:', { id, ...formState });
      } else {
        // Create new task in database
        console.log('Creating new task:', formState);
      }
      
      // Redirect to task detail or tasks list
      navigate('/tasks');
    } catch (error) {
      console.error('Error submitting task:', error);
      setError('Failed to save task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900 sm:truncate">
                {isEditMode ? 'Edit Task' : 'Assign New Task'}
              </h1>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
                    Client
                  </label>
                  <div className="mt-1">
                    <select
                      id="clientId"
                      name="clientId"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={formState.clientId}
                      onChange={handleInputChange}
                      disabled={isEditMode}
                    >
                      <option value="">Select a client</option>
                      {mockClients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.firstName} {client.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                    Priority
                  </label>
                  <div className="mt-1">
                    <select
                      id="priority"
                      name="priority"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={formState.priority}
                      onChange={handleInputChange}
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Task Title
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="title"
                      id="title"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={formState.title}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={formState.description}
                      onChange={handleInputChange}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Provide clear instructions for the task with any necessary details.
                  </p>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="assignedDate" className="block text-sm font-medium text-gray-700">
                    Assigned Date
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="assignedDate"
                      id="assignedDate"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={formState.assignedDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                    Due Date
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="dueDate"
                      id="dueDate"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={formState.dueDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
                    Frequency
                  </label>
                  <div className="mt-1">
                    <select
                      id="frequency"
                      name="frequency"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={formState.frequency}
                      onChange={handleInputChange}
                    >
                      <option value="once">Once</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>

                {isEditMode && (
                  <div className="sm:col-span-3">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <div className="mt-1">
                      <select
                        id="status"
                        name="status"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formState.status}
                        onChange={handleInputChange}
                      >
                        <option value="assigned">Assigned</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="sm:col-span-6">
                  <label htmlFor="goalArea" className="block text-sm font-medium text-gray-700">
                    Goal Areas (hold Ctrl/Cmd to select multiple)
                  </label>
                  <div className="mt-1">
                    <select
                      id="goalArea"
                      name="goalArea"
                      multiple
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={formState.goalArea}
                      onChange={handleGoalAreaChange}
                      size={6}
                    >
                      {mockGoalAreas.map(goal => (
                        <option key={goal} value={goal}>
                          {goal}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Select one or more therapy goal areas that this task addresses.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/tasks')}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300"
                >
                  {submitting ? 'Saving...' : (isEditMode ? 'Update Task' : 'Assign Task')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default TaskForm; 