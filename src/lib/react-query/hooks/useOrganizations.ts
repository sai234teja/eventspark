import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserOrganizations, createOrganization, updateOrganization, getOrganizationSettings, updateOrganizationSettings } from '@/services/organizationService';
import { queryKeys } from '../queryKeys';
import { Role } from '@/types/rbac';

export function useOrganizations(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.organizations,
    queryFn: () => getUserOrganizations(userId!),
    enabled: !!userId,
  });
}

export function useOrganizationSettings(organizationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.organizationSettings(organizationId!),
    queryFn: () => getOrganizationSettings(organizationId!),
    enabled: !!organizationId,
  });
}

export function useUpdateOrganization(organizationId: string, currentRole: Role | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => updateOrganization(organizationId, data, currentRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations });
      queryClient.invalidateQueries({ queryKey: queryKeys.organization(organizationId) });
    },
  });
}

export function useUpdateOrganizationSettings(organizationId: string, currentRole: Role | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => updateOrganizationSettings(organizationId, data, currentRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizationSettings(organizationId) });
    },
  });
}
