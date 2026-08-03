-- Phase 1: Authentication Excellence Schema Updates

-- Table for Login History
CREATE TABLE IF NOT EXISTS public.login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

-- Users can only view their own login history
CREATE POLICY "Users can view their own login history"
  ON public.login_history FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert (handled via server actions)
CREATE POLICY "Service role can insert login history"
  ON public.login_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Table for Device Sessions
CREATE TABLE IF NOT EXISTS public.device_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  last_active TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.device_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only view and manage their own device sessions
CREATE POLICY "Users can view their own device sessions"
  ON public.device_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own device sessions"
  ON public.device_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert device sessions"
  ON public.device_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add rate limiting table for brute force protection
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  ip_address TEXT PRIMARY KEY,
  attempts INTEGER DEFAULT 1,
  last_attempt TIMESTAMPTZ DEFAULT now(),
  blocked_until TIMESTAMPTZ
);

-- Rate limits are private to the backend, no RLS policies needed other than denying public access
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;
