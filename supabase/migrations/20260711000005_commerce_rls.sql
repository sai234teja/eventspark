-- Migration: 20260711000005_commerce_rls.sql
-- Description: Enable RLS and define policies for commerce tables

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_tiers ENABLE ROW LEVEL SECURITY;

---------------------------------------------------------
-- Coupons
---------------------------------------------------------
CREATE POLICY "Users can view active coupons for their organization"
  ON public.coupons FOR SELECT
  USING (
    is_active = true OR public.is_member_of(organization_id)
  );

CREATE POLICY "Org members with MANAGE_SETTINGS can manage coupons"
  ON public.coupons FOR ALL
  USING (
    public.is_member_of(organization_id) AND public.has_role_in_org(organization_id, 'manager')
  );

---------------------------------------------------------
-- Refunds
---------------------------------------------------------
CREATE POLICY "Users can view their own refunds"
  ON public.refunds FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.payments
      WHERE payments.id = refunds.payment_id
      AND payments.user_id = auth.uid()
    ) OR public.is_member_of(organization_id)
  );

CREATE POLICY "Org members can process refunds"
  ON public.refunds FOR INSERT
  WITH CHECK (
    public.is_member_of(organization_id) AND public.has_role_in_org(organization_id, 'manager')
  );

CREATE POLICY "Org members can update refunds"
  ON public.refunds FOR UPDATE
  USING (
    public.is_member_of(organization_id) AND public.has_role_in_org(organization_id, 'manager')
  );

---------------------------------------------------------
-- Wallets
---------------------------------------------------------
CREATE POLICY "Users can view their own wallet"
  ON public.wallets FOR SELECT
  USING (user_id = auth.uid());

-- Only system/service role can insert/update wallets (so no INSERT/UPDATE policies for standard users)

---------------------------------------------------------
-- Wallet Transactions
---------------------------------------------------------
CREATE POLICY "Users can view their own wallet transactions"
  ON public.wallet_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.wallets
      WHERE wallets.id = wallet_transactions.wallet_id
      AND wallets.user_id = auth.uid()
    )
  );

---------------------------------------------------------
-- Affiliates
---------------------------------------------------------
CREATE POLICY "Users can view their own affiliate profile"
  ON public.affiliates FOR SELECT
  USING (
    user_id = auth.uid() OR public.is_member_of(organization_id)
  );

CREATE POLICY "Org members can manage affiliates"
  ON public.affiliates FOR ALL
  USING (
    public.is_member_of(organization_id) AND public.has_role_in_org(organization_id, 'manager')
  );

---------------------------------------------------------
-- Affiliate Conversions
---------------------------------------------------------
CREATE POLICY "Affiliates can view their own conversions"
  ON public.affiliate_conversions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.affiliates
      WHERE affiliates.id = affiliate_conversions.affiliate_id
      AND affiliates.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.registrations
      WHERE registrations.id = affiliate_conversions.registration_id
      AND public.is_member_of(registrations.organization_id)
    )
  );

---------------------------------------------------------
-- Ticket Tiers
---------------------------------------------------------
CREATE POLICY "Anyone can view active ticket tiers"
  ON public.ticket_tiers FOR SELECT
  USING (
    is_active = true OR EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = ticket_tiers.event_id
      AND public.is_member_of(events.organization_id)
    )
  );

CREATE POLICY "Org members can manage ticket tiers"
  ON public.ticket_tiers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = ticket_tiers.event_id
      AND public.is_member_of(events.organization_id)
    )
  );
