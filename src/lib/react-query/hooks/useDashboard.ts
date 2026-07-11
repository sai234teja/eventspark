import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '@/services/adminService';
import { queryKeys } from '../queryKeys';
import { Role } from '@/types/rbac';

export function useDashboardSummary(organizationId: string | undefined, currentRole: Role | string | undefined) {
  return useQuery({
    queryKey: queryKeys.dashboard(organizationId!),
    queryFn: () => getDashboardSummary(organizationId!, currentRole!),
    enabled: !!organizationId && !!currentRole,
  });
}
