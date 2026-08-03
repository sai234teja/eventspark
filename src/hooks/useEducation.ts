import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { educationService } from '../services/educationService';
import { addEducationAction, deleteEducationAction } from '../../app/actions/profile';
import { useAuth } from '@/contexts/AuthContext';

export function useEducation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: education, isLoading, error } = useQuery({
    queryKey: ['education', user?.id],
    queryFn: () => educationService.getEducation(user!.id),
    enabled: !!user?.id,
  });

  const addEducationMutation = useMutation({
    mutationFn: (formData: FormData) => addEducationAction(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education', user?.id] });
    },
  });

  const deleteEducationMutation = useMutation({
    mutationFn: (id: string) => deleteEducationAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education', user?.id] });
    },
  });

  return {
    education,
    isLoading,
    error,
    addEducation: addEducationMutation.mutateAsync,
    isAdding: addEducationMutation.isPending,
    deleteEducation: deleteEducationMutation.mutateAsync,
    isDeleting: deleteEducationMutation.isPending,
  };
}
