-- Phase 2 Profile Platform: Relational Database Schema
-- Enhances the profiles system with professional, educational, and preferences data

-- Add new columns to existing profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS headline TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;

-- 1. User Skills
CREATE TABLE IF NOT EXISTS user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    endorsement_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, skill_name)
);

-- 2. User Education
CREATE TABLE IF NOT EXISTS user_education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    institution TEXT NOT NULL,
    degree TEXT,
    field_of_study TEXT,
    start_date DATE,
    end_date DATE,
    current BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 3. User Experience
CREATE TABLE IF NOT EXISTS user_experience (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    location TEXT,
    start_date DATE,
    end_date DATE,
    current BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 4. User Social Links
CREATE TABLE IF NOT EXISTS user_social_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL, -- e.g. 'github', 'linkedin', 'twitter'
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, platform)
);

-- 5. User Badges & Certificates
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_name TEXT NOT NULL,
    badge_type TEXT,
    issued_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS user_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    certificate_name TEXT NOT NULL,
    issuing_organization TEXT NOT NULL,
    issue_date DATE,
    expiration_date DATE,
    credential_id TEXT,
    credential_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 6. User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Notifications
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    push_notifications BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT false,
    reminder_frequency TEXT DEFAULT '1h',
    
    -- Appearance & Locale
    theme TEXT DEFAULT 'system',
    language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    currency TEXT DEFAULT 'USD',
    date_format TEXT DEFAULT 'MM/DD/YYYY',
    time_format TEXT DEFAULT '12h',
    
    -- Privacy
    public_profile BOOLEAN DEFAULT true,
    hide_email BOOLEAN DEFAULT true,
    hide_phone BOOLEAN DEFAULT true,
    hide_social_links BOOLEAN DEFAULT false,
    hide_activity BOOLEAN DEFAULT false,
    allow_organizer_messages BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_education_user_id ON user_education(user_id);
CREATE INDEX IF NOT EXISTS idx_user_experience_user_id ON user_experience(user_id);
CREATE INDEX IF NOT EXISTS idx_user_social_links_user_id ON user_social_links(user_id);

-- RLS setup
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Generic RLS policies (Users can manage their own data, public profiles viewable by all)
-- Profiles
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Skills
CREATE POLICY "Public skills are viewable." ON user_skills FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Users manage own skills." ON user_skills FOR ALL USING (auth.uid() = user_id);

-- Education
CREATE POLICY "Public education viewable." ON user_education FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Users manage own education." ON user_education FOR ALL USING (auth.uid() = user_id);

-- Experience
CREATE POLICY "Public experience viewable." ON user_experience FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Users manage own experience." ON user_experience FOR ALL USING (auth.uid() = user_id);

-- Social Links
CREATE POLICY "Public social links viewable." ON user_social_links FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Users manage own social links." ON user_social_links FOR ALL USING (auth.uid() = user_id);

-- Badges
CREATE POLICY "Public badges viewable." ON user_badges FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Users manage own badges." ON user_badges FOR ALL USING (auth.uid() = user_id);

-- Certificates
CREATE POLICY "Public certificates viewable." ON user_certificates FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Users manage own certificates." ON user_certificates FOR ALL USING (auth.uid() = user_id);

-- Preferences (Strictly Private)
CREATE POLICY "Users view own preferences." ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own preferences." ON user_preferences FOR ALL USING (auth.uid() = user_id);
