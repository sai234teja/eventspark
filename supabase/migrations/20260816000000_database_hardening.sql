-- 1. FIX FINANCIAL DATA CASCADE (ON DELETE SET NULL)
-- Drop NOT NULL constraints and alter FKs dynamically to handle unknown constraint names.

DO $$
DECLARE
    r RECORD;
BEGIN
    -- 1a. registrations.user_id
    ALTER TABLE public.registrations ALTER COLUMN user_id DROP NOT NULL;
    FOR r IN (
        SELECT constraint_name 
        FROM information_schema.key_column_usage 
        WHERE table_name = 'registrations' AND column_name = 'user_id'
        AND constraint_schema = 'public'
    ) LOOP
        EXECUTE 'ALTER TABLE public.registrations DROP CONSTRAINT ' || r.constraint_name;
    END LOOP;
    ALTER TABLE public.registrations ADD CONSTRAINT registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

    -- 1b. payments.user_id
    ALTER TABLE public.payments ALTER COLUMN user_id DROP NOT NULL;
    FOR r IN (
        SELECT constraint_name 
        FROM information_schema.key_column_usage 
        WHERE table_name = 'payments' AND column_name = 'user_id'
        AND constraint_schema = 'public'
    ) LOOP
        EXECUTE 'ALTER TABLE public.payments DROP CONSTRAINT ' || r.constraint_name;
    END LOOP;
    ALTER TABLE public.payments ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

    -- 1c. wallets.user_id
    ALTER TABLE public.wallets ALTER COLUMN user_id DROP NOT NULL;
    FOR r IN (
        SELECT constraint_name 
        FROM information_schema.key_column_usage 
        WHERE table_name = 'wallets' AND column_name = 'user_id'
        AND constraint_schema = 'public'
    ) LOOP
        EXECUTE 'ALTER TABLE public.wallets DROP CONSTRAINT ' || r.constraint_name;
    END LOOP;
    ALTER TABLE public.wallets ADD CONSTRAINT wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
END $$;


-- 2. ATOMIC TICKET INVENTORY ALLOCATION (RPC)
CREATE OR REPLACE FUNCTION public.increment_quantity_sold(
  p_ticket_type_id UUID,
  p_quantity INTEGER
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ticket_type record;
BEGIN
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be greater than 0';
  END IF;

  -- Lock row to prevent concurrent modifications
  SELECT * INTO v_ticket_type
  FROM public.ticket_types
  WHERE id = p_ticket_type_id
  FOR UPDATE;

  IF v_ticket_type IS NULL THEN
    RAISE EXCEPTION 'Ticket type not found';
  END IF;

  -- Prevent overselling
  IF (v_ticket_type.quantity_total - COALESCE(v_ticket_type.quantity_sold, 0)) < p_quantity THEN
    RAISE EXCEPTION 'Insufficient ticket inventory';
  END IF;

  -- Atomic increment
  UPDATE public.ticket_types
  SET quantity_sold = COALESCE(quantity_sold, 0) + p_quantity
  WHERE id = p_ticket_type_id;

  RETURN jsonb_build_object(
    'success', true,
    'ticket_type_id', p_ticket_type_id,
    'quantity_allocated', p_quantity
  );
END;
$$;

-- 3. RPC SECURITY
REVOKE EXECUTE ON FUNCTION public.increment_quantity_sold(UUID, INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_quantity_sold(UUID, INTEGER) FROM anon;
REVOKE EXECUTE ON FUNCTION public.increment_quantity_sold(UUID, INTEGER) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.increment_quantity_sold(UUID, INTEGER) TO service_role;
