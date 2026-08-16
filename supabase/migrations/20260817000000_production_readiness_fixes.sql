-- 20260817000000_production_readiness_fixes.sql
-- Production readiness / RLS and financial data retention fixes


-- ============================================================
-- 1. RLS FIXES FOR EVENTS AND RELATED ENTITIES
-- ============================================================

-- Remove insecure authenticated write policies.
DROP POLICY IF EXISTS "Authenticated write access for events"
ON public.events;

DROP POLICY IF EXISTS "Authenticated write access for event_images"
ON public.event_images;

DROP POLICY IF EXISTS "Authenticated write access for event_categories"
ON public.event_categories;

DROP POLICY IF EXISTS "Authenticated write access for ticket_types"
ON public.ticket_types;

DROP POLICY IF EXISTS "Authenticated write access for venues"
ON public.venues;


-- ============================================================
-- EVENTS
-- ============================================================

CREATE POLICY "Organizers can write events"
ON public.events
FOR ALL
TO authenticated
USING (
  public.is_member_of(organizer_id)
)
WITH CHECK (
  public.is_member_of(organizer_id)
);


-- ============================================================
-- EVENT IMAGES
--
-- event_images.event_id -> events.id
-- ============================================================

CREATE POLICY "Organizers can write event_images"
ON public.event_images
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.events
    WHERE events.id = event_images.event_id
      AND public.is_member_of(events.organizer_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.events
    WHERE events.id = event_images.event_id
      AND public.is_member_of(events.organizer_id)
  )
);


-- ============================================================
-- EVENT CATEGORIES
--
-- IMPORTANT:
-- event_categories is a GLOBAL lookup table.
-- It does NOT contain event_id.
--
-- Therefore only admins can modify categories.
-- ============================================================

CREATE POLICY "Only admins can write event_categories"
ON public.event_categories
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::public.user_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::public.user_role
  )
);

-- ============================================================
-- TICKET TYPES
--
-- ticket_types.event_id -> events.id
-- ============================================================

CREATE POLICY "Organizers can write ticket_types"
ON public.ticket_types
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.events
    WHERE events.id = ticket_types.event_id
      AND public.is_member_of(events.organizer_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.events
    WHERE events.id = ticket_types.event_id
      AND public.is_member_of(events.organizer_id)
  )
);


-- ============================================================
-- VENUES
--
-- Production schema does NOT have organization_id.
-- Therefore only admins can modify venues.
-- ============================================================

CREATE POLICY "Only admins can write venues"
ON public.venues
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::public.user_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::public.user_role
  )
);


-- ============================================================
-- 2. FINANCIAL DATA RETENTION
-- ============================================================

DO $$
DECLARE
  r RECORD;
BEGIN

  -- ----------------------------------------------------------
  -- invoices.user_id
  -- ----------------------------------------------------------

  FOR r IN (
    SELECT tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'invoices'
      AND kcu.column_name = 'user_id'
      AND tc.constraint_type = 'FOREIGN KEY'
  ) LOOP
    EXECUTE format(
      'ALTER TABLE public.invoices DROP CONSTRAINT %I',
      r.constraint_name
    );
  END LOOP;

  ALTER TABLE public.invoices
    ALTER COLUMN user_id DROP NOT NULL;

  ALTER TABLE public.invoices
    ADD CONSTRAINT invoices_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE SET NULL;


  -- ----------------------------------------------------------
  -- invoices.organization_id
  -- ----------------------------------------------------------

  FOR r IN (
    SELECT tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'invoices'
      AND kcu.column_name = 'organization_id'
      AND tc.constraint_type = 'FOREIGN KEY'
  ) LOOP
    EXECUTE format(
      'ALTER TABLE public.invoices DROP CONSTRAINT %I',
      r.constraint_name
    );
  END LOOP;

  ALTER TABLE public.invoices
    ALTER COLUMN organization_id DROP NOT NULL;

  ALTER TABLE public.invoices
    ADD CONSTRAINT invoices_organization_id_fkey
    FOREIGN KEY (organization_id)
    REFERENCES public.organizations(id)
    ON DELETE SET NULL;


  -- ----------------------------------------------------------
  -- refunds.user_id
  -- ----------------------------------------------------------

  FOR r IN (
    SELECT tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'refunds'
      AND kcu.column_name = 'user_id'
      AND tc.constraint_type = 'FOREIGN KEY'
  ) LOOP
    EXECUTE format(
      'ALTER TABLE public.refunds DROP CONSTRAINT %I',
      r.constraint_name
    );
  END LOOP;

  ALTER TABLE public.refunds
    ALTER COLUMN user_id DROP NOT NULL;

  ALTER TABLE public.refunds
    ADD CONSTRAINT refunds_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE SET NULL;


  -- ----------------------------------------------------------
  -- bulk_registrations.purchaser_id
  -- ----------------------------------------------------------

  FOR r IN (
    SELECT tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'bulk_registrations'
      AND kcu.column_name = 'purchaser_id'
      AND tc.constraint_type = 'FOREIGN KEY'
  ) LOOP
    EXECUTE format(
      'ALTER TABLE public.bulk_registrations DROP CONSTRAINT %I',
      r.constraint_name
    );
  END LOOP;

  ALTER TABLE public.bulk_registrations
    ALTER COLUMN purchaser_id DROP NOT NULL;

  ALTER TABLE public.bulk_registrations
    ADD CONSTRAINT bulk_registrations_purchaser_id_fkey
    FOREIGN KEY (purchaser_id)
    REFERENCES auth.users(id)
    ON DELETE SET NULL;

END $$;