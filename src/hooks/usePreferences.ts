import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profilePreferenceService } from '../services/profilePreferenceService';
import { updatePreferencesAction } from '../../app/actions/profile';
import { useAuth } from '@/contexts/AuthContext';

export function usePreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading, error } = useQuery({
    queryKey: ['preferences', user?.id],
    queryFn: () => profilePreferenceService.getPreferences(user!.id),
    enabled: !!user?.id,
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (formData: FormData) => updatePreferencesAction(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences', user?.id] });
    },
  });

  return {
    preferences,
    isLoading,
    error,
    updatePreferences: updatePreferencesMutation.mutateAsync,
    isUpdating: updatePreferencesMutation.isPending,
  };
}
