import { supabase } from '@/integrations/supabase/client';

export interface SearchParams {
  keyword?: string;
  category?: string | number;
  organizer?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  minPrice?: number;
  maxPrice?: number;
  isFree?: boolean;
  minCapacity?: number;
  hasAvailableSeats?: boolean;
  sortBy?: 'date_asc' | 'date_desc' | 'price_asc' | 'price_desc' | 'popularity';
  page?: number;
  limit?: number;
}

export const searchService = {
  async searchEvents(params: SearchParams) {
    const { page = 1, limit = 12 } = params;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('events')
      .select(`
        *,
        organizations(name),
        categories(name),
        ticket_tiers(price, capacity, sold_count)
      `, { count: 'exact' })
      .eq('status', 'published')
      .is('deleted_at', null);

    // Keyword (Title or Description)
    if (params.keyword) {
      query = query.or(`title.ilike.%${params.keyword}%,description.ilike.%${params.keyword}%`);
    }

    // Filters
    if (params.category) query = query.eq('category_id', params.category);
    if (params.organizer) query = query.eq('organization_id', params.organizer);
    if (params.location) query = query.ilike('location', `%${params.location}%`);
    
    // Dates
    if (params.startDate) query = query.gte('date', params.startDate);
    if (params.endDate) query = query.lte('date', params.endDate);

    // Sorting
    switch (params.sortBy) {
      case 'date_asc':
        query = query.order('date', { ascending: true });
        break;
      case 'date_desc':
        query = query.order('date', { ascending: false });
        break;
      case 'popularity':
        // If we had a direct popularity score in events table, we'd sort by it. 
        // For now, defaulting to date
        query = query.order('created_at', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    
    if (error) throw error;

    // Post-Processing for array relations like prices, free/paid, capacity
    let results = data || [];
    
    if (params.isFree !== undefined || params.minPrice !== undefined || params.maxPrice !== undefined || params.hasAvailableSeats) {
      results = results.filter((event: any) => {
        const tiers = event.ticket_tiers || [];
        if (tiers.length === 0) return !params.hasAvailableSeats; // No tiers means no tickets to buy
        
        let minEventPrice = Math.min(...tiers.map((t: any) => t.price));
        let maxEventPrice = Math.max(...tiers.map((t: any) => t.price));
        
        let hasSeats = tiers.some((t: any) => (t.capacity - t.sold_count) > 0);
        
        if (params.isFree && minEventPrice > 0) return false;
        if (params.minPrice !== undefined && maxEventPrice < params.minPrice) return false;
        if (params.maxPrice !== undefined && minEventPrice > params.maxPrice) return false;
        if (params.hasAvailableSeats && !hasSeats) return false;
        if (params.minCapacity !== undefined && tiers.reduce((acc: number, t: any) => acc + t.capacity, 0) < params.minCapacity) return false;
        
        return true;
      });
    }

    // Sort by price if requested (requires client-side sort since price is in a nested table)
    if (params.sortBy === 'price_asc') {
      results.sort((a, b) => {
        const priceA = Math.min(...(a.ticket_tiers || []).map((t: any) => t.price));
        const priceB = Math.min(...(b.ticket_tiers || []).map((t: any) => t.price));
        return priceA - priceB;
      });
    } else if (params.sortBy === 'price_desc') {
      results.sort((a, b) => {
        const priceA = Math.max(...(a.ticket_tiers || []).map((t: any) => t.price));
        const priceB = Math.max(...(b.ticket_tiers || []).map((t: any) => t.price));
        return priceB - priceA;
      });
    }

    return {
      events: results,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }
};
