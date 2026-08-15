-- 20260817000000_production_readiness_fixes.sql

-- 1. RLS FIXES FOR EVENTS AND RELATED ENTITIES
-- Drop insecure "USING (true)" policies
DROP POLICY IF EXISTS "Authenticated write access for events" ON public.events;
DROP POLICY IF EXISTS "Authenticated write access for event_images" ON public.event_images;
DROP POLICY IF EXISTS "Authenticated write access for event_categories" ON public.event_categories;
DROP POLICY IF EXISTS "Authenticated write access for ticket_types" ON public.ticket_types;
DROP POLICY IF EXISTS "Authenticated write access for venues" ON public.venues;

-- Secure events
CREATE POLICY "Organizers can write events" ON public.events 
FOR ALL TO authenticated 
USING (
  public.is_member_of(organizer_id)
) WITH CHECK (
  public.is_member_of(organizer_id)
);

-- Secure event_images
CREATE POLICY "Organizers can write event_images" ON public.event_images
FOR ALL TO authenticated 
USING (
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND public.is_member_of(organizer_id))
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND public.is_member_of(organizer_id))
);

-- Secure event_categories
CREATE POLICY "Organizers can write event_categories" ON public.event_categories
FOR ALL TO authenticated 
USING (
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND public.is_member_of(organizer_id))
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND public.is_member_of(organizer_id))
);

-- Secure ticket_types
CREATE POLICY "Organizers can write ticket_types" ON public.ticket_types
FOR ALL TO authenticated 
USING (
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND public.is_member_of(organizer_id))
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND public.is_member_of(organizer_id))
);

-- Secure venues
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venues' AND column_name = 'organization_id') THEN
    EXECUTE '
      CREATE POLICY "Organizers can write venues" ON public.venues
      FOR ALL TO authenticated 
      USING (public.is_member_of(organization_id)) 
      WITH CHECK (public.is_member_of(organization_id));
    ';
  ELSE
    EXECUTE '
      CREATE POLICY "Only admins can write venues" ON public.venues
      FOR ALL TO authenticated 
      USING (public.is_admin()) 
      WITH CHECK (public.is_admin());
    ';
  END IF;
END $$;


-- 2. FINANCIAL DATA RETENTION (Cascades)
DO $$
DECLARE
  r RECORD;
BEGIN
  -- invoices.user_id
  FOR r IN (
    SELECT tc.constraint_name 
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'invoices' AND kcu.column_name = 'user_id' AND tc.constraint_type = 'FOREIGN KEY'
  ) LOOP
    EXECUTE format('ALTER TABLE invoices DROP CONSTRAINT %I', r.constraint_name);
  END LOOP;
  ALTER TABLE invoices ALTER COLUMN user_id DROP NOT NULL;
  ALTER TABLE invoices ADD CONSTRAINT invoices_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

  -- invoices.organization_id
  FOR r IN (
    SELECT tc.constraint_name 
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'invoices' AND kcu.column_name = 'organization_id' AND tc.constraint_type = 'FOREIGN KEY'
  ) LOOP
    EXECUTE format('ALTER TABLE invoices DROP CONSTRAINT %I', r.constraint_name);
  END LOOP;
  ALTER TABLE invoices ALTER COLUMN organization_id DROP NOT NULL;
  ALTER TABLE invoices ADD CONSTRAINT invoices_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;

  -- refunds.user_id
  FOR r IN (
    SELECT tc.constraint_name 
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'refunds' AND kcu.column_name = 'user_id' AND tc.constraint_type = 'FOREIGN KEY'
  ) LOOP
    EXECUTE format('ALTER TABLE refunds DROP CONSTRAINT %I', r.constraint_name);
  END LOOP;
  ALTER TABLE refunds ALTER COLUMN user_id DROP NOT NULL;
  ALTER TABLE refunds ADD CONSTRAINT refunds_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

  -- bulk_registrations.purchaser_id
  FOR r IN (
    SELECT tc.constraint_name 
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'bulk_registrations' AND kcu.column_name = 'purchaser_id' AND tc.constraint_type = 'FOREIGN KEY'
  ) LOOP
    EXECUTE format('ALTER TABLE bulk_registrations DROP CONSTRAINT %I', r.constraint_name);
  END LOOP;
  ALTER TABLE bulk_registrations ALTER COLUMN purchaser_id DROP NOT NULL;
  ALTER TABLE bulk_registrations ADD CONSTRAINT bulk_registrations_purchaser_id_fkey FOREIGN KEY (purchaser_id) REFERENCES auth.users(id) ON DELETE SET NULL;

END $$;
