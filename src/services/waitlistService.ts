import { supabase } from '@/contexts/AuthContext';

export interface WaitlistResult {
  success: boolean;
  position?: number;
  error?: string;
}

export const waitlistService = {
  async join(userId: string, eventId: number, orgId: string, tierId?: string): Promise<WaitlistResult> {
    try {
      // Get current max position
      const { data: maxData, error: maxError } = await supabase
        .from('waitlist_entries')
        .select('position')
        .eq('event_id', eventId)
        .order('position', { ascending: false })
        .limit(1)
        .single();
        
      const nextPosition = maxData ? maxData.position + 1 : 1;

      const payload: any = {
        user_id: userId,
        event_id: eventId,
        organization_id: orgId,
        position: nextPosition,
        status: 'waiting'
      };
      
      if (tierId) payload.tier_id = tierId;

      const { error } = await supabase.from('waitlist_entries').insert(payload);
      if (error) throw error;
      
      return { success: true, position: nextPosition };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async leave(userId: string, eventId: number): Promise<WaitlistResult> {
    try {
      const { error } = await supabase.from('waitlist_entries')
        .update({ deleted_at: new Date().toISOString(), status: 'expired' })
        .eq('user_id', userId)
        .eq('event_id', eventId)
        .is('deleted_at', null);
      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async getPosition(userId: string, eventId: number): Promise<number | null> {
    const { data, error } = await supabase.from('waitlist_entries')
      .select('position, status')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .is('deleted_at', null)
      .single();
      
    if (error || !data || data.status !== 'waiting') return null;
    return data.position;
  },

  async getUserWaitlists(userId: string): Promise<any[]> {
    const { data, error } = await supabase.from('waitlist_entries')
      .select('*, events(title, date, image), ticket_tiers(name, price)')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  },

  async reserveSeat(eventId: number, tierId?: string): Promise<WaitlistResult> {
    try {
      const { data, error } = await supabase.rpc('promote_next_waitlist_user', {
        p_event_id: eventId,
        p_tier_id: tierId || null,
        p_reservation_timeout_minutes: 30
      });
      
      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
};
