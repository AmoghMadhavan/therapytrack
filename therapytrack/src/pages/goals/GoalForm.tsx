import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import { useAuth } from '../../contexts/SupabaseAuthContext';

// Simulated API data
const MOCK_CLIENTS = [
  { id: '1', name: 'Sarah Johnson' },
  { id: '2', name: 'Michael Chen' },
  { id: '3', name: 'Aisha Patel' },
  { id: '4', name: 'Robert Garcia' },
];

const MOCK_GOAL_CATEGORIES = [
  'Speech Production',
  'Language Comprehension',
  'Language Expression',
  'Social Communication',
  'Cognitive Communication',
  'Fluency',
  'Voice',
  'Swallowing',
  'Augmentative and Alternative Communication',
];

const MOCK_GOALS = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Sarah Johnson',
    title: 'Improve articulation of S-blends',
    description: 'Work on S-blend words in initial word position with 80% accuracy',
    category: 'Speech Production',
    startDate: '2023-06-01',
    targetDate: '2023-09-01',
    status: 'in-progress',
    progress: 45,
    lastUpdated: '2023-07-15',
    notes: 'Making steady progress, focusing on s-blends in reading activities',
    measurableOutcome: '80% accuracy in structured activities'
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'Michael Chen',
    title: 'Expand expressive vocabulary',
    description: 'Increase expressive vocabulary by 50 new words',
    category: 'Language Expression',
    startDate: '2023-05-15',
    targetDate: '2023-08-15',
    status: 'in-progress',
    progress: 60,
    lastUpdated: '2023-07-10',
    notes: 'Good progress with category-based vocabulary activities',
    measurableOutcome: '50 new consistently used words in conversation'
  },
  {
    id: '3',
    clientId: '3',
    clientName: 'Aisha Patel',
    title: 'Develop conversation turn-taking',
    description: 'Improve ability to take turns in conversation without interrupting',
    category: 'Social Communication',
    startDate: '2023-04-10',
    targetDate: '2023-08-10',
    status: 'in-progress',
    progress: 75,
    lastUpdated: '2023-07-12',
    notes: 'Significant improvement in structured conversations, still working on naturalistic settings',
    measurableOutcome: 'Maintains 5-minute conversation with appropriate turn-taking'
  },
  {
    id: '4',
    clientId: '1',
    clientName: 'Sarah Johnson',
    title: 'Increase sentence complexity',
    description: 'Use compound and complex sentences in narrative tasks',
    category: 'Language Expression',
    startDate: '2023-06-15',
    targetDate: '2023-10-15',
    status: 'not-started',
    progress: 0,
    lastUpdated: '2023-06-15',
    notes: 'Pending start, planned after completion of articulation goal',
    measurableOutcome: 'Use of 5+ compound/complex sentences in story retell'
  }
];

// Form state interface
interface FormState {
  clientId: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  targetDate: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'discontinued';
  progress: number;
  notes: string;
  measurableOutcome: string;
}

const GoalForm: React.FC = () => {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = Boolean(goalId);
  const { currentUser } = useAuth();
  
  const [formState, setFormState] = useState<FormState>({
    clientId: '',
    title: '',
    description: '',
    category: '',
    startDate: new Date().toISOString().split('T')[0],
    targetDate: '',
    status: 'not-started',
    progress: 0,
    notes: '',
    measurableOutcome: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if user is authenticated
    if (!currentUser) {
      navigate('/login', { state: { from: location } });
      return;
    }
    
    // If editing, load the goal data
    if (isEditMode && goalId) {
      // In a real app, this would be an API call
      const goal = MOCK_GOALS.find(g => g.id === goalId);
      
      if (goal) {
        setFormState({
          clientId: goal.clientId,
          title: goal.title,
          description: goal.description,
          category: goal.category,
          startDate: goal.startDate,
          targetDate: goal.targetDate,
          status: goal.status as FormState['status'],
          progress: goal.progress,
          notes: goal.notes,
          measurableOutcome: goal.measurableOutcome
        });
      } else {
        setError('Goal not found');
      }
    }
    
    setLoading(false);
  }, [goalId, isEditMode, navigate, currentUser, location]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: name === 'progress' ? Number(value) : value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    
    // Validate form
    if (!formState.clientId || !formState.title || !formState.category || !formState.startDate || !formState.targetDate) {
      setError('Please fill in all required fields');
      setSubmitting(false);
      return;
    }
    
    try {
      // In a real app, this would be an API call
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isEditMode) {
        console.log('Updated goal:', { id: goalId, ...formState });
      } else {
        console.log('New goal:', formState);
      }
      
      // Redirect to goals list
      navigate('/goals');
    } catch (err) {
      setError('An error occurred while saving the goal');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout>
      <div className="py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                {isEditMode ? 'Edit Goal' : 'Create New Goal'}
              </h2>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
                  Client <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="clientId"
                    name="clientId"
                    value={formState.clientId}
                    onChange={handleInputChange}
                    required
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Select a client</option>
                    {MOCK_CLIENTS.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="category"
                    name="category"
                    value={formState.category}
                    onChange={handleInputChange}
                    required
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Select a category</option>
                    {MOCK_GOAL_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Goal Title <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={formState.title}
                    onChange={handleInputChange}
                    required
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="E.g., Improve articulation of S-blends"
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
                    rows={3}
                    value={formState.description}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Detailed description of the goal"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">Brief description of what this goal entails.</p>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    value={formState.startDate}
                    onChange={handleInputChange}
                    required
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700">
                  Target Completion Date <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="targetDate"
                    id="targetDate"
                    value={formState.targetDate}
                    onChange={handleInputChange}
                    required
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="mt-1">
                  <select
                    id="status"
                    name="status"
                    value={formState.status}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="discontinued">Discontinued</option>
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="progress" className="block text-sm font-medium text-gray-700">
                  Progress (%)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="progress"
                    id="progress"
                    min="0"
                    max="100"
                    value={formState.progress}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="measurableOutcome" className="block text-sm font-medium text-gray-700">
                  Measurable Outcome
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="measurableOutcome"
                    id="measurableOutcome"
                    value={formState.measurableOutcome}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="E.g., 80% accuracy in structured activities"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">Specific, measurable criteria for determining when the goal is met.</p>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <div className="mt-1">
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={formState.notes}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Additional notes about this goal"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/goals')}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  isEditMode ? 'Update Goal' : 'Create Goal'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
};

export default GoalForm;