-- Helper function to check if RLS is enabled on a table
CREATE OR REPLACE FUNCTION public.check_rls_enabled(table_name text)
RETURNS TABLE(rls_enabled boolean) SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT rel.relrowsecurity
  FROM pg_class rel
  JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
  WHERE nsp.nspname = 'public'
  AND rel.relname = table_name;
END;
$$ LANGUAGE plpgsql;

-- Helper function to create the check_rls_enabled function (needed for the script)
CREATE OR REPLACE FUNCTION public.create_rls_check_function()
RETURNS void SECURITY DEFINER AS $$
BEGIN
  -- This function just creates the check_rls_enabled function if it doesn't exist
  -- Since we already created it above, this is just a placeholder to avoid errors
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Create a view to easily check policies
CREATE OR REPLACE VIEW pg_policies AS
SELECT n.nspname AS schemaname,
       c.relname AS tablename,
       pol.polname AS policyname,
       CASE pol.polpermissive WHEN 't' THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END AS permissive,
       CASE pol.polroles = '{0}' WHEN true THEN 'PUBLIC' ELSE 'ROLE' END AS roles,
       CASE pol.polcmd
       WHEN 'r' THEN 'SELECT'
       WHEN 'a' THEN 'INSERT'
       WHEN 'w' THEN 'UPDATE'
       WHEN 'd' THEN 'DELETE'
       WHEN '*' THEN 'ALL'
       END AS cmd,
       pg_get_expr(pol.polqual, pol.polrelid) AS qual,
       pg_get_expr(pol.polwithcheck, pol.polrelid) AS withcheck
FROM pg_policy pol
JOIN pg_class c ON c.oid = pol.polrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
ORDER BY tablename, policyname; 