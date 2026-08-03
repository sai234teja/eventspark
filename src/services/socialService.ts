import { createClient } from '@supabase/supabase-js';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface UserSocialLink {
  id: string;
  user_id: string;
  platform: string;
  url: string;
}

export const socialService = {
  async getSocialLinks(userId: string): Promise<UserSocialLink[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('user_social_links')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (error) throw error;
    return data as UserSocialLink[];
  },

  async setSocialLink(userId: string, platform: string, url: string): Promise<UserSocialLink> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('user_social_links')
      .upsert({ user_id: userId, platform, url }, { onConflict: 'user_id, platform' })
      .select()
      .single();

    if (error) throw error;
    return data as UserSocialLink;
  },

  async deleteSocialLink(userId: string, id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('user_social_links')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }
};
