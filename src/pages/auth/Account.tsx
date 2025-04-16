import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../lib/supabase/config';
import { 
  updateSubscriptionTier, 
  SubscriptionTier, 
  getCurrentSubscriptionTier, 
  subscriptionTiers 
} from '../../services/subscriptionService';
import toast from 'react-hot-toast';

const Account: React.FC = () => {
  const { currentUser, refreshSession } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [clientCount, setClientCount] = useState<number>(0);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [updating, setUpdating] = useState(false);

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
          toast.error('Error loading profile data');
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
          toast.error('Error loading client data');
        } else {
          setClientCount(clientsData.length);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('An error occurred while loading account data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser, navigate]);

  const handleUpgrade = async (tier: SubscriptionTier) => {
    if (!currentUser) {
      toast.error('You must be logged in to change your subscription');
      navigate('/login');
      return;
    }
    
    try {
      setProcessingPayment(true);
      
      // Use the subscription service to update the tier
      const success = await updateSubscriptionTier(currentUser.id, tier);
      
      if (success) {
        // Refresh profile data
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
          
        setProfile(updatedProfile);
        
        // Refresh the auth session to ensure it has the latest data
        await refreshSession();
        
        toast.success(`Successfully ${
          tier === currentTier ? 'renewed' : 
          tier === 'starter' ? 'downgraded to Starter' : 
          `upgraded to ${tier === 'pro' ? 'Pro' : 'Premium AI'}`
        } tier!`);
      } else {
        toast.error('Failed to update subscription. Please try again.');
      }
    } catch (error) {
      console.error('Error during payment processing:', error);
      toast.error('An error occurred during payment processing. Please try again.');
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
    if (tier === 'starter') return 5;
    if (tier === 'pro') return 20;
    if (tier === 'premium') return 50;
    if (tier === 'basic') return 5;
    if (tier === 'professional') return 20;
    if (tier === 'enterprise') return 50;
    return 5;
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
                      {currentTier === 'starter' || currentTier === 'basic' ? 'Starter' : 
                       currentTier === 'pro' || currentTier === 'professional' ? 'Pro' : 'Premium AI'}
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
          <div className={`bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200 ${
            currentTier === 'starter' || currentTier === 'basic' ? 'border-2 border-primary-500' : ''
          }`}>
            <div className={`px-4 py-5 sm:px-6 ${
              currentTier === 'starter' || currentTier === 'basic' ? 'bg-primary-50' : ''
            }`}>
              <h3 className="text-lg font-medium text-gray-900">Starter</h3>
              <p className="mt-1 text-sm text-gray-500">Basic features for small practices</p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="text-5xl font-extrabold text-gray-900 mb-4">$0<span className="text-xl font-normal text-gray-500">/month</span></div>
              <ul className="space-y-3">
                {subscriptionTiers.starter.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-2 text-sm text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="px-4 py-4 sm:px-6">
              <button
                onClick={() => handleUpgrade('starter')}
                disabled={(currentTier === 'starter' || currentTier === 'basic') || processingPayment}
                className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                  ${(currentTier === 'starter' || currentTier === 'basic') 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                  }`}
              >
                {(currentTier === 'starter' || currentTier === 'basic') ? 'Current Plan' : processingPayment ? 'Processing...' : 'Downgrade'}
              </button>
            </div>
          </div>
          
          {/* Pro Plan */}
          <div className={`bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200 ${
            currentTier === 'pro' || currentTier === 'professional' ? 'border-2 border-primary-500' : ''
          }`}>
            <div className={`px-4 py-5 sm:px-6 ${
              currentTier === 'pro' || currentTier === 'professional' ? 'bg-primary-50' : ''
            }`}>
              <h3 className="text-lg font-medium text-gray-900">Pro</h3>
              <p className="mt-1 text-sm text-gray-500">For established practices</p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="text-5xl font-extrabold text-gray-900 mb-4">$39<span className="text-xl font-normal text-gray-500">/month</span></div>
              <ul className="space-y-3">
                {subscriptionTiers.pro.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-2 text-sm text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="px-4 py-4 sm:px-6">
              <button
                onClick={() => handleUpgrade('pro')}
                disabled={(currentTier === 'pro' || currentTier === 'professional') || processingPayment}
                className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                  ${(currentTier === 'pro' || currentTier === 'professional') 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                  }`}
              >
                {(currentTier === 'pro' || currentTier === 'professional') ? 'Current Plan' : 
                 (currentTier === 'premium' || currentTier === 'enterprise') ? 'Downgrade' : 
                 processingPayment ? 'Processing...' : 'Upgrade'}
              </button>
            </div>
          </div>
          
          {/* Premium Plan */}
          <div className={`bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200 ${
            currentTier === 'premium' || currentTier === 'enterprise' ? 'border-2 border-primary-500' : ''
          }`}>
            <div className={`px-4 py-5 sm:px-6 ${
              currentTier === 'premium' || currentTier === 'enterprise' ? 'bg-primary-50' : ''
            }`}>
              <h3 className="text-lg font-medium text-gray-900">Premium AI</h3>
              <p className="mt-1 text-sm text-gray-500">AI-powered features for maximum productivity</p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="text-5xl font-extrabold text-gray-900 mb-4">$79<span className="text-xl font-normal text-gray-500">/month</span></div>
              <ul className="space-y-3">
                {subscriptionTiers.premium.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-2 text-sm text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="px-4 py-4 sm:px-6">
              <button
                onClick={() => handleUpgrade('premium')}
                disabled={(currentTier === 'premium' || currentTier === 'enterprise') || processingPayment}
                className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                  ${(currentTier === 'premium' || currentTier === 'enterprise') 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                  }`}
              >
                {(currentTier === 'premium' || currentTier === 'enterprise') ? 'Current Plan' : processingPayment ? 'Processing...' : 'Upgrade'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Account; 