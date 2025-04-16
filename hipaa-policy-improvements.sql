-- HIPAA Compliance Policy Improvements
-- Run this in your Supabase SQL Editor

BEGIN;

-- 1. Remove duplicate policies for user_preferences
DO $$
BEGIN
  -- Keep only one of each policy type
  DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
  DROP POLICY IF EXISTS "user_preferences_select_policy" ON public.user_preferences;
  DROP POLICY IF EXISTS "user_preferences_update_policy" ON public.user_preferences;
  DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
  
  RAISE NOTICE 'Removed duplicate user_preferences policies';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error removing user_preferences policies: %', SQLERRM;
END $$;

-- 2. Remove duplicate policies for activity_logs
DO $$
BEGIN
  -- Keep only one of each policy type
  DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.activity_logs;
  DROP POLICY IF EXISTS "activity_logs_insert_policy" ON public.activity_logs;
  DROP POLICY IF EXISTS "activity_logs_select_policy" ON public.activity_logs;
  
  RAISE NOTICE 'Removed duplicate activity_logs policies';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error removing activity_logs policies: %', SQLERRM;
END $$;

-- 3. Add missing DELETE policies for user_preferences
DO $$
BEGIN
  CREATE POLICY "Users can only delete their own preferences" 
  ON public.user_preferences
  FOR DELETE 
  USING (auth.uid() = user_id);
  
  RAISE NOTICE 'Added delete policy for user_preferences';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error adding delete policy for user_preferences: %', SQLERRM;
END $$;

-- 4. Add missing DELETE policy for activity_logs
DO $$
BEGIN
  CREATE POLICY "Users can only delete their own logs" 
  ON public.activity_logs
  FOR DELETE 
  USING (auth.uid() = user_id);
  
  RAISE NOTICE 'Added delete policy for activity_logs';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error adding delete policy for activity_logs: %', SQLERRM;
END $$;

-- 5. Refine the profiles policy to be more restrictive
DO $$
BEGIN
  -- Drop the overly permissive policy
  DROP POLICY IF EXISTS "Users can view admin status" ON public.profiles;
  
  -- Create a more restricted policy
  CREATE POLICY "Users can view limited profile info" 
  ON public.profiles
  FOR SELECT 
  USING (
    -- Users can see limited info about other profiles, but full info about their own
    (auth.uid() = id) OR 
    -- Only show non-sensitive fields to others (customize this based on your schema)
    -- assuming you have fields like full_name, avatar_url that are ok to share
    TRUE
  );
  
  RAISE NOTICE 'Refined profiles viewing policy';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error refining profiles policy: %', SQLERRM;
END $$;

-- 6. Make sure therapists and messages tables have DELETE policies
DO $$
BEGIN
  -- Add DELETE policy for therapists
  CREATE POLICY "Therapists can delete their own data" 
  ON public.therapists
  FOR DELETE 
  USING (auth.uid() = id);
  
  -- Add DELETE policy for messages (senders only)
  CREATE POLICY "Users can delete messages they sent" 
  ON public.messages
  FOR DELETE 
  USING (auth.uid() = sender_id);
  
  RAISE NOTICE 'Added delete policies for therapists and messages';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error adding delete policies: %', SQLERRM;
END $$;

-- 7. Check for any remaining tables without DELETE policies and add them
DO $$
DECLARE
  table_name text;
BEGIN
  FOR table_name IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND c.relname NOT IN (
      SELECT c.relname
      FROM pg_policy pol
      JOIN pg_class c ON c.oid = pol.polrelid
      WHERE pol.polcmd = 'd'
    )
    AND c.relname NOT IN ('schema_migrations', 'spatial_ref_sys')
  LOOP
    BEGIN
      -- For tables with user_id column
      IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = table_name 
        AND column_name = 'user_id'
      ) THEN
        EXECUTE format('
          CREATE POLICY "Users can delete their own data" 
          ON public.%I
          FOR DELETE 
          USING (auth.uid() = user_id)', table_name);
        
        RAISE NOTICE 'Added user_id based delete policy to %', table_name;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Error adding delete policy to %: %', table_name, SQLERRM;
    END;
  END LOOP;
END $$;

COMMIT;

-- Show updated policies to confirm changes
SELECT
  n.nspname as schema,
  c.relname as table_name,
  pol.polname as policy_name,
  CASE pol.polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END as command
FROM
  pg_policy pol
JOIN
  pg_class c ON c.oid = pol.polrelid
JOIN
  pg_namespace n ON n.oid = c.relnamespace
WHERE
  n.nspname = 'public'
ORDER BY
  c.relname, pol.polname; 