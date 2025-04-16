import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { SubscriptionTierTester } from './SubscriptionTierTester';
import { isFeatureEnabled, getCurrentSubscriptionTier, SubscriptionTier } from '../services/subscriptionService';
import Paywall from './Paywall';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('starter');
  const [aiNotesEnabled, setAiNotesEnabled] = useState<boolean>(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showPaywall, setShowPaywall] = useState<boolean>(false);
  const [paywallFeature, setPaywallFeature] = useState<string>('');
  const [requiredTier, setRequiredTier] = useState<SubscriptionTier>('pro');

  useEffect(() => {
    // Redirect if not logged in
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const loadSubscriptionInfo = async () => {
      setIsLoading(true);
      try {
        // Get current subscription tier
        const tier = await getCurrentSubscriptionTier(currentUser.id);
        setSubscriptionTier(tier);
        
        // Check feature availability
        const hasAiNotes = await isFeatureEnabled(currentUser.id, 'aiNotes');
        const hasAnalytics = await isFeatureEnabled(currentUser.id, 'analytics');
        
        setAiNotesEnabled(hasAiNotes);
        setAnalyticsEnabled(hasAnalytics);
      } catch (error) {
        console.error('Error loading subscription data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSubscriptionInfo();
  }, [currentUser, navigate]);

  const handleAiFeatureClick = () => {
    if (!aiNotesEnabled) {
      setPaywallFeature('AI Session Notes');
      setRequiredTier('premium');
      setShowPaywall(true);
    } else {
      // Navigate to AI notes feature
      navigate('/notes/ai');
    }
  };

  const handleAnalyticsClick = () => {
    if (!analyticsEnabled) {
      setPaywallFeature('Practice Analytics');
      setRequiredTier('premium');
      setShowPaywall(true);
    } else {
      // Navigate to analytics feature
      navigate('/analytics');
    }
  };

  const closePaywall = () => {
    setShowPaywall(false);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Subscription tier tester (only in development) */}
      {process.env.NODE_ENV !== 'production' && currentUser && (
        <SubscriptionTierTester userId={currentUser.id} />
      )}
      
      {/* Subscription tier info */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold text-blue-800">
          Your Subscription: {subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)}
        </h2>
        <p className="text-sm text-blue-600 mt-1">
          {subscriptionTier === 'starter' ? 'Free tier' : subscriptionTier === 'pro' ? '$19.99/month' : '$39.99/month'}
        </p>
      </div>
      
      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Clients Feature - Available to all tiers */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Clients</h3>
          <p className="text-gray-600 mb-4">Manage your client information and sessions</p>
          <button 
            onClick={() => navigate('/clients')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Access Clients
          </button>
        </div>
        
        {/* AI Notes Feature - Premium only */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">AI Session Notes</h3>
          <p className="text-gray-600 mb-4">AI-assisted note taking and analysis</p>
          <div className="flex items-center mb-3">
            <span className={`text-sm ${aiNotesEnabled ? 'text-green-600' : 'text-red-600'}`}>
              {aiNotesEnabled ? 'Available' : 'Premium Feature'}
            </span>
          </div>
          <button 
            onClick={handleAiFeatureClick}
            className={`w-full py-2 px-4 rounded ${aiNotesEnabled 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
          >
            {aiNotesEnabled ? 'Access AI Notes' : 'Upgrade to Premium'}
          </button>
        </div>
        
        {/* Analytics Feature - Premium only */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Practice Analytics</h3>
          <p className="text-gray-600 mb-4">Detailed insights about your practice</p>
          <div className="flex items-center mb-3">
            <span className={`text-sm ${analyticsEnabled ? 'text-green-600' : 'text-red-600'}`}>
              {analyticsEnabled ? 'Available' : 'Premium Feature'}
            </span>
          </div>
          <button 
            onClick={handleAnalyticsClick}
            className={`w-full py-2 px-4 rounded ${analyticsEnabled 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
          >
            {analyticsEnabled ? 'View Analytics' : 'Upgrade to Premium'}
          </button>
        </div>
      </div>
      
      {/* Paywall modal */}
      {showPaywall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-md w-full">
            <Paywall 
              requiredTier={requiredTier} 
              featureName={paywallFeature} 
              onCancel={closePaywall} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 