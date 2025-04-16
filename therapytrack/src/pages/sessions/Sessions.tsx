import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../lib/supabase/config';

// Mock data for development
const mockSessions = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Jane Smith',
    date: new Date('2023-06-01T14:00:00').toISOString(),
    duration: 60,
    status: 'completed',
    location: 'clinic',
    notes: 'Worked on articulation exercises and language skills.',
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'Michael Johnson',
    date: new Date('2023-06-02T10:00:00').toISOString(),
    duration: 45,
    status: 'scheduled',
    location: 'telehealth',
    notes: 'Focus on sensory integration and fine motor skills.',
  },
  {
    id: '3',
    clientId: '3',
    clientName: 'Emma Wilson',
    date: new Date('2023-05-25T15:30:00').toISOString(),
    duration: 60,
    status: 'completed',
    location: 'home',
    notes: 'Visual tracking exercises and handwriting practice.',
  },
  {
    id: '4',
    clientId: '4',
    clientName: 'Thomas Brown',
    date: new Date('2023-06-03T09:00:00').toISOString(),
    duration: 45,
    status: 'scheduled',
    location: 'clinic',
    notes: 'Continue with speech sound production and language development.',
  },
  {
    id: '5',
    clientId: '1',
    clientName: 'Jane Smith',
    date: new Date('2023-05-28T13:00:00').toISOString(),
    duration: 60,
    status: 'completed',
    location: 'clinic',
    notes: 'Made progress on /s/ sounds and vocabulary building.',
  },
];

const Sessions: React.FC = () => {
  const { currentUser } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch sessions from Supabase
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching sessions data...');
        
        if (!currentUser) {
          console.warn('No user authenticated, using mock data');
          setSessions(mockSessions);
          return;
        }
        
        // Query sessions table for the current therapist
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('sessions')
          .select(`
            *,
            clients (
              firstName,
              lastName
            )
          `)
          .eq('therapistId', currentUser.id);
          
        if (sessionsError) {
          console.error('Error fetching sessions:', sessionsError);
          setError('Failed to load sessions. Please try again later.');
          
          // In development, fallback to mock data
          if (process.env.NODE_ENV === 'development') {
            console.warn('Using mock session data for development');
            setSessions(mockSessions);
          }
          return;
        }
        
        console.log(`Successfully loaded ${sessionsData?.length || 0} sessions`);
        
        // Transform data to add clientName for use in the UI
        const formattedSessions = sessionsData?.map(session => ({
          ...session,
          clientName: session.clients 
            ? `${session.clients.firstName} ${session.clients.lastName}`
            : 'Unknown Client'
        })) || [];
        
        setSessions(formattedSessions);
      } catch (err) {
        console.error('Unexpected error fetching sessions:', err);
        setError('An unexpected error occurred. Please try again later.');
        
        // In development, fallback to mock data
        if (process.env.NODE_ENV === 'development') {
          console.warn('Using mock session data for development');
          setSessions(mockSessions);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
  }, [currentUser]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'scheduled':
        return 'Scheduled';
      case 'canceled':
        return 'Canceled';
      case 'no-show':
        return 'No Show';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getLocationLabel = (location: string) => {
    switch (location) {
      case 'clinic':
        return 'Clinic';
      case 'telehealth':
        return 'Telehealth';
      case 'home':
        return 'Home Visit';
      case 'school':
        return 'School';
      default:
        return location.charAt(0).toUpperCase() + location.slice(1);
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.notes.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Sort sessions by date (most recent first)
  const sortedSessions = [...filteredSessions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <PageLayout>
      <div className="py-10">
        <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">Sessions</h1>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Link
                to="/sessions/new"
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                New Session
              </Link>
            </div>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="flex flex-col sm:flex-row justify-between mb-6">
                <div className="w-full sm:w-1/3 mb-4 sm:mb-0">
                  <label htmlFor="search" className="sr-only">
                    Search sessions
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
                      placeholder="Search by client or notes"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-full sm:w-1/4">
                  <select
                    id="status"
                    name="status"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Sessions</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="canceled">Canceled</option>
                    <option value="no-show">No Show</option>
                  </select>
                </div>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {sortedSessions.length > 0 ? (
                      sortedSessions.map((session) => (
                        <li key={session.id}>
                          <Link to={`/sessions/${session.id}`} className="block hover:bg-gray-50">
                            <div className="px-4 py-4 sm:px-6">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-primary-600 truncate">
                                  {session.clientName}
                                </p>
                                <div className="ml-2 flex-shrink-0 flex">
                                  <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(session.status)}`}>
                                    {getStatusLabel(session.status)}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-2 sm:flex sm:justify-between">
                                <div className="sm:flex">
                                  <p className="flex items-center text-sm text-gray-500">
                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {new Date(session.date).toLocaleString(undefined, {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: 'numeric',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                  <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {getLocationLabel(session.location)}
                                  </p>
                                </div>
                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <p>
                                    {session.duration} minutes
                                  </p>
                                </div>
                              </div>
                              {session.notes && (
                                <div className="mt-2">
                                  <p className="text-sm text-gray-500 truncate">{session.notes}</p>
                                </div>
                              )}
                            </div>
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-6 text-center text-gray-500">
                        No sessions found matching your criteria.
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

export default Sessions; 