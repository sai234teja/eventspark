import { createClient } from '@supabase/supabase-js';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface UserSkill {
  id: string;
  user_id: string;
  skill_name: string;
  endorsement_count: number;
  created_at: string;
}

export const skillService = {
  async getSkills(userId: string): Promise<UserSkill[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as UserSkill[];
  },

  async addSkill(userId: string, skillName: string): Promise<UserSkill> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('user_skills')
      .insert({ user_id: userId, skill_name: skillName })
      .select()
      .single();

    if (error) throw error;
    return data as UserSkill;
  },

  async deleteSkill(userId: string, skillId: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('user_skills')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', skillId)
      .eq('user_id', userId);

    if (error) throw error;
  }
};
