import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const payload = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(payload);
    
    // Create admin client directly
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zkgkepieivzprpvbbtyw.supabase.co",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    // Idempotency: Check if webhook already processed
    const { data: existingLog } = await supabase
      .from('audit_logs')
      .select('id')
      .eq('entity_id', event.payload.payment.entity.id)
      .eq('action', 'razorpay_webhook')
      .single();

    if (existingLog) {
      return NextResponse.json({ status: 'Already processed' }, { status: 200 });
    }

    // Process event
    switch (event.event) {
      case 'payment.captured':
        // Handle captured payment
        await supabase.from('payments').update({ status: 'completed' }).eq('razorpay_payment_id', event.payload.payment.entity.id);
        break;
      case 'payment.failed':
        // Handle failed payment
        await supabase.from('payments').update({ status: 'failed' }).eq('razorpay_payment_id', event.payload.payment.entity.id);
        break;
      case 'refund.processed':
        // Handle refund
        await supabase.from('refunds').update({ status: 'processed', processed_at: new Date().toISOString() }).eq('razorpay_refund_id', event.payload.refund.entity.id);
        break;
      default:
        break;
    }

    // Log webhook to audit table
    await supabase.from('audit_logs').insert({
      action: 'razorpay_webhook',
      entity_type: 'payment',
      entity_id: event.payload.payment.entity.id,
      metadata: event
    });

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
