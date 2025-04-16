import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import { useAuth } from '../../contexts/SupabaseAuthContext';

// Mock data for development
const mockClients = [
  {
    id: '1',
    firstName: 'Jane',
    lastName: 'Smith',
    dateOfBirth: new Date('2015-04-15').toISOString(),
    gender: 'Female',
    diagnosis: ['Speech Delay', 'Developmental Coordination Disorder'],
    goalAreas: ['Articulation', 'Fine Motor Skills', 'Sensory Processing'],
    status: 'active',
    lastSessionDate: new Date('2023-06-01').toISOString(),
    contactInfo: {
      email: 'parent@example.com',
      phone: '555-123-4567',
      guardianName: 'Sarah Smith',
      guardianRelationship: 'Mother',
      address: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip: '12345'
      }
    },
    notes: 'Jane has been making good progress with her articulation exercises. Continue working on /s/ and /r/ sounds.'
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Johnson',
    dateOfBirth: new Date('2014-09-22').toISOString(),
    gender: 'Male',
    diagnosis: ['Autism Spectrum Disorder', 'Sensory Processing'],
    goalAreas: ['Social Skills', 'Executive Functioning', 'Sensory Integration'],
    status: 'active',
    lastSessionDate: new Date('2023-05-28').toISOString(),
    contactInfo: {
      email: 'johnson.family@example.com',
      phone: '555-987-6543',
      guardianName: 'Robert Johnson',
      guardianRelationship: 'Father',
      address: {
        street: '456 Oak Ave',
        city: 'Anytown',
        state: 'CA',
        zip: '12345'
      }
    },
    notes: 'Michael responds well to visual schedules and sensory breaks during sessions.'
  }
];

const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    // Check if user is logged in
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // This would be replaced with a Supabase fetch
    const fetchedClient = mockClients.find(client => client.id === id);
    
    if (fetchedClient) {
      setClient(fetchedClient);
    } else {
      // If client not found, redirect to clients list
      navigate('/clients');
    }
    
    setLoading(false);
  }, [id, currentUser, navigate]);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </PageLayout>
    );
  }

  if (!client) {
    return (
      <PageLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <p className="text-center text-gray-500">Client not found</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Client header */}
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900 sm:truncate">
                {client.firstName} {client.lastName}
              </h1>
              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    client.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : client.status === 'inactive' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                  </span>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Born: {new Date(client.dateOfBirth).toLocaleDateString()}
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {client.gender}
                </div>
              </div>
            </div>
            <div className="mt-5 flex lg:mt-0 lg:ml-4">
              <span className="hidden sm:block ml-3">
                <Link
                  to={`/clients/${client.id}/edit`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit
                </Link>
              </span>

              <span className="sm:ml-3">
                <Link
                  to={`/sessions/new?clientId=${client.id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Session
                </Link>
              </span>
            </div>
          </div>
          
          {/* Tab navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`${
                  activeTab === 'profile'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm mr-8`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('sessions')}
                className={`${
                  activeTab === 'sessions'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm mr-8`}
              >
                Sessions
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`${
                  activeTab === 'tasks'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm mr-8`}
              >
                Tasks
              </button>
              <button
                onClick={() => setActiveTab('goals')}
                className={`${
                  activeTab === 'goals'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Goals
              </button>
            </nav>
          </div>
          
          {/* Tab content */}
          <div className="mt-6">
            {activeTab === 'profile' && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Client Information</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and diagnoses.</p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                  <dl className="sm:divide-y sm:divide-gray-200">
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Full name</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {client.firstName} {client.lastName}
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Date of birth</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {new Date(client.dateOfBirth).toLocaleDateString()}
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Guardian</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {client.contactInfo.guardianName} ({client.contactInfo.guardianRelationship})
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Contact information</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <div>{client.contactInfo.email}</div>
                        <div>{client.contactInfo.phone}</div>
                        <div className="mt-1">
                          {client.contactInfo.address.street}<br />
                          {client.contactInfo.address.city}, {client.contactInfo.address.state} {client.contactInfo.address.zip}
                        </div>
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Diagnoses</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                          {client.diagnosis.map((diagnosis: string, index: number) => (
                            <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                              <div className="w-0 flex-1 flex items-center">
                                <span className="ml-2 flex-1 w-0 truncate">{diagnosis}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Goal Areas</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                          {client.goalAreas.map((goal: string, index: number) => (
                            <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                              <div className="w-0 flex-1 flex items-center">
                                <span className="ml-2 flex-1 w-0 truncate">{goal}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Notes</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {client.notes}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}
            
            {activeTab === 'sessions' && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Sessions</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Recent and upcoming sessions.</p>
                  </div>
                  <Link
                    to={`/sessions/new?clientId=${client.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                  >
                    New Session
                  </Link>
                </div>
                <div className="border-t border-gray-200">
                  <div className="px-4 py-6 sm:px-6">
                    <p className="text-center text-gray-500 italic">No session records found. Create a new session to get started.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Tasks</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Assigned tasks and exercises.</p>
                  </div>
                  <Link
                    to={`/tasks/new?clientId=${client.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Assign Task
                  </Link>
                </div>
                <div className="border-t border-gray-200">
                  <div className="px-4 py-6 sm:px-6">
                    <p className="text-center text-gray-500 italic">No tasks assigned yet. Assign a task to get started.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'goals' && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Goals</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Therapy goals and progress.</p>
                  </div>
                  <Link
                    to={`/goals/new?clientId=${client.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Add Goal
                  </Link>
                </div>
                <div className="border-t border-gray-200">
                  <div className="px-4 py-6 sm:px-6">
                    <p className="text-center text-gray-500 italic">No goals set yet. Add a goal to track progress.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ClientDetail; 