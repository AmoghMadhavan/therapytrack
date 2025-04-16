import { supabase } from '../lib/supabase/config';
import { subscriptionTiers } from './subscriptionService';

// Constants for subscription pricing
const PRICE_IDS = {
  starter: 'price_starter_id', // Replace with your actual Stripe price IDs
  pro: 'price_pro_id',
  premium: 'price_premium_id'
};

/**
 * Create a checkout session for subscription upgrade
 * @param userId The user ID
 * @param tier The subscription tier to upgrade to
 * @returns The checkout URL from Stripe
 */
export const createCheckoutSession = async (
  userId: string,
  tier: 'starter' | 'pro' | 'premium'
): Promise<string> => {
  try {
    // In production, this would be a serverless function call to your backend
    // that creates a Stripe checkout session for security reasons
    
    // This is a mock implementation for demonstration
    // In a real app, you would:
    // 1. Call your backend API to create a Stripe session
    // 2. The backend would use Stripe SDK to create a session
    // 3. Return the session ID or checkout URL to the client
    
    console.log(`Creating checkout session for user ${userId} to tier ${tier}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a mock checkout URL
    // In production this would be a real Stripe checkout URL
    return `https://checkout.stripe.com/mock-checkout/${userId}/${tier}/${Date.now()}`;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create checkout session');
  }
};

/**
 * Handle successful subscription payment
 * @param userId The user ID
 * @param tier The subscription tier
 * @param sessionId The Stripe session ID
 */
export const handleSubscriptionSuccess = async (
  userId: string,
  tier: 'starter' | 'pro' | 'premium',
  sessionId: string
): Promise<void> => {
  try {
    // In production, this would verify the session with Stripe
    // before updating the user's subscription
    
    // Calculate expiry (30 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    // Update the user's profile with new subscription info
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: tier,
        subscription_status: 'active',
        subscription_expiry: expiryDate.toISOString(),
        stripe_session_id: sessionId,
        stripe_customer_id: `cus_mock_${userId}` // In production, this would be the real Stripe customer ID
      })
      .eq('id', userId);
      
    if (error) {
      console.error('Error updating subscription:', error);
      throw new Error('Failed to update subscription');
    }
  } catch (error) {
    console.error('Error handling subscription success:', error);
    throw new Error('Failed to process subscription');
  }
};

/**
 * Get a price display string for a tier
 * @param tier The subscription tier
 * @returns Formatted price string
 */
export const getTierPriceDisplay = (tier: string): string => {
  const tierConfig = subscriptionTiers[tier as keyof typeof subscriptionTiers];
  if (!tierConfig) return '$0';
  
  return `$${tierConfig.price}`;
}; 