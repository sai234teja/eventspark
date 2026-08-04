import { supabase } from '@/integrations/supabase/client';
import { ticketService } from './ticketService';

export interface TransferResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export const transferService = {
  async initiateTransfer(
    organizationId: string,
    fromUserId: string,
    toEmail: string,
    registrationId: string,
    ticketId: string
  ): Promise<TransferResult<{ token: string }>> {
    try {
      // 1. Validate Ticket isn't checked in, cancelled, or expired
      const ticket = await ticketService.verifyTicket(organizationId, ticketId, false);
      if (!ticket) throw new Error('Ticket not found');
      if ((ticket as any).status !== 'issued') throw new Error(`Ticket cannot be transferred (Status: ${(ticket as any).status})`);

      // 2. Generate secure transfer token
      const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48); // 48 hour expiration

      // 3. Create transfer record
      const { data, error } = await (supabase as any)
        .from('ticket_transfers')
        .insert({
          organization_id: organizationId,
          from_user_id: fromUserId,
          to_email: toEmail,
          registration_id: registrationId,
          transfer_token: token,
          status: 'pending',
          old_ticket_id: ticketId,
          expires_at: expiresAt.toISOString()
        } as any)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data: { token } };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async acceptTransfer(
    organizationId: string,
    token: string,
    acceptingUserId: string
  ): Promise<TransferResult<{ newTicketId: string }>> {
    try {
      // 1. Validate token
      const { data: transfer, error: fetchError } = await supabase
        .from('ticket_transfers')
        .select('*')
        .eq('transfer_token', token)
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
        .single();

      if (fetchError || !transfer) throw new Error('Transfer request not found or invalid.');
      if ((transfer as any).status !== 'pending') throw new Error(`Transfer is already ${(transfer as any).status}.`);
      if (new Date((transfer as any).expires_at) < new Date()) throw new Error('Transfer has expired.');

      // 2. Invalidate previous QR and regenerate
      const newToken = await ticketService.regenerateQRCode(organizationId, (transfer as any).old_ticket_id);
      
      // 3. Update registration ownership (mocking the user update in registration_data)
      const { data: reg, error: regError } = await supabase
        .from('registrations')
        .select('registration_data')
        .eq('id', (transfer as any).registration_id)
        .single();
        
      if (regError) throw regError;
if (!reg) throw new Error('Registration not found');
      
      const newRegData = {
        ...((reg as any).registration_data),
        user_id: acceptingUserId,
        email: (transfer as any).to_email
      };

      await (supabase as any)
        .from('registrations')
        .update({ registration_data: newRegData } as any)
        .eq('id', (transfer as any).registration_id);

      // 4. Mark Transfer as Accepted
      const { error: updateError } = await (supabase as any)
        .from('ticket_transfers')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          new_ticket_id: (transfer as any).old_ticket_id // Reusing the ticket row, just swapping token and owner
        } as any)
        .eq('id', (transfer as any).id);

      if (updateError) throw updateError;

      return { success: true, data: { newTicketId: (transfer as any).old_ticket_id } };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async rejectTransfer(organizationId: string, transferId: string): Promise<TransferResult> {
    try {
      const { error } = await ((supabase as any).from('ticket_transfers') as any)
        .update({ status: 'rejected', rejected_at: new Date().toISOString() } as any)
        .eq('id', transferId)
        .eq('organization_id', organizationId)
        .eq('status', 'pending');

      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async cancelTransfer(organizationId: string, transferId: string, userId: string): Promise<TransferResult> {
    try {
      const { error } = await ((supabase as any).from('ticket_transfers') as any)
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() } as any)
        .eq('id', transferId)
        .eq('organization_id', organizationId)
        .eq('from_user_id', userId)
        .eq('status', 'pending');

      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async getPendingTransfers(userId: string): Promise<any[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user?.email) return [];

    const { data, error } = await supabase
      .from('ticket_transfers')
      .select('*, registrations(events(title, date, image))')
      .eq('to_email', user.user.email)
      .eq('status', 'pending')
      .is('deleted_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  },

  async getTransferHistory(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('ticket_transfers')
      .select('*, registrations(events(title, date, image))')
      .eq('from_user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  }
};
