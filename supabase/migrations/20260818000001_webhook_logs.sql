-- Migration: 20260818000001_webhook_logs.sql
-- Date: 2026-08-18
-- Purpose: HIGH-1 Fix — Create a dedicated webhook_logs table for system-level
--          payment webhook events that are not scoped to any organization.
--
-- PROBLEM (HIGH-1 from Phase 3 Audit):
--   The Razorpay webhook handler inserts into audit_logs without providing
--   organization_id, which is NOT NULL. This causes a constraint violation,
--   silently crashing the audit log insert, which breaks webhook idempotency.
--   The webhook then re-fires on every retry from Razorpay.
--
-- FIX:
--   Create a dedicated webhook_logs table that:
--   1. Has no organization_id (system-level, not org-scoped)
--   2. Stores the Razorpay event ID as TEXT (not UUID) for idempotency lookup
--   3. Has full RLS — only service_role can insert/read (no user access)
--
-- The webhook handler will be updated to use this table instead of audit_logs.

CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'razorpay',
  event_id TEXT NOT NULL,                       -- Razorpay event ID (TEXT, not UUID)
  event_type TEXT NOT NULL,                     -- e.g. 'payment.captured'
  payload jsonb,                                -- Full event payload for debugging
  processed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(provider, event_id)                    -- Idempotency constraint
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_id ON public.webhook_logs(provider, event_id);

-- RLS: No user should be able to read or write webhook logs
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
-- No SELECT/INSERT/UPDATE/DELETE policies for anon or authenticated roles.
-- Only service_role (bypasses RLS) can access this table.
