import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  organization_id: string;
  user_id: string;
  event_id: number | null;
  template: string;
  subject: string | null;
  body: string;
  delivery_status: string; // 'pending', 'delivered', 'failed'
  created_at: string;
}

// Interfaces for future Email/SMS integration
export interface EmailProvider {
  sendEmail(to: string, subject: string, body: string): Promise<boolean>;
}

export interface SMSProvider {
  sendSMS(phone: string, message: string): Promise<boolean>;
}

export interface PushProvider {
  sendPush(userId: string, title: string, body: string): Promise<boolean>;
}

export const notificationService = {
  /**
   * Queues a notification in the database
   */
  async queueNotification(
    organizationId: string, 
    userId: string, 
    template: string, 
    subject: string, 
    body: string,
    eventId?: number
  ) {
    const { error } = await (supabase as any)
      .from('notifications')
      .insert({
        organization_id: organizationId,
        user_id: userId,
        template,
        subject,
        body,
        event_id: eventId || null,
        delivery_status: 'pending'
      } as any);

    if (error) throw error;
    return { success: true };
  },

  /**
   * Sends a notification immediately (using stubs for now)
   */
  async sendNotification(notificationId: string, organizationId: string) {
    // 1. Fetch notification
    const { data: notification, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .eq('organization_id', organizationId)
      .single();

    if (fetchError || !notification) throw fetchError || new Error('Notification not found');

    try {
      // Note: Actual EmailProvider integration goes here in future phases
      // Simulated sending for now

      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 500));

      // 2. Mark as delivered
      await (supabase as any)
        .from('notifications')
        .update({ delivery_status: 'delivered' } as any)
        .eq('id', notificationId);

      return { success: true };
    } catch (err) {
      // Mark as failed
      await (supabase as any)
        .from('notifications')
        .update({ delivery_status: 'failed' } as any)
        .eq('id', notificationId);
      
      throw err;
    }
  },

  /**
   * Resend a failed notification
   */
  async resendNotification(notificationId: string, organizationId: string) {
    // Reset to pending
      const { error } = await (supabase as any)
        .from('notifications')
        .update({ delivery_status: 'pending' } as any)
        .eq('id', notificationId)
        .eq('organization_id', organizationId);

    if (error) throw error;
    
    // Attempt send
    return this.sendNotification(notificationId, organizationId);
  },

  /**
   * Fetch notification history for an organization
   */
  async getNotificationHistory(organizationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*, profile:profiles(full_name), event:events(title)')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};
