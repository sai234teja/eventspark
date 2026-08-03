import { supabase } from '@/contexts/AuthContext';

export interface WishlistResult {
  success: boolean;
  error?: string;
}

export const wishlistService = {
  async addEvent(userId: string, eventId: string, orgId: string): Promise<WishlistResult> {
    try {
      const { error } = await supabase.from('user_wishlists').insert({
        user_id: userId,
        entity_type: 'event',
        entity_id: eventId,
        organization_id: orgId
      });
      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async removeEvent(userId: string, eventId: string): Promise<WishlistResult> {
    try {
      const { error } = await supabase.from('user_wishlists')
        .update({ deleted_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('entity_type', 'event')
        .eq('entity_id', eventId);
      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async getWishlist(userId: string): Promise<any[]> {
    const { data, error } = await supabase.from('user_wishlists')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null);
    if (error) throw error;
    return data;
  },

  async followOrganizer(userId: string, orgId: string): Promise<WishlistResult> {
    try {
      const { error } = await supabase.from('user_wishlists').insert({
        user_id: userId,
        entity_type: 'organizer',
        entity_id: orgId,
        organization_id: orgId
      });
      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async unfollowOrganizer(userId: string, orgId: string): Promise<WishlistResult> {
    try {
      const { error } = await supabase.from('user_wishlists')
        .update({ deleted_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('entity_type', 'organizer')
        .eq('entity_id', orgId);
      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
};
