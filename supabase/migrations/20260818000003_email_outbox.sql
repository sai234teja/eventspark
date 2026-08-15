-- Migration: 20260818000003_email_outbox.sql
-- Date: 2026-08-18
-- Purpose: HIGH-3 Fix — Create an email_outbox table for persistent transactional email queues

CREATE TABLE IF NOT EXISTS public.email_outbox (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  idempotency_key text UNIQUE, -- e.g. registration_id to prevent duplicate booking emails
  recipient text NOT NULL,
  subject text NOT NULL,
  template_name text NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
  attempts integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 3,
  last_error text,
  available_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  sent_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for efficient queue polling
CREATE INDEX IF NOT EXISTS idx_email_outbox_status_available ON public.email_outbox(status, available_at) WHERE status IN ('pending', 'failed');

-- Enable RLS
ALTER TABLE public.email_outbox ENABLE ROW LEVEL SECURITY;

-- No public or authenticated user access. Only service_role can read/write to the queue.

-- RPC to claim emails atomically for cron workers
CREATE OR REPLACE FUNCTION public.claim_emails_for_processing(p_limit int)
RETURNS TABLE (
  id uuid,
  recipient text,
  subject text,
  template_name text,
  payload jsonb,
  attempts integer,
  max_attempts integer,
  available_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.email_outbox
  SET status = 'processing',
      updated_at = NOW()
  WHERE id IN (
    SELECT id
    FROM public.email_outbox
    WHERE status IN ('pending', 'failed')
      AND available_at <= NOW()
      AND attempts < max_attempts
    ORDER BY available_at ASC
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED
  )
  RETURNING id, recipient, subject, template_name, payload, attempts, max_attempts, available_at;
$$;

-- Revoke public execution
REVOKE EXECUTE ON FUNCTION public.claim_emails_for_processing(int) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.claim_emails_for_processing(int) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.claim_emails_for_processing(int) FROM anon;
