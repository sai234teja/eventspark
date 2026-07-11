-- 1. Add branding fields to organization_settings
ALTER TABLE organization_settings
ADD COLUMN IF NOT EXISTS favicon_url text,
ADD COLUMN IF NOT EXISTS accent_color text,
ADD COLUMN IF NOT EXISTS font_family text DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS border_radius text DEFAULT '0.5rem',
ADD COLUMN IF NOT EXISTS theme_preference text DEFAULT 'system';

-- Add tracking fields for branding updates
ALTER TABLE organization_settings
ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users(id);

-- 2. Create the brand-assets storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-assets', 'brand-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up Storage RLS for brand-assets
-- Allow public access to view assets
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'brand-assets');

-- Allow authenticated members to upload to their organization's folder
-- The folder structure should be: brand-assets/{organizationId}/filename
CREATE POLICY "Members can upload brand assets" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'brand-assets' AND
  auth.uid() IN (
    SELECT user_id 
    FROM organization_members 
    WHERE organization_id::text = (string_to_array(name, '/'))[1]
    AND role IN ('owner', 'admin', 'manager')
  )
);

CREATE POLICY "Members can update brand assets" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'brand-assets' AND
  auth.uid() IN (
    SELECT user_id 
    FROM organization_members 
    WHERE organization_id::text = (string_to_array(name, '/'))[1]
    AND role IN ('owner', 'admin', 'manager')
  )
);

CREATE POLICY "Members can delete brand assets" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'brand-assets' AND
  auth.uid() IN (
    SELECT user_id 
    FROM organization_members 
    WHERE organization_id::text = (string_to_array(name, '/'))[1]
    AND role IN ('owner', 'admin', 'manager')
  )
);
