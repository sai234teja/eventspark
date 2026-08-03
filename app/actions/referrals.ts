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

export async function fetchUserReferrals() {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');
  
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('user_referrals')
    .select('*')
    .eq('referrer_user_id', userId)
    .is('deleted_at', null);

  if (error) throw new Error(error.message);
  return data;
}
