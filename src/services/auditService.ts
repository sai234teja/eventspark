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

export interface AuditLogFilters {
  page: number;
  limit: number;
  search?: string;
  action?: string;
}

export const getAuditLogs = async (organizationId: string, currentRole: Role | string, filters: AuditLogFilters): Promise<{ logs: AuditLog[], totalCount: number }> => {
  if (!hasPermission(currentRole, Permission.MANAGE_SETTINGS)) {
    throw new Error('You do not have permission to view audit logs');
  }

  let query = supabase
    .from('audit_logs')
    .select(`
      *,
      profiles:user_id (
        full_name,
        email
      )
    `, { count: 'exact' })
    .eq('organization_id', organizationId);

  if (filters.action && filters.action !== 'all') {
    query = query.eq('action', filters.action);
  }

  // Supabase doesn't easily support OR across joined tables with text search in a single simple query without RPC or complex syntax,
  // but we can search within entity_type or action.
  if (filters.search) {
    query = query.or(`action.ilike.%${filters.search}%,entity_type.ilike.%${filters.search}%`);
  }

  const from = (filters.page - 1) * filters.limit;
  const to = from + filters.limit - 1;

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }

  return {
    logs: data as unknown as AuditLog[],
    totalCount: count || 0
  };
};
