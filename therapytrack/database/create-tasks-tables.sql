-- Create Tasks table
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Goals table
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

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for Tasks table
CREATE POLICY "Therapists can view their own tasks" 
ON public.tasks
FOR SELECT 
TO authenticated
USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can insert their own tasks" 
ON public.tasks
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can update their own tasks" 
ON public.tasks
FOR UPDATE 
TO authenticated
USING (auth.uid() = therapist_id)
WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can delete their own tasks" 
ON public.tasks
FOR DELETE 
TO authenticated
USING (auth.uid() = therapist_id);

-- Create RLS policies for Goals table
CREATE POLICY "Therapists can view their own goals" 
ON public.goals
FOR SELECT 
TO authenticated
USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can insert their own goals" 
ON public.goals
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can update their own goals" 
ON public.goals
FOR UPDATE 
TO authenticated
USING (auth.uid() = therapist_id)
WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can delete their own goals" 
ON public.goals
FOR DELETE 
TO authenticated
USING (auth.uid() = therapist_id);

-- Create functions for RPC calls
CREATE OR REPLACE FUNCTION create_tasks_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE '
    CREATE TABLE IF NOT EXISTS public.tasks (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      therapist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      assigned_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      due_date TIMESTAMP WITH TIME ZONE NOT NULL,
      status TEXT NOT NULL DEFAULT ''assigned'' CHECK (status IN (''assigned'', ''in-progress'', ''completed'', ''overdue'')),
      priority TEXT NOT NULL DEFAULT ''medium'' CHECK (priority IN (''high'', ''medium'', ''low'')),
      goal_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
      frequency TEXT NOT NULL DEFAULT ''once'' CHECK (frequency IN (''once'', ''daily'', ''weekly'', ''monthly'')),
      completion_details JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Therapists can view their own tasks" ON public.tasks;
    CREATE POLICY "Therapists can view their own tasks" 
    ON public.tasks
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = therapist_id);
    
    DROP POLICY IF EXISTS "Therapists can insert their own tasks" ON public.tasks;
    CREATE POLICY "Therapists can insert their own tasks" 
    ON public.tasks
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = therapist_id);
    
    DROP POLICY IF EXISTS "Therapists can update their own tasks" ON public.tasks;
    CREATE POLICY "Therapists can update their own tasks" 
    ON public.tasks
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = therapist_id)
    WITH CHECK (auth.uid() = therapist_id);
    
    DROP POLICY IF EXISTS "Therapists can delete their own tasks" ON public.tasks;
    CREATE POLICY "Therapists can delete their own tasks" 
    ON public.tasks
    FOR DELETE 
    TO authenticated
    USING (auth.uid() = therapist_id);
  ';
END;
$$;

CREATE OR REPLACE FUNCTION create_goals_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE '
    CREATE TABLE IF NOT EXISTS public.goals (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      therapist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      area TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT ''active'' CHECK (status IN (''active'', ''completed'', ''archived'')),
      target_date TIMESTAMP WITH TIME ZONE,
      baseline_measurement TEXT,
      current_measurement TEXT,
      target_measurement TEXT,
      measurement_unit TEXT,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Therapists can view their own goals" ON public.goals;
    CREATE POLICY "Therapists can view their own goals" 
    ON public.goals
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = therapist_id);
    
    DROP POLICY IF EXISTS "Therapists can insert their own goals" ON public.goals;
    CREATE POLICY "Therapists can insert their own goals" 
    ON public.goals
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = therapist_id);
    
    DROP POLICY IF EXISTS "Therapists can update their own goals" ON public.goals;
    CREATE POLICY "Therapists can update their own goals" 
    ON public.goals
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = therapist_id)
    WITH CHECK (auth.uid() = therapist_id);
    
    DROP POLICY IF EXISTS "Therapists can delete their own goals" ON public.goals;
    CREATE POLICY "Therapists can delete their own goals" 
    ON public.goals
    FOR DELETE 
    TO authenticated
    USING (auth.uid() = therapist_id);
  ';
END;
$$; 