-- Database Reset and Clean Script for TherapyTrack
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
DROP FUNCTION IF EXISTS public.create_tasks_table();
DROP FUNCTION IF EXISTS public.create_goals_table();
DROP FUNCTION IF EXISTS public.create_all_tables();
DROP FUNCTION IF EXISTS public.exec_sql(text);

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Create UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table to extend auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'therapist',
  phone_number TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_tier TEXT DEFAULT 'basic',
  subscription_status TEXT DEFAULT 'trial',
  subscription_expiry TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- Create therapists table
CREATE TABLE IF NOT EXISTS public.therapists (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  title TEXT,
  license_type TEXT,
  license_number TEXT,
  license_state TEXT,
  therapeutic_approach TEXT[],
  specialties TEXT[],
  bio TEXT,
  years_of_experience INTEGER,
  hourly_rate DECIMAL(10, 2),
  phone TEXT,
  address TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  settings JSONB DEFAULT '{}'::jsonb
);

-- Create clients table with consistent snake_case naming
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
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'archived')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_session_date TIMESTAMP WITH TIME ZONE,
  goal_areas TEXT[],
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  insurance_group_number TEXT,
  insurance_authorization_details TEXT,
  profile_photo_url TEXT
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  therapist_id UUID REFERENCES auth.users(id) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'canceled', 'no-show')),
  location TEXT NOT NULL DEFAULT 'telehealth' CHECK (location IN ('clinic', 'school', 'home', 'telehealth')),
  notes TEXT,
  treatment_goals TEXT[],
  interventions_used TEXT[],
  progress_notes TEXT,
  follow_up_actions TEXT[],
  billing_status TEXT DEFAULT 'unbilled' CHECK (billing_status IN ('unbilled', 'billed', 'paid')),
  billing_amount DECIMAL(10, 2),
  insurance_claim_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create session attachments table
CREATE TABLE IF NOT EXISTS public.session_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  description TEXT
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  therapist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in-progress', 'completed', 'overdue')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  goal_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
  frequency TEXT NOT NULL DEFAULT 'once' CHECK (frequency IN ('once', 'daily', 'weekly', 'monthly')),
  completion_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  session_id UUID REFERENCES public.sessions(id)
);

-- Create task attachments table
CREATE TABLE IF NOT EXISTS public.task_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'audio', 'document')),
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_submission BOOLEAN DEFAULT FALSE,
  notes TEXT
);

-- Create goals table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  therapist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  area TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  target_date TIMESTAMP WITH TIME ZONE,
  baseline_measurement TEXT,
  current_measurement TEXT,
  target_measurement TEXT,
  measurement_unit TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id TEXT NOT NULL,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('therapist', 'client')),
  text TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Create message_attachments table
CREATE TABLE IF NOT EXISTS public.message_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Therapist policies
CREATE POLICY "Therapists can view their own data" 
  ON public.therapists FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Therapists can update their own data" 
  ON public.therapists FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Therapists can insert their own data" 
  ON public.therapists FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Client policies
CREATE POLICY "Therapists can CRUD their own clients" 
  ON public.clients FOR ALL 
  USING (auth.uid() = therapist_id);

CREATE POLICY "Clients can view their own data" 
  ON public.clients FOR SELECT 
  USING (auth.uid() = user_id);

-- Session policies
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

-- Session attachments policies
CREATE POLICY "Users can view attachments for sessions they can access" 
  ON public.session_attachments FOR SELECT 
  USING (
    session_id IN (
      SELECT id FROM public.sessions 
      WHERE therapist_id = auth.uid() 
      OR client_id IN (
        SELECT id FROM public.clients WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Therapists can add attachments" 
  ON public.session_attachments FOR INSERT 
  WITH CHECK (
    session_id IN (
      SELECT id FROM public.sessions WHERE therapist_id = auth.uid()
    )
  );

-- Task policies
CREATE POLICY "Therapists can view their own tasks" 
  ON public.tasks FOR SELECT 
  USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can insert their own tasks" 
  ON public.tasks FOR INSERT 
  WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can update their own tasks" 
  ON public.tasks FOR UPDATE 
  USING (auth.uid() = therapist_id)
  WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can delete their own tasks" 
  ON public.tasks FOR DELETE 
  USING (auth.uid() = therapist_id);

CREATE POLICY "Clients can view tasks assigned to them" 
  ON public.tasks FOR SELECT 
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can update tasks assigned to them" 
  ON public.tasks FOR UPDATE 
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  );

-- Task attachments policies
CREATE POLICY "Users can view task attachments they have access to" 
  ON public.task_attachments FOR SELECT 
  USING (
    task_id IN (
      SELECT id FROM public.tasks 
      WHERE therapist_id = auth.uid() 
      OR client_id IN (
        SELECT id FROM public.clients WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Therapists can add instructions" 
  ON public.task_attachments FOR INSERT 
  WITH CHECK (
    task_id IN (
      SELECT id FROM public.tasks WHERE therapist_id = auth.uid()
    )
  );

CREATE POLICY "Clients can add submissions" 
  ON public.task_attachments FOR INSERT 
  WITH CHECK (
    task_id IN (
      SELECT id FROM public.tasks 
      WHERE client_id IN (
        SELECT id FROM public.clients WHERE user_id = auth.uid()
      )
    ) AND is_submission = TRUE
  );

-- Goal policies
CREATE POLICY "Therapists can view their own goals" 
  ON public.goals FOR SELECT 
  USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can insert their own goals" 
  ON public.goals FOR INSERT 
  WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can update their own goals" 
  ON public.goals FOR UPDATE 
  USING (auth.uid() = therapist_id)
  WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can delete their own goals" 
  ON public.goals FOR DELETE 
  USING (auth.uid() = therapist_id);

CREATE POLICY "Clients can view goals assigned to them" 
  ON public.goals FOR SELECT 
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  );

-- Message policies
CREATE POLICY "Users can see messages they sent or received" 
  ON public.messages FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" 
  ON public.messages FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can mark messages as read" 
  ON public.messages FOR UPDATE 
  USING (auth.uid() = recipient_id);

-- Message attachments policies
CREATE POLICY "Users can view message attachments they have access to" 
  ON public.message_attachments FOR SELECT 
  USING (
    message_id IN (
      SELECT id FROM public.messages 
      WHERE sender_id = auth.uid() OR recipient_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload message attachments" 
  ON public.message_attachments FOR INSERT 
  WITH CHECK (
    message_id IN (
      SELECT id FROM public.messages WHERE sender_id = auth.uid()
    )
  );

-- Remove any dummy data
DELETE FROM public.clients WHERE first_name = 'Dummy' OR last_name = 'Dummy';
DELETE FROM public.clients WHERE notes LIKE '%dummy%' OR notes LIKE '%test%'; 