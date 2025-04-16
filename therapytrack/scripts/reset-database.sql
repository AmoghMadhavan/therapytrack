-- Database Reset Script for TherapyTrack
-- WARNING: This will delete all data in the public schema!

-- Disable triggers temporarily
SET session_replication_role = 'replica';

-- Drop all tables in the correct order to avoid foreign key conflicts
DROP TABLE IF EXISTS public.session_attachments CASCADE;
DROP TABLE IF EXISTS public.task_attachments CASCADE;
DROP TABLE IF EXISTS public.message_attachments CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.goals CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.therapists CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Also drop any functions that might be causing issues
DROP FUNCTION IF EXISTS public.create_profiles_table();
DROP FUNCTION IF EXISTS public.create_clients_table();
DROP FUNCTION IF EXISTS public.create_sessions_table();
DROP FUNCTION IF EXISTS public.create_all_tables();
DROP FUNCTION IF EXISTS public.exec_sql(text);

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Now insert your initial migration script here
-- Copy and paste the contents of 20230101000000_initial_schema.sql below

-- ====================== START OF INITIAL MIGRATION SCRIPT ======================

-- Create profiles table to extend auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('therapist', 'client')),
  phone_number TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_tier TEXT CHECK (subscription_tier IN ('basic', 'professional', 'enterprise')),
  subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'trial')),
  subscription_expiry TIMESTAMP WITH TIME ZONE,
  notifications BOOLEAN DEFAULT TRUE,
  email_alerts BOOLEAN DEFAULT TRUE,
  sms_alerts BOOLEAN DEFAULT TRUE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system'))
);

-- Create RLS policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create therapists table
CREATE TABLE IF NOT EXISTS public.therapists (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  specialty TEXT[],
  business_name TEXT,
  business_street TEXT,
  business_city TEXT,
  business_state TEXT,
  business_zip TEXT,
  license_number TEXT,
  active_client_count INTEGER DEFAULT 0,
  subscription_tier TEXT CHECK (subscription_tier IN ('basic', 'professional', 'enterprise')),
  subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'trial')),
  subscription_expiry TIMESTAMP WITH TIME ZONE,
  payment_method TEXT
);

-- Create RLS policies for therapists
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Therapists can view their own data" 
  ON public.therapists FOR SELECT 
  USING (auth.uid() = id);
CREATE POLICY "Therapists can update their own data" 
  ON public.therapists FOR UPDATE 
  USING (auth.uid() = id);

-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  therapist_id UUID REFERENCES auth.users(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth TIMESTAMP WITH TIME ZONE NOT NULL,
  gender TEXT,
  email TEXT,
  phone TEXT,
  guardian_name TEXT,
  guardian_relationship TEXT,
  guardian_phone TEXT,
  guardian_email TEXT,
  address_street TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zip TEXT,
  diagnosis TEXT[],
  notes TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_session_date TIMESTAMP WITH TIME ZONE,
  goal_areas TEXT[],
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  insurance_group_number TEXT,
  insurance_authorization_details TEXT,
  profile_photo_url TEXT
);

-- Create RLS policies for clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Therapists can CRUD their own clients" 
  ON public.clients FOR ALL 
  USING (auth.uid() = therapist_id);
CREATE POLICY "Clients can view their own data" 
  ON public.clients FOR SELECT 
  USING (auth.uid() = user_id);

-- Create sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  therapist_id UUID REFERENCES auth.users(id) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'canceled', 'no-show')),
  location TEXT NOT NULL CHECK (location IN ('clinic', 'school', 'home', 'telehealth')),
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  private_notes TEXT,
  sent_to_client BOOLEAN DEFAULT FALSE,
  billing_status TEXT DEFAULT 'unbilled' CHECK (billing_status IN ('unbilled', 'billed', 'paid')),
  billing_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for sessions
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Therapists can CRUD their own sessions" 
  ON public.sessions FOR ALL 
  USING (auth.uid() = therapist_id);
CREATE POLICY "Clients can view their own sessions" 
  ON public.sessions FOR SELECT 
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  );

-- Create simple helper function to execute SQL
CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS void AS $$
BEGIN
  EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 