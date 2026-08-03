-- Phase 7.5: Notifications, Ticketing & QR Check-In System

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Create tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
    qr_token TEXT NOT NULL UNIQUE,
    ticket_number TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'issued', -- pending, issued, checked-in, cancelled, expired
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    checked_in_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create ticket_checkins table
CREATE TABLE IF NOT EXISTS public.ticket_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    checked_in_by UUID NOT NULL REFERENCES auth.users(id),
    checked_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    device TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create notification_templates table
CREATE TABLE IF NOT EXISTS public.notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject TEXT,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, name)
);

-- 4. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    template TEXT NOT NULL,
    subject TEXT,
    body TEXT NOT NULL,
    delivery_status TEXT NOT NULL DEFAULT 'pending', -- pending, delivered, failed
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tickets_org_event ON public.tickets(organization_id, event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_registration ON public.tickets(registration_id);
CREATE INDEX IF NOT EXISTS idx_tickets_qr_token ON public.tickets(qr_token);
CREATE INDEX IF NOT EXISTS idx_tickets_number ON public.tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_ticket_checkins_ticket ON public.ticket_checkins(ticket_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_org ON public.notifications(organization_id, delivery_status);

-- RPC for issuing a ticket transactionally
CREATE OR REPLACE FUNCTION public.issue_ticket(
    p_organization_id UUID,
    p_event_id INTEGER,
    p_registration_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_qr_token TEXT;
    v_ticket_number TEXT;
    v_ticket_id UUID;
    v_result JSONB;
BEGIN
    -- Verify registration exists and belongs to the organization
    IF NOT EXISTS (
        SELECT 1 FROM public.registrations
        WHERE id = p_registration_id 
        AND event_id = p_event_id 
        AND organization_id = p_organization_id
    ) THEN
        RAISE EXCEPTION 'Registration not found or unauthorized';
    END IF;

    -- Ensure ticket hasn't already been issued for this registration
    IF EXISTS (
        SELECT 1 FROM public.tickets WHERE registration_id = p_registration_id
    ) THEN
        RAISE EXCEPTION 'Ticket already issued for this registration';
    END IF;

    -- Generate secure tokens
    v_qr_token := encode(gen_random_bytes(32), 'hex');
    v_ticket_number := 'TKT-' || upper(substring(md5(random()::text) from 1 for 8));

    -- Insert ticket
    INSERT INTO public.tickets (
        organization_id, event_id, registration_id, qr_token, ticket_number, status
    ) VALUES (
        p_organization_id, p_event_id, p_registration_id, v_qr_token, v_ticket_number, 'issued'
    ) RETURNING id INTO v_ticket_id;

    -- Queue a confirmation notification
    INSERT INTO public.notifications (
        organization_id, user_id, event_id, template, subject, body, delivery_status
    )
    SELECT 
        p_organization_id, 
        r.user_id, 
        p_event_id, 
        'Registration Confirmation', 
        'Your Ticket to Event', 
        'Ticket ' || v_ticket_number || ' has been issued.', 
        'pending'
    FROM public.registrations r
    WHERE r.id = p_registration_id;

    -- Return JSON representation
    SELECT jsonb_build_object(
        'id', v_ticket_id,
        'ticket_number', v_ticket_number,
        'qr_token', v_qr_token,
        'status', 'issued'
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- Enable RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Apply Tenant RLS Policies (Requires security_invoker = true implicitly via standard RLS)
CREATE POLICY tenant_isolation_tickets ON public.tickets
    FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY tenant_isolation_ticket_checkins ON public.ticket_checkins
    FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY tenant_isolation_notification_templates ON public.notification_templates
    FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY tenant_isolation_notifications ON public.notifications
    FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    ));
