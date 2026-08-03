-- Migration: 20260711000007_user_experience.sql
-- Description: Core schema for Wishlists, Reminders, Waitlists, Transfers, Cancellations, and Reports with Strict Constraints

---------------------------------------------------------
-- Waitlist Auto-Promotion RPC
-- Required early for waitlist table dependency
---------------------------------------------------------

---------------------------------------------------------
-- 1. Wishlists & Favorites
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_wishlists (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  entity_type text NOT NULL CHECK (entity_type IN ('event', 'organizer', 'category')),
  entity_id text NOT NULL, -- Flexible ID to store event_id, org_id, or category string
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz NULL,
  UNIQUE(user_id, entity_type, entity_id)
);

---------------------------------------------------------
-- 2. Reminders
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_reminders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  timeframe text NOT NULL CHECK (timeframe IN ('24h', '6h', '1h', 'custom')),
  method text NOT NULL CHECK (method IN ('email', 'sms', 'push')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  scheduled_for timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz NULL
);

---------------------------------------------------------
-- 3. Waitlist
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.waitlist_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  tier_id uuid REFERENCES public.ticket_tiers(id) ON DELETE CASCADE,
  position integer NOT NULL,
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'promoted', 'expired', 'joined')),
  promoted_at timestamptz,
  notification_sent_at timestamptz,
  reservation_expires_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz NULL
);

---------------------------------------------------------
-- 4. Ticket Transfers
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ticket_transfers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  to_email text NOT NULL,
  registration_id uuid REFERENCES public.registrations(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  transfer_token text UNIQUE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'cancelled')),
  old_ticket_id uuid, -- Reference to old ticket
  new_ticket_id uuid, -- Reference to new generated ticket
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  rejected_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz NULL
);

---------------------------------------------------------
-- 5. Cancellations & Reports
---------------------------------------------------------
-- Add policy fields to ticket_tiers
ALTER TABLE public.ticket_tiers
  ADD COLUMN IF NOT EXISTS refundable boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS non_refundable boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS refund_before_hours integer DEFAULT 48,
  ADD COLUMN IF NOT EXISTS refund_percentage numeric DEFAULT 100.0,
  ADD COLUMN IF NOT EXISTS organizer_approval_required boolean DEFAULT false;

CREATE TABLE IF NOT EXISTS public.cancellation_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id uuid REFERENCES public.registrations(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  reason text,
  status text DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'rejected', 'processing', 'refunded', 'completed')),
  refund_amount numeric,
  refund_reason text,
  approved_by uuid REFERENCES public.profiles(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz NULL
);

CREATE TABLE IF NOT EXISTS public.event_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL CHECK (category IN ('spam', 'fraud', 'duplicate', 'incorrect', 'offensive', 'other')),
  details text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamptz,
  resolution text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz NULL
);

---------------------------------------------------------
-- SQL Views for Recommendation Engine
---------------------------------------------------------
CREATE OR REPLACE VIEW public.vw_trending_events WITH (security_invoker=true) AS
  SELECT e.*, COUNT(r.id) as recent_registrations
  FROM public.events e
  LEFT JOIN public.registrations r ON e.id = r.event_id
  WHERE e.status = 'published' AND e.start_date >= CURRENT_DATE
  GROUP BY e.id
  ORDER BY recent_registrations DESC;

CREATE OR REPLACE VIEW public.vw_popular_events WITH (security_invoker=true) AS
  SELECT e.*, 
    (SELECT COUNT(*) FROM public.user_wishlists w WHERE w.entity_type = 'event' AND w.entity_id = e.id::text) as wishlist_count
  FROM public.events e
  WHERE e.status = 'published' AND e.start_date >= CURRENT_DATE
  ORDER BY wishlist_count DESC;

---------------------------------------------------------
-- RLS POLICIES
---------------------------------------------------------
ALTER TABLE public.user_wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cancellation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_reports ENABLE ROW LEVEL SECURITY;

-- Wishlists (Users manage their own)
CREATE POLICY "Users can manage their wishlists" ON public.user_wishlists
  FOR ALL USING (user_id = auth.uid() AND deleted_at IS NULL);

-- Reminders
CREATE POLICY "Users can manage their reminders" ON public.user_reminders
  FOR ALL USING (user_id = auth.uid() AND deleted_at IS NULL);

-- Waitlist
CREATE POLICY "Users can view their waitlist entries" ON public.waitlist_entries
  FOR SELECT USING (user_id = auth.uid() AND deleted_at IS NULL);
CREATE POLICY "Users can insert waitlist entries" ON public.waitlist_entries
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Org members can view waitlist" ON public.waitlist_entries
  FOR SELECT USING (public.is_member_of(organization_id) AND deleted_at IS NULL);

-- Ticket Transfers
CREATE POLICY "Users can view transfers they sent or received" ON public.ticket_transfers
  FOR SELECT USING ((from_user_id = auth.uid() OR to_email = (SELECT email FROM auth.users WHERE id = auth.uid())) AND deleted_at IS NULL);
CREATE POLICY "Users can initiate transfers" ON public.ticket_transfers
  FOR INSERT WITH CHECK (from_user_id = auth.uid());

-- Cancellations
CREATE POLICY "Users can view their cancellations" ON public.cancellation_requests
  FOR SELECT USING (user_id = auth.uid() AND deleted_at IS NULL);
CREATE POLICY "Users can request cancellation" ON public.cancellation_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Org members can manage cancellations" ON public.cancellation_requests
  FOR ALL USING (public.is_member_of(organization_id) AND deleted_at IS NULL);

-- Event Reports
CREATE POLICY "Users can submit reports" ON public.event_reports
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Org members can view reports" ON public.event_reports
  FOR SELECT USING (public.is_member_of(organization_id) AND deleted_at IS NULL);

---------------------------------------------------------
-- Indexes
---------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_wishlist_user_org ON public.user_wishlists(user_id, organization_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_entity ON public.user_wishlists(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_waitlist_event ON public.waitlist_entries(event_id, status);
CREATE INDEX IF NOT EXISTS idx_waitlist_user_org ON public.waitlist_entries(user_id, organization_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_created ON public.waitlist_entries(created_at);

CREATE INDEX IF NOT EXISTS idx_transfer_token ON public.ticket_transfers(transfer_token);
CREATE INDEX IF NOT EXISTS idx_transfer_user_org ON public.ticket_transfers(from_user_id, organization_id);

CREATE INDEX IF NOT EXISTS idx_cancellation_user_org ON public.cancellation_requests(user_id, organization_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_status ON public.cancellation_requests(status);

CREATE INDEX IF NOT EXISTS idx_reports_event ON public.event_reports(event_id, status);
