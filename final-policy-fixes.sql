-- Final Policy Fixes
-- Run this in your Supabase SQL Editor

BEGIN;

-- Remove the remaining duplicate update policy for user_preferences
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
  
  RAISE NOTICE 'Removed duplicate update policy for user_preferences';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error removing duplicate update policy: %', SQLERRM;
END $$;

-- Add missing DELETE policies for tables with attachments
DO $$
BEGIN
  -- For message_attachments
  CREATE POLICY "Users can delete their message attachments" 
  ON public.message_attachments
  FOR DELETE 
  USING (message_id IN (SELECT id FROM messages WHERE sender_id = auth.uid()));
  
  -- For session_attachments
  CREATE POLICY "Therapists can delete session attachments" 
  ON public.session_attachments
  FOR DELETE 
  USING (session_id IN (SELECT id FROM sessions WHERE therapist_id = auth.uid()));
  
  -- For task_attachments
  CREATE POLICY "Users can delete their task attachments" 
  ON public.task_attachments
  FOR DELETE 
  USING (
    (task_id IN (SELECT id FROM tasks WHERE therapist_id = auth.uid())) OR 
    (task_id IN (SELECT id FROM tasks WHERE client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )) AND is_submission = true)
  );
  
  RAISE NOTICE 'Added delete policies for attachment tables';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error adding attachment delete policies: %', SQLERRM;
END $$;

-- Add a specific client delete policy
DO $$
BEGIN
  CREATE POLICY "Clients can delete their own client records" 
  ON public.clients
  FOR DELETE 
  USING (user_id = auth.uid());
  
  RAISE NOTICE 'Added client delete policy';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error adding client delete policy: %', SQLERRM;
END $$;

COMMIT;

-- Show final policy list
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