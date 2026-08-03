import { useQuery } from '@tanstack/react-query';
import { fetchUserBadges } from '../../app/actions/badges';
import { useAuth } from '@/contexts/AuthContext';

export function useBadges() {
  const { user } = useAuth();

  const { data: badges, isLoading, error } = useQuery({
    queryKey: ['badges', user?.id],
    queryFn: () => fetchUserBadges(),
    enabled: !!user?.id,
  });

  return {
    badges,
    isLoading,
    error,
  };
}
