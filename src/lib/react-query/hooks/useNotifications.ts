import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { notificationService } from '@/services/notificationService';
import { toast } from 'sonner';

export const useNotifications = (organizationId: string) => {
  return useQuery({
    queryKey: queryKeys.notifications(organizationId),
    queryFn: () => notificationService.getNotificationHistory(organizationId),
    enabled: !!organizationId,
  });
};

export const useResendNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ notificationId, organizationId }: { notificationId: string, organizationId: string }) => 
      notificationService.resendNotification(notificationId, organizationId),
    onSuccess: (_, { organizationId }) => {
      toast.success('Notification sent successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications(organizationId) });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to resend notification');
    }
  });
};
