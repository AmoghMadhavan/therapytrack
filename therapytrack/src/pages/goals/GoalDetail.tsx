import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import { useAuth } from '../../contexts/SupabaseAuthContext';

// Mock data - would be replaced with actual database fetch
const mockGoals = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Jane Smith',
    title: 'Improve /s/ sound production',
    description: 'Improve articulation of /s/ sounds in word-initial position with 80% accuracy.',
    category: 'Articulation',
    startDate: new Date('2023-05-01').toISOString(),
    targetDate: new Date('2023-08-01').toISOString(),
    status: 'in-progress',
    progress: 60,
    lastUpdated: new Date('2023-06-01').toISOString(),
    notes: 'Making good progress, especially with visual cues.',
    measurableOutcome: 'Will produce /s/ sounds in word-initial position with 80% accuracy in conversational speech.'
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'Michael Johnson',
    title: 'Develop self-regulation skills',
    description: 'Develop ability to identify emotional state and apply appropriate self-regulation strategies.',
    category: 'Social Communication',
    startDate: new Date('2023-04-15').toISOString(),
    targetDate: new Date('2023-10-15').toISOString(),
    status: 'in-progress',
    progress: 40,
    lastUpdated: new Date('2023-05-30').toISOString(),
    notes: 'Using visual supports has been helpful for identification of emotions.',
    measurableOutcome: 'Will independently identify emotional state and select appropriate regulation strategy in 4/5 opportunities.'
  },
  {
    id: '3',
    clientId: '3',
    clientName: 'Emma Wilson',
    title: 'Improve fine motor control',
    description: 'Improve pencil grip and control for handwriting tasks.',
    category: 'Fine Motor Skills',
    startDate: new Date('2023-03-10').toISOString(),
    targetDate: new Date('2023-06-10').toISOString(),
    status: 'completed',
    progress: 100,
    lastUpdated: new Date('2023-06-05').toISOString(),
    notes: 'Goal met ahead of schedule. Emma is now able to maintain proper pencil grip throughout writing tasks.',
    measurableOutcome: 'Will maintain proper tripod grasp for full 5-minute writing activity.'
  }
];

// Mock tasks related to goals
const mockTasks = [
  {
    id: '1',
    goalId: '1',
    title: 'Daily Speech Practice',
    description: 'Practice /s/ sounds in word-initial position for 10 minutes daily.',
    dueDate: new Date('2023-06-04').toISOString(),
    status: 'assigned'
  },
  {
    id: '2',
    goalId: '1',
    title: 'Story Reading Activity',
    description: 'Read "Sam the Snake" story and identify all /s/ sounds.',
    dueDate: new Date('2023-06-10').toISOString(),
    status: 'completed'
  },
  {
    id: '3',
    goalId: '2',
    title: 'Emotion Recognition Cards',
    description: 'Review emotion cards and practice identifying feelings.',
    dueDate: new Date('2023-06-08').toISOString(),
    status: 'in-progress'
  }
];

