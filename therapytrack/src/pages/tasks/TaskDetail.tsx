import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import { useAuth } from '../../contexts/SupabaseAuthContext';

// Mock data - would be replaced with actual database fetch
const mockTasks = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Jane Smith',
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
    clientName: 'Michael Johnson',
    title: 'Sensory Integration Exercises',
    description: 'Complete the provided sensory diet activities each morning.',
    assignedDate: new Date('2023-05-30').toISOString(),
    dueDate: new Date('2023-06-06').toISOString(),
    status: 'in-progress',
    priority: 'medium',
    goalArea: ['Sensory Processing'],
    frequency: 'daily'
  },
  {
    id: '3',
    clientId: '3',
    clientName: 'Emma Wilson',
    title: 'Fine Motor Worksheet',
    description: 'Complete the attached worksheet to practice pencil control and hand strength.',
    assignedDate: new Date('2023-05-25').toISOString(),
    dueDate: new Date('2023-06-01').toISOString(),
    status: 'completed',
    priority: 'medium',
    goalArea: ['Fine Motor Skills'],
    frequency: 'once',
    completionDetails: {
      completedDate: new Date('2023-05-31').toISOString(),
      notes: 'Client completed with minimal assistance, showing improvement in grip strength.',
      rating: 4
    }
  }
];

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submittingStatus, setSubmittingStatus] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // This would be replaced with an actual database fetch
    const fetchedTask = mockTasks.find(task => task.id === id);
    
    if (fetchedTask) {
      setTask(fetchedTask);
    } else {
      // If task not found, redirect to tasks list
      navigate('/tasks');
    }
    
    setLoading(false);
  }, [id, currentUser, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'assigned':
        return 'bg-purple-100 text-purple-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'In Progress';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setSubmittingStatus(true);
      
      // This would be replaced with actual database update
      console.log(`Updating task ${id} status to ${newStatus}`);
      
      // Update local state
      setTask((prev: any) => ({
        ...prev,
        status: newStatus,
        ...(newStatus === 'completed' && {
          completionDetails: {
            completedDate: new Date().toISOString(),
            notes: '',
            rating: 0
          }
        })
      }));
      
      setSubmittingStatus(false);
    } catch (error) {
      console.error('Error updating task status:', error);
      setSubmittingStatus(false);
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

  if (!task) {
    return (
      <PageLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <p className="text-center text-gray-500">Task not found</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Task header */}
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900 sm:truncate">
                {task.title}
              </h1>
              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                    {getStatusLabel(task.status)}
                  </span>
                  <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                  </span>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Assigned to: {task.clientName}
                </div>
              </div>
            </div>
            <div className="mt-5 flex lg:mt-0 lg:ml-4">
              {task.status !== 'completed' && (
                <span className="hidden sm:block ml-3">
                  <Link
                    to={`/tasks/${task.id}/edit`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit
                  </Link>
                </span>
              )}
            </div>
          </div>
          
          {/* Task details */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Task Details</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Details and information about the task.</p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {task.description}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Goal Areas</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {task.goalArea.join(', ')}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Frequency</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {task.frequency.charAt(0).toUpperCase() + task.frequency.slice(1)}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Assigned Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(task.assignedDate).toLocaleDateString()}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </dd>
                </div>
                
                {task.status === 'completed' && task.completionDetails && (
                  <>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Completion Date</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {new Date(task.completionDetails.completedDate).toLocaleDateString()}
                      </dd>
                    </div>
                    {task.completionDetails.notes && (
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Completion Notes</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {task.completionDetails.notes}
                        </dd>
                      </div>
                    )}
                    {task.completionDetails.rating > 0 && (
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Performance Rating</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <div className="flex items-center">
                            {Array.from({ length: 5 }, (_, i) => (
                              <svg 
                                key={i}
                                className={`h-5 w-5 ${i < task.completionDetails.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="ml-2 text-sm text-gray-500">
                              {task.completionDetails.rating}/5
                            </span>
                          </div>
                        </dd>
                      </div>
                    )}
                  </>
                )}
              </dl>
            </div>
          </div>
          
          {/* Task status update */}
          {task.status !== 'completed' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Update Status</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Update the current status of this task.</p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <div className="flex flex-wrap gap-3">
                  {task.status !== 'assigned' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus('assigned')}
                      disabled={submittingStatus}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                      Mark as Assigned
                    </button>
                  )}
                  
                  {task.status !== 'in-progress' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus('in-progress')}
                      disabled={submittingStatus}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Mark as In Progress
                    </button>
                  )}
                  
                  {task.status !== 'completed' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus('completed')}
                      disabled={submittingStatus}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Mark as Completed
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default TaskDetail; 