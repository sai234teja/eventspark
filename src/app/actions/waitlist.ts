'use server';

import { waitlistService } from '@/services/waitlistService';
import { revalidatePath } from 'next/cache';

export async function joinWaitlistAction(userId: string, eventId: number, orgId: string, tierId?: string) {
  const result = await waitlistService.join(userId, eventId, orgId, tierId);
  revalidatePath(`/events/${eventId}`);
  revalidatePath('/dashboard');
  return result;
}

export async function leaveWaitlistAction(userId: string, eventId: number) {
  const result = await waitlistService.leave(userId, eventId);
  revalidatePath(`/events/${eventId}`);
  revalidatePath('/dashboard');
  return result;
}

export async function reservePromotedSeatAction(eventId: number, tierId?: string) {
  const result = await waitlistService.reserveSeat(eventId, tierId);
  return result;
}
