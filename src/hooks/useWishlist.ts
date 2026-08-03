import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addEventToWishlist, removeEventFromWishlist, followOrganizer, unfollowOrganizer } from '@/app/actions/wishlist';
import { wishlistService } from '@/services/wishlistService';

export const useWishlist = (userId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['wishlist', userId],
    queryFn: () => wishlistService.getWishlist(userId!),
    enabled: !!userId,
  });

  const addEventMutation = useMutation({
    mutationFn: (params: { eventId: string; orgId: string }) => 
      addEventToWishlist(userId!, params.eventId, params.orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', userId] });
    },
  });

  const removeEventMutation = useMutation({
    mutationFn: (eventId: string) => removeEventFromWishlist(userId!, eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', userId] });
    },
  });

  const followOrgMutation = useMutation({
    mutationFn: (orgId: string) => followOrganizer(userId!, orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', userId] });
    },
  });

  const unfollowOrgMutation = useMutation({
    mutationFn: (orgId: string) => unfollowOrganizer(userId!, orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', userId] });
    },
  });

  return {
    wishlist: query.data || [],
    isLoading: query.isLoading,
    addEvent: addEventMutation.mutateAsync,
    removeEvent: removeEventMutation.mutateAsync,
    followOrganizer: followOrgMutation.mutateAsync,
    unfollowOrganizer: unfollowOrgMutation.mutateAsync,
  };
};
