'use server';

import { transferService } from '@/services/transferService';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/integrations/supabase/client';

export async function initiateTransferAction(
  organizationId: string,
  toEmail: string,
  registrationId: string,
  ticketId: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const result = await transferService.initiateTransfer(
    organizationId,
    user.id,
    toEmail,
    registrationId,
    ticketId
  );

  revalidatePath('/dashboard/transfers');
  revalidatePath(`/tickets/${ticketId}`);
  return result;
}

export async function acceptTransferAction(organizationId: string, token: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const result = await transferService.acceptTransfer(organizationId, token, user.id);
  
  revalidatePath('/dashboard/transfers');
  if (result.success && result.data) {
    revalidatePath(`/tickets/${result.data.newTicketId}`);
  }
  return result;
}

export async function rejectTransferAction(organizationId: string, transferId: string) {
  const result = await transferService.rejectTransfer(organizationId, transferId);
  revalidatePath('/dashboard/transfers');
  return result;
}

export async function cancelTransferAction(organizationId: string, transferId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const result = await transferService.cancelTransfer(organizationId, transferId, user.id);
  revalidatePath('/dashboard/transfers');
  return result;
}
