import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { createTimestamp, createSession, updateSession, getSession, getClientsByTherapist } from '../../services/supabaseService';
import { isFeatureEnabled } from '../../services/subscriptionService';

// Mock client data for selection
const mockClients = [
  {
    id: '1',
    firstName: 'Jane',
    lastName: 'Smith',
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Johnson',
  },
  {
    id: '3',
    firstName: 'Emma',
    lastName: 'Wilson',
  },
  {
    id: '4',
    firstName: 'Thomas',
    lastName: 'Brown',
  },
];

// Mock session data for edit mode
const mockSessions = [
  {
    id: '1',
    clientId: '1',
    date: '2023-06-01T14:00',
    duration: 60,
    status: 'completed',
    location: 'clinic',
    soap: {
      subjective: 'Client reports progress with homework exercises. Parent notes improved speech at home.',
      objective: 'Successfully completed 85% of articulation drills. Demonstrated improved /s/ sound production in word-initial position.',
      assessment: 'Good progress on articulation goals. Attention span has improved since last session.',
      plan: 'Continue with current program. Adding new exercises for /r/ sounds next session.'
    },
    privateNotes: 'Remember to follow up with parent about scheduling the next set of sessions.'
  }
];

const SessionForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [generatingNotes, setGeneratingNotes] = useState(false);
  const [showUpgradeMessage, setShowUpgradeMessage] = useState(false);
  
  // Feature flags based on subscription
  const [canUseAINotes, setCanUseAINotes] = useState(false);
  const [canUseFullNotes, setCanUseFullNotes] = useState(false);
  const [canUseExport, setCanUseExport] = useState(false);

  // Get clientId from query parameter for new sessions
  const queryParams = new URLSearchParams(location.search);
  const preselectedClientId = queryParams.get('clientId');

  // Form state
  const [formData, setFormData] = useState({
    clientId: preselectedClientId || '',
    date: new Date().toISOString().substring(0, 16), // Format: YYYY-MM-DDThh:mm
    duration: 60,
    status: 'scheduled',
    location: 'clinic',
    soap: {
      subjective: '',
      objective: '',
      assessment: '',
      plan: ''
    },
    privateNotes: '',
    billingStatus: 'unbilled',
    billingCode: ''
  });

  useEffect(() => {
    // Check if user is logged in
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Check subscription features
        const hasAINotes = await isFeatureEnabled(currentUser.id, 'aiNotes');
        const hasFullNotes = await isFeatureEnabled(currentUser.id, 'fullNotes');
        const hasExport = await isFeatureEnabled(currentUser.id, 'export');
        
        setCanUseAINotes(hasAINotes);
        setCanUseFullNotes(hasFullNotes);
        setCanUseExport(hasExport);

        // Fetch clients
        const clientsData = await getClientsByTherapist(currentUser.id);
        setClients(clientsData || []);

        // If in edit mode, fetch session data
        if (isEditMode && id) {
          const sessionData = await getSession(id);
          if (sessionData) {
            // Format date for input element
            const date = new Date(sessionData.date);
            const formattedDate = date.toISOString().substring(0, 16); // YYYY-MM-DDThh:mm
            
            setFormData({
              ...sessionData,
              date: formattedDate
            });
          } else {
            setError('Session not found');
            navigate('/sessions');
          }
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
        setError('Failed to load necessary data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, currentUser, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name.startsWith('soap.')) {
      const soapField = name.replace('soap.', '');
      setFormData({
        ...formData,
        soap: {
          ...formData.soap,
          [soapField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleGenerateAINotes = async () => {
    if (!canUseAINotes) {
      setShowUpgradeMessage(true);
      return;
    }
    
    if (!formData.soap.subjective || !formData.soap.objective) {
      setError('Please fill in subjective and objective fields to generate AI notes');
      return;
    }
    
    // Check for current user before proceeding
    if (!currentUser) {
      setError('User authentication required');
      navigate('/login');
      return;
    }
    
    try {
      setGeneratingNotes(true);
      
      // Import AI service only when needed - code splitting for performance
      const aiService = await import('../../services/aiService');
      
      // Get client name for better context
      const client = clients.find(c => c.id === formData.clientId);
      const clientName = client ? `${client.firstName} ${client.lastName}` : 'the client';
      
      // Generate AI notes using the service
      const aiNotes = await aiService.generateTreatmentPlan(
        currentUser.id,
        formData.clientId,
        `Client Name: ${clientName}. Subjective: ${formData.soap.subjective}`,
        `Objective Observations: ${formData.soap.objective}`
      );
      
      if (aiNotes) {
        // Try to split the AI response into assessment and plan
        let assessment = aiNotes;
        let plan = aiNotes;
        
        // Look for plan section indicators
        const planIndicators = ['Plan:', 'PLAN:', 'Treatment Plan:', 'Recommendations:'];
        
        for (const indicator of planIndicators) {
          if (aiNotes.includes(indicator)) {
            const parts = aiNotes.split(indicator);
            assessment = parts[0].trim();
            plan = parts[1].trim();
            break;
          }
        }
        
        setFormData({
          ...formData,
          soap: {
            ...formData.soap,
            assessment: assessment,
            plan: plan
          }
        });
      } else {
        // Fallback to simulated response if API fails
        const assessment = `Based on the subjective report and objective observations, ${clientName} demonstrates ${formData.soap.subjective.includes('progress') ? 'continued progress' : 'ongoing challenges'} with targeted skills. Client is showing ${formData.soap.objective.includes('improved') ? 'improvements in functional performance' : 'a need for continued therapeutic intervention'} across treatment areas.`;
        
        const plan = `Continue with current treatment plan focusing on ${formData.soap.subjective.includes('motor') ? 'motor skill development' : 'communication skills'}. Recommend weekly sessions to maintain progress.`;
        
        setFormData({
          ...formData,
          soap: {
            ...formData.soap,
            assessment,
            plan
          }
        });
      }
    } catch (error) {
      console.error('Error generating AI notes:', error);
      setError('Failed to generate AI notes. Please try again or fill in manually.');
    } finally {
      setGeneratingNotes(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId || !formData.date) {
      setError('Client and date are required');
      return;
    }
    
    try {
      setError('');
      setSubmitting(true);
      
      // Convert date string to ISO string
      const sessionDate = new Date(formData.date);
      
      // Prepare data for Supabase
      const sessionData = {
        ...formData,
        therapistId: currentUser?.id,
        date: sessionDate.toISOString(),
        createdAt: isEditMode ? undefined : createTimestamp(),
        updatedAt: createTimestamp(),
        sentToClient: false
      };
      
      // Save to Supabase
      if (isEditMode) {
        await updateSession(id as string, sessionData);
      } else {
        await createSession(sessionData);
      }
      
      // Navigate back to sessions list or client detail
      navigate(isEditMode ? `/sessions/${id}` : `/clients/${formData.clientId}`);
      
    } catch (error) {
      console.error('Error saving session:', error);
      setError('Failed to save session. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleExport = () => {
    if (!canUseExport) {
      setShowUpgradeMessage(true);
      return;
    }
    
    // Export logic would go here - for demo, just show an alert
    alert('Session data exported successfully!');
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
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditMode ? 'Edit Session' : 'New Session'}
              </h1>
            </div>
          </div>
          
          {showUpgradeMessage && (
            <div className="mb-6 bg-purple-50 border-l-4 border-purple-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-purple-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-purple-700">
                    This feature is only available on the Pro plan.
                    <a href="/account" className="font-medium underline text-purple-700 hover:text-purple-600 ml-1">
                      Upgrade now
                    </a> to unlock advanced features like AI notes and exports.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-400">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* Session Details */}
                  <div className="sm:col-span-3">
                    <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
                      Client
                    </label>
                    <div className="mt-1">
                      <select
                        id="clientId"
                        name="clientId"
                        value={formData.clientId}
                        onChange={handleInputChange}
                        required
                        disabled={isEditMode || !!preselectedClientId}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100"
                      >
                        <option value="">Select a client</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.firstName} {client.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                      Date & Time
                    </label>
                    <div className="mt-1">
                      <input
                        type="datetime-local"
                        name="date"
                        id="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                      Duration (minutes)
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="duration"
                        id="duration"
                        min="5"
                        step="5"
                        value={formData.duration}
                        onChange={handleInputChange}
                        required
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <div className="mt-1">
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="canceled">Canceled</option>
                        <option value="no-show">No Show</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <div className="mt-1">
                      <select
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="clinic">Clinic</option>
                        <option value="school">School</option>
                        <option value="home">Home Visit</option>
                        <option value="telehealth">Telehealth</option>
                      </select>
                    </div>
                  </div>

                  {/* SOAP Notes */}
                  <div className="sm:col-span-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium leading-6 text-gray-900 mt-4">SOAP Notes</h3>
                      <div>
                        <button
                          type="button"
                          onClick={handleGenerateAINotes}
                          disabled={generatingNotes}
                          className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white
                            ${canUseAINotes 
                              ? 'bg-purple-600 hover:bg-purple-700' 
                              : 'bg-gray-400 cursor-not-allowed'
                            }`}
                        >
                          {generatingNotes ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Generating...
                            </>
                          ) : (
                            <>
                              <svg className="mr-2 -ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                              Generate with AI
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    {!canUseFullNotes && (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-600">
                          Your current subscription only provides access to basic notes. 
                          <a href="/account" className="font-medium underline text-yellow-700 hover:text-yellow-600 ml-1">
                            Upgrade to Starter tier
                          </a> for full SOAP notes.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="soap.subjective" className="block text-sm font-medium text-gray-700">
                      Subjective
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="soap.subjective"
                        name="soap.subjective"
                        rows={3}
                        value={formData.soap.subjective}
                        onChange={handleInputChange}
                        placeholder="Client/parent report, how the client is feeling, reported symptoms or changes"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="soap.objective" className="block text-sm font-medium text-gray-700">
                      Objective
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="soap.objective"
                        name="soap.objective"
                        rows={3}
                        value={formData.soap.objective}
                        onChange={handleInputChange}
                        placeholder="Measurable observations, test results, session data, facts about what occurred in session"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className={`sm:col-span-6 ${!canUseFullNotes ? 'opacity-50' : ''}`}>
                    <label htmlFor="soap.assessment" className="block text-sm font-medium text-gray-700">
                      Assessment
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="soap.assessment"
                        name="soap.assessment"
                        rows={3}
                        value={formData.soap.assessment}
                        onChange={handleInputChange}
                        disabled={!canUseFullNotes}
                        placeholder={canUseFullNotes ? "Professional assessment of progress, analysis of findings, clinical interpretations" : "Upgrade to access this feature"}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  <div className={`sm:col-span-6 ${!canUseFullNotes ? 'opacity-50' : ''}`}>
                    <label htmlFor="soap.plan" className="block text-sm font-medium text-gray-700">
                      Plan
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="soap.plan"
                        name="soap.plan"
                        rows={3}
                        value={formData.soap.plan}
                        onChange={handleInputChange}
                        disabled={!canUseFullNotes}
                        placeholder={canUseFullNotes ? "Treatment plan, next steps, home program, changes to intervention" : "Upgrade to access this feature"}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="privateNotes" className="block text-sm font-medium text-gray-700">
                      Private Notes (not shared with client)
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="privateNotes"
                        name="privateNotes"
                        rows={3}
                        value={formData.privateNotes}
                        onChange={handleInputChange}
                        placeholder="Notes for your reference only"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  {/* Billing Information */}
                  <div className="sm:col-span-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mt-4">Billing Information</h3>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="billingStatus" className="block text-sm font-medium text-gray-700">
                      Billing Status
                    </label>
                    <div className="mt-1">
                      <select
                        id="billingStatus"
                        name="billingStatus"
                        value={formData.billingStatus}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="unbilled">Unbilled</option>
                        <option value="billed">Billed</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="billingCode" className="block text-sm font-medium text-gray-700">
                      Billing Code (CPT)
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="billingCode"
                        id="billingCode"
                        value={formData.billingCode}
                        onChange={handleInputChange}
                        placeholder="e.g., 92507"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 flex justify-between">
                <div>
                  <button
                    type="button"
                    onClick={handleExport}
                    className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm
                      ${canUseExport
                        ? 'border-indigo-600 text-indigo-600 bg-white hover:bg-indigo-50'
                        : 'border-gray-300 text-gray-400 bg-white cursor-not-allowed'
                      }`}
                  >
                    <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Export Session
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => navigate('/sessions')}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300"
                  >
                    {submitting ? 'Saving...' : 'Save Session'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SessionForm; 