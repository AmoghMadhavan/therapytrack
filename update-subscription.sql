-- Update subscription tier directly
-- Run this in Supabase SQL Editor with service_role access

UPDATE public.profiles
SET 
  subscription_tier = 'premium'  -- Change to: 'free', 'basic', 'premium', or 'enterprise'
WHERE id = 'your-auth-id-here';  -- Replace with your actual auth.id 