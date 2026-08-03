import { createClient } from '@supabase/supabase-js';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface UserExperience {
  id: string;
  user_id: string;
  company: string;
  role: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  current: boolean;
  description?: string;
}

export const experienceService = {
  async getExperience(userId: string): Promise<UserExperience[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('user_experience')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data as UserExperience[];
  },

  async addExperience(userId: string, expData: Omit<UserExperience, 'id' | 'user_id'>): Promise<UserExperience> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('user_experience')
      .insert({ user_id: userId, ...expData })
      .select()
      .single();

    if (error) throw error;
    return data as UserExperience;
  },

  async updateExperience(userId: string, id: string, expData: Partial<UserExperience>): Promise<UserExperience> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('user_experience')
      .update(expData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as UserExperience;
  },

  async deleteExperience(userId: string, id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('user_experience')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }
};
