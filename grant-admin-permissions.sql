-- Grant admin permissions to your user and fix RLS issues
-- Run this in Supabase SQL Editor with service_role access

-- 1. First ensure you have admin status
UPDATE public.profiles
SET 
  is_admin = true,
  role = 'admin',
  subscription_tier = 'premium'
WHERE id = 'your-auth-id-here';  -- Replace with your actual auth.id

-- 2. Create an admin policy to allow admins to update any profile
CREATE POLICY "Admins can update any profile" 
ON public.profiles
FOR UPDATE 
USING (
  -- Using subquery to check if current user is admin
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- 3. Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- 4. Create RLS bypass function for admins
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
$$ LANGUAGE sql SECURITY DEFINER; 