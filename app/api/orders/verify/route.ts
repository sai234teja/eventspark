import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { sendBookingConfirmationEmail } from '../../../../src/utils/email';

function getAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Returns the authenticated user ID from the server-side session cookie.
 * NEVER trusts userId from the request body.
 */
async function getAuthenticatedUserId(): Promise<string | null> {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore inside Route Handler
          }
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user.id;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
      ticketTypeId,
      quantity,
      attendeeName,
      attendeeEmail,
      eventId,
    } = body;
    // NOTE: userId is intentionally NOT destructured from body — it is derived from the server session below.

    // SECURITY: Authenticate user from server-side session.
    // Never trust userId from the request body — it is an IDOR vulnerability.
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // 1. CRITICAL: Verify Razorpay signature BEFORE any DB update
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    const supabase = getAdminClient();

    // 2. ATOMIC CLAIM: Ensure Idempotency + Verify order ownership
    // The .eq('user_id', userId) guard prevents one user from verifying another user's order.
    const { data: claimedOrder, error: claimErr } = await supabase
      .from('orders')
      .update({ status: 'processing', razorpay_payment_id })
      .eq('id', orderId)
      .eq('status', 'pending')
      .eq('user_id', userId)                       // SECURITY: owner check — prevents cross-user order claim
      .select('id, total_amount, event_id, user_id')
      .single();

    if (claimErr || !claimedOrder) {
      // Check if it was already processed successfully (idempotent re-delivery)
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('status, user_id')
        .eq('id', orderId)
        .single();

      if (existingOrder?.status === 'paid' && existingOrder?.user_id === userId) {
        const { data: reg } = await supabase
          .from('registrations')
          .select('id')
          .eq('order_id', orderId)
          .single();
        return NextResponse.json({ success: true, registrationId: reg?.id });
      }
      return NextResponse.json({ error: 'Order not found or already processed' }, { status: 409 });
    }

    // 3. ATOMIC INVENTORY ALLOCATION (RPC with FOR UPDATE lock)
    const { error: rpcErr } = await supabase.rpc('increment_quantity_sold', {
      p_ticket_type_id: ticketTypeId,
      p_quantity: quantity,
    });

    if (rpcErr) {
      console.error('RPC Inventory exhaustion:', rpcErr);

      // INVENTORY EXHAUSTION FALLBACK: Server-Side Razorpay Refund
      const razorpay = new Razorpay({
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
      });

      try {
        await razorpay.payments.refund(razorpay_payment_id, {
          amount: Math.round(claimedOrder.total_amount * 100), // paise
          notes: { reason: 'Inventory exhausted after payment capture', order_id: orderId }
        });
        await supabase.from('orders').update({ status: 'refunded' }).eq('id', orderId);
      } catch (refundErr) {
        console.error('CRITICAL: Failed to issue Razorpay refund for exhausted inventory', refundErr);
        // Leave order in 'processing' for manual admin reconciliation
      }

      return NextResponse.json(
        { error: 'Inventory exhausted. Your payment has been refunded automatically.' },
        { status: 409 }
      );
    }

    // 4. Generate signed QR code
    const { signQrPayload } = await import('@/lib/qrSignature');
    const QRCode = (await import('qrcode')).default;
    const regId = crypto.randomUUID();
    const qrData = signQrPayload(regId, eventId, userId);
    const qrCode = await QRCode.toDataURL(qrData);

    // 5. Insert registration — userId is from server session, NOT from body
    const { error: regErr } = await supabase.from('registrations').insert({
      id: regId,
      order_id: orderId,
      ticket_type_id: ticketTypeId,
      user_id: userId,                             // Authoritative from server session
      attendee_name: attendeeName,
      attendee_email: attendeeEmail,
      qr_code: qrCode,
      attendance_status: 'not_checked_in',
      avatar_url: body.avatarUrl || null,
    });

    if (regErr) {
      console.error('Registration insert error:', regErr);
      return NextResponse.json({ error: 'Failed to create registration' }, { status: 500 });
    }

    // 6. Insert Payment Record — userId is from server session, NOT from body
    const { error: paymentErr } = await supabase.from('payments').insert({
      registration_id: regId,
      user_id: userId,                             // Authoritative from server session
      amount: claimedOrder.total_amount,
      currency: 'INR',
      status: 'completed',
      provider_reference: razorpay_payment_id
    });

    if (paymentErr) {
      console.error('Payment insert error:', paymentErr);
      // Log but continue — payment already captured. Webhook can sync later.
    }

    // 7. Finalize order state
    await supabase.from('orders').update({ status: 'paid' }).eq('id', orderId);

    // Insert into email outbox instead of fire-and-forget email sending
    try {
      const [{ data: eventData }, { data: ticketTypeData }] = await Promise.all([
        supabase.from('events').select('title, start_date, venue_name, city').eq('id', eventId).single(),
        supabase.from('ticket_types').select('name').eq('id', ticketTypeId).single()
      ]);
      
      await supabase.from('email_outbox').insert({
        idempotency_key: `booking_confirmation_${regId}`,
        recipient: attendeeEmail || '',
        subject: `Your ticket for ${eventData?.title || 'Event'} is confirmed!`,
        template_name: 'BookingConfirmation',
        payload: {
          eventName: eventData?.title || 'Event',
          eventDate: eventData?.start_date ? new Date(eventData.start_date).toLocaleString() : 'TBA',
          eventVenue: eventData?.venue_name || eventData?.city || 'TBA',
          attendeeName,
          attendeeEmail,
          ticketTypeName: ticketTypeData?.name || 'General Admission',
          qrCodeUrl: qrCode,
          registrationId: regId,
        }
      });
    } catch (e) {
      console.error('Failed to queue confirmation email:', e);
    }

    return NextResponse.json({ success: true, registrationId: regId });
  } catch (err: any) {
    console.error('Order verify error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
