-- Migration: Fix profiles trigger and enable RLS on core tables
-- Date: 2026-08-02

-- 1. Create Trigger for automatic Profile creation on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'avatar_url', 
    COALESCE(NEW.raw_user_meta_data->>'role', 'user') -- Use role from metadata if provided
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to prevent errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Enable RLS and add basic policies for specified tables

-- event_tags
ALTER TABLE public.event_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for event_tags" ON public.event_tags;
CREATE POLICY "Public read access for event_tags" ON public.event_tags FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated write access for event_tags" ON public.event_tags;
CREATE POLICY "Authenticated write access for event_tags" ON public.event_tags FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- venues
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for venues" ON public.venues;
CREATE POLICY "Public read access for venues" ON public.venues FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated write access for venues" ON public.venues;
CREATE POLICY "Authenticated write access for venues" ON public.venues FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- event_categories
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for event_categories" ON public.event_categories;
CREATE POLICY "Public read access for event_categories" ON public.event_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated write access for event_categories" ON public.event_categories;
CREATE POLICY "Authenticated write access for event_categories" ON public.event_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- event_images
ALTER TABLE public.event_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for event_images" ON public.event_images;
CREATE POLICY "Public read access for event_images" ON public.event_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated write access for event_images" ON public.event_images;
CREATE POLICY "Authenticated write access for event_images" ON public.event_images FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ticket_types
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for ticket_types" ON public.ticket_types;
CREATE POLICY "Public read access for ticket_types" ON public.ticket_types FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated write access for ticket_types" ON public.ticket_types;
CREATE POLICY "Authenticated write access for ticket_types" ON public.ticket_types FOR ALL TO authenticated USING (true) WITH CHECK (true);
