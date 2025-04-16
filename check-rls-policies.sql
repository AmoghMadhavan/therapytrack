-- Check existing RLS policies
SELECT
  n.nspname as schema,
  c.relname as table_name,
  pol.polname as policy_name,
  pg_get_expr(pol.polqual, pol.polrelid) as using_expression,
  pg_get_expr(pol.polwithcheck, pol.polrelid) as with_check_expression,
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