import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { createTimestamp, dateToTimestamp, createClient, updateClient, getClient } from '../../services/supabaseService';
import { canAddMoreClients } from '../../services/subscriptionService';

// Use these as common diagnosis options
const DIAGNOSIS_OPTIONS = [
  'Speech Delay',
  'Developmental Coordination Disorder',
  'Autism Spectrum Disorder',
  'Sensory Processing',
  'Fine Motor Delay',
  'Visual Processing',
  'Language Delay',
  'Speech Articulation',
  'Auditory Processing',
  'ADHD'
];

// Use these as common goal areas
const GOAL_AREAS = [
  'Articulation',
  'Fine Motor Skills',
  'Gross Motor Skills',
  'Sensory Processing',
  'Social Skills',
  'Executive Functioning',
  'Language Development',
  'Visual Processing',
  'Feeding/Swallowing',
  'Self-Care/ADLs'
];

// Mock client data for edit mode
const mockClients = [
  {
    id: '1',
    firstName: 'Jane',
    lastName: 'Smith',
    dateOfBirth: '2015-04-15',
    gender: 'Female',
    diagnosis: ['Speech Delay', 'Developmental Coordination Disorder'],
    goalAreas: ['Articulation', 'Fine Motor Skills', 'Sensory Processing'],
    status: 'active',
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
  }
];

const ClientForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [canAddClient, setCanAddClient] = useState(true);
  const [showUpgradeMessage, setShowUpgradeMessage] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    diagnosis: [] as string[],
    goalAreas: [] as string[],
    status: 'active',
    contactInfo: {
      email: '',
      phone: '',
      guardianName: '',
      guardianRelationship: '',
      address: {
        street: '',
        city: '',
        state: '',
        zip: ''
      }
    },
    notes: ''
  });

  // Form state for adding new diagnoses and goals
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newGoalArea, setNewGoalArea] = useState('');

  useEffect(() => {
    // Check if user is logged in
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const checkSubscriptionAndLoad = async () => {
      try {
        setLoading(true);
        
        // Only check subscription limit for new clients, not when editing
        if (!isEditMode) {
          // Check if the user can add more clients based on their subscription
          const canAdd = await canAddMoreClients(currentUser.id);
          setCanAddClient(canAdd);
          
          if (!canAdd) {
            setShowUpgradeMessage(true);
          }
        }

        // If in edit mode, fetch client data
        if (isEditMode && id) {
          try {
            // Fetch from Supabase
            const clientData = await getClient(id);
            if (clientData) {
              setFormData({
                ...clientData,
                dateOfBirth: new Date(clientData.dateOfBirth).toISOString().substring(0, 10)
              });
            } else {
              setError('Client not found');
              navigate('/clients');
            }
          } catch (error) {
            console.error('Error fetching client:', error);
            setError('Failed to fetch client data');
            navigate('/clients');
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkSubscriptionAndLoad();
  }, [isEditMode, id, currentUser, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested fields like contactInfo.email
      const [parent, child] = name.split('.');
      const parentValue = formData[parent as keyof typeof formData];
      
      // Check if parentValue is an object before spreading
      if (parentValue && typeof parentValue === 'object') {
        setFormData({
          ...formData,
          [parent]: {
            ...parentValue,
            [child]: value
          }
        });
      }
    } else if (name.includes('address.')) {
      // Handle address fields
      const field = name.replace('address.', '');
      setFormData({
        ...formData,
        contactInfo: {
          ...formData.contactInfo,
          address: {
            ...formData.contactInfo.address,
            [field]: value
          }
        }
      });
    } else {
      // Handle regular fields
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleAddDiagnosis = () => {
    if (newDiagnosis && !formData.diagnosis.includes(newDiagnosis)) {
      setFormData({
        ...formData,
        diagnosis: [...formData.diagnosis, newDiagnosis]
      });
      setNewDiagnosis('');
    }
  };

  const handleRemoveDiagnosis = (index: number) => {
    setFormData({
      ...formData,
      diagnosis: formData.diagnosis.filter((_, i) => i !== index)
    });
  };

  const handleAddGoalArea = () => {
    if (newGoalArea && !formData.goalAreas.includes(newGoalArea)) {
      setFormData({
        ...formData,
        goalAreas: [...formData.goalAreas, newGoalArea]
      });
      setNewGoalArea('');
    }
  };

  const handleRemoveGoalArea = (index: number) => {
    setFormData({
      ...formData,
      goalAreas: formData.goalAreas.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth) {
      setError('First name, last name, and date of birth are required');
      return;
    }
    
    // Don't allow submission if they can't add more clients
    if (!isEditMode && !canAddClient) {
      setShowUpgradeMessage(true);
      setError('You have reached your client limit for your current subscription tier');
      return;
    }
    
    try {
      setError('');
      setSubmitting(true);
      
      // Prepare data for Supabase
      const clientData = {
        ...formData,
        therapistId: currentUser?.id,
        dateOfBirth: dateToTimestamp(new Date(formData.dateOfBirth)),
        createdAt: isEditMode ? undefined : createTimestamp(),
        updatedAt: createTimestamp()
      };
      
      // Save to Supabase
      if (isEditMode) {
        await updateClient(id as string, clientData);
      } else {
        await createClient(clientData);
      }
      
      // Navigate back to clients list
      navigate('/clients');
      
    } catch (error) {
      console.error('Error saving client:', error);
      setError('Failed to save client. Please try again.');
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
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditMode ? 'Edit Client' : 'Add New Client'}
              </h1>
            </div>
          </div>
          
          {showUpgradeMessage && !isEditMode && (
            <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    You have reached your client limit for your current subscription tier.
                    <a href="/account" className="font-medium underline text-yellow-700 hover:text-yellow-600 ml-1">
                      Upgrade your subscription
                    </a> to add more clients.
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
                  {/* Basic Information */}
                  <div className="sm:col-span-3">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="firstName"
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="lastName"
                        id="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                      Date of birth
                    </label>
                    <div className="mt-1">
                      <input
                        type="date"
                        name="dateOfBirth"
                        id="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        required
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <div className="mt-1">
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
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
                        value={formData.status}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="sm:col-span-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mt-4">Contact Information</h3>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="contactInfo.guardianName" className="block text-sm font-medium text-gray-700">
                      Guardian Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="contactInfo.guardianName"
                        id="contactInfo.guardianName"
                        value={formData.contactInfo.guardianName}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="contactInfo.guardianRelationship" className="block text-sm font-medium text-gray-700">
                      Relationship to Client
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="contactInfo.guardianRelationship"
                        id="contactInfo.guardianRelationship"
                        value={formData.contactInfo.guardianRelationship}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="contactInfo.email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="contactInfo.email"
                        id="contactInfo.email"
                        value={formData.contactInfo.email}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="contactInfo.phone" className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <div className="mt-1">
                      <input
                        type="tel"
                        name="contactInfo.phone"
                        id="contactInfo.phone"
                        value={formData.contactInfo.phone}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">
                      Street Address
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="address.street"
                        id="address.street"
                        value={formData.contactInfo.address.street}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="address.city"
                        id="address.city"
                        value={formData.contactInfo.address.city}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">
                      State
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="address.state"
                        id="address.state"
                        value={formData.contactInfo.address.state}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="address.zip" className="block text-sm font-medium text-gray-700">
                      ZIP Code
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="address.zip"
                        id="address.zip"
                        value={formData.contactInfo.address.zip}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  {/* Clinical Information */}
                  <div className="sm:col-span-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mt-4">Clinical Information</h3>
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700">
                      Diagnoses
                    </label>
                    <div className="mt-1 flex">
                      <select
                        value={newDiagnosis}
                        onChange={(e) => setNewDiagnosis(e.target.value)}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="">Select a diagnosis</option>
                        {DIAGNOSIS_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                        <option value="other">Other (Custom)</option>
                      </select>
                      {newDiagnosis === 'other' && (
                        <input
                          type="text"
                          placeholder="Enter custom diagnosis"
                          className="ml-2 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          onChange={(e) => setNewDiagnosis(e.target.value)}
                        />
                      )}
                      <button
                        type="button"
                        onClick={handleAddDiagnosis}
                        className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Add
                      </button>
                    </div>
                    <div className="mt-2">
                      <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                        {formData.diagnosis.map((diagnosis, index) => (
                          <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                            <div className="w-0 flex-1 flex items-center">
                              <span className="ml-2 flex-1 w-0 truncate">{diagnosis}</span>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => handleRemoveDiagnosis(index)}
                                className="font-medium text-red-600 hover:text-red-500"
                              >
                                Remove
                              </button>
                            </div>
                          </li>
                        ))}
                        {formData.diagnosis.length === 0 && (
                          <li className="pl-3 pr-4 py-3 text-sm text-gray-500">
                            No diagnoses added
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700">
                      Goal Areas
                    </label>
                    <div className="mt-1 flex">
                      <select
                        value={newGoalArea}
                        onChange={(e) => setNewGoalArea(e.target.value)}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="">Select a goal area</option>
                        {GOAL_AREAS.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                        <option value="other">Other (Custom)</option>
                      </select>
                      {newGoalArea === 'other' && (
                        <input
                          type="text"
                          placeholder="Enter custom goal area"
                          className="ml-2 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          onChange={(e) => setNewGoalArea(e.target.value)}
                        />
                      )}
                      <button
                        type="button"
                        onClick={handleAddGoalArea}
                        className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Add
                      </button>
                    </div>
                    <div className="mt-2">
                      <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                        {formData.goalAreas.map((goalArea, index) => (
                          <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                            <div className="w-0 flex-1 flex items-center">
                              <span className="ml-2 flex-1 w-0 truncate">{goalArea}</span>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => handleRemoveGoalArea(index)}
                                className="font-medium text-red-600 hover:text-red-500"
                              >
                                Remove
                              </button>
                            </div>
                          </li>
                        ))}
                        {formData.goalAreas.length === 0 && (
                          <li className="pl-3 pr-4 py-3 text-sm text-gray-500">
                            No goal areas added
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="notes"
                        name="notes"
                        rows={4}
                        value={formData.notes}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="button"
                  onClick={() => navigate('/clients')}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || (!isEditMode && !canAddClient)}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white
                    ${(!isEditMode && !canAddClient) 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300'
                    }`}
                >
                  {submitting ? 'Saving...' : 'Save Client'}
                </button>
                {!isEditMode && !canAddClient && (
                  <a 
                    href="/account" 
                    className="mt-2 inline-block text-primary-600 hover:text-primary-500 text-sm"
                  >
                    Upgrade your subscription
                  </a>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ClientForm; 