-- Add is_admin column to the profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Update subscription_tier values to match constraints
UPDATE public.profiles SET subscription_tier = 'basic' WHERE subscription_tier = 'starter';
UPDATE public.profiles SET subscription_tier = 'professional' WHERE subscription_tier = 'pro';
UPDATE public.profiles SET subscription_tier = 'enterprise' WHERE subscription_tier = 'premium';

-- Drop existing policies if they exist (to avoid errors)
DROP POLICY IF EXISTS "Users can view admin status" ON public.profiles;
DROP POLICY IF EXISTS "Only admins can update admin status" ON public.profiles;

-- Create policies
CREATE POLICY "Users can view admin status" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can update admin status" 
  ON public.profiles FOR UPDATE 
  USING (
    (auth.uid() = id) OR
    ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true)
  )
  WITH CHECK (
    (auth.uid() = id) OR
    ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true)
  ); 