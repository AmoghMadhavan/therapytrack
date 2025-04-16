-- This file contains SQL functions for creating missing tables in the database
-- These functions can be copied and run directly in the Supabase SQL Editor
-- They should be executed with proper permissions (superuser or role with create table permissions)

-- Function to create profiles table
CREATE OR REPLACE FUNCTION create_profiles_table()
RETURNS void AS $$
BEGIN
    -- Check if table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        -- Create the table
        CREATE TABLE public.profiles (
          id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
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

        -- Set up RLS
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Users can view their own profile" 
          ON public.profiles FOR SELECT 
          USING (auth.uid() = id);
        CREATE POLICY "Users can update their own profile" 
          ON public.profiles FOR UPDATE 
          USING (auth.uid() = id);
        
        -- Allow insert for authenticated users
        CREATE POLICY "Users can insert their own profile" 
          ON public.profiles FOR INSERT 
          WITH CHECK (auth.uid() = id);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to create clients table
CREATE OR REPLACE FUNCTION create_clients_table()
RETURNS void AS $$
BEGIN
    -- Check if table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clients') THEN
        -- Create the table
        CREATE TABLE public.clients (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          therapist_id UUID REFERENCES auth.users(id) NOT NULL,
          user_id UUID REFERENCES auth.users(id),
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          date_of_birth TIMESTAMP WITH TIME ZONE,
          gender TEXT,
          email TEXT,
          phone TEXT,
          status TEXT NOT NULL DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_session_date TIMESTAMP WITH TIME ZONE
        );

        -- Set up RLS
        ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Therapists can CRUD their own clients" 
          ON public.clients FOR ALL 
          USING (auth.uid() = therapist_id);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to create sessions table
CREATE OR REPLACE FUNCTION create_sessions_table()
RETURNS void AS $$
BEGIN
    -- Check if table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sessions') THEN
        -- Create the table
        CREATE TABLE public.sessions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
          therapist_id UUID REFERENCES auth.users(id) NOT NULL,
          date TIMESTAMP WITH TIME ZONE NOT NULL,
          duration INTEGER NOT NULL DEFAULT 50,
          status TEXT NOT NULL DEFAULT 'scheduled',
          location TEXT NOT NULL DEFAULT 'telehealth',
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Set up RLS
        ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Therapists can CRUD their own sessions" 
          ON public.sessions FOR ALL 
          USING (auth.uid() = therapist_id);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to create all required tables
CREATE OR REPLACE FUNCTION create_all_tables()
RETURNS void AS $$
BEGIN
    -- Create the extension if it doesn't exist
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- Create each table
    PERFORM create_profiles_table();
    PERFORM create_clients_table();
    PERFORM create_sessions_table();
END;
$$ LANGUAGE plpgsql; 