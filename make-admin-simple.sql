-- Simple script to make your account an admin
-- Run this in the Supabase SQL Editor (using service_role access)

UPDATE public.profiles
SET 
  is_admin = true,
  role = 'admin'
WHERE id = 'your-auth-id-here';  -- Replace with your actual auth.id from Supabase dashboard 