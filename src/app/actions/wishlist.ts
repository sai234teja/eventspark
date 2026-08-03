'use server';

import { wishlistService } from '@/services/wishlistService';
import { revalidatePath } from 'next/cache';

export async function addEventToWishlist(userId: string, eventId: string, orgId: string) {
  const result = await wishlistService.addEvent(userId, eventId, orgId);
  revalidatePath('/dashboard/wishlist');
  revalidatePath('/events');
  revalidatePath(`/events/${eventId}`);
  return result;
}

export async function removeEventFromWishlist(userId: string, eventId: string) {
  const result = await wishlistService.removeEvent(userId, eventId);
  revalidatePath('/dashboard/wishlist');
  revalidatePath('/events');
  revalidatePath(`/events/${eventId}`);
  return result;
}

export async function followOrganizer(userId: string, orgId: string) {
  const result = await wishlistService.followOrganizer(userId, orgId);
  revalidatePath('/dashboard/wishlist');
  return result;
}

export async function unfollowOrganizer(userId: string, orgId: string) {
  const result = await wishlistService.unfollowOrganizer(userId, orgId);
  revalidatePath('/dashboard/wishlist');
  return result;
}
