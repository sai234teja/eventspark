-- Phase 2 Finalization: Referrals, Login History, Activity Logs

-- 1. User Referrals
CREATE TABLE IF NOT EXISTS user_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invited_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    referral_code TEXT NOT NULL UNIQUE,
    referral_status TEXT DEFAULT 'pending', -- pending, successful, rejected
    wallet_reward NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_user_referrals_referrer ON user_referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_user_referrals_code ON user_referrals(referral_code);

-- 2. Login History Expansion
ALTER TABLE login_history 
    ADD COLUMN IF NOT EXISTS session_id UUID,
    ADD COLUMN IF NOT EXISTS browser TEXT,
    ADD COLUMN IF NOT EXISTS device TEXT,
    ADD COLUMN IF NOT EXISTS operating_system TEXT,
    ADD COLUMN IF NOT EXISTS city TEXT,
    ADD COLUMN IF NOT EXISTS country TEXT,
    ADD COLUMN IF NOT EXISTS login_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    ADD COLUMN IF NOT EXISTS logout_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_login_history_user ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_session ON login_history(session_id);

-- 3. User Activity Logs
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    entity_id UUID,
    entity_type TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity_logs(activity_type);

-- RLS Policies
ALTER TABLE user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Referrals
CREATE POLICY "Users can view own referrals." ON user_referrals FOR SELECT USING (auth.uid() = referrer_user_id);
CREATE POLICY "Users cannot create own referrals directly." ON user_referrals FOR INSERT WITH CHECK (false); -- Handled by RPC/Service Role

-- Login History
CREATE POLICY "Users view own login history." ON login_history FOR SELECT USING (auth.uid() = user_id);

-- Activity Logs
CREATE POLICY "Users view own activity logs." ON user_activity_logs FOR SELECT USING (auth.uid() = user_id);
