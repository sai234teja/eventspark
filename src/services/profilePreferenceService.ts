import { createClient } from '@supabase/supabase-js';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface UserPreferences {
  user_id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  reminder_frequency: string;
  theme: string;
  language: string;
  timezone: string;
  currency: string;
  date_format: string;
  time_format: string;
  public_profile: boolean;
  hide_email: boolean;
  hide_phone: boolean;
  hide_social_links: boolean;
  hide_activity: boolean;
  allow_organizer_messages: boolean;
}

export const profilePreferenceService = {
  async getPreferences(userId: string): Promise<UserPreferences> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    // Return default if not exists, since it's lazy initialized
    if (!data) {
      return {
        user_id: userId,
        email_notifications: true,
        sms_notifications: false,
        push_notifications: true,
        marketing_emails: false,
        reminder_frequency: '1h',
        theme: 'system',
        language: 'en',
        timezone: 'UTC',
        currency: 'USD',
        date_format: 'MM/DD/YYYY',
        time_format: '12h',
        public_profile: true,
        hide_email: true,
        hide_phone: true,
        hide_social_links: false,
        hide_activity: false,
        allow_organizer_messages: true,
      };
    }
    
    return data as UserPreferences;
  },

  async updatePreferences(userId: string, updates: Partial<UserPreferences>): Promise<UserPreferences> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({ user_id: userId, ...updates })
      .select()
      .single();

    if (error) throw error;
    return data as UserPreferences;
  }
};
