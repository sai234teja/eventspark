import { supabase } from '@/integrations/supabase/client';

export interface ReminderResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export type ReminderInterval = '7d' | '3d' | '24h' | '6h' | '1h' | '15m';
export type ReminderType = 'email' | 'sms' | 'push';

export interface ReminderPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
}

export const reminderService = {
  async createReminder(
    userId: string,
    eventId: number,
    interval: ReminderInterval,
    types: ReminderType[]
  ): Promise<ReminderResult> {
    try {
      const { error } = await (supabase as any)
        .from('event_reminders')
        .insert({
          user_id: userId,
          event_id: eventId,
          interval,
          types,
          is_enabled: true
        } as any);

      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async updateReminder(
    reminderId: string,
    userId: string,
    updates: { interval?: ReminderInterval; types?: ReminderType[]; is_enabled?: boolean }
  ): Promise<ReminderResult> {
    try {
      const { error } = await (supabase as any)
        .from('event_reminders')
        .update(updates as any)
        .eq('id', reminderId)
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async deleteReminder(reminderId: string, userId: string): Promise<ReminderResult> {
    try {
      const { error } = await supabase
        .from('event_reminders')
        .delete()
        .eq('id', reminderId)
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async getUserReminders(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('event_reminders')
      .select('*, events(title, date, image, location)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  },

  async toggleReminder(reminderId: string, userId: string, isEnabled: boolean): Promise<ReminderResult> {
    return this.updateReminder(reminderId, userId, { is_enabled: isEnabled });
  },

  async getPreferences(userId: string): Promise<ReminderPreferences> {
    // In a real app, this would be fetched from user_profiles. 
    // Mocking for now as per instructions to not connect external providers.
    return { email: true, sms: false, push: true };
  }
};
