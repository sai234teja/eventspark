import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { experienceService } from '../services/experienceService';
import { addExperienceAction, deleteExperienceAction } from '../../app/actions/profile';
import { useAuth } from '@/contexts/AuthContext';

export function useExperience() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: experience, isLoading, error } = useQuery({
    queryKey: ['experience', user?.id],
    queryFn: () => experienceService.getExperience(user!.id),
    enabled: !!user?.id,
  });

  const addExperienceMutation = useMutation({
    mutationFn: (formData: FormData) => addExperienceAction(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experience', user?.id] });
    },
  });

  const deleteExperienceMutation = useMutation({
    mutationFn: (id: string) => deleteExperienceAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experience', user?.id] });
    },
  });

  return {
    experience,
    isLoading,
    error,
    addExperience: addExperienceMutation.mutateAsync,
    isAdding: addExperienceMutation.isPending,
    deleteExperience: deleteExperienceMutation.mutateAsync,
    isDeleting: deleteExperienceMutation.isPending,
  };
}
