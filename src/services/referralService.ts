import { createClient } from '@supabase/supabase-js';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface UserReferral {
  id: string;
  referrer_user_id: string;
  invited_user_id?: string;
  referral_code: string;
  referral_status: 'pending' | 'successful' | 'rejected';
  wallet_reward: number;
  created_at: string;
}

export const referralService = {
  async getReferrals(userId: string): Promise<UserReferral[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('user_referrals')
      .select('*')
      .eq('referrer_user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as UserReferral[];
  }
};
