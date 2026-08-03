import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  requestCancellationAction, 
  approveCancellationAction, 
  rejectCancellationAction 
} from '@/app/actions/cancellations';
import { cancellationService } from '@/services/cancellationService';

export const useCancellations = (userId?: string, orgId?: string) => {
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ['cancellations', 'user', userId],
    queryFn: () => cancellationService.getUserCancellations(userId!),
    enabled: !!userId && !orgId,
  });

  const orgQuery = useQuery({
    queryKey: ['cancellations', 'org', orgId],
    queryFn: () => cancellationService.getOrganizerCancellations(orgId!),
    enabled: !!orgId,
  });

  const requestMutation = useMutation({
    mutationFn: (params: { orgId: string; regId: string; reason: string }) => 
      requestCancellationAction(params.orgId, params.regId, params.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cancellations', 'user', userId] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: (params: { orgId: string; cancelId: string }) => 
      approveCancellationAction(params.orgId, params.cancelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cancellations'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (params: { orgId: string; cancelId: string }) => 
      rejectCancellationAction(params.orgId, params.cancelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cancellations'] });
    },
  });

  return {
    userCancellations: userQuery.data || [],
    orgCancellations: orgQuery.data || [],
    isLoading: userQuery.isLoading || orgQuery.isLoading,
    requestCancellation: requestMutation.mutateAsync,
    approveCancellation: approveMutation.mutateAsync,
    rejectCancellation: rejectMutation.mutateAsync,
  };
};
