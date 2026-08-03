import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialService } from '../services/socialService';
import { addSocialLinkAction, deleteSocialLinkAction } from '../../app/actions/profile';
import { useAuth } from '@/contexts/AuthContext';

export function useSocial() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: socialLinks, isLoading, error } = useQuery({
    queryKey: ['socialLinks', user?.id],
    queryFn: () => socialService.getSocialLinks(user!.id),
    enabled: !!user?.id,
  });

  const addSocialLinkMutation = useMutation({
    mutationFn: (formData: FormData) => addSocialLinkAction(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialLinks', user?.id] });
    },
  });

  const deleteSocialLinkMutation = useMutation({
    mutationFn: (id: string) => deleteSocialLinkAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialLinks', user?.id] });
    },
  });

  return {
    socialLinks,
    isLoading,
    error,
    addSocialLink: addSocialLinkMutation.mutateAsync,
    isAdding: addSocialLinkMutation.isPending,
    deleteSocialLink: deleteSocialLinkMutation.mutateAsync,
    isDeleting: deleteSocialLinkMutation.isPending,
  };
}
