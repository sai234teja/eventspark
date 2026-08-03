import { createClient } from '@supabase/supabase-js';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface UserBadge {
  id: string;
  user_id: string;
  badge_name: string;
  badge_type: 'earned' | 'locked' | 'progress' | 'organizer' | 'achievement';
  issued_at?: string;
  created_at: string;
}

export const badgeService = {
  async getBadges(userId: string): Promise<UserBadge[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as UserBadge[];
  }
};
