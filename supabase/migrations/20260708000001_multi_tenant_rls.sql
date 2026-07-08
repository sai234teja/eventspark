-- Migration: 20260708000001_multi_tenant_rls.sql
-- Description: Enable RLS and apply security policies for multi-tenant isolation.

---------------------------------------------------------
-- 1. Enable RLS on all tables
---------------------------------------------------------

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

---------------------------------------------------------
-- 2. Organizations & Settings Policies
---------------------------------------------------------

-- Organizations: Members can view their organizations
CREATE POLICY "View organizations" ON public.organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  );

-- Organizations: Only admins/owners can update
CREATE POLICY "Update organizations" ON public.organizations
  FOR UPDATE USING (
    public.has_role_in_org(id, 'admin')
  );

-- Organization Settings: Members can view
CREATE POLICY "View organization settings" ON public.organization_settings
  FOR SELECT USING (
    public.is_member_of(organization_id)
  );

-- Organization Settings: Only admins/owners can update
CREATE POLICY "Update organization settings" ON public.organization_settings
  FOR UPDATE USING (
    public.has_role_in_org(organization_id, 'admin')
  );

---------------------------------------------------------
-- 3. Members & Invites Policies
---------------------------------------------------------

-- Members: Members can view other members in the same organization
CREATE POLICY "View organization members" ON public.organization_members
  FOR SELECT USING (
    public.is_member_of(organization_id)
  );

-- Members: Only admins/owners can add/remove/update members
CREATE POLICY "Manage organization members" ON public.organization_members
  FOR ALL USING (
    public.has_role_in_org(organization_id, 'admin')
  );

-- Invites: Members can view invites
CREATE POLICY "View organization invites" ON public.organization_invites
  FOR SELECT USING (
    public.is_member_of(organization_id)
  );

-- Invites: Only admins/owners can manage invites
CREATE POLICY "Manage organization invites" ON public.organization_invites
  FOR ALL USING (
    public.has_role_in_org(organization_id, 'admin')
  );

---------------------------------------------------------
-- 4. Subscriptions Policies
---------------------------------------------------------

-- Subscriptions: Members can view subscription status
CREATE POLICY "View subscriptions" ON public.subscriptions
  FOR SELECT USING (
    public.is_member_of(organization_id)
  );

-- Subscriptions: Only owners can update/manage subscriptions
CREATE POLICY "Manage subscriptions" ON public.subscriptions
  FOR ALL USING (
    public.has_role_in_org(organization_id, 'owner')
  );

---------------------------------------------------------
-- 5. Audit Logs Policies
---------------------------------------------------------

-- Audit Logs: Only admins/owners can view audit logs
CREATE POLICY "View audit logs" ON public.audit_logs
  FOR SELECT USING (
    public.has_role_in_org(organization_id, 'admin')
  );

-- Audit Logs: System/Application can insert (No user update/delete)
CREATE POLICY "Insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (
    public.is_member_of(organization_id)
  );

---------------------------------------------------------
-- 6. Events, Registrations, Payments Policies
---------------------------------------------------------

-- Events: Members can view events (ignoring soft-deleted)
CREATE POLICY "View events" ON public.events
  FOR SELECT USING (
    public.is_member_of(organization_id) AND deleted_at IS NULL
  );

-- Events: Managers/Admins/Owners can insert/update events
CREATE POLICY "Manage events" ON public.events
  FOR ALL USING (
    public.has_role_in_org(organization_id, 'manager')
  );

-- Registrations: Members can view registrations for their org
CREATE POLICY "View registrations" ON public.registrations
  FOR SELECT USING (
    public.is_member_of(organization_id)
  );

-- Registrations: Staff or above can manage registrations, or user can manage their own
CREATE POLICY "Manage registrations" ON public.registrations
  FOR ALL USING (
    public.has_role_in_org(organization_id, 'staff') OR user_id = auth.uid()
  );

-- Payments: Members can view payments for their org
CREATE POLICY "View payments" ON public.payments
  FOR SELECT USING (
    public.is_member_of(organization_id)
  );

-- Payments: Only managers/admins/owners can manage payments
CREATE POLICY "Manage payments" ON public.payments
  FOR ALL USING (
    public.has_role_in_org(organization_id, 'manager')
  );
