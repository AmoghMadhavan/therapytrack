# Dashboard Setup Guide

This guide will help you fix the "Failed to load dashboard data" issue that appears after login.

## The Problem

The dashboard is failing to load because:

1. The required database tables don't exist in your Supabase project
2. The dashboard is trying to query these tables but encountering errors

## Quick Solutions

### Option 1: Visit the Test Page

1. After logging in, instead of going to the dashboard, navigate to: `/test-db`
2. This page will show diagnostic information about your database connection
3. It will help identify exactly which tables are missing

### Option 2: Run the SQL Setup Script

1. Go to your Supabase dashboard: [https://app.supabase.io](https://app.supabase.io)
2. Navigate to SQL Editor
3. Copy the contents of the `src/lib/supabase/setupFunctions.sql` file
4. Paste it into the SQL Editor and run it
5. After execution, run the following command:
   ```sql
   SELECT create_all_tables();
   ```
6. This will create all the necessary tables with proper permissions

## Manual Table Creation

If you prefer to create the tables manually:

### 1. Create the profiles table

```sql
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
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);
```

### 2. Create the clients table

```sql
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
```

### 3. Create the sessions table

```sql
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
```

## Additional Info

### Database Schema

The application requires the following tables:
- `profiles`: Links to Supabase auth.users and stores user profile information
- `clients`: Stores client information linked to therapist users
- `sessions`: Stores therapy session information linked to clients

### Debugging Process

If you're still encountering issues:

1. Check the browser console for specific error messages
2. Visit the `/test-db` route to see diagnostic information
3. Verify the Supabase configuration in `.env` or `src/lib/supabase/config.ts`
4. Ensure your Supabase project has RLS (Row Level Security) policies configured correctly

## Need More Help?

If you continue to experience issues, please:
1. Check the browser's developer console (F12) for specific error messages
2. Take a screenshot of any errors
3. Contact support with the error details 