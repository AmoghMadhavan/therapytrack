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

-- Create attachments table for sessions
CREATE TABLE IF NOT EXISTS public.session_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'audio', 'document')),
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for session attachments
ALTER TABLE public.session_attachments ENABLE ROW LEVEL SECURITY;
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

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  therapist_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_date TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('assigned', 'in-progress', 'completed', 'overdue')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  completed_date TIMESTAMP WITH TIME ZONE,
  completion_notes TEXT,
  difficulty_rating INTEGER,
  reminder_sent BOOLEAN DEFAULT FALSE,
  frequency TEXT CHECK (frequency IN ('once', 'daily', 'weekly')),
  goal_area TEXT[],
  session_id UUID REFERENCES public.sessions(id)
);

-- Create RLS policies for tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Therapists can CRUD their own tasks" 
  ON public.tasks FOR ALL 
  USING (auth.uid() = therapist_id);
CREATE POLICY "Clients can view and update their own tasks" 
  ON public.tasks FOR SELECT 
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Clients can update their own tasks" 
  ON public.tasks FOR UPDATE 
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  );

-- Create task_attachments table
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

-- Create RLS policies for task_attachments
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
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

-- Create goals table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  therapist_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'achieved', 'discontinued')),
  date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  target_date TIMESTAMP WITH TIME ZONE,
  date_achieved TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100)
);

-- Create RLS policies for goals
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Therapists can CRUD their clients' goals" 
  ON public.goals FOR ALL 
  USING (auth.uid() = therapist_id);
CREATE POLICY "Clients can view their own goals" 
  ON public.goals FOR SELECT 
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
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

-- Create RLS policies for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see messages they sent or received" 
  ON public.messages FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can send messages" 
  ON public.messages FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Recipients can mark messages as read" 
  ON public.messages FOR UPDATE 
  USING (auth.uid() = recipient_id);

-- Create message_attachments table
CREATE TABLE IF NOT EXISTS public.message_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'audio', 'document')),
  url TEXT NOT NULL,
  name TEXT NOT NULL
);

-- Create RLS policies for message_attachments
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see message attachments they have access to" 
  ON public.message_attachments FOR SELECT 
  USING (
    message_id IN (
      SELECT id FROM public.messages WHERE sender_id = auth.uid() OR recipient_id = auth.uid()
    )
  );
CREATE POLICY "Message senders can add attachments" 
  ON public.message_attachments FOR INSERT 
  WITH CHECK (
    message_id IN (
      SELECT id FROM public.messages WHERE sender_id = auth.uid()
    )
  ); 