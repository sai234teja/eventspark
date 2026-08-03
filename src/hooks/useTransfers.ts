import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  initiateTransferAction, 
  acceptTransferAction, 
  rejectTransferAction, 
  cancelTransferAction 
} from '@/app/actions/transfers';
import { transferService } from '@/services/transferService';

export const useTransfers = (userId?: string) => {
  const queryClient = useQueryClient();

  const pendingQuery = useQuery({
    queryKey: ['transfers', 'pending', userId],
    queryFn: () => transferService.getPendingTransfers(userId!),
    enabled: !!userId,
  });

  const historyQuery = useQuery({
    queryKey: ['transfers', 'history', userId],
    queryFn: () => transferService.getTransferHistory(userId!),
    enabled: !!userId,
  });

  const initiateMutation = useMutation({
    mutationFn: (params: { orgId: string; toEmail: string; regId: string; ticketId: string }) => 
      initiateTransferAction(params.orgId, params.toEmail, params.regId, params.ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers', 'history', userId] });
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (params: { orgId: string; token: string }) => 
      acceptTransferAction(params.orgId, params.token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (params: { orgId: string; transferId: string }) => 
      rejectTransferAction(params.orgId, params.transferId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (params: { orgId: string; transferId: string }) => 
      cancelTransferAction(params.orgId, params.transferId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
    },
  });

  return {
    pendingTransfers: pendingQuery.data || [],
    transferHistory: historyQuery.data || [],
    isLoading: pendingQuery.isLoading || historyQuery.isLoading,
    initiateTransfer: initiateMutation.mutateAsync,
    acceptTransfer: acceptMutation.mutateAsync,
    rejectTransfer: rejectMutation.mutateAsync,
    cancelTransfer: cancelMutation.mutateAsync,
  };
};
