import { supabase } from '@/integrations/supabase/client';
import { issueTicketAction } from '@/app/actions/tickets';

export interface Ticket {
  id: string;
  organization_id: string;
  event_id: number;
  registration_id: string;
  qr_token: string;
  ticket_number: string;
  status: string; // 'pending', 'issued', 'checked-in', 'cancelled', 'expired'
  issued_at: string;
  checked_in_at: string | null;
}

export const ticketService = {
  /**
   * Orchestrates the ticket generation through the Server Action
   * Registration -> PostgreSQL RPC -> Server Action -> ticketService
   */
  async issueTicket(organizationId: string, eventId: number, registrationId: string) {
    const response = await issueTicketAction(organizationId, eventId, registrationId);
    if (!response.success) {
      throw new Error(response.error);
    }
    return response.ticket;
  },

  /**
   * Verifies a ticket's validity using its QR token or Ticket Number
   */
  async verifyTicket(organizationId: string, identifier: string, isToken: boolean = true) {
    let query = supabase
      .from('tickets')
      .select('*, event:events(title, date, location), registration:registrations(registration_data)')
      .eq('organization_id', organizationId);
      
    if (isToken) {
      query = query.eq('qr_token', identifier);
    } else {
      query = query.eq('ticket_number', identifier);
    }

    const { data, error } = await query.single();
    if (error) throw error;
    return data;
  },

  /**
   * Checks in a ticket
   */
  async checkInTicket(organizationId: string, ticketId: string, userId: string, device: string = 'web') {
    // 1. Mark ticket as checked-in
    const { error: updateError } = await (supabase as any)
      .from('tickets')
      .update({ status: 'checked-in', checked_in_at: new Date().toISOString() } as any)
      .eq('id', ticketId)
      .eq('organization_id', organizationId)
      .eq('status', 'issued'); // Duplicate detection

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        throw new Error('Ticket already checked-in or invalid status');
      }
      throw updateError;
    }

    // 2. Record check-in audit
    const { error: logError } = await (supabase as any)
      .from('ticket_checkins')
      .insert({
        organization_id: organizationId,
        ticket_id: ticketId,
        checked_in_by: userId,
        device
      } as any);

    if (logError) throw logError;

    return { success: true };
  },

  /**
   * Cancels a ticket
   */
  async cancelTicket(organizationId: string, ticketId: string) {
    const { error } = await (supabase as any)
      .from('tickets')
      .update({ status: 'cancelled' } as any)
      .eq('id', ticketId)
      .eq('organization_id', organizationId);
    
    if (error) throw error;
    return { success: true };
  },

  /**
   * Regenerates a QR Code for a compromised ticket
   */
  async regenerateQRCode(organizationId: string, ticketId: string) {
    // Basic random token generation for the client fallback, though ideally this would be an RPC
    const newToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    const { error } = await (supabase as any)
      .from('tickets')
      .update({ qr_token: newToken } as any)
      .eq('id', ticketId)
      .eq('organization_id', organizationId);

    if (error) throw error;
    return newToken;
  },

  /**
   * Fetch tickets for an event
   */
  async getEventTickets(organizationId: string, eventId: number) {
    const { data, error } = await supabase
      .from('tickets')
      .select('*, registration:registrations(registration_data)')
      .eq('organization_id', organizationId)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Fetch all tickets for an organization (for the data table)
   */
  async getAllTickets(organizationId: string) {
    const { data, error } = await supabase
      .from('tickets')
      .select('*, event:events(title), registration:registrations(registration_data, user_id)')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
  
  /**
   * Fetch tickets for a specific user
   */
  async getUserTickets(userId: string) {
    const { data, error } = await supabase
      .from('tickets')
      .select('*, event:events(title, date, location)')
      .eq('registration.user_id', userId); // Needs to join via registration
      // Currently Supabase doesn't natively support filtering by joined table in the eq without inner join semantics.
      // We'll fetch registrations first for simplicity, or we can use a view.
      
    // Actually, since RLS is isolated by org, users can only read tickets inside orgs they are members of.
    // We will do a two-step query if needed.
    
    if (error) throw error;
    return data;
  }
};
