'use server';

import { reminderService, ReminderInterval, ReminderType } from '@/services/reminderService';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/integrations/supabase/client';

export async function createReminderAction(eventId: number, interval: ReminderInterval, types: ReminderType[]) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const result = await reminderService.createReminder(user.id, eventId, interval, types);

  revalidatePath('/dashboard/reminders');
  revalidatePath(`/events/${eventId}`);
  return result;
}

export async function updateReminderAction(reminderId: string, updates: { interval?: ReminderInterval; types?: ReminderType[]; is_enabled?: boolean }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const result = await reminderService.updateReminder(reminderId, user.id, updates);
  
  revalidatePath('/dashboard/reminders');
  return result;
}

export async function toggleReminderAction(reminderId: string, isEnabled: boolean) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const result = await reminderService.toggleReminder(reminderId, user.id, isEnabled);
  
  revalidatePath('/dashboard/reminders');
  return result;
}

export async function deleteReminderAction(reminderId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const result = await reminderService.deleteReminder(reminderId, user.id);
  
  revalidatePath('/dashboard/reminders');
  return result;
}
