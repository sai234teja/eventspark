import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfileDetails, updateProfileBio } from '../../app/actions/profile';
import { useAuth } from '@/contexts/AuthContext';

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => getProfileDetails(user!.id),
    enabled: !!user?.id,
  });

  const updateBioMutation = useMutation({
    mutationFn: (formData: FormData) => updateProfileBio(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateBio: updateBioMutation.mutateAsync,
    isUpdatingBio: updateBioMutation.isPending,
  };
}
