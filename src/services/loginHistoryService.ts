import { createClient } from '@supabase/supabase-js';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface LoginHistory {
  id: string;
  user_id: string;
  session_id?: string;
  browser?: string;
  device?: string;
  operating_system?: string;
  ip_address?: string;
  city?: string;
  country?: string;
  login_at: string;
  logout_at?: string;
  created_at: string;
}

export const loginHistoryService = {
  async getHistory(userId: string): Promise<LoginHistory[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('login_history')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('login_at', { ascending: false });

    if (error) throw error;
    return data as LoginHistory[];
  }
};
