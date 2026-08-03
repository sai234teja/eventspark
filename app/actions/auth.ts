'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { headers } from 'next/headers';

// We must use the service_role key to bypass RLS for logging failed logins, creating sessions, and rate limits
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function checkRateLimit(ipAddress: string) {
  const { data, error } = await supabaseAdmin
    .from('auth_rate_limits')
    .select('*')
    .eq('ip_address', ipAddress)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Rate limit check error:', error);
    return true; // fail open or closed? Better to fail open to prevent DoS via db error
  }

  if (data) {
    if (data.blocked_until && new Date(data.blocked_until) > new Date()) {
      const minutesLeft = Math.ceil((new Date(data.blocked_until).getTime() - new Date().getTime()) / 60000);
      throw new Error(`Too many attempts. Please try again in ${minutesLeft} minutes.`);
    }

    // Reset if it's been more than LOCKOUT_MINUTES since last attempt
    const lastAttemptStr = data.last_attempt as string;
    if (new Date().getTime() - new Date(lastAttemptStr).getTime() > LOCKOUT_MINUTES * 60 * 1000) {
      await supabaseAdmin.from('auth_rate_limits').update({ attempts: 0, blocked_until: null }).eq('ip_address', ipAddress);
    }
  }

  return true;
}

export async function incrementRateLimit(ipAddress: string) {
  const { data, error } = await supabaseAdmin
    .from('auth_rate_limits')
    .select('*')
    .eq('ip_address', ipAddress)
    .single();

  if (!data) {
    await supabaseAdmin.from('auth_rate_limits').insert({ ip_address: ipAddress, attempts: 1 });
  } else {
    const newAttempts = data.attempts + 1;
    const blockedUntil = newAttempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MINUTES * 60000).toISOString() : null;
    
    await supabaseAdmin
      .from('auth_rate_limits')
      .update({ 
        attempts: newAttempts, 
        last_attempt: new Date().toISOString(),
        blocked_until: blockedUntil
      })
      .eq('ip_address', ipAddress);
  }
}

export async function clearRateLimit(ipAddress: string) {
  await supabaseAdmin.from('auth_rate_limits').delete().eq('ip_address', ipAddress);
}

export async function logAuthActivity(userId: string | null, ipAddress: string, userAgent: string, success: boolean) {
  if (!userId) return; // Can't log failed logins if we don't know the user, but we rely on IP rate limiting for that
  await supabaseAdmin.from('login_history').insert({
    user_id: userId,
    ip_address: ipAddress,
    user_agent: userAgent,
    success: success
  });
}

export async function trackDeviceSession(userId: string, sessionId: string, ipAddress: string, userAgent: string) {
  await supabaseAdmin.from('device_sessions').insert({
    user_id: userId,
    session_id: sessionId,
    ip_address: ipAddress,
    user_agent: userAgent,
    is_active: true
  });
}

export async function getDeviceSessions(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('device_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('last_active', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getLoginHistory(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('login_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return data;
}

export async function invalidateDeviceSession(sessionId: string) {
  await supabaseAdmin.from('device_sessions').update({ is_active: false }).eq('session_id', sessionId);
}

export async function recordLoginSession(userId: string, accessToken: string) {
  const headersList = headers();
  const ip = headersList.get('x-forwarded-for') || 'Unknown IP';
  const ua = headersList.get('user-agent') || 'Unknown Browser';
  
  await logAuthActivity(userId, ip, ua, true);
  await trackDeviceSession(userId, accessToken, ip, ua);
}


