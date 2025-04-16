-- Check which tables have RLS enabled
SELECT
  n.nspname as schema,
  c.relname as table_name,
  CASE WHEN c.relrowsecurity THEN 'RLS enabled' ELSE 'RLS disabled' END as rls_status
FROM
  pg_class c
JOIN
  pg_namespace n ON n.oid = c.relnamespace
WHERE
  n.nspname = 'public'
  AND c.relkind = 'r'  -- Only for tables
ORDER BY
  c.relname; 