import { useQuery } from '@tanstack/react-query';
import { getSubscription, getUsage } from '@/services/billingService';
import { queryKeys } from '../queryKeys';
import { Role } from '@/types/rbac';

export function useSubscription(organizationId: string | undefined, currentRole: Role | string | undefined) {
  return useQuery({
    queryKey: queryKeys.subscription(organizationId!),
    queryFn: () => getSubscription(organizationId!, currentRole!),
    enabled: !!organizationId && !!currentRole,
  });
}

export function useUsage(organizationId: string | undefined, currentRole: Role | string | undefined) {
  return useQuery({
    queryKey: queryKeys.usage(organizationId!),
    queryFn: () => getUsage(organizationId!, currentRole!),
    enabled: !!organizationId && !!currentRole,
  });
}
