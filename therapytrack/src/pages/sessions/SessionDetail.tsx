import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { getSession } from '../../services/supabaseService';
import { supabase } from '../../lib/supabase/config';

// Mock data - would be replaced with actual database fetch
const mockSessions = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Jane Smith',
    date: new Date('2023-06-01T14:00:00').toISOString(),
    duration: 60,
    status: 'completed',
    location: 'clinic',
    soap: {
      subjective: 'Client reports practicing daily at home. Parent notes improvement in school communication.',
      objective: 'Completed 8/10 articulation exercises correctly. Demonstrated 70% accuracy with targeted sounds.',
      assessment: 'Good progress on articulation goals. Attention span has improved since last session.',
      plan: 'Continue with current exercise program. Introducing new phonological awareness activities next session.'
    },
    privateNotes: 'Consider referral for audiological assessment if no improvement in next 3 sessions.',
    attachments: [],
    sentToClient: true,
    billingStatus: 'billed',
    billingCode: 'CPT-92507',
    createdAt: new Date('2023-06-01T14:00:00').toISOString(),
    updatedAt: new Date('2023-06-01T15:10:00').toISOString()
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'Michael Johnson',
    date: new Date('2023-06-02T10:00:00').toISOString(),
    duration: 45,
    status: 'scheduled',
    location: 'telehealth',
    soap: {
      subjective: '',
      objective: '',
      assessment: '',
      plan: 'Focus on sensory integration activities and fine motor skills.'
    },
    privateNotes: '',
    attachments: [],
    sentToClient: false,
    billingStatus: 'unbilled',
    billingCode: '',
    createdAt: new Date('2023-05-25T09:30:00').toISOString(),
    updatedAt: new Date('2023-05-25T09:30:00').toISOString()
  }
];

const SessionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    // Fetch session data from Supabase
    const fetchSessionData = async () => {
      if (!id) {
        navigate('/sessions');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching session with id: ${id}`);
        
        if (!currentUser) {
          console.warn('No user authenticated, using mock data');
          const mockSession = mockSessions.find(s => s.id === id);
          if (mockSession) {
            setSession(mockSession);
          } else {
            setError('Session not found');
          }
          return;
        }
        
        // Use the service to fetch the session
        const sessionData = await getSession(id);
        
        if (!sessionData) {
          console.warn('Session not found in database');
          setError('Session not found');
          setSession(null);
          return;
        }
        
        // Also fetch client details
        if (sessionData.clientId) {
          const { data: clientData, error: clientError } = await supabase
            .from('clients')
            .select('firstName, lastName')
            .eq('id', sessionData.clientId)
            .single();
            
          if (!clientError && clientData) {
            sessionData.clientName = `${clientData.firstName} ${clientData.lastName}`;
          } else {
            sessionData.clientName = 'Unknown Client';
          }
        }
        
        console.log('Session data loaded successfully');
        setSession(sessionData);
      } catch (err) {
        console.error('Error fetching session details:', err);
        setError('Failed to load session details. Please try again later.');
        
        // In development, fallback to mock data
        if (process.env.NODE_ENV === 'development') {
          console.warn('Using mock session data for development');
          const mockSession = mockSessions.find(s => s.id === id);
          if (mockSession) {
            setSession(mockSession);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [id, currentUser, navigate]);

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

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </PageLayout>
    );
  }

  if (!session) {
    return (
      <PageLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <p className="text-center text-gray-500">Session not found</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Session header */}
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900 sm:truncate">
                Session with {session.clientName}
              </h1>
              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(session.status)}`}>
                    {getStatusLabel(session.status)}
                  </span>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(session.date).toLocaleString()}
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {getLocationLabel(session.location)}
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {session.duration} minutes
                </div>
              </div>
            </div>
            <div className="mt-5 flex lg:mt-0 lg:ml-4">
              {session.status === 'scheduled' && (
                <>
                  <span className="hidden sm:block ml-3">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </button>
                  </span>
                  <span className="sm:ml-3">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Start Session
                    </button>
                  </span>
                </>
              )}
              
              {session.status === 'completed' && (
                <span className="sm:ml-3">
                  <Link
                    to={`/sessions/${session.id}/edit`}
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
          
          {/* SOAP Notes */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">SOAP Notes</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Session documentation and clinical notes.</p>
              </div>
              {session.status === 'completed' && !session.sentToClient && (
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Send to Client
                </button>
              )}
            </div>
            
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Subjective</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {session.soap.subjective || 'No subjective notes recorded.'}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Objective</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {session.soap.objective || 'No objective notes recorded.'}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Assessment</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {session.soap.assessment || 'No assessment notes recorded.'}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Plan</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {session.soap.plan || 'No plan notes recorded.'}
                  </dd>
                </div>
                
                {session.privateNotes && (
                  <div className="bg-yellow-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-yellow-700">Private Notes (not shared with client)</dt>
                    <dd className="mt-1 text-sm text-yellow-700 sm:mt-0 sm:col-span-2">
                      {session.privateNotes}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
          
          {/* Billing Information */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Billing Information</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Session billing details and status.</p>
            </div>
            
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      session.billingStatus === 'unbilled' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : session.billingStatus === 'billed' 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {session.billingStatus ? session.billingStatus.charAt(0).toUpperCase() + session.billingStatus.slice(1) : 'Unbilled'}
                    </span>
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Billing Code</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {session.billingCode || 'Not specified'}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Duration</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {session.duration} minutes
                  </dd>
                </div>
              </dl>
            </div>
            
            {session.status === 'completed' && session.billingStatus === 'unbilled' && (
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="button"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Mark as Billed
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SessionDetail; 