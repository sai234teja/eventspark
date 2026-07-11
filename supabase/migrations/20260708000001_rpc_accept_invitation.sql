-- Function to securely accept an invitation in a single transaction
CREATE OR REPLACE FUNCTION accept_invitation(token_val text, user_id_val uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_invite RECORD;
BEGIN
    -- 1. Get and lock the invite to prevent race conditions
    SELECT * INTO v_invite
    FROM organization_invites
    WHERE token = token_val
    FOR UPDATE;

    IF v_invite IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired invitation';
    END IF;

    IF v_invite.expires_at < NOW() THEN
        RAISE EXCEPTION 'Invitation has expired';
    END IF;

    -- 2. Add user to organization_members
    INSERT INTO organization_members (organization_id, user_id, role)
    VALUES (v_invite.organization_id, user_id_val, v_invite.role)
    ON CONFLICT (organization_id, user_id) DO UPDATE SET role = EXCLUDED.role;

    -- 3. Delete the invite so it can't be reused
    DELETE FROM organization_invites WHERE id = v_invite.id;
    
END;
$$;
