-- Migration: 20260818000002_wallet_atomic_rpc.sql
-- Date: 2026-08-18
-- Purpose: HIGH-4 Fix — Create an atomic RPC for wallet credits with idempotency

CREATE OR REPLACE FUNCTION public.credit_wallet_atomic(
    p_user_id uuid,
    p_amount numeric,
    p_provider_reference text
) RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_wallet_id uuid;
    v_new_balance numeric;
BEGIN
    -- 1. Validate inputs
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Credit amount must be greater than zero';
    END IF;

    IF p_provider_reference IS NULL OR p_provider_reference = '' THEN
        RAISE EXCEPTION 'Provider reference is required for idempotency';
    END IF;

    -- 2. Get the user's wallet, create if it doesn't exist
    SELECT id INTO v_wallet_id FROM public.wallets WHERE user_id = p_user_id;
    
    IF v_wallet_id IS NULL THEN
        INSERT INTO public.wallets (user_id, balance) 
        VALUES (p_user_id, 0)
        RETURNING id INTO v_wallet_id;
    END IF;

    -- 3. Idempotent Insert into wallet_transactions
    -- Ensure wallet_transactions has a unique constraint on provider_reference
    -- Note: Since the existing schema might not have it, we handle it logically here,
    -- but ideally there's a unique constraint on provider_reference.
    -- We use an INSERT ... ON CONFLICT (if constraint exists) or rely on it failing.
    -- To ensure true idempotency without throwing an exception, we first check.
    IF EXISTS (
        SELECT 1 FROM public.wallet_transactions 
        WHERE provider_reference = p_provider_reference
    ) THEN
        -- Already processed, just return the current balance
        SELECT balance INTO v_new_balance FROM public.wallets WHERE id = v_wallet_id;
        RETURN v_new_balance;
    END IF;

    -- Insert the transaction
    INSERT INTO public.wallet_transactions (wallet_id, amount, transaction_type, description, provider_reference)
    VALUES (v_wallet_id, p_amount, 'credit', 'Razorpay Wallet Top-up', p_provider_reference);

    -- 4. Atomic Update of the Wallet Balance
    UPDATE public.wallets 
    SET balance = balance + p_amount,
        updated_at = NOW()
    WHERE id = v_wallet_id
    RETURNING balance INTO v_new_balance;

    RETURN v_new_balance;
END;
$$;

-- Revoke public execution
REVOKE EXECUTE ON FUNCTION public.credit_wallet_atomic(uuid, numeric, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.credit_wallet_atomic(uuid, numeric, text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.credit_wallet_atomic(uuid, numeric, text) FROM anon;

-- Ensure provider_reference is UNIQUE for true DB-level idempotency
-- We will add a unique constraint if it doesn't already exist on wallet_transactions
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_wallet_tx_provider_ref'
  ) THEN
    -- Make provider_reference unique to prevent double credits
    -- Note: If there are existing nulls, this might need a partial index.
    -- We assume provider_reference is used for external topups.
    CREATE UNIQUE INDEX uq_wallet_tx_provider_ref ON public.wallet_transactions(provider_reference) WHERE provider_reference IS NOT NULL;
  END IF;
END $$;
