-- Migration: 20260711000008_waitlist_rpc.sql
-- Description: Waitlist Auto Promotion RPC

CREATE OR REPLACE FUNCTION public.promote_next_waitlist_user(
  p_event_id uuid,
  p_tier_id uuid,
  p_reservation_timeout_minutes integer DEFAULT 30
) RETURNS uuid AS $$
DECLARE
  v_waitlist_id uuid;
  v_user_id uuid;
BEGIN
  -- Find the next waiting user
  SELECT id, user_id INTO v_waitlist_id, v_user_id
  FROM public.waitlist_entries
  WHERE event_id = p_event_id
    AND (tier_id = p_tier_id OR p_tier_id IS NULL)
    AND status = 'waiting'
    AND deleted_at IS NULL
  ORDER BY position ASC
  FOR UPDATE SKIP LOCKED
  LIMIT 1;

  -- If a user is found, promote them
  IF v_waitlist_id IS NOT NULL THEN
    UPDATE public.waitlist_entries
    SET status = 'promoted',
        promoted_at = now(),
        reservation_expires_at = now() + (p_reservation_timeout_minutes || ' minutes')::interval,
        updated_at = now()
    WHERE id = v_waitlist_id;
    
    RETURN v_user_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
