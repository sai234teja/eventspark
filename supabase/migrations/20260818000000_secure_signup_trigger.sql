-- Migration: 20260818000000_secure_signup_trigger.sql
-- Date: 2026-08-18
-- Purpose: CRITICAL SECURITY FIX — Remove role injection from signup trigger.
--
-- PROBLEM (CRITICAL-2 from Phase 3 Audit):
--   The previous handle_new_user() trigger (in 20260802000001_stage2_fixes.sql and
--   20260803000000_fix_signup_trigger.sql) read the 'role' field from
--   raw_user_meta_data, which is client-supplied during supabase.auth.signUp().
--   This allowed any client to register with role = 'admin' or role = 'organizer':
--
--     supabase.auth.signUp({ email: '...', options: { data: { role: 'admin' } } })
--
--   This would result in profiles.role = 'admin' on the very first login.
--
-- FIX:
--   Always insert role = 'user'::public.user_role regardless of metadata.
--   Role elevation must happen exclusively via the admin approval workflow
--   (check_profile_role_escalation trigger + service_role bypass in admin API).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    'user'::public.user_role   -- ALWAYS 'user'. Never read role from client metadata.
  )
  ON CONFLICT (id) DO NOTHING;  -- Prevent duplicate errors on retries
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger (DROP IF EXISTS to be idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
