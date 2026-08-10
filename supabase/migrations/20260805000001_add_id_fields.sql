-- Add id_template_url to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS id_template_url text;

-- Add avatar_url to registrations table
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS avatar_url text;

-- Ensure public buckets exist for avatars and templates
insert into storage.buckets (id, name, public) 
values ('user_avatars', 'user_avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) 
values ('id_templates', 'id_templates', true)
on conflict (id) do nothing;

-- Set up basic policies for buckets (allow public read, authenticated insert)
create policy "Public Access avatars"
  on storage.objects for select
  using ( bucket_id = 'user_avatars' );

create policy "Auth Insert avatars"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'user_avatars' );

create policy "Public Access templates"
  on storage.objects for select
  using ( bucket_id = 'id_templates' );

create policy "Auth Insert templates"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'id_templates' );
