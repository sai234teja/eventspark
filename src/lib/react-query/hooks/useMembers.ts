import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMembers, removeMember, updateMemberRole, OrganizationMember } from '@/services/teamService';
import { queryKeys } from '../queryKeys';
import { Role } from '@/types/rbac';

export function useMembers(organizationId: string | undefined, currentRole: Role | string | undefined) {
  return useQuery({
    queryKey: queryKeys.members(organizationId!),
    queryFn: () => getMembers(organizationId!, currentRole!),
    enabled: !!organizationId && !!currentRole,
  });
}

export function useUpdateMemberRole(organizationId: string, currentRole: Role | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, newRole }: { memberId: number, newRole: Role }) => 
      updateMemberRole(memberId, newRole, organizationId, currentRole),
    onMutate: async ({ memberId, newRole }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.members(organizationId) });
      const previousMembers = queryClient.getQueryData<OrganizationMember[]>(queryKeys.members(organizationId));

      if (previousMembers) {
        queryClient.setQueryData<OrganizationMember[]>(
          queryKeys.members(organizationId),
          previousMembers.map(m => m.id === memberId ? { ...m, role: newRole } : m)
        );
      }
      return { previousMembers };
    },
    onError: (err, variables, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(queryKeys.members(organizationId), context.previousMembers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members(organizationId) });
    },
  });
}

export function useRemoveMember(organizationId: string, currentRole: Role | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: number) => removeMember(memberId, organizationId, currentRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members(organizationId) });
    },
  });
}