const GoalDetail: React.FC = () => {
  const { goalId } = useParams<{ goalId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [goal, setGoal] = useState<any>(null);
  const [relatedTasks, setRelatedTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingStatus, setSubmittingStatus] = useState(false);
  const [progressHistory, setProgressHistory] = useState<any[]>([]);

  useEffect(() => {
    // Check if user is logged in
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // This would be replaced with an actual database fetch
    const fetchedGoal = mockGoals.find(g => g.id === goalId);
    
    if (fetchedGoal) {
      setGoal(fetchedGoal);
      
      // Fetch related tasks
      const tasks = mockTasks.filter(task => task.goalId === goalId);
      setRelatedTasks(tasks);
      
      // Generate some mock progress history
      if (fetchedGoal.progress > 0) {
        const history = [];
        let currentProgress = fetchedGoal.progress;
        const step = Math.floor(currentProgress / 3);
        
        for (let i = 0; i < 3; i++) {
          const date = new Date();
          date.setDate(date.getDate() - (i * 14)); // Every two weeks
          
          history.unshift({
            date: date.toISOString(),
            progress: i === 0 ? currentProgress : (currentProgress - step),
            note: `Progress update: ${i === 0 ? currentProgress : (currentProgress - step)}% complete`
          });
          
          currentProgress = currentProgress - step;
          if (currentProgress < 0) currentProgress = 0;
        }
        
        setProgressHistory(history);
      }
    } else {
      // If goal not found, redirect to goals list
      navigate('/goals');
    }
    
    setLoading(false);
  }, [goalId, currentUser, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'not-started':
        return 'bg-gray-100 text-gray-800';
      case 'discontinued':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusColor = (status: string) => {
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'In Progress';
      case 'not-started':
        return 'Not Started';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getProgressColorClass = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const handleUpdateProgress = async (newProgress: number) => {
    try {
      setSubmittingStatus(true);
      
      // This would be replaced with actual database update
      console.log(`Updating goal ${goalId} progress to ${newProgress}%`);
      
      // Update local state
      setGoal((prev: any) => {
        const updatedGoal = {
          ...prev,
          progress: newProgress,
          status: newProgress >= 100 ? 'completed' : (newProgress > 0 ? 'in-progress' : 'not-started'),
          lastUpdated: new Date().toISOString()
        };
        return updatedGoal;
      });
      
      // Add to progress history
      setProgressHistory((prev) => [
        ...prev,
        {
          date: new Date().toISOString(),
          progress: newProgress,
          note: `Progress updated to ${newProgress}%`
        }
      ]);
      
      setSubmittingStatus(false);
    } catch (error) {
      console.error('Error updating goal progress:', error);
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

  if (!goal) {
    return (
      <PageLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <p className="text-center text-gray-500">Goal not found</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Goal header */}
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900 sm:truncate">
                {goal.title}
              </h1>
              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(goal.status)}`}>
                    {getStatusLabel(goal.status)}
                  </span>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Client: {goal.clientName}
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Category: {goal.category}
                </div>
              </div>
            </div>
            <div className="mt-5 flex lg:mt-0 lg:ml-4">
              {goal.status !== 'completed' && (
                <>
                  <span className="hidden sm:block">
                    <Link
                      to={`/tasks/new?goalId=${goal.id}&clientId=${goal.clientId}`}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Assign Task
                    </Link>
                  </span>
                  <span className="hidden sm:block ml-3">
                    <Link
                      to={`/goals/${goal.id}/edit`}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit
                    </Link>
                  </span>
                </>
              )}
            </div>
          </div>
          
          {/* Goal Progress */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Goal Progress</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Current progress towards achieving this goal.</p>
              </div>
              <div className="text-3xl font-bold text-gray-700">{goal.progress}%</div>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full ${getProgressColorClass(goal.progress)}`} 
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
              
              {goal.status !== 'completed' && (
                <div className="mt-6">
                  <label htmlFor="progress" className="block text-sm font-medium text-gray-700">
                    Update Progress
                  </label>
                  <div className="mt-2 flex items-center">
                    <input
                      type="range"
                      id="progress"
                      name="progress"
                      min="0"
                      max="100"
                      step="5"
                      value={goal.progress}
                      onChange={(e) => handleUpdateProgress(parseInt(e.target.value))}
                      className="block w-full"
                    />
                    <span className="ml-3 text-sm text-gray-500">{goal.progress}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Goal details */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Goal Details</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Complete information about this therapy goal.</p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {goal.description}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Measurable Outcome</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {goal.measurableOutcome}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(goal.startDate).toLocaleDateString()}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Target Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(goal.targetDate).toLocaleDateString()}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(goal.lastUpdated).toLocaleDateString()}
                  </dd>
                </div>
                {goal.notes && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {goal.notes}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
          
          {/* Progress History */}
          {progressHistory.length > 0 && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Progress History</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Record of updates to this goal's progress.</p>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {progressHistory.map((entry, index) => (
                    <li key={index} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(entry.date).toLocaleDateString()} - {entry.progress}% Complete
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <div className={`h-3 w-16 rounded-full ${getProgressColorClass(entry.progress)}`}></div>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">{entry.note}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {/* Related Tasks */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Related Tasks</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Tasks assigned to help achieve this goal.</p>
              </div>
              {goal.status !== 'completed' && (
                <Link
                  to={`/tasks/new?goalId=${goal.id}&clientId=${goal.clientId}`}
                  className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Assign New Task
                </Link>
              )}
            </div>
            <div className="border-t border-gray-200">
              {relatedTasks.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {relatedTasks.map(task => (
                    <li key={task.id}>
                      <Link to={`/tasks/${task.id}`} className="block hover:bg-gray-50">
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-primary-600 truncate">
                              {task.title}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTaskStatusColor(task.status)}`}>
                                {getStatusLabel(task.status)}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">{task.description}</p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
                  No tasks have been assigned for this goal yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default GoalDetail; 