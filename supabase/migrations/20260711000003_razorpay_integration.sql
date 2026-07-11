-- Migration: 20260711000003_razorpay_integration.sql
-- Description: Add Razorpay tracking fields and webhook idempotency to payments and registrations.

ALTER TABLE public.payments 
  ADD COLUMN IF NOT EXISTS razorpay_order_id text,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id text,
  ADD COLUMN IF NOT EXISTS razorpay_signature text,
  ADD COLUMN IF NOT EXISTS payment_provider text DEFAULT 'razorpay',
  ADD COLUMN IF NOT EXISTS webhook_event_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS webhook_processed_at timestamp with time zone;

-- In case payment_status is missing (if we didn't have it before or want to standardize)
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';

-- Index for idempotency lookups
CREATE INDEX IF NOT EXISTS idx_payments_webhook_event ON public.payments(webhook_event_id);
CREATE INDEX IF NOT EXISTS idx_payments_rzp_order ON public.payments(razorpay_order_id);

ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL;
