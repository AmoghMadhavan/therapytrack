-- Fix duplicate policies error and complete HIPAA setup
-- Run this in your Supabase SQL Editor

BEGIN;

-- First, drop any existing policies to avoid "already exists" errors
DO $$
BEGIN
  -- Drop policies for user_preferences if they exist
  DROP POLICY IF EXISTS "Users can only see their own preferences" ON public.user_preferences;
  DROP POLICY IF EXISTS "Users can only update their own preferences" ON public.user_preferences;
  DROP POLICY IF EXISTS "Users can only insert their own preferences" ON public.user_preferences;
  
  -- Drop policies for activity_logs if they exist
  DROP POLICY IF EXISTS "Users can only see their own logs" ON public.activity_logs;
  DROP POLICY IF EXISTS "Users can only insert their own logs" ON public.activity_logs;
  
  RAISE NOTICE 'Existing policies dropped successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping policies: %', SQLERRM;
END $$;

-- Make sure RLS is enabled
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Recreate policies for user_preferences
DO $$
BEGIN
  -- Create select policy
  EXECUTE 'CREATE POLICY "Users can only see their own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id)';
  
  -- Create update policy
  EXECUTE 'CREATE POLICY "Users can only update their own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id)';
  
  -- Create insert policy
  EXECUTE 'CREATE POLICY "Users can only insert their own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id)';
  
  RAISE NOTICE 'Policies created for user_preferences';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating user_preferences policies: %', SQLERRM;
END $$;

-- Recreate policies for activity_logs
DO $$
BEGIN
  -- Create select policy
  EXECUTE 'CREATE POLICY "Users can only see their own logs" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id)';
  
  -- Create insert policy
  EXECUTE 'CREATE POLICY "Users can only insert their own logs" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id)';
  
  RAISE NOTICE 'Policies created for activity_logs';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating activity_logs policies: %', SQLERRM;
END $$;

-- Make sure service roles have full access
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

COMMIT;

-- Show existing policies for verification
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM
  pg_policies
WHERE
  schemaname = 'public'
  AND tablename IN ('user_preferences', 'activity_logs'); 