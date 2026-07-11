import { supabase } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

export type DateRange = {
  startDate?: string;
  endDate?: string;
};

export type DashboardSummary = Database['public']['Views']['tenant_analytics_summary']['Row'];
export type RevenueTrend = Database['public']['Views']['revenue_trend_analytics']['Row'];
export type RegistrationTrend = Database['public']['Views']['registration_trend_analytics']['Row'];
export type EventAnalytics = Database['public']['Views']['event_analytics']['Row'];

export const getDashboardSummary = async (organizationId: string): Promise<DashboardSummary> => {
  const { data, error } = await supabase
    .from('tenant_analytics_summary')
    .select('*')
    .eq('organization_id', organizationId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found, return safe defaults
      return {
        organization_id: organizationId,
        total_events: 0,
        upcoming_events: 0,
        completed_events: 0,
        total_registrations: 0,
        total_revenue: 0,
      };
    }
    console.error('Error fetching dashboard summary:', error);
    throw new Error('Failed to fetch dashboard summary');
  }

  return data;
};

export const getRevenueTrend = async (organizationId: string, dateRange?: DateRange): Promise<RevenueTrend[]> => {
  let query = supabase
    .from('revenue_trend_analytics')
    .select('*')
    .eq('organization_id', organizationId)
    .order('date', { ascending: true });

  if (dateRange?.startDate) {
    query = query.gte('date', dateRange.startDate);
  }
  if (dateRange?.endDate) {
    query = query.lte('date', dateRange.endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching revenue trend:', error);
    throw new Error('Failed to fetch revenue trend');
  }

  return data || [];
};

export const getRegistrationTrend = async (organizationId: string, dateRange?: DateRange): Promise<RegistrationTrend[]> => {
  let query = supabase
    .from('registration_trend_analytics')
    .select('*')
    .eq('organization_id', organizationId)
    .order('date', { ascending: true });

  if (dateRange?.startDate) {
    query = query.gte('date', dateRange.startDate);
  }
  if (dateRange?.endDate) {
    query = query.lte('date', dateRange.endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching registration trend:', error);
    throw new Error('Failed to fetch registration trend');
  }

  return data || [];
};

export const getAttendanceTrend = async (organizationId: string, dateRange?: DateRange): Promise<EventAnalytics[]> => {
  // Using event_analytics to represent attendance (registrations vs max capacity) over time
  let query = supabase
    .from('event_analytics')
    .select('*')
    .eq('organization_id', organizationId)
    .order('date', { ascending: true });

  if (dateRange?.startDate) {
    query = query.gte('date', dateRange.startDate);
  }
  if (dateRange?.endDate) {
    query = query.lte('date', dateRange.endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching attendance trend:', error);
    throw new Error('Failed to fetch attendance trend');
  }

  return data || [];
};

export const getTopEvents = async (organizationId: string, limit: number = 5): Promise<EventAnalytics[]> => {
  const { data, error } = await supabase
    .from('event_analytics')
    .select('*')
    .eq('organization_id', organizationId)
    .order('total_registrations', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching top events:', error);
    throw new Error('Failed to fetch top events');
  }

  return data || [];
};

export const getTopRevenueEvents = async (organizationId: string, limit: number = 5): Promise<EventAnalytics[]> => {
  const { data, error } = await supabase
    .from('event_analytics')
    .select('*')
    .eq('organization_id', organizationId)
    .order('total_revenue', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching top revenue events:', error);
    throw new Error('Failed to fetch top revenue events');
  }

  return data || [];
};

export const getRecentEvents = async (organizationId: string, limit: number = 5): Promise<EventAnalytics[]> => {
  const { data, error } = await supabase
    .from('event_analytics')
    .select('*')
    .eq('organization_id', organizationId)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent events:', error);
    throw new Error('Failed to fetch recent events');
  }

  return data || [];
};

export const getCategoryDistribution = async (organizationId: string): Promise<{ category: string; value: number }[]> => {
  // To strictly avoid client-side iteration of thousands of rows, we query the already aggregated event_analytics view
  // and perform a minimal reduce. If event_analytics was thousands of rows, we'd need an RPC function. 
  // However, since it represents 1 row per event, this is an acceptable hybrid approach for v1.0.
  const { data, error } = await supabase
    .from('event_analytics')
    .select('category, total_registrations')
    .eq('organization_id', organizationId);

  if (error) {
    console.error('Error fetching category distribution:', error);
    throw new Error('Failed to fetch category distribution');
  }

  const distribution = (data || []).reduce((acc: Record<string, number>, curr) => {
    const cat = curr.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + (curr.total_registrations || 0);
    return acc;
  }, {});

  return Object.entries(distribution).map(([category, value]) => ({ category, value }));
};
