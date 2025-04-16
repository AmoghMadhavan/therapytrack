-- IMPROVED HIPAA COMPLIANCE FIX
-- Run this in your Supabase SQL Editor
-- This script includes error handling and more detailed checks

-- Start a transaction so changes can be rolled back if there's an error
BEGIN;

-- Output operation status
DO $$
BEGIN
  RAISE NOTICE 'Starting HIPAA compliance configuration...';
END $$;

-- Check if user_preferences exists and has user_id column
DO $$
DECLARE
  user_id_exists BOOLEAN;
BEGIN
  -- Check if user_id column exists in user_preferences
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_preferences' 
    AND column_name = 'user_id'
  ) INTO user_id_exists;

  IF NOT user_id_exists THEN
    RAISE EXCEPTION 'The table user_preferences does not have a user_id column. Please add this column before enabling RLS.';
  END IF;
END $$;

-- Check if activity_logs exists and has user_id column
DO $$
DECLARE
  user_id_exists BOOLEAN;
BEGIN
  -- Check if user_id column exists in activity_logs
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'activity_logs' 
    AND column_name = 'user_id'
  ) INTO user_id_exists;

  IF NOT user_id_exists THEN
    RAISE EXCEPTION 'The table activity_logs does not have a user_id column. Please add this column before enabling RLS.';
  END IF;
END $$;

-- 1. Enable RLS on user_preferences table
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can only see their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can only update their own preferences" ON public.user_preferences;

-- 3. Create basic policies for user_preferences
CREATE POLICY "Users can only see their own preferences" 
ON public.user_preferences
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only update their own preferences" 
ON public.user_preferences
FOR UPDATE USING (auth.uid() = user_id);

-- 4. Enable RLS on activity_logs table
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can only see their own logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can only insert their own logs" ON public.activity_logs;

-- 6. Create basic policies for activity_logs
CREATE POLICY "Users can only see their own logs" 
ON public.activity_logs
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own logs" 
ON public.activity_logs
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Make sure service roles have full access
GRANT ALL ON public.user_preferences TO service_role;
GRANT ALL ON public.activity_logs TO service_role;

-- Verify RLS is enabled
DO $$
DECLARE
  user_prefs_rls BOOLEAN;
  activity_logs_rls BOOLEAN;
BEGIN
  -- Check RLS status
  SELECT relrowsecurity INTO user_prefs_rls
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'user_preferences';
  
  SELECT relrowsecurity INTO activity_logs_rls
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'activity_logs';
  
  IF user_prefs_rls AND activity_logs_rls THEN
    RAISE NOTICE 'RLS enabled successfully on both tables';
  ELSE
    IF NOT user_prefs_rls THEN
      RAISE WARNING 'Failed to enable RLS on user_preferences';
    END IF;
    IF NOT activity_logs_rls THEN
      RAISE WARNING 'Failed to enable RLS on activity_logs';
    END IF;
  END IF;
END $$;

-- Commit the transaction
COMMIT;

-- Final confirmation
DO $$
BEGIN
  RAISE NOTICE '------------------------------------';
  RAISE NOTICE 'HIPAA compliance setup completed!';
  RAISE NOTICE 'Run your compliance check script to verify.';
  RAISE NOTICE '------------------------------------';
END $$; 