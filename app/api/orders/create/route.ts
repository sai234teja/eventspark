import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Razorpay from 'razorpay';
import { sendBookingConfirmationEmail } from '../../../../src/utils/email';

// Service-role client that bypasses RLS for order creation and inventory management
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
    const { ticketTypeId, quantity, eventId, attendeeName, attendeeEmail } = body;

    if (!ticketTypeId || !quantity || !eventId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // SECURITY: Authenticate user from server-side session.
    // Never trust userId from the request body — it is an IDOR vulnerability.
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const supabase = getAdminClient();

    // 1. Check ticket availability
    const { data: ticketType, error: ticketErr } = await supabase
      .from('ticket_types')
      .select('id, name, price, quantity_total, quantity_sold, event_id')
      .eq('id', ticketTypeId)
      .single();

    if (ticketErr || !ticketType) {
      return NextResponse.json({ error: 'Ticket type not found' }, { status: 404 });
    }

    // Verify the ticket belongs to the requested event (prevent ticket<->event mismatch attacks)
    if (ticketType.event_id !== eventId) {
      return NextResponse.json({ error: 'Ticket type does not belong to this event' }, { status: 400 });
    }

    const available = ticketType.quantity_total - (ticketType.quantity_sold || 0);
    if (available < quantity) {
      return NextResponse.json(
        { error: `Not enough tickets. Only ${available} remaining.` },
        { status: 409 }
      );
    }

    const totalAmount = ticketType.price * quantity;

    // 2. For FREE tickets — skip Razorpay, complete immediately
    if (totalAmount === 0) {
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          event_id: eventId,
          total_amount: 0,
          status: 'paid',
          razorpay_order_id: null,
        })
        .select('id')
        .single();

      if (orderErr || !order) {
        console.error('Free order create error:', orderErr);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
      }

      // Increment quantity_sold atomically via RPC (FOR UPDATE lock inside)
      const { error: rpcErr } = await supabase.rpc('increment_quantity_sold', {
        p_ticket_type_id: ticketTypeId,
        p_quantity: quantity,
      });

      if (rpcErr) {
        // Roll back order if inventory fails
        await supabase.from('orders').delete().eq('id', order.id);
        return NextResponse.json({ error: 'Insufficient ticket inventory' }, { status: 409 });
      }

      // Generate signed QR payload
      const { signQrPayload } = await import('@/lib/qrSignature');
      const QRCode = (await import('qrcode')).default;
      const regId = crypto.randomUUID();
      const qrData = signQrPayload(regId, eventId, userId);
      const qrCode = await QRCode.toDataURL(qrData);

      const { error: regErr } = await supabase.from('registrations').insert({
        id: regId,
        order_id: order.id,
        ticket_type_id: ticketTypeId,
        user_id: userId,                           // Authoritative from server session
        attendee_name: attendeeName || '',
        attendee_email: attendeeEmail || '',
        qr_code: qrCode,
        attendance_status: 'not_checked_in',
        avatar_url: body.avatarUrl || null,
      });

      if (regErr) {
        console.error('Free registration insert error:', regErr);
        return NextResponse.json({ error: 'Failed to create registration' }, { status: 500 });
      }

      // Insert into email outbox instead of fire-and-forget email sending
      try {
        const { data: eventData } = await supabase.from('events').select('title, start_date, venue_name, city').eq('id', eventId).single();
        
        await supabase.from('email_outbox').insert({
          idempotency_key: `booking_confirmation_${regId}`,
          recipient: attendeeEmail || '',
          subject: `Your ticket for ${eventData?.title || 'Event'} is confirmed!`,
          template_name: 'BookingConfirmation',
          payload: {
            eventName: eventData?.title || 'Event',
            eventDate: eventData?.start_date ? new Date(eventData.start_date).toLocaleString() : 'TBA',
            eventVenue: eventData?.venue_name || eventData?.city || 'TBA',
            attendeeName: attendeeName || '',
            attendeeEmail: attendeeEmail || '',
            ticketTypeName: ticketType?.name || 'General Admission',
            qrCodeUrl: qrCode,
            registrationId: regId,
          }
        });
      } catch (e) {
        console.error('Failed to queue confirmation email for free ticket:', e);
      }

      return NextResponse.json({ free: true, registrationId: regId, orderId: order.id });
    }

    // 3. PAID tickets — create Razorpay order
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // Insert pending order to get a receipt ID before calling Razorpay
    const { data: pendingOrder, error: pendingErr } = await supabase
      .from('orders')
      .insert({
        user_id: userId,                           // Authoritative from server session
        event_id: eventId,
        total_amount: totalAmount,
        status: 'pending',
      })
      .select('id')
      .single();

    if (pendingErr || !pendingOrder) {
      console.error('Pending order create error:', pendingErr);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // paise
      currency: 'INR',
      receipt: pendingOrder.id,
    });

    // Save razorpay_order_id
    await supabase
      .from('orders')
      .update({ razorpay_order_id: rzpOrder.id })
      .eq('id', pendingOrder.id);

    return NextResponse.json({
      free: false,
      orderId: pendingOrder.id,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      ticketTypeId,
      quantity,
    });
  } catch (err: any) {
    console.error('Order create error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
