'use server';

import { createClient } from '@supabase/supabase-js';

const getSupabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const getUserId = async () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id;
};

export async function fetchLoginHistory() {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');
  
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('login_history')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('login_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function revokeSession(sessionId: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');
  
  const supabase = getSupabaseAdmin();
  
  // End session in auth
  // Note: Supabase doesn't easily expose individual session revocation without admin APIs 
  // or storing refresh tokens, but we mark it deleted in our log.
  
  const { error } = await supabase
    .from('login_history')
    .update({ deleted_at: new Date().toISOString(), logout_at: new Date().toISOString() })
    .eq('session_id', sessionId)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  return { success: true };
}
