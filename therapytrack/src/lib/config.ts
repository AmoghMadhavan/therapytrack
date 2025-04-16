/**
 * Application Configuration
 * 
 * This file centralizes access to environment variables and configuration
 * to make it easier to manage and ensure type safety
 */

// Supabase Configuration
export const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// OpenAI Configuration
export const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || '';

// Feature flags
export const FEATURES = {
  ENABLE_AI: Boolean(OPENAI_API_KEY),
  IS_PRODUCTION: process.env.NODE_ENV === 'production'
};

// Validate critical configuration
export const validateConfig = (): boolean => {
  const missingVars = [];
  
  if (!SUPABASE_URL) missingVars.push('REACT_APP_SUPABASE_URL');
  if (!SUPABASE_ANON_KEY) missingVars.push('REACT_APP_SUPABASE_ANON_KEY');
  
  // Only warn about OpenAI API in production
  if (FEATURES.IS_PRODUCTION && !OPENAI_API_KEY) {
    console.warn('⚠️ REACT_APP_OPENAI_API_KEY is not set. AI features will use simulated responses.');
  }
  
  if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  
  return true;
}; 