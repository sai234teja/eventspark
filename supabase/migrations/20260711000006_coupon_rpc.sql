-- Migration: 20260711000006_coupon_rpc.sql
-- Description: RPC for incrementing coupon usage safely.

CREATE OR REPLACE FUNCTION increment_coupon_uses(coupon_code text, org_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.coupons
  SET current_uses = current_uses + 1
  WHERE code = coupon_code AND organization_id = org_id;
END;
$$;
