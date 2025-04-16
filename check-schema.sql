-- Schema inspection script for Supabase
-- Run this in your Supabase SQL Editor to understand your database structure

-- List all tables in the public schema
SELECT 
  table_name,
  table_type
FROM 
  information_schema.tables
WHERE 
  table_schema = 'public'
ORDER BY 
  table_name;

-- List all tables in the auth schema
SELECT 
  table_name,
  table_type
FROM 
  information_schema.tables
WHERE 
  table_schema = 'auth'
ORDER BY 
  table_name;

-- Get column details for all tables in public schema
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM 
  information_schema.columns
WHERE 
  table_schema = 'public'
ORDER BY 
  table_name, ordinal_position;

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

-- Check table permissions for roles
SELECT
  n.nspname as schema,
  c.relname as table_name,
  ARRAY_AGG(acl.privilege_type) as privileges,
  acl.grantee as role
FROM
  information_schema.table_privileges acl
JOIN
  pg_class c ON acl.table_name = c.relname
JOIN
  pg_namespace n ON c.relnamespace = n.oid
WHERE
  n.nspname = 'public'
GROUP BY
  n.nspname, c.relname, acl.grantee
ORDER BY
  c.relname, acl.grantee; 