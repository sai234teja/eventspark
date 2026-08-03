import { createClient } from '@supabase/supabase-js';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface UserActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  entity_id?: string;
  entity_type?: string;
  metadata?: any;
  ip_address?: string;
  created_at: string;
}

export const activityService = {
  async getActivityLogs(userId: string): Promise<UserActivityLog[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as UserActivityLog[];
  }
};
