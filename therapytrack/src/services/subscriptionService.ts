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
 * Check if user can add more clients based on their subscription tier
 */
export const canAddMoreClients = async (userId: string): Promise<boolean> => {
  try {
    if (!userId) return false;
    
    // Get user profile to check subscription tier
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      // Fallback to starter tier limit if there's an error
      return 0 < subscriptionTiers.starter.clientLimit;
    }
    
    const tier = profile?.subscription_tier || 'starter';
    const tierConfig = subscriptionTiers[tier as keyof typeof subscriptionTiers] || subscriptionTiers.starter;
    
    // Pro and Premium tiers have fixed limits, not unlimited
    // Count current clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id')
      .eq('therapist_id', userId);
      
    if (clientsError) {
      console.error('Error counting clients:', clientsError);
      // Fallback to starter tier limit if there's an error
      return 0 < tierConfig.clientLimit;
    }
    
    // Check if user is below their client limit
    return (clients?.length || 0) < tierConfig.clientLimit;
  } catch (error) {
    console.error('Error checking client limit:', error);
    // Default to the most restrictive policy on error
    return false;
  }
};

/**
 * Check if a specific feature is available for a user
 */
export const isFeatureEnabled = async (
  userId: string, 
  feature: 'fullNotes' | 'aiNotes' | 'export' | 'analytics' | 'aiSessionAnalysis' | 'aiTreatmentPlans' | 'aiProgressPrediction' | 'aiSearch' | 'aiTranscription'
): Promise<boolean> => {
  try {
    if (!userId) return false;
    
    // Check cache first for faster response
    const CACHE_KEY = `user_${userId}_feature_${feature}`;
    const cachedValue = getFromCache<boolean>(CACHE_KEY);
    
    if (cachedValue !== null) {
      return cachedValue;
    }
    
    // Get user profile to check subscription tier
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      // Fall back to starter tier settings
      const featureMap = {
        fullNotes: 'fullNotesEnabled',
        aiNotes: 'aiNotesEnabled',
        export: 'exportEnabled',
        analytics: 'analyticsEnabled',
        aiSessionAnalysis: 'aiSessionAnalysisEnabled',
        aiTreatmentPlans: 'aiTreatmentPlansEnabled',
        aiProgressPrediction: 'aiProgressPredictionEnabled', 
        aiSearch: 'aiSearchEnabled',
        aiTranscription: 'aiTranscriptionEnabled'
      };
      
      const result = subscriptionTiers.starter[featureMap[feature] as keyof typeof subscriptionTiers.starter] as boolean;
      setInCache(CACHE_KEY, result, 15); // Cache for 15 minutes
      return result;
    }
    
    const tier = profile?.subscription_tier || 'starter';
    const tierConfig = subscriptionTiers[tier as keyof typeof subscriptionTiers] || subscriptionTiers.starter;
    
    // Map feature to config property
    const featureMap = {
      fullNotes: 'fullNotesEnabled',
      aiNotes: 'aiNotesEnabled',
      export: 'exportEnabled',
      analytics: 'analyticsEnabled',
      aiSessionAnalysis: 'aiSessionAnalysisEnabled',
      aiTreatmentPlans: 'aiTreatmentPlansEnabled',
      aiProgressPrediction: 'aiProgressPredictionEnabled',
      aiSearch: 'aiSearchEnabled',
      aiTranscription: 'aiTranscriptionEnabled'
    };
    
    const result = tierConfig[featureMap[feature] as keyof typeof tierConfig] as boolean;
    
    // Cache the result for faster future checks
    setInCache(CACHE_KEY, result, 15); // Cache for 15 minutes
    
    return result;
  } catch (error) {
    console.error('Error checking feature availability:', error);
    // Default to most restrictive policy on error
    return false;
  }
};

/**
 * Update database schema for subscription tiers if needed
 */
export const checkAndUpdateSubscriptionSchema = async (): Promise<void> => {
  try {
    // Check if subscription tiers are already set up
    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .limit(1);
      
    if (error) {
      console.error('Error checking subscription schema:', error);
    }
    
    // If data exists, schema is already set up
    if (data && data.length > 0) return;
    
    // Otherwise, update profiles schema
    // Note: This would typically be done through migrations,
    // but this is a simpler approach for the demo
    console.log('Setting up subscription schema...');
    
    // This would be done through database migrations in a real app
  } catch (error) {
    console.error('Error updating subscription schema:', error);
  }
};

/**
 * Get user's current subscription tier
 */
export const getCurrentSubscriptionTier = async (userId: string): Promise<SubscriptionTier> => {
  try {
    if (!userId) return 'starter';
    
    // Check cache first
    const CACHE_KEY = `user_${userId}_subscription_tier`;
    const cachedTier = getFromCache<string>(CACHE_KEY);
    
    if (cachedTier) {
      return cachedTier as SubscriptionTier;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching subscription tier:', error);
      return 'starter';
    }
    
    const tier = data?.subscription_tier || 'starter';
    
    // Cache the tier for faster future lookups
    setInCache(CACHE_KEY, tier, 30); // Cache for 30 minutes
    
    return tier as SubscriptionTier;
  } catch (error) {
    console.error('Error getting subscription tier:', error);
    return 'starter';
  }
};

/**
 * Checks if the user's subscription tier allows access to a feature
 */
export const hasAccess = (
  userTier: SubscriptionTier,
  requiredTier: SubscriptionTier
): boolean => {
  const tiers = ['starter', 'pro', 'premium'];
  const userTierIndex = tiers.indexOf(userTier);
  const requiredTierIndex = tiers.indexOf(requiredTier);
  
  return userTierIndex >= requiredTierIndex;
};

/**
 * Get the client limit for a given subscription tier
 */
export const getClientLimit = (tier: SubscriptionTier): number => {
  return subscriptionTiers[tier].clientLimit;
};

/**
 * Determines if a user has reached their client limit
 */
export const hasReachedClientLimit = (currentClientCount: number, tier: SubscriptionTier): boolean => {
  return currentClientCount >= getClientLimit(tier);
}; 