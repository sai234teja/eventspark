import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  createReminderAction, 
  updateReminderAction, 
  deleteReminderAction, 
  toggleReminderAction 
} from '@/app/actions/reminders';
import { reminderService, ReminderInterval, ReminderType } from '@/services/reminderService';

export const useReminders = (userId?: string) => {
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ['reminders', 'user', userId],
    queryFn: () => reminderService.getUserReminders(userId!),
    enabled: !!userId,
  });

  const prefsQuery = useQuery({
    queryKey: ['reminders', 'preferences', userId],
    queryFn: () => reminderService.getPreferences(userId!),
    enabled: !!userId,
  });

  const createMutation = useMutation({
    mutationFn: (params: { eventId: number; interval: ReminderInterval; types: ReminderType[] }) => 
      createReminderAction(params.eventId, params.interval, params.types),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', 'user', userId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (params: { reminderId: string; updates: { interval?: ReminderInterval; types?: ReminderType[]; is_enabled?: boolean } }) => 
      updateReminderAction(params.reminderId, params.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', 'user', userId] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (params: { reminderId: string; isEnabled: boolean }) => 
      toggleReminderAction(params.reminderId, params.isEnabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', 'user', userId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (params: { reminderId: string }) => 
      deleteReminderAction(params.reminderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', 'user', userId] });
    },
  });

  return {
    reminders: userQuery.data || [],
    preferences: prefsQuery.data,
    isLoading: userQuery.isLoading || prefsQuery.isLoading,
    createReminder: createMutation.mutateAsync,
    updateReminder: updateMutation.mutateAsync,
    toggleReminder: toggleMutation.mutateAsync,
    deleteReminder: deleteMutation.mutateAsync,
  };
};
