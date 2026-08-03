-- Migration: 20260711000004_commerce_expansion.sql
-- Description: Core Commerce expansion for coupons, refunds, wallets, affiliates, and multi-tier ticketing.

---------------------------------------------------------
-- 1. Coupons & Discounts
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  code text NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL,
  max_uses integer,
  current_uses integer DEFAULT 0,
  valid_from timestamp with time zone DEFAULT now(),
  valid_until timestamp with time zone,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(organization_id, code)
);

---------------------------------------------------------
-- 2. Refunds
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.refunds (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  payment_id uuid REFERENCES public.payments(id) ON DELETE CASCADE NOT NULL,
  razorpay_refund_id text UNIQUE,
  amount numeric NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  processed_at timestamp with time zone
);

---------------------------------------------------------
-- 3. Wallets
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wallets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  balance numeric DEFAULT 0.00 NOT NULL,
  currency text DEFAULT 'INR',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id uuid REFERENCES public.wallets(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
  description text,
  reference_id uuid, -- e.g., payment_id or refund_id
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

---------------------------------------------------------
-- 4. Affiliates & Referrals
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.affiliates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  referral_code text UNIQUE NOT NULL,
  commission_rate numeric DEFAULT 0.00,
  total_earnings numeric DEFAULT 0.00,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.affiliate_conversions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id uuid REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
  registration_id uuid REFERENCES public.registrations(id) ON DELETE CASCADE NOT NULL,
  commission_amount numeric NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

---------------------------------------------------------
-- 5. Multi-Tier Ticketing
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ticket_tiers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL, -- e.g., 'VIP', 'Early Bird', 'General Admission'
  price numeric NOT NULL,
  capacity integer,
  sold_count integer DEFAULT 0,
  sales_start timestamp with time zone,
  sales_end timestamp with time zone,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS tier_id uuid REFERENCES public.ticket_tiers(id) ON DELETE SET NULL;

---------------------------------------------------------
-- Indexes for Performance
---------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_coupons_org_code ON public.coupons(organization_id, code);
CREATE INDEX IF NOT EXISTS idx_refunds_payment ON public.refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet ON public.wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON public.affiliates(referral_code);
CREATE INDEX IF NOT EXISTS idx_ticket_tiers_event ON public.ticket_tiers(event_id);
