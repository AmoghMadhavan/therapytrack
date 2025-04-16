-- SIMPLE HIPAA COMPLIANCE FIX
-- Run this in your Supabase SQL Editor

-- 1. Enable RLS on user_preferences table
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 2. Create basic policies for user_preferences
CREATE POLICY "Users can only see their own preferences" 
ON public.user_preferences
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only update their own preferences" 
ON public.user_preferences
FOR UPDATE USING (auth.uid() = user_id);

-- 3. Enable RLS on activity_logs table
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create basic policies for activity_logs
CREATE POLICY "Users can only see their own logs" 
ON public.activity_logs
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own logs" 
ON public.activity_logs
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Make sure service roles have full access
GRANT ALL ON public.user_preferences TO service_role;
GRANT ALL ON public.activity_logs TO service_role; 