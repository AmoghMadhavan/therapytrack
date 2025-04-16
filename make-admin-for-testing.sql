-- Script to make your account an admin and set up testing capabilities
-- Run this in the Supabase SQL Editor (service_role required)

BEGIN;

-- 1. Make your account an admin
-- Replace 'your-auth-id-here' with your actual auth.id
-- You can find your auth.id in the Supabase dashboard under Authentication > Users
UPDATE public.profiles
SET 
  is_admin = true,
  role = 'admin',
  subscription_tier = 'premium',  -- Set to premium tier
  updated_at = NOW()
WHERE id = 'your-auth-id-here';

-- 2. Create a function to toggle between subscription tiers for testing
CREATE OR REPLACE FUNCTION public.toggle_subscription_tier(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  current_tier TEXT;
  new_tier TEXT;
BEGIN
  -- Get current tier
  SELECT subscription_tier INTO current_tier FROM profiles WHERE id = user_id;
  
  -- Toggle between tiers
  IF current_tier = 'free' THEN
    new_tier := 'basic';
  ELSIF current_tier = 'basic' THEN
    new_tier := 'premium';
  ELSIF current_tier = 'premium' THEN
    new_tier := 'enterprise';
  ELSE
    new_tier := 'free';
  END IF;
  
  -- Update the tier
  UPDATE profiles SET subscription_tier = new_tier WHERE id = user_id;
  
  RETURN 'Subscription changed from ' || current_tier || ' to ' || new_tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.toggle_subscription_tier TO authenticated;

-- 4. Create a test clients table entry if you don't have any (for testing)
INSERT INTO public.clients (
  id,
  therapist_id,
  user_id,
  first_name,
  last_name,
  email,
  phone,
  status,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  'your-auth-id-here',  -- Your ID as therapist
  'your-auth-id-here',  -- For testing purposes, same ID as user
  'Test',
  'Client',
  'testclient@example.com',
  '555-123-4567',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;  -- Skip if you already have clients

-- 5. Ensure your user_preferences entry exists with AI settings enabled
INSERT INTO public.user_preferences (
  user_id,
  ai_preferences,
  theme,
  created_at,
  updated_at
)
VALUES (
  'your-auth-id-here',
  '{"enableAI": true, "enableSessionAnalysis": true, "enableTreatmentPlans": true, "enableProgressPrediction": true, "enableTranscription": true, "clientExclusions": []}',
  'light',
  NOW(),
  NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET 
  ai_preferences = '{"enableAI": true, "enableSessionAnalysis": true, "enableTreatmentPlans": true, "enableProgressPrediction": true, "enableTranscription": true, "clientExclusions": []}',
  updated_at = NOW();

COMMIT;

-- After running this script, you can toggle between subscription tiers using:
-- SELECT public.toggle_subscription_tier('your-auth-id-here'); 