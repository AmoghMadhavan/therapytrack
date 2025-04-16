import { supabase } from '../lib/supabase/config';
import { getFromCache, setInCache } from '../utils/cache';

export type SubscriptionTier = 'starter' | 'pro' | 'premium';

export interface SubscriptionDetails {
  clientLimit: number;
  fullNotesEnabled: boolean;
  aiNotesEnabled: boolean;
  exportEnabled: boolean;
  analyticsEnabled: boolean;
  price: number;
  features: string[]; // List of features for display
}

// Define subscription tiers and their features
export const subscriptionTiers: Record<SubscriptionTier, SubscriptionDetails> = {
  starter: {
    clientLimit: 5,
    fullNotesEnabled: false,
    aiNotesEnabled: false,
    exportEnabled: false,
    analyticsEnabled: false,
    price: 0,
    features: [
      'Up to 5 clients',
      'Basic session notes',
      'Calendar management',
      'Email reminders'
    ]
  },
  pro: {
    clientLimit: 20,
    fullNotesEnabled: true,
    aiNotesEnabled: false,
    exportEnabled: true,
    analyticsEnabled: false,
    price: 39.00,
    features: [
      'Up to 20 clients',
      'Advanced session notes',
      'Export client data',
      'Calendar management',
      'Email and SMS reminders',
      'Billing management'
    ]
  },
  premium: {
    clientLimit: 50,
    fullNotesEnabled: true,
    aiNotesEnabled: true,
    exportEnabled: true,
    analyticsEnabled: true,
    price: 79.00,
    features: [
      'Up to 50 clients',
      'Advanced session notes with AI assistance',
      'Practice analytics and insights',
      'Export client data',
      'Calendar management',
      'Email and SMS reminders',
      'Billing management',
      'Priority support'
    ]
  }
};

/**
 * Check if a feature is enabled for current subscription tier
 */
export const isFeatureEnabled = async (
  userId: string,
  feature: 'aiNotes' | 'fullNotes' | 'export' | 'analytics'
): Promise<boolean> => {
  try {
    if (!userId) return false;
    
    // Directly fetch from subscription_features table for real-time data
    const tier = await getCurrentSubscriptionTier(userId);
    
    switch (feature) {
      case 'aiNotes':
        return subscriptionTiers[tier]?.aiNotesEnabled || false;
      case 'fullNotes':
        return subscriptionTiers[tier]?.fullNotesEnabled || false;
      case 'export':
        return subscriptionTiers[tier]?.exportEnabled || false;
      case 'analytics':
        return subscriptionTiers[tier]?.analyticsEnabled || false;
      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking feature availability:', error);
    return false;
  }
};

/**
 * Get the limit of clients for the current subscription tier
 */
export const getClientLimit = async (userId: string): Promise<number> => {
  try {
    if (!userId) return 5; // Default to starter tier
    
    const tier = await getCurrentSubscriptionTier(userId);
    return subscriptionTiers[tier]?.clientLimit || 5;
  } catch (error) {
    console.error('Error getting client limit:', error);
    return 5; // Default to starter tier limit
  }
};

/**
 * Update subscription tier
 */
export const updateSubscriptionTier = async (
  userId: string,
  tier: SubscriptionTier
): Promise<boolean> => {
  try {
    if (!userId) return false;
    
    // Calculate new expiry (30 days from now)
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 30);
    
    // Update the profile in the database
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: tier,
        subscription_status: 'active',
        subscription_expiry: newExpiry.toISOString()
      })
      .eq('id', userId);
      
    if (error) {
      console.error('Error updating subscription tier:', error);
      throw error;
    }
    
    // Clear cache to force refresh
    const CACHE_KEY = `user_${userId}_subscription_tier`;
    setInCache(CACHE_KEY, tier, 1); // Update cache with new tier
    
    return true;
  } catch (error) {
    console.error('Error updating subscription tier:', error);
    return false;
  }
};

/**
 * Get user's current subscription tier
 */
export const getCurrentSubscriptionTier = async (userId: string): Promise<SubscriptionTier> => {
  try {
    if (!userId) return 'starter';
    
    // Check cache first for better performance
    const CACHE_KEY = `user_${userId}_subscription_tier`;
    const cachedTier = getFromCache<string>(CACHE_KEY);
    
    if (cachedTier) {
      return cachedTier as SubscriptionTier;
    }
    
    // Fetch from database if not in cache
    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_expiry, subscription_status')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching subscription tier:', error);
      return 'starter';
    }
    
    // Check if subscription is valid
    if (data) {
      // Check if subscription has expired
      if (data.subscription_status === 'active' && data.subscription_expiry) {
        const expiryDate = new Date(data.subscription_expiry);
        if (expiryDate < new Date()) {
          console.warn('Subscription expired, downgrading to starter');
          
          // Auto-downgrade to starter tier
          await supabase
            .from('profiles')
            .update({ 
              subscription_tier: 'starter',
              subscription_status: 'canceled'
            })
            .eq('id', userId);
            
          setInCache(CACHE_KEY, 'starter', 30); // Cache for 30 minutes
          return 'starter';
        }
      }
      
      const tier = data.subscription_tier || 'starter';
      
      // Type checking to ensure valid tier
      if (tier !== 'starter' && tier !== 'pro' && tier !== 'premium') {
        console.warn(`Invalid tier "${tier}" found, defaulting to starter`);
        setInCache(CACHE_KEY, 'starter', 30);
        return 'starter';
      }
      
      // Cache tier for future requests
      setInCache(CACHE_KEY, tier, 30); // Cache for 30 minutes
      return tier as SubscriptionTier;
    }
    
    return 'starter'; // Default to starter tier
  } catch (error) {
    console.error('Error getting subscription tier:', error);
    return 'starter';
  }
};

/**
 * Get subscription details for a specific tier
 */
export const getSubscriptionDetails = async (tier: SubscriptionTier): Promise<SubscriptionDetails> => {
  try {
    return subscriptionTiers[tier] || subscriptionTiers.starter;
  } catch (error) {
    console.error('Error getting subscription details:', error);
    return subscriptionTiers.starter;
  }
};

/**
 * Check if user has reached client limit for their current subscription tier
 */
export const hasReachedClientLimit = async (userId: string): Promise<boolean> => {
  try {
    if (!userId) return true;
    
    // Get client limit for user's subscription tier
    const clientLimit = await getClientLimit(userId);
    
    // Get count of active clients for this user
    const { count, error } = await supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('therapist_id', userId)
      .eq('status', 'active');
      
    if (error) {
      console.error('Error checking client limit:', error);
      return true; // Assume limit reached to be safe
    }
    
    // Return true if at or above limit
    return (count || 0) >= clientLimit;
  } catch (error) {
    console.error('Error checking client limit:', error);
    return true; // Assume limit reached to be safe
  }
}; 