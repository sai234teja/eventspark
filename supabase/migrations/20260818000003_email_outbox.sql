-- Migration: 20260818000003_email_outbox.sql
-- Date: 2026-08-18
-- Purpose: HIGH-3 Fix — Persistent transactional email queue

-- ============================================================
-- 1. EMAIL OUTBOX TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.email_outbox (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,

  idempotency_key text UNIQUE,

  recipient text NOT NULL,
  subject text NOT NULL,
  template_name text NOT NULL,
  payload jsonb NOT NULL,

  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'sent', 'failed')),

  attempts integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 3,

  last_error text,

  available_at timestamp with time zone
    DEFAULT timezone('utc'::text, now()) NOT NULL,

  sent_at timestamp with time zone,

  created_at timestamp with time zone
    DEFAULT timezone('utc'::text, now()) NOT NULL,

  updated_at timestamp with time zone
    DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ============================================================
-- 2. QUEUE POLLING INDEX
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_email_outbox_status_available
ON public.email_outbox(status, available_at)
WHERE status IN ('pending', 'failed');


-- ============================================================
-- 3. RLS
-- ============================================================

ALTER TABLE public.email_outbox ENABLE ROW LEVEL SECURITY;

-- No policies for anon/authenticated.
-- service_role bypasses RLS.


-- ============================================================
-- 4. ATOMIC EMAIL CLAIM RPC
-- ============================================================

CREATE OR REPLACE FUNCTION public.claim_emails_for_processing(
    p_limit integer
)
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
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN

  -- ----------------------------------------------------------
  -- Validate batch size
  -- ----------------------------------------------------------

  IF p_limit IS NULL OR p_limit <= 0 OR p_limit > 100 THEN
    RAISE EXCEPTION 'p_limit must be between 1 and 100';
  END IF;


  -- ----------------------------------------------------------
  -- Atomically claim available emails.
  --
  -- FOR UPDATE SKIP LOCKED allows multiple workers to process
  -- different emails without claiming the same row.
  -- ----------------------------------------------------------

  RETURN QUERY
  UPDATE public.email_outbox e
  SET
    status = 'processing',
    attempts = e.attempts + 1,
    updated_at = NOW()
  WHERE e.id IN (
    SELECT q.id
    FROM public.email_outbox q
    WHERE q.status IN ('pending', 'failed')
      AND q.available_at <= NOW()
      AND q.attempts < q.max_attempts
    ORDER BY q.available_at ASC
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED
  )
  RETURNING
    e.id,
    e.recipient,
    e.subject,
    e.template_name,
    e.payload,
    e.attempts,
    e.max_attempts,
    e.available_at;

END;
$$;


-- ============================================================
-- 5. RPC SECURITY
-- ============================================================

REVOKE EXECUTE
ON FUNCTION public.claim_emails_for_processing(integer)
FROM PUBLIC;

REVOKE EXECUTE
ON FUNCTION public.claim_emails_for_processing(integer)
FROM authenticated;

REVOKE EXECUTE
ON FUNCTION public.claim_emails_for_processing(integer)
FROM anon;

GRANT EXECUTE
ON FUNCTION public.claim_emails_for_processing(integer)
TO service_role;