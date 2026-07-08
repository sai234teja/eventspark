-- Migration: 20260708000000_multi_tenant_schema.sql
-- Description: Create organizations, junction tables, subscriptions, audit_logs and expand existing tables.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

---------------------------------------------------------
-- 1. Create Core Tables
---------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  deleted_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS public.organization_settings (
  organization_id uuid PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
  logo_url text,
  primary_color text,
  secondary_color text,
  website text,
  timezone text DEFAULT 'UTC',
  feature_flags jsonb DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.organization_members (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'staff', 'student')),
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.organization_invites (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'staff', 'student')),
  token text UNIQUE NOT NULL,
  invited_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id uuid UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'trial')),
  current_period_end timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

---------------------------------------------------------
-- 2. Modify Existing Tables
---------------------------------------------------------

ALTER TABLE public.events 
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

ALTER TABLE public.registrations 
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.payments 
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

---------------------------------------------------------
-- 3. Create Helper Functions
---------------------------------------------------------

-- Helper: Get current organization from app_metadata or headers (used if enforcing via custom JWT)
CREATE OR REPLACE FUNCTION public.current_organization()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  -- Example: read from jwt claim or request header
  SELECT nullif(current_setting('request.jwt.claim.app_metadata.organization_id', true), '')::uuid;
$$;

-- Helper: Check membership
CREATE OR REPLACE FUNCTION public.is_member_of(_organization_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = _organization_id
    AND user_id = auth.uid()
  );
$$;

-- Helper: Get user's role in an organization
CREATE OR REPLACE FUNCTION public.current_user_role(_organization_id uuid)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.organization_members
  WHERE organization_id = _organization_id AND user_id = auth.uid()
  LIMIT 1;
$$;

-- Helper: Check if user meets role requirement (Role Hierarchy)
CREATE OR REPLACE FUNCTION public.has_role_in_org(_organization_id uuid, _required_role text)
RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  _user_role text;
  _role_level int;
  _required_level int;
BEGIN
  _user_role := public.current_user_role(_organization_id);
  IF _user_role IS NULL THEN
    RETURN false;
  END IF;

  -- Define hierarchy: owner(5) > admin(4) > manager(3) > staff(2) > student(1)
  _role_level := CASE _user_role
    WHEN 'owner' THEN 5
    WHEN 'admin' THEN 4
    WHEN 'manager' THEN 3
    WHEN 'staff' THEN 2
    WHEN 'student' THEN 1
    ELSE 0
  END;

  _required_level := CASE _required_role
    WHEN 'owner' THEN 5
    WHEN 'admin' THEN 4
    WHEN 'manager' THEN 3
    WHEN 'staff' THEN 2
    WHEN 'student' THEN 1
    ELSE 0
  END;

  RETURN _role_level >= _required_level;
END;
$$;

---------------------------------------------------------
-- 4. Create Indexes for Performance
---------------------------------------------------------

-- Foreign Key Indexes
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_invites_org_id ON public.organization_invites(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON public.audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_events_org_id ON public.events(organization_id);
CREATE INDEX IF NOT EXISTS idx_registrations_org_id ON public.registrations(organization_id);
CREATE INDEX IF NOT EXISTS idx_payments_org_id ON public.payments(organization_id);

-- Composite Indexes
CREATE INDEX IF NOT EXISTS idx_events_org_created_at ON public.events(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_org_organizer ON public.events(organization_id, organizer_id);
CREATE INDEX IF NOT EXISTS idx_payments_org_status ON public.payments(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_registrations_org_user ON public.registrations(organization_id, user_id);
