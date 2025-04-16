import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../lib/supabase/config';

const Account: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [clientCount, setClientCount] = useState<number>(0);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        // Get user profile from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else {
          setProfile(profileData);
        }

        // Get client count for this therapist
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('id')
          .eq('therapist_id', currentUser.id);

        if (clientsError) {
          console.error('Error fetching clients count:', clientsError);
        } else {
          setClientCount(clientsData.length);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser, navigate]);

  const handleUpgrade = async (tier: 'starter' | 'pro' | 'premium') => {
    // In a real app, this would integrate with a payment processor
    // For this demo, we'll just update the subscription tier directly
    try {
      if (!currentUser) {
        alert('You must be logged in to change your subscription.');
        navigate('/login');
        return;
      }
      
      setProcessingPayment(true);
      
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_tier: tier,
          subscription_status: 'active',
          subscription_expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        })
        .eq('id', currentUser.id);

      if (error) {
        console.error('Error updating subscription:', error);
        alert('Failed to update subscription. Please try again.');
      } else {
        // Refresh profile data
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
          
        setProfile(updatedProfile);
        alert(`Successfully ${`upgraded to ${tier === 'starter' ? 'Starter' : tier === 'pro' ? 'Pro' : 'Premium AI'} tier`}!`);
      }
    } catch (error) {
      console.error('Error during payment processing:', error);
      alert('An error occurred during payment processing. Please try again.');
    } finally {
      setProcessingPayment(false);
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

  const currentTier = profile?.subscription_tier || 'starter';
  const expiryDate = profile?.subscription_expiry ? new Date(profile.subscription_expiry).toLocaleDateString() : 'N/A';
  
  const getClientLimit = (tier: string): number => {
    switch(tier) {
      case 'starter': return 5;
      case 'pro': return 20;
      case 'premium': return 50;
      default: return 5;
    }
  };
  
  // Helper function for displaying client limit
  const displayClientLimit = (tier: string): string => {
    const limit = getClientLimit(tier);
    return limit === Infinity ? '∞' : limit.toString();
  };

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
              <button
                onClick={() => navigate('/admin')}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                Admin Panel
              </button>
            </div>
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Subscription</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage your Theriq subscription plan</p>
            </div>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900">Current Subscription</h2>
            <div className="mt-4">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Plan</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800">
                      {currentTier === 'starter' ? 'Starter' : currentTier === 'pro' ? 'Pro' : 'Premium AI'}
                    </span>
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {profile?.subscription_status || 'Active'}
                    </span>
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Renewal Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">{expiryDate}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Client Usage</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {clientCount} / {displayClientLimit(currentTier)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Available Plans</h2>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Starter Plan */}
          <div className={`bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200 ${currentTier === 'starter' ? 'border-2 border-primary-500' : ''}`}>
            <div className={`px-4 py-5 sm:px-6 ${currentTier === 'starter' ? 'bg-primary-50' : ''}`}>
              <h3 className="text-lg font-medium text-gray-900">Starter</h3>
              <p className="mt-1 text-sm text-gray-500">Basic features for small practices</p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="text-5xl font-extrabold text-gray-900 mb-4">$0<span className="text-xl font-normal text-gray-500">/month</span></div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2 text-sm text-gray-500">Up to 5 clients</span>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2 text-sm text-gray-500">Basic session notes</span>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2 text-sm text-gray-500">Client management</span>
                </li>
              </ul>
            </div>
            <div className="px-4 py-4 sm:px-6">
              <button
                onClick={() => handleUpgrade('starter')}
                disabled={currentTier === 'starter' || processingPayment}
                className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                  ${currentTier === 'starter' 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                  }`}
              >
                {currentTier === 'starter' ? 'Current Plan' : processingPayment ? 'Processing...' : 'Downgrade'}
              </button>
            </div>
          </div>
          
          {/* Pro Plan */}
          <div className={`bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200 ${currentTier === 'pro' ? 'border-2 border-primary-500' : ''}`}>
            <div className={`px-4 py-5 sm:px-6 ${currentTier === 'pro' ? 'bg-primary-50' : ''}`}>
              <h3 className="text-lg font-medium text-gray-900">Pro</h3>
              <p className="mt-1 text-sm text-gray-500">For established practices</p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="text-5xl font-extrabold text-gray-900 mb-4">$39<span className="text-xl font-normal text-gray-500">/month</span></div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2 text-sm text-gray-500">Up to 20 clients</span>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2 text-sm text-gray-500">AI-powered notes</span>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2 text-sm text-gray-500">Advanced analytics</span>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2 text-sm text-gray-500">Export & integration tools</span>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2 text-sm text-gray-500">Priority support</span>
                </li>
              </ul>
            </div>
            <div className="px-4 py-4 sm:px-6">
              <button
                onClick={() => handleUpgrade('pro')}
                disabled={currentTier === 'pro' || processingPayment}
                className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                  ${currentTier === 'pro' 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                  }`}
              >
                {currentTier === 'pro' ? 'Current Plan' : processingPayment ? 'Processing...' : 'Upgrade'}
              </button>
            </div>
          </div>
          
          {/* Premium AI Plan */}
          <div className={`bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200 ${currentTier === 'premium' ? 'border-2 border-primary-500' : ''}`}>
            <div className={`px-4 py-5 sm:px-6 ${currentTier === 'premium' ? 'bg-primary-50' : ''}`}>
              <h3 className="text-lg font-medium text-gray-900">Premium AI</h3>
              <p className="mt-1 text-sm text-gray-500">Advanced AI-powered features</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mt-2">
                New
              </span>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="text-5xl font-extrabold text-gray-900 mb-4">$79<span className="text-xl font-normal text-gray-500">/month</span></div>
              <div className="mb-4">
                <span className="text-sm text-purple-600 font-medium">14-day free trial available</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2 text-sm text-gray-500">Everything in Pro plan</span>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2 text-sm text-gray-500">AI session analysis</span>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2 text-sm text-gray-500">AI treatment plan generation</span>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2 text-sm text-gray-500">AI progress predictions</span>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2 text-sm text-gray-500">Natural language search</span>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2 text-sm text-gray-500">Voice-to-notes transcription</span>
                </li>
              </ul>
            </div>
            <div className="px-4 py-4 sm:px-6">
              <button
                onClick={() => handleUpgrade('premium')}
                disabled={currentTier === 'premium' || processingPayment}
                className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                  ${currentTier === 'premium' 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                  }`}
              >
                {currentTier === 'premium' ? 'Current Plan' : processingPayment ? 'Processing...' : 'Upgrade to Premium AI'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Account; 