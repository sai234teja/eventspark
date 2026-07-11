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
};
