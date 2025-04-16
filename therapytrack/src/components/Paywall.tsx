import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { subscriptionTiers } from '../services/subscriptionService';
import { createCheckoutSession, getTierPriceDisplay } from '../services/paymentService';
import { toast } from 'react-hot-toast';

interface PaywallProps {
  requiredTier: 'starter' | 'pro' | 'premium';
  featureName: string;
  onCancel?: () => void;
}

const Paywall: React.FC<PaywallProps> = ({ requiredTier, featureName, onCancel }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Get the subscription details
  const tierDetails = subscriptionTiers[requiredTier];
  const price = getTierPriceDisplay(requiredTier);
  
  const handleUpgrade = async () => {
    if (!currentUser) {
      toast.error('You must be logged in to upgrade');
      navigate('/login');
      return;
    }
    
    setIsLoading(true);
    try {
      // Create checkout session
      const checkoutUrl = await createCheckoutSession(currentUser.id, requiredTier);
      
      // Redirect to checkout
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Error initiating checkout:', error);
      toast.error('Failed to initiate checkout process');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-blue-700">Upgrade Required</h2>
        <p className="text-gray-600 mt-2">
          The <span className="font-semibold">{featureName}</span> feature requires 
          a <span className="font-semibold text-blue-600">{requiredTier}</span> subscription.
        </p>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-blue-800">
          {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} Plan
        </h3>
        <div className="text-2xl font-bold text-blue-900 my-2">{price}<span className="text-sm font-normal">/month</span></div>
        
        <ul className="mt-4 space-y-2">
          {tierDetails?.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="flex space-x-4">
        <button
          onClick={handleUpgrade}
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition duration-150 ease-in-out disabled:opacity-70"
        >
          {isLoading ? 'Processing...' : `Upgrade Now - ${price}`}
        </button>
        
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md font-medium transition duration-150 ease-in-out"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default Paywall; 