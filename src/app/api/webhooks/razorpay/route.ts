import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
    }

    // Verify webhook signature
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(rawBody);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const eventId = req.headers.get('x-razorpay-event-id') || event.id;

    // Handle payment.captured
    if (event.event === 'payment.captured') {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      
      // 1. Idempotency Check
      const { data: existingPayment } = await supabaseAdmin
        .from('payments')
        .select('id, payment_status')
        .eq('webhook_event_id', eventId)
        .single();

      if (existingPayment) {
        return NextResponse.json({ status: 'ok', message: 'Event already processed' });
      }

      // 2. Update payment record
      const { data: paymentRecord, error: updateError } = await supabaseAdmin
        .from('payments')
        .update({
          payment_status: 'paid',
          razorpay_payment_id: paymentEntity.id,
          webhook_event_id: eventId,
          webhook_processed_at: new Date().toISOString()
        })
        .eq('razorpay_order_id', orderId)
        .eq('payment_status', 'pending')
        .select()
        .single();

      if (updateError || !paymentRecord) {
        console.error('Failed to update payment record or already updated:', updateError);
        return NextResponse.json({ error: 'Payment not found or already processed' }, { status: 400 });
      }
      
      // Handle coupon uses increment if used
      if (paymentEntity.notes && paymentEntity.notes.couponCode) {
        await supabaseAdmin.rpc('increment_coupon_uses', { 
           coupon_code: paymentEntity.notes.couponCode,
           org_id: paymentEntity.notes.organizationId
        });
      }

      // Handle Affiliate commission logic if used
      if (paymentEntity.notes && paymentEntity.notes.affiliateCode) {
         // Log affiliate conversion
         const { data: affiliate } = await supabaseAdmin
           .from('affiliates')
           .select('id, commission_rate')
           .eq('referral_code', paymentEntity.notes.affiliateCode)
           .single();

         if (affiliate) {
           await supabaseAdmin.from('affiliate_conversions').insert({
              affiliate_id: affiliate.id,
              registration_id: 'pending-reg-from-webhook', // This is usually done after registration
              commission_amount: (paymentEntity.amount / 100) * (affiliate.commission_rate / 100),
              status: 'pending'
           });
         }
      }

      return NextResponse.json({ status: 'ok', paymentRecordId: paymentRecord.id });
    }

    // Handle refund.processed
    if (event.event === 'refund.processed') {
      const refundEntity = event.payload.refund.entity;
      const razorpayPaymentId = refundEntity.payment_id;

      const { data: refundRecord, error: updateError } = await supabaseAdmin
        .from('refunds')
        .update({
          status: 'processed',
          processed_at: new Date().toISOString()
        })
        .eq('razorpay_refund_id', refundEntity.id)
        .select()
        .single();
      
      if (!refundRecord) {
        // Find payment manually to record unsolicited refund
        const { data: payment } = await supabaseAdmin
          .from('payments')
          .select('id, organization_id')
          .eq('razorpay_payment_id', razorpayPaymentId)
          .single();

        if (payment) {
          await supabaseAdmin.from('refunds').insert({
            organization_id: payment.organization_id,
            payment_id: payment.id,
            razorpay_refund_id: refundEntity.id,
            amount: refundEntity.amount / 100,
            status: 'processed',
            processed_at: new Date().toISOString()
          });
        }
      }

      return NextResponse.json({ status: 'ok', message: 'Refund processed' });
    }

    return NextResponse.json({ status: 'ok', message: 'Event ignored' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
