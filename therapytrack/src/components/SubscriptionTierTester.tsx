import React from 'react';
import { toast } from 'react-hot-toast';
import { SubscriptionTier } from '../services/subscriptionService';
import { setTestSubscriptionTier } from '../utils/testSubscription';

/**
 * Test component that lets you switch between subscription tiers for testing
 * Available in the admin panel in all environments
 */
export const SubscriptionTierTester: React.FC<{ userId: string }> = ({ userId }) => {
  const setTier = async (tier: SubscriptionTier) => {
    try {
      const success = await setTestSubscriptionTier(userId, tier);
      if (success) {
        toast.success(`Subscription set to ${tier} tier`);
        // Force reload to update UI based on new subscription
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      console.error('Error setting subscription tier:', error);
      toast.error('Failed to update subscription tier');
    }
  };
  
  return (
    <div className="bg-yellow-50 border border-yellow-300 rounded p-4 mb-4">
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">Test Subscription Tiers</h3>
      <p className="text-sm text-yellow-700 mb-3">Set account tier for testing functionality</p>
      <div className="flex space-x-2">
        <button
          onClick={() => setTier('starter')}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
        >
          Starter
        </button>
        <button
          onClick={() => setTier('pro')}
          className="px-3 py-1 bg-blue-200 hover:bg-blue-300 rounded text-sm"
        >
          Pro
        </button>
        <button
          onClick={() => setTier('premium')}
          className="px-3 py-1 bg-purple-200 hover:bg-purple-300 rounded text-sm"
        >
          Premium
        </button>
      </div>
    </div>
  );
};
