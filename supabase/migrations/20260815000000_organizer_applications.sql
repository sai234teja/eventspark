-- Migration: 20260815000000_organizer_applications
-- Description: Create organizer_applications table and secure profile role updates

-- 1. Create Application Status Enum
DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Organizer Applications Table
CREATE TABLE IF NOT EXISTS public.organizer_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_name TEXT NOT NULL,
    organization_type TEXT NOT NULL,
    phone TEXT,
    website TEXT,
    description TEXT,
    city TEXT,
    address TEXT,
    reason TEXT,
    status application_status DEFAULT 'PENDING'::application_status NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    UNIQUE(user_id)
);

-- 3. Enable RLS
ALTER TABLE public.organizer_applications ENABLE ROW LEVEL SECURITY;

-- 4. Policies for Users
CREATE POLICY "Users can view own applications"
ON public.organizer_applications FOR SELECT
USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert own application"
ON public.organizer_applications FOR INSERT
WITH CHECK ( auth.uid() = user_id );

-- Note: Normal users are explicitly denied UPDATE and DELETE access
-- to prevent spoofing approval states or modifying audit trails.

-- 5. Policies for Admins
CREATE POLICY "Admins can view all applications"
ON public.organizer_applications FOR SELECT
USING ( EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
) );

CREATE POLICY "Admins can update all applications"
ON public.organizer_applications FOR UPDATE
USING ( EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
) );

-- 6. Secure Profile Role Updates
-- Prevent users from escalating their own role via the API
CREATE OR REPLACE FUNCTION public.check_profile_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- If role is being changed
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Allow bypass if the current database user is service_role
    IF current_user = 'service_role' THEN
      RETURN NEW;
    END IF;

    -- Check if the user performing the update is an admin
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Unauthorized: You cannot change your own role';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS check_profile_role_update ON public.profiles;
CREATE TRIGGER check_profile_role_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.check_profile_role_escalation();
