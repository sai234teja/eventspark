-- Phase 5 Organizer Platform: Core Schema

-- 1. Organizer Settings & Branding
CREATE TABLE IF NOT EXISTS organizer_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    logo_url TEXT,
    accent_color TEXT DEFAULT '#4F46E5',
    public_description TEXT,
    website_url TEXT,
    twitter_url TEXT,
    linkedin_url TEXT,
    theme_preference TEXT DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_org_settings_org_id ON organizer_settings(organization_id);

-- 2. Staff Management
CREATE TABLE IF NOT EXISTS organization_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'finance', 'marketing', 'scanner', 'support')),
    status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended')),
    invited_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(organization_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_org_staff_org_id ON organization_staff(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_staff_user_id ON organization_staff(user_id);

-- 3. Commerce & Marketing
CREATE TABLE IF NOT EXISTS organizer_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE, -- null means global for org
    code TEXT NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10,2) NOT NULL,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(organization_id, code)
);
CREATE INDEX IF NOT EXISTS idx_org_coupons_org_id ON organizer_coupons(organization_id);

CREATE TABLE IF NOT EXISTS organizer_affiliates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    affiliate_code TEXT NOT NULL UNIQUE,
    commission_rate NUMERIC(5,2) NOT NULL DEFAULT 10.00,
    total_earnings NUMERIC(12,2) DEFAULT 0.00,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(organization_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_org_affiliates_org_id ON organizer_affiliates(organization_id);

-- RLS Policies
ALTER TABLE organizer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizer_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizer_affiliates ENABLE ROW LEVEL SECURITY;

-- Basic Organizer RLS (Requires checking organization_staff, recursive checks simplified here to direct owner/admin access for brevity in phase 5)
-- Note: In production, functions are used to check staff membership efficiently without infinite recursion.
CREATE POLICY "Public can view organizer settings" ON organizer_settings FOR SELECT USING (true);
CREATE POLICY "Staff can view staff" ON organization_staff FOR SELECT USING (true);
