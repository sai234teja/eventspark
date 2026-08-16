-- Migration: 20260818000002_wallet_atomic_rpc.sql
-- Purpose: Atomic wallet credits with database-level idempotency

-- ============================================================
-- 1. Add provider_reference for external payment/top-up IDs
-- ============================================================

ALTER TABLE public.wallet_transactions
ADD COLUMN IF NOT EXISTS provider_reference TEXT;

-- Prevent duplicate external payment references.
-- NULL values are allowed for existing/internal transactions.
CREATE UNIQUE INDEX IF NOT EXISTS uq_wallet_tx_provider_ref
ON public.wallet_transactions(provider_reference)
WHERE provider_reference IS NOT NULL;


-- ============================================================
-- 2. Prevent multiple wallets for the same user
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS uq_wallets_user_id
ON public.wallets(user_id)
WHERE user_id IS NOT NULL;


-- ============================================================
-- 3. Atomic wallet credit RPC
-- ============================================================

CREATE OR REPLACE FUNCTION public.credit_wallet_atomic(
    p_user_id UUID,
    p_amount NUMERIC,
    p_provider_reference TEXT
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_wallet_id UUID;
    v_new_balance NUMERIC;
BEGIN
    -- --------------------------------------------------------
    -- Validate inputs
    -- --------------------------------------------------------

    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'User ID is required';
    END IF;

    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE EXCEPTION 'Credit amount must be greater than zero';
    END IF;

    IF p_provider_reference IS NULL
       OR trim(p_provider_reference) = '' THEN
        RAISE EXCEPTION 'Provider reference is required for idempotency';
    END IF;


    -- --------------------------------------------------------
    -- Get existing wallet.
    --
    -- If it does not exist, create it.
    -- The unique index on wallets.user_id prevents
    -- concurrent requests from creating two wallets.
    -- --------------------------------------------------------

    SELECT id
    INTO v_wallet_id
    FROM public.wallets
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF v_wallet_id IS NULL THEN

        BEGIN
            INSERT INTO public.wallets (
                user_id,
                balance
            )
            VALUES (
                p_user_id,
                0
            )
            RETURNING id INTO v_wallet_id;

        EXCEPTION
            WHEN unique_violation THEN
                -- Another concurrent transaction created
                -- the wallet first.
                SELECT id
                INTO v_wallet_id
                FROM public.wallets
                WHERE user_id = p_user_id
                FOR UPDATE;
        END;

    END IF;


    -- --------------------------------------------------------
    -- Idempotency check
    --
    -- If this provider reference was already processed,
    -- DO NOT credit the wallet again.
    -- --------------------------------------------------------

    IF EXISTS (
        SELECT 1
        FROM public.wallet_transactions
        WHERE provider_reference = p_provider_reference
    ) THEN

        SELECT balance
        INTO v_new_balance
        FROM public.wallets
        WHERE id = v_wallet_id
        FOR UPDATE;

        RETURN v_new_balance;

    END IF;


    -- --------------------------------------------------------
    -- Record the transaction
    -- --------------------------------------------------------

    INSERT INTO public.wallet_transactions (
        wallet_id,
        amount,
        transaction_type,
        description,
        provider_reference
    )
    VALUES (
        v_wallet_id,
        p_amount,
        'credit',
        'Razorpay Wallet Top-up',
        p_provider_reference
    );


    -- --------------------------------------------------------
    -- Atomic balance update
    -- --------------------------------------------------------

    UPDATE public.wallets
    SET
        balance = COALESCE(balance, 0) + p_amount,
        updated_at = NOW()
    WHERE id = v_wallet_id
    RETURNING balance INTO v_new_balance;


    RETURN v_new_balance;

END;
$$;


-- ============================================================
-- 4. Restrict RPC execution
-- ============================================================

REVOKE EXECUTE
ON FUNCTION public.credit_wallet_atomic(UUID, NUMERIC, TEXT)
FROM PUBLIC;

REVOKE EXECUTE
ON FUNCTION public.credit_wallet_atomic(UUID, NUMERIC, TEXT)
FROM anon;

REVOKE EXECUTE
ON FUNCTION public.credit_wallet_atomic(UUID, NUMERIC, TEXT)
FROM authenticated;

GRANT EXECUTE
ON FUNCTION public.credit_wallet_atomic(UUID, NUMERIC, TEXT)
TO service_role;