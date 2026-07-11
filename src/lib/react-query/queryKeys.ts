export const queryKeys = {
  // Admin Dashboard
  dashboard: (orgId: string) => ['dashboard', orgId] as const,

  // Organizations
  organizations: ['organizations'] as const,
  organization: (orgId: string) => ['organizations', orgId] as const,
  
  // Organization Settings
  organizationSettings: (orgId: string) => ['organizationSettings', orgId] as const,

  // Members
  members: (orgId: string) => ['members', orgId] as const,
  
  // Events
  events: (orgId: string) => ['events', orgId] as const,
  
  // Audit Logs
  auditLogs: (orgId: string, filters?: any) => ['auditLogs', orgId, filters] as const,

  // Billing
  subscription: (orgId: string) => ['subscription', orgId] as const,
  usage: (orgId: string) => ['usage', orgId] as const,

  // Analytics
  analyticsSummary: (orgId: string) => ['analytics', 'summary', orgId] as const,
  analyticsRevenue: (orgId: string, startDate?: string, endDate?: string) => ['analytics', 'revenue', orgId, startDate, endDate] as const,
  analyticsRegistration: (orgId: string, startDate?: string, endDate?: string) => ['analytics', 'registration', orgId, startDate, endDate] as const,
  analyticsAttendance: (orgId: string, startDate?: string, endDate?: string) => ['analytics', 'attendance', orgId, startDate, endDate] as const,
  analyticsTopEvents: (orgId: string, limit: number) => ['analytics', 'topEvents', orgId, limit] as const,
  analyticsTopRevenueEvents: (orgId: string, limit: number) => ['analytics', 'topRevenueEvents', orgId, limit] as const,
  analyticsRecentEvents: (orgId: string, limit: number) => ['analytics', 'recentEvents', orgId, limit] as const,
  analyticsCategories: (orgId: string) => ['analytics', 'categories', orgId] as const,
};
