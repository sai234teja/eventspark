import { supabase } from '@/contexts/AuthContext';
import { Permission, hasPermission, Role } from '@/types/rbac';

export interface AuditLog {
  id: number;
  organization_id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: any | null;
  new_values: any | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  } | null;
}

export const getAuditLogs = async (organizationId: string, currentRole: Role | string, limit = 50): Promise<AuditLog[]> => {
  if (!hasPermission(currentRole, Permission.MANAGE_SETTINGS)) {
    throw new Error('You do not have permission to view audit logs');
  }

  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      *,
      profiles:user_id (
        full_name,
        email
      )
    `)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }

  return data as unknown as AuditLog[];
};
