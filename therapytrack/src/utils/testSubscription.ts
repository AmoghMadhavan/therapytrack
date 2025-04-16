import { supabase } from '../lib/supabase/config';
import { toast } from 'react-hot-toast';
import { SubscriptionTier } from '../services/subscriptionService';

/**
 * Test utility for temporarily setting a user's subscription tier
 * Accessible through the admin panel with password protection
 */
export const setTestSubscriptionTier = async (
  userId: string,
  tier: SubscriptionTier
): Promise<boolean> => {
  try {
    // Calculate expiry (30 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    // Update user's subscription tier
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: tier,
        subscription_status: 'active',
        subscription_expiry: expiryDate.toISOString(),
      })
      .eq('id', userId);
      
    if (error) {
      console.error('Error updating test subscription:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in test subscription function:', error);
    return false;
  }
};

/**
 * Reset a user's subscription back to starter tier
 */
export const resetTestSubscription = async (userId: string): Promise<boolean> => {
  return setTestSubscriptionTier(userId, 'starter');
};
