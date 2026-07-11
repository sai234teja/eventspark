import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { ticketService } from '@/services/ticketService';
import { toast } from 'sonner';

export const useTickets = (organizationId: string) => {
  return useQuery({
    queryKey: queryKeys.tickets(organizationId),
    queryFn: () => ticketService.getAllTickets(organizationId),
    enabled: !!organizationId,
  });
};

export const useEventTickets = (organizationId: string, eventId: number) => {
  return useQuery({
    queryKey: queryKeys.eventTickets(organizationId, eventId),
    queryFn: () => ticketService.getEventTickets(organizationId, eventId),
    enabled: !!organizationId && !!eventId,
  });
};

export const useVerifyTicket = () => {
  return useMutation({
    mutationFn: ({ organizationId, identifier, isToken }: { organizationId: string, identifier: string, isToken: boolean }) => 
      ticketService.verifyTicket(organizationId, identifier, isToken)
  });
};

export const useCheckInTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, ticketId, userId, device }: { organizationId: string, ticketId: string, userId: string, device?: string }) => 
      ticketService.checkInTicket(organizationId, ticketId, userId, device),
    onSuccess: (_, { organizationId }) => {
      toast.success('Ticket checked in successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets(organizationId) });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to check in ticket');
    }
  });
};

export const useCancelTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, ticketId }: { organizationId: string, ticketId: string }) => 
      ticketService.cancelTicket(organizationId, ticketId),
    onSuccess: (_, { organizationId }) => {
      toast.success('Ticket cancelled');
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets(organizationId) });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel ticket');
    }
  });
};
