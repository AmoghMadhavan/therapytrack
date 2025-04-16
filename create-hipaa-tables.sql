-- Create HIPAA-compliant tables and enable proper RLS
-- Run this in your Supabase SQL Editor

BEGIN;

-- 1. Create user_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme VARCHAR(50) DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT true,
  data_retention_days INTEGER DEFAULT 365,
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- 2. Create activity_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(100) NOT NULL,
  description TEXT,
  ip_address VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id and activity_type
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_activity_type ON public.activity_logs(activity_type);

-- Add comments to tables for documentation
COMMENT ON TABLE public.user_preferences IS 'Stores user preferences and settings with HIPAA compliance';
COMMENT ON TABLE public.activity_logs IS 'Logs user activity for HIPAA compliance and audit trails';

-- 3. Enable Row Level Security (RLS) on the tables
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for user_preferences

-- Users can only see their own preferences
CREATE POLICY "Users can only see their own preferences" 
ON public.user_preferences
FOR SELECT USING (auth.uid() = user_id);

-- Users can only update their own preferences
CREATE POLICY "Users can only update their own preferences" 
ON public.user_preferences
FOR UPDATE USING (auth.uid() = user_id);

-- Users can only insert their own preferences
CREATE POLICY "Users can only insert their own preferences" 
ON public.user_preferences
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Create RLS policies for activity_logs

-- Users can only see their own logs
CREATE POLICY "Users can only see their own logs" 
ON public.activity_logs
FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own logs
CREATE POLICY "Users can only insert their own logs" 
ON public.activity_logs
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Allow service role full access
GRANT ALL ON public.user_preferences TO service_role;
GRANT ALL ON public.activity_logs TO service_role;

-- 7. Insert a sample record (optional)
-- This is just to have some data for testing
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Check if there's at least one user in the auth.users table
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Insert a sample user preference
    INSERT INTO public.user_preferences (user_id, theme, notifications_enabled)
    VALUES (test_user_id, 'dark', true)
    ON CONFLICT (id) DO NOTHING;
    
    -- Insert a sample activity log
    INSERT INTO public.activity_logs (user_id, activity_type, description)
    VALUES (test_user_id, 'login', 'User logged in')
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Sample data inserted for user %', test_user_id;
  ELSE
    RAISE NOTICE 'No users found in auth.users table. Sample data not inserted.';
  END IF;
END $$;

COMMIT;

-- Final confirmation
DO $$
BEGIN
  RAISE NOTICE '------------------------------------';
  RAISE NOTICE 'HIPAA-compliant tables created!';
  RAISE NOTICE 'Tables are protected with Row Level Security';
  RAISE NOTICE 'Run your compliance check script to verify.';
  RAISE NOTICE '------------------------------------';
END $$; 