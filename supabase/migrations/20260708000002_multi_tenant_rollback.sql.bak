-- Migration: 20260708000002_multi_tenant_rollback.sql
-- Description: Teardown multi-tenant schema additions.

---------------------------------------------------------
-- 1. Remove RLS Policies (automatically dropped when tables are dropped, but good practice)
---------------------------------------------------------

-- Events, Registrations, Payments columns and RLS
ALTER TABLE public.events DROP COLUMN IF EXISTS organization_id;
ALTER TABLE public.events DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE public.registrations DROP COLUMN IF EXISTS organization_id;
ALTER TABLE public.payments DROP COLUMN IF EXISTS organization_id;

---------------------------------------------------------
-- 2. Drop Helper Functions
---------------------------------------------------------

DROP FUNCTION IF EXISTS public.has_role_in_org(uuid, text);
DROP FUNCTION IF EXISTS public.current_user_role(uuid);
DROP FUNCTION IF EXISTS public.is_member_of(uuid);
DROP FUNCTION IF EXISTS public.current_organization();

---------------------------------------------------------
-- 3. Drop New Tables
---------------------------------------------------------

DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.organization_invites CASCADE;
DROP TABLE IF EXISTS public.organization_members CASCADE;
DROP TABLE IF EXISTS public.organization_settings CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;
