import { useQuery } from '@tanstack/react-query';
import { fetchUserActivity } from '../../app/actions/activity';
import { useAuth } from '@/contexts/AuthContext';

export function useActivity() {
  const { user } = useAuth();

  const { data: activityLogs, isLoading, error } = useQuery({
    queryKey: ['activity', user?.id],
    queryFn: () => fetchUserActivity(),
    enabled: !!user?.id,
  });

  return {
    activityLogs,
    isLoading,
    error,
  };
}
