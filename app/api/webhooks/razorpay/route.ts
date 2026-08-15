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

    // 1. Verify Razorpay webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(payload);

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 2. Build a stable idempotency key from the Razorpay event ID header.
    // Fall back to a composite key if the header is absent (older Razorpay versions).
    const rzpEventId =
      req.headers.get('x-razorpay-event-id') ||
      `${event.event}_${event.payload?.payment?.entity?.id || event.payload?.refund?.entity?.id || 'unknown'}`;

    // 3. Idempotency: Attempt to insert the log record.
    // The UNIQUE(provider, event_id) constraint on webhook_logs will reject duplicates.
    const { error: logErr } = await supabase
      .from('webhook_logs')
      .insert({
        provider: 'razorpay',
        event_id: rzpEventId,
        event_type: event.event,
        payload: event,
      });

    if (logErr) {
      // Unique constraint violation (code 23505) means already processed
      if (logErr.code === '23505') {
        return NextResponse.json({ status: 'Already processed' }, { status: 200 });
      }
      // Any other error — log and continue (webhook processing is more important than logging)
      console.error('Webhook log insert error:', logErr);
    }

    // 4. Process the event
    switch (event.event) {
      case 'payment.captured':
        await supabase
          .from('payments')
          .update({ status: 'completed' })
          .eq('provider_reference', event.payload.payment.entity.id);
        break;

      case 'payment.failed':
        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('provider_reference', event.payload.payment.entity.id);
        break;

      case 'refund.processed':
        await supabase
          .from('refunds')
          .update({ status: 'processed', processed_at: new Date().toISOString() })
          .eq('razorpay_refund_id', event.payload.refund.entity.id);
        break;

      default:
        // Unknown event type — already logged, no further action needed
        break;
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
