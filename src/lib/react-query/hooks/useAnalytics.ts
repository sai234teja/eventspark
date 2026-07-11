import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import * as analyticsService from '@/services/analyticsService';

const STALE_TIME_5_MIN = 5 * 60 * 1000;
const STALE_TIME_2_MIN = 2 * 60 * 1000;
const STALE_TIME_1_MIN = 1 * 60 * 1000;
const GC_TIME_15_MIN = 15 * 60 * 1000;

const DEFAULT_QUERY_OPTIONS = {
  retry: 1,
  refetchOnWindowFocus: false,
  gcTime: GC_TIME_15_MIN,
};

export const useDashboardSummary = (organizationId: string | null) => {
  return useQuery({
    queryKey: queryKeys.analyticsSummary(organizationId as string),
    queryFn: () => analyticsService.getDashboardSummary(organizationId as string),
    enabled: !!organizationId,
    staleTime: STALE_TIME_5_MIN,
    ...DEFAULT_QUERY_OPTIONS,
  });
};

export const useRevenueTrend = (organizationId: string | null, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: queryKeys.analyticsRevenue(organizationId as string, startDate, endDate),
    queryFn: () => analyticsService.getRevenueTrend(organizationId as string, { startDate, endDate }),
    enabled: !!organizationId,
    staleTime: STALE_TIME_5_MIN,
    ...DEFAULT_QUERY_OPTIONS,
  });
};

export const useRegistrationTrend = (organizationId: string | null, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: queryKeys.analyticsRegistration(organizationId as string, startDate, endDate),
    queryFn: () => analyticsService.getRegistrationTrend(organizationId as string, { startDate, endDate }),
    enabled: !!organizationId,
    staleTime: STALE_TIME_5_MIN,
    ...DEFAULT_QUERY_OPTIONS,
  });
};

export const useAttendanceTrend = (organizationId: string | null, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: queryKeys.analyticsAttendance(organizationId as string, startDate, endDate),
    queryFn: () => analyticsService.getAttendanceTrend(organizationId as string, { startDate, endDate }),
    enabled: !!organizationId,
    staleTime: STALE_TIME_5_MIN,
    ...DEFAULT_QUERY_OPTIONS,
  });
};

export const useTopEvents = (organizationId: string | null, limit: number = 5) => {
  return useQuery({
    queryKey: queryKeys.analyticsTopEvents(organizationId as string, limit),
    queryFn: () => analyticsService.getTopEvents(organizationId as string, limit),
    enabled: !!organizationId,
    staleTime: STALE_TIME_2_MIN,
    ...DEFAULT_QUERY_OPTIONS,
  });
};

export const useTopRevenueEvents = (organizationId: string | null, limit: number = 5) => {
  return useQuery({
    queryKey: queryKeys.analyticsTopRevenueEvents(organizationId as string, limit),
    queryFn: () => analyticsService.getTopRevenueEvents(organizationId as string, limit),
    enabled: !!organizationId,
    staleTime: STALE_TIME_2_MIN,
    ...DEFAULT_QUERY_OPTIONS,
  });
};

export const useRecentEvents = (organizationId: string | null, limit: number = 5) => {
  return useQuery({
    queryKey: queryKeys.analyticsRecentEvents(organizationId as string, limit),
    queryFn: () => analyticsService.getRecentEvents(organizationId as string, limit),
    enabled: !!organizationId,
    staleTime: STALE_TIME_1_MIN,
    ...DEFAULT_QUERY_OPTIONS,
  });
};

export const useCategoryDistribution = (organizationId: string | null) => {
  return useQuery({
    queryKey: queryKeys.analyticsCategories(organizationId as string),
    queryFn: () => analyticsService.getCategoryDistribution(organizationId as string),
    enabled: !!organizationId,
    staleTime: STALE_TIME_5_MIN,
    ...DEFAULT_QUERY_OPTIONS,
  });
};
