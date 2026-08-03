import { useQuery } from '@tanstack/react-query';
import { fetchUserCertificates } from '../../app/actions/certificates';
import { useAuth } from '@/contexts/AuthContext';

export function useCertificates() {
  const { user } = useAuth();

  const { data: certificates, isLoading, error } = useQuery({
    queryKey: ['certificates', user?.id],
    queryFn: () => fetchUserCertificates(),
    enabled: !!user?.id,
  });

  return {
    certificates,
    isLoading,
    error,
  };
}
