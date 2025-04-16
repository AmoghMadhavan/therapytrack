-- Check table structure for HIPAA compliance tables
-- Run this in your Supabase SQL Editor

-- Check user_preferences structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM 
  information_schema.columns
WHERE 
  table_schema = 'public' 
  AND table_name = 'user_preferences'
ORDER BY ordinal_position;

-- Check activity_logs structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM 
  information_schema.columns
WHERE 
  table_schema = 'public' 
  AND table_name = 'activity_logs'
ORDER BY ordinal_position;

-- Check if RLS is enabled on the tables
SELECT 
  tablename,
  CASE WHEN relrowsecurity = true THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM
  pg_class c
JOIN
  pg_namespace n ON n.oid = c.relnamespace
WHERE
  n.nspname = 'public'
  AND c.relname IN ('user_preferences', 'activity_logs');

-- Check existing policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM
  pg_policies
WHERE
  schemaname = 'public'
  AND tablename IN ('user_preferences', 'activity_logs'); 