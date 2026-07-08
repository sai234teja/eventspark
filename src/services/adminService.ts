import { supabase } from '@/contexts/AuthContext';
import { Permission, hasPermission, Role } from '@/types/rbac';

export interface DashboardSummary {
  membersCount: number;
  eventsCount: number;
  pendingInvitesCount: number;
  subscriptionPlan: string;
}

export const getDashboardSummary = async (organizationId: string, currentRole: Role | string): Promise<DashboardSummary> => {
  if (!hasPermission(currentRole, Permission.MANAGE_TEAM)) {
    throw new Error('You do not have permission to view the admin dashboard');
  }

  // Run queries in parallel for performance
  const [membersResult, eventsResult, invitesResult, orgResult] = await Promise.all([
    supabase.from('organization_members').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId),
    supabase.from('organization_invites').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId).eq('status', 'pending'),
    supabase.from('organizations').select('subscription_plan').eq('id', organizationId).single()
  ]);

  return {
    membersCount: membersResult.count || 0,
    eventsCount: eventsResult.count || 0,
    pendingInvitesCount: invitesResult.count || 0,
    subscriptionPlan: orgResult.data?.subscription_plan || 'Free'
  };
};
