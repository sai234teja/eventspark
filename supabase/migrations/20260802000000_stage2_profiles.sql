-- Migration: 20260802000000_stage2_profiles
-- Description: Enforce Stage 2 specific profiles schema and RLS

-- 1. Create the role enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'organizer', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add role column to existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user'::user_role NOT NULL;

-- 3. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if any to avoid conflicts
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 5. Recreate strict RLS policies
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING ( true );

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING ( auth.uid() = id );
