-- Migration: add_eligibility_to_events
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS eligibility_rules JSONB DEFAULT '{"is_18_plus": false, "members_only": false}'::jsonb;
