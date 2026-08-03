import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { joinWaitlistAction, leaveWaitlistAction, reservePromotedSeatAction } from '@/app/actions/waitlist';
import { waitlistService } from '@/services/waitlistService';

export const useWaitlist = (userId?: string, eventId?: number) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['waitlist-position', userId, eventId],
    queryFn: () => waitlistService.getPosition(userId!, eventId!),
    enabled: !!userId && !!eventId,
  });

  const allQuery = useQuery({
    queryKey: ['user-waitlists', userId],
    queryFn: () => waitlistService.getUserWaitlists(userId!),
    enabled: !!userId && !eventId,
  });

  const joinMutation = useMutation({
    mutationFn: (params: { eventId: number; orgId: string; tierId?: string }) => 
      joinWaitlistAction(userId!, params.eventId, params.orgId, params.tierId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist-position', userId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-details', String(eventId)] });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: (eventId: number) => leaveWaitlistAction(userId!, eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist-position', userId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-details', String(eventId)] });
    },
  });

  return {
    position: query.data,
    allWaitlists: allQuery.data || [],
    isLoading: query.isLoading || allQuery.isLoading,
    joinWaitlist: joinMutation.mutateAsync,
    leaveWaitlist: leaveMutation.mutateAsync,
  };
};
