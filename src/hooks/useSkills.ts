import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { skillService } from '../services/skillService';
import { addUserSkill, deleteUserSkill } from '../../app/actions/profile';
import { useAuth } from '@/contexts/AuthContext';

export function useSkills() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: skills, isLoading, error } = useQuery({
    queryKey: ['skills', user?.id],
    queryFn: () => skillService.getSkills(user!.id),
    enabled: !!user?.id,
  });

  const addSkillMutation = useMutation({
    mutationFn: (skillName: string) => addUserSkill(skillName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills', user?.id] });
    },
  });

  const deleteSkillMutation = useMutation({
    mutationFn: (id: string) => deleteUserSkill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills', user?.id] });
    },
  });

  return {
    skills,
    isLoading,
    error,
    addSkill: addSkillMutation.mutateAsync,
    isAdding: addSkillMutation.isPending,
    deleteSkill: deleteSkillMutation.mutateAsync,
    isDeleting: deleteSkillMutation.isPending,
  };
}
