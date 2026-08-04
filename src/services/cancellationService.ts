import { supabase } from '@/integrations/supabase/client';

export interface CancellationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export const cancellationService = {
  async requestCancellation(
    organizationId: string,
    userId: string,
    registrationId: string,
    reason: string
  ): Promise<CancellationResult> {
    try {
      // 1. Validate registration
      const { data: reg, error: regError } = await supabase
        .from('registrations')
        .select('*, ticket_tiers(refundable, refund_before_hours)')
        .eq('id', registrationId)
        .single();
        
      if (regError || !reg) throw new Error('Registration not found');
      if (! (reg as any).ticket_tiers?.refundable) throw new Error('This ticket tier is non-refundable.');
      
      // 2. Insert request
      const { error } = await supabase.from('cancellation_requests').insert({
        organization_id: organizationId,
        user_id: userId,
        registration_id: registrationId,
        reason,
        status: 'requested',
      } as any);

      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async approveRefund(
    organizationId: string,
    cancellationId: string,
    approvedByUserId: string
  ): Promise<CancellationResult> {
    try {
      const { data: request, error: reqError } = await supabase
        .from('cancellation_requests')
        .select('*, registrations(payment_id)')
        .eq('id', cancellationId)
        .eq('organization_id', organizationId)
        .single();

      if (reqError || !request) throw new Error('Request not found');

      // 1. Process Refund via PaymentService (Razorpay logic)
      // Assuming paymentService handles Razorpay refunds if payment_id exists
      if ((request as any).registrations?.payment_id) {
         // Mocking refund execution
         // await paymentService.processRefund(request.registrations.payment_id);
      }

      // 2. Update status
      const { error: updateError } = await (supabase as any)
        .from('cancellation_requests')
        .update({
          status: 'refunded',
          approved_by: approvedByUserId,
          approved_at: new Date().toISOString()
        } as any)
        .eq('id', cancellationId);

      if (updateError) throw updateError;
      
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async rejectRefund(organizationId: string, cancellationId: string): Promise<CancellationResult> {
    try {
      const { error } = await (supabase as any)
        .from('cancellation_requests')
        .update({ status: 'rejected' } as any)
        .eq('id', cancellationId)
        .eq('organization_id', organizationId);

      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async getUserCancellations(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('cancellation_requests')
      .select('*, registrations(events(title, date))')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  },
  
  async getOrganizerCancellations(organizationId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('cancellation_requests')
      .select('*, profiles(email), registrations(events(title))')
      .eq('organization_id', organizationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  }
};
