-- Migration: 20260708000003_data_migration.sql
-- Description: Create a default organization for existing users and migrate their data to prevent loss of access after RLS is enabled.

DO $$
DECLARE
    default_org_id uuid;
    user_record record;
BEGIN
    -- 1. Create a Default Organization if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM public.organizations WHERE slug = 'default-organization') THEN
        INSERT INTO public.organizations (name, slug, created_by)
        VALUES ('Default Organization', 'default-organization', NULL)
        RETURNING id INTO default_org_id;

        -- Create settings for the default organization
        INSERT INTO public.organization_settings (organization_id)
        VALUES (default_org_id);
    ELSE
        SELECT id INTO default_org_id FROM public.organizations WHERE slug = 'default-organization';
    END IF;

    -- 2. Add all existing profiles to this Default Organization as 'owner'
    FOR user_record IN SELECT id FROM public.profiles LOOP
        INSERT INTO public.organization_members (organization_id, user_id, role)
        VALUES (default_org_id, user_record.id, 'owner')
        ON CONFLICT (organization_id, user_id) DO NOTHING;
    END LOOP;

    -- 3. Assign all existing events to the Default Organization
    UPDATE public.events 
    SET organization_id = default_org_id 
    WHERE organization_id IS NULL;

    -- 4. Assign all existing registrations to the Default Organization
    UPDATE public.registrations 
    SET organization_id = default_org_id 
    WHERE organization_id IS NULL;

    -- 5. Assign all existing payments to the Default Organization
    UPDATE public.payments 
    SET organization_id = default_org_id 
    WHERE organization_id IS NULL;

END $$;
