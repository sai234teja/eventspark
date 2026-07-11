import { useQuery } from '@tanstack/react-query';
import { getAuditLogs, AuditLogFilters } from '@/services/auditService';
import { queryKeys } from '../queryKeys';
import { Role } from '@/types/rbac';

export function useAuditLogs(organizationId: string | undefined, currentRole: Role | string | undefined, filters: AuditLogFilters) {
  return useQuery({
    queryKey: queryKeys.auditLogs(organizationId!, filters),
    queryFn: () => getAuditLogs(organizationId!, currentRole!, filters),
    enabled: !!organizationId && !!currentRole,
    // Keep previous data while fetching new pages
    placeholderData: (previousData) => previousData,
  });
}
