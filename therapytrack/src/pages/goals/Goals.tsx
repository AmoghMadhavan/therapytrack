import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  },
  {
    id: '4',
    clientId: '1',
    clientName: 'Jane Smith',
    title: 'Improve reading comprehension',
    description: 'Develop strategies for improved reading comprehension of narrative texts.',
    category: 'Language',
    startDate: new Date('2023-05-15').toISOString(),
    targetDate: new Date('2023-11-15').toISOString(),
    status: 'not-started',
    progress: 0,
    lastUpdated: new Date('2023-05-15').toISOString(),
    notes: 'Will begin focused work on this goal in July.',
    measurableOutcome: 'Will answer comprehension questions about grade-level narrative text with 80% accuracy.'
  }
];

const Goals: React.FC = () => {
  const { currentUser } = useAuth();
  const [goals, setGoals] = useState(mockGoals);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterClient, setFilterClient] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Get unique client names for filter
  const clientOptions = Array.from(new Set(mockGoals.map(goal => goal.clientName)));
  
  // Get unique categories for filter
  const categoryOptions = Array.from(new Set(mockGoals.map(goal => goal.category)));

  useEffect(() => {
    // This would be replaced with an actual database fetch
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'not-started':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
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

  const filteredGoals = goals.filter(goal => {
    const matchesSearch = 
      goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || goal.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || goal.category === filterCategory;
    const matchesClient = filterClient === 'all' || goal.clientName === filterClient;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesClient;
  });

  // Sort goals by progress (lowest to highest)
  const sortedGoals = [...filteredGoals].sort((a, b) => a.progress - b.progress);

  return (
    <PageLayout>
      <div className="py-10">
        <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">Therapy Goals</h1>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Link
                to="/goals/new"
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Add New Goal
              </Link>
            </div>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row justify-between mb-6 space-y-4 sm:space-y-0">
                <div className="w-full sm:w-1/3 sm:pr-4">
                  <label htmlFor="search" className="sr-only">
                    Search goals
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="search"
                      id="search"
                      className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Search goals"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full sm:w-2/3">
                  <select
                    id="status"
                    name="status"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  
                  <select
                    id="category"
                    name="category"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {categoryOptions.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  
                  <select
                    id="client"
                    name="client"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    value={filterClient}
                    onChange={(e) => setFilterClient(e.target.value)}
                  >
                    <option value="all">All Clients</option>
                    {clientOptions.map(client => (
                      <option key={client} value={client}>{client}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <ul className="divide-y divide-gray-200">
                    {sortedGoals.length > 0 ? (
                      sortedGoals.map((goal) => (
                        <li key={goal.id}>
                          <Link to={`/goals/${goal.id}`} className="block hover:bg-gray-50">
                            <div className="px-4 py-4 sm:px-6">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-primary-600 truncate">
                                  {goal.title}
                                </p>
                                <div className="ml-2 flex-shrink-0 flex">
                                  <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(goal.status)}`}>
                                    {getStatusLabel(goal.status)}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-2 sm:flex sm:justify-between">
                                <div className="sm:flex">
                                  <p className="flex items-center text-sm text-gray-500">
                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    {goal.clientName}
                                  </p>
                                  <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    {goal.category}
                                  </p>
                                </div>
                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <p>
                                    Target: {new Date(goal.targetDate).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-2">
                                <p className="text-sm text-gray-500 truncate">{goal.description}</p>
                              </div>
                              <div className="mt-3">
                                <div className="flex items-center">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                                    <div 
                                      className={`h-2.5 rounded-full ${getProgressColorClass(goal.progress)}`} 
                                      style={{ width: `${goal.progress}%` }}
                                    ></div>
                                  </div>
                                  <span className="ml-2 text-sm font-medium text-gray-700">{goal.progress}%</span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-6 text-center text-gray-500">
                        No goals found matching your criteria.
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </PageLayout>
  );
};

export default Goals; 