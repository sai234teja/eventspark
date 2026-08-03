'use server';

import { cancellationService } from '@/services/cancellationService';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/integrations/supabase/client';

export async function requestCancellationAction(
  organizationId: string,
  registrationId: string,
  reason: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const result = await cancellationService.requestCancellation(
    organizationId,
    user.id,
    registrationId,
    reason
  );

  revalidatePath('/dashboard/cancellations');
  revalidatePath(`/tickets/${registrationId}`);
  return result;
}

export async function approveCancellationAction(organizationId: string, cancellationId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const result = await cancellationService.approveRefund(organizationId, cancellationId, user.id);
  
  revalidatePath('/admin/commerce');
  return result;
}

export async function rejectCancellationAction(organizationId: string, cancellationId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const result = await cancellationService.rejectRefund(organizationId, cancellationId);
  revalidatePath('/admin/commerce');
  return result;
}
