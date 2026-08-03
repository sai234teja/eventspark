import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchLoginHistory, revokeSession } from '../../app/actions/login-history';
import { useAuth } from '@/contexts/AuthContext';

export function useLoginHistory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: loginHistory, isLoading, error } = useQuery({
    queryKey: ['loginHistory', user?.id],
    queryFn: () => fetchLoginHistory(),
    enabled: !!user?.id,
  });

  const revokeMutation = useMutation({
    mutationFn: (sessionId: string) => revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loginHistory', user?.id] });
    },
  });

  return {
    loginHistory,
    isLoading,
    error,
    revokeSession: revokeMutation.mutateAsync,
    isRevoking: revokeMutation.isPending,
  };
}
