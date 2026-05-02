-- ========================================================================================
-- ⚠️ WARNING: THIS WILL DROP THE PASSWORD AND EMAIL COLUMNS FROM YOUR PATIENTS TABLE.
-- ANY EXISTING TEST ACCOUNTS WILL NO LONGER BE ABLE TO LOGIN. 
-- YOU MUST RECREATE YOUR TEST ACCOUNTS AFTER RUNNING THIS SCRIPT.
-- ========================================================================================

-- 1. Ensure the user_profiles table exists (matching src/database/schema.sql)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Ensure the user_roles table exists
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'staff', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Modify the patients table to remove redundancies and link to auth.users
-- Drop the redundant columns safely if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'password_hash') THEN
        ALTER TABLE public.patients DROP COLUMN password_hash;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'email') THEN
        ALTER TABLE public.patients DROP COLUMN email;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'role') THEN
        ALTER TABLE public.patients DROP COLUMN role;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'first_name') THEN
        ALTER TABLE public.patients DROP COLUMN first_name;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'last_name') THEN
        ALTER TABLE public.patients DROP COLUMN last_name;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'phone') THEN
        ALTER TABLE public.patients DROP COLUMN phone;
    END IF;
END $$;

-- Add the user_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'user_id') THEN
        -- Add the column, initially nullable so it doesn't crash on existing data
        ALTER TABLE public.patients ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        -- Note: If you want to make it NOT NULL later, you should clear your existing test data first.
        -- ALTER TABLE public.patients ALTER COLUMN user_id SET NOT NULL;
        -- ALTER TABLE public.patients ADD CONSTRAINT patients_user_id_key UNIQUE (user_id);
    END IF;
END $$;


-- ========================================================================================
-- AUTOMATIC PROFILE CREATION TRIGGERS (SECURITY ENHANCEMENT)
-- ========================================================================================

-- Function to handle new user signups from Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
    role_val VARCHAR(20);
BEGIN
    -- By default, assume new signups are 'patient' unless metadata specifies otherwise
    role_val := COALESCE((new.raw_user_meta_data->>'role')::VARCHAR, 'patient');

    -- 1. Insert into user_profiles
    INSERT INTO public.user_profiles (user_id, email, first_name, last_name, phone)
    VALUES (
        new.id, 
        new.email, 
        new.raw_user_meta_data->>'first_name', 
        new.raw_user_meta_data->>'last_name',
        new.raw_user_meta_data->>'phone'
    );

    -- 2. Insert into user_roles
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, role_val);

    -- 3. If role is patient, automatically create a patient record
    IF role_val = 'patient' THEN
        INSERT INTO public.patients (user_id)
        VALUES (new.id);
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to fire the function on every new user inserted into auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS for the tables if not already enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Note: Ensure policies exist for user_profiles and user_roles as per your schema.sql
