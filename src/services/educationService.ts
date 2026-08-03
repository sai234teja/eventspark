import { createClient } from '@supabase/supabase-js';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface UserEducation {
  id: string;
  user_id: string;
  institution: string;
  degree?: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  current: boolean;
  description?: string;
}

export const educationService = {
  async getEducation(userId: string): Promise<UserEducation[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('user_education')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data as UserEducation[];
  },

  async addEducation(userId: string, eduData: Omit<UserEducation, 'id' | 'user_id'>): Promise<UserEducation> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('user_education')
      .insert({ user_id: userId, ...eduData })
      .select()
      .single();

    if (error) throw error;
    return data as UserEducation;
  },

  async updateEducation(userId: string, id: string, eduData: Partial<UserEducation>): Promise<UserEducation> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('user_education')
      .update(eduData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as UserEducation;
  },

  async deleteEducation(userId: string, id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('user_education')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }
};
