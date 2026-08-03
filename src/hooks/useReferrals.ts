import { useQuery } from '@tanstack/react-query';
import { fetchUserReferrals } from '../../app/actions/referrals';
import { useAuth } from '@/contexts/AuthContext';

export function useReferrals() {
  const { user } = useAuth();

  const { data: referrals, isLoading, error } = useQuery({
    queryKey: ['referrals', user?.id],
    queryFn: () => fetchUserReferrals(),
    enabled: !!user?.id,
  });

  return {
    referrals,
    isLoading,
    error,
  };
}
