-- This script only enables Row Level Security on existing tables
-- and adds necessary policies for HIPAA compliance
-- It does NOT recreate tables, so it's safe to run on existing data

-- =============================================
-- 1. Enable RLS and add policies to user_preferences
-- =============================================

-- Enable Row Level Security
ALTER TABLE IF EXISTS public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Check if policies exist and create them if they don't
DO $$
BEGIN
    -- Drop existing policies if they exist to avoid conflicts
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_preferences' AND policyname = 'user_preferences_select_policy') THEN
        DROP POLICY user_preferences_select_policy ON public.user_preferences;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_preferences' AND policyname = 'user_preferences_update_policy') THEN
        DROP POLICY user_preferences_update_policy ON public.user_preferences;
    END IF;
    
    -- Create select policy for user_preferences
    CREATE POLICY user_preferences_select_policy ON public.user_preferences 
        FOR SELECT USING (auth.uid() = user_id);
    
    -- Create update policy for user_preferences
    CREATE POLICY user_preferences_update_policy ON public.user_preferences 
        FOR UPDATE USING (auth.uid() = user_id);
    
    RAISE NOTICE 'RLS policies created for user_preferences';
END
$$;

-- Ensure the service role can still access everything
GRANT ALL ON public.user_preferences TO service_role;

-- =============================================
-- 2. Enable RLS and add policies to activity_logs
-- =============================================

-- Enable Row Level Security
ALTER TABLE IF EXISTS public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Check if policies exist and create them if they don't
DO $$
BEGIN
    -- Drop existing policies if they exist to avoid conflicts
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'activity_logs' AND policyname = 'activity_logs_select_policy') THEN
        DROP POLICY activity_logs_select_policy ON public.activity_logs;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'activity_logs' AND policyname = 'activity_logs_insert_policy') THEN
        DROP POLICY activity_logs_insert_policy ON public.activity_logs;
    END IF;
    
    -- Create select policy for activity_logs
    CREATE POLICY activity_logs_select_policy ON public.activity_logs 
        FOR SELECT USING (auth.uid() = user_id);
    
    -- Create insert policy for activity_logs
    CREATE POLICY activity_logs_insert_policy ON public.activity_logs 
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    RAISE NOTICE 'RLS policies created for activity_logs';
END
$$;

-- Ensure the service role can still access everything
GRANT ALL ON public.activity_logs TO service_role;

-- =============================================
-- Verification message
-- =============================================
DO $$
BEGIN
    RAISE NOTICE 'HIPAA SECURITY CONFIGURATION COMPLETE';
    RAISE NOTICE 'Row Level Security has been enabled on the required tables';
    RAISE NOTICE 'Policies have been applied to restrict data access to appropriate users';
    RAISE NOTICE '';
    RAISE NOTICE 'Verification: Run the simple-hipaa-check.js script again to verify compliance';
END
$$; 