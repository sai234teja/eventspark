-- Phase 2 Profile Platform: Storage Buckets
-- Creates storage for Avatars and Cover photos

-- Insert Avatars Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO UPDATE SET 
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Insert Covers Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'covers',
    'covers',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET 
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS Policies for Avatars
-- Allow public viewing
CREATE POLICY "Avatar Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own avatar
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own avatar
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policies for Covers
-- Allow public viewing
CREATE POLICY "Cover Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'covers');

-- Allow authenticated users to upload their own cover
CREATE POLICY "Users can upload their own cover" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'covers' AND 
    auth.role() = 'authenticated' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own cover
CREATE POLICY "Users can update their own cover" ON storage.objects FOR UPDATE USING (
    bucket_id = 'covers' AND 
    auth.role() = 'authenticated' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own cover
CREATE POLICY "Users can delete their own cover" ON storage.objects FOR DELETE USING (
    bucket_id = 'covers' AND 
    auth.role() = 'authenticated' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);
