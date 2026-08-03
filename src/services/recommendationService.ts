import { supabase } from '@/integrations/supabase/client';

export const recommendationService = {
  async getTrendingEvents(limit: number = 5): Promise<any[]> {
    const { data, error } = await supabase
      .from('vw_trending_events')
      .select('*')
      .limit(limit);
      
    if (error) throw error;
    return data;
  },

  async getPopularEvents(limit: number = 5): Promise<any[]> {
    const { data, error } = await supabase
      .from('vw_popular_events')
      .select('*')
      .limit(limit);
      
    if (error) throw error;
    return data;
  },

  async getNearYou(location: string, limit: number = 5): Promise<any[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*, organizations(name)')
      .ilike('location', `%${location}%`)
      .eq('status', 'published')
      .is('deleted_at', null)
      .limit(limit);
      
    if (error) throw error;
    return data;
  },

  async getSimilarEvents(categoryId: number, excludeEventId: number, limit: number = 5): Promise<any[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*, organizations(name)')
      .eq('category_id', categoryId)
      .neq('id', excludeEventId)
      .eq('status', 'published')
      .is('deleted_at', null)
      .limit(limit);
      
    if (error) throw error;
    return data;
  },
  
  async getRecommendedForUser(userId: string, limit: number = 5): Promise<any[]> {
    // In a production SQL structure, this would reference a view vw_recommended_events
    // For now we will return trending as a fallback base
    return this.getTrendingEvents(limit);
  }
};
