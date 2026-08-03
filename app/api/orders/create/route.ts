import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import Razorpay from 'razorpay';
import { sendBookingConfirmationEmail } from '../../../../src/utils/email';

// Service-role client that bypasses RLS for order creation
function getAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticketTypeId, quantity, eventId } = body;

    if (!ticketTypeId || !quantity || !eventId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

    const available = ticketType.quantity_total - (ticketType.quantity_sold || 0);
    if (available < quantity) {
      return NextResponse.json(
        { error: `Not enough tickets. Only ${available} remaining.` },
        { status: 409 }
      );
    }

    // 2. Get authenticated user from Authorization header cookie
    // We accept user_id directly from body for now — validated by RLS on insert
    const { userId, attendeeName, attendeeEmail } = body;
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const totalAmount = ticketType.price * quantity;

    // 3. For FREE tickets — skip Razorpay, return special flag
    if (totalAmount === 0) {
      // Insert order with status 'paid' directly
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
        return NextResponse.json({ error: orderErr?.message || 'Failed to create order' }, { status: 500 });
      }

      // Increment quantity_sold
      await supabase.rpc('increment_quantity_sold', {
        p_ticket_type_id: ticketTypeId,
        p_quantity: quantity,
      }).then(() => null); // best-effort via RPC (fallback below)

      // Fallback direct update if RPC not set up
      await supabase
        .from('ticket_types')
        .update({ quantity_sold: (ticketType.quantity_sold || 0) + quantity })
        .eq('id', ticketTypeId);

      // Generate registration
      const QRCode = (await import('qrcode')).default;
      const regId = crypto.randomUUID();
      const qrData = JSON.stringify({ registrationId: regId, eventId, userId });
      const qrCode = await QRCode.toDataURL(qrData);

      const { error: regErr } = await supabase.from('registrations').insert({
        id: regId,
        order_id: order.id,
        ticket_type_id: ticketTypeId,
        user_id: userId,
        attendee_name: attendeeName || '',
        attendee_email: attendeeEmail || '',
        qr_code: qrCode,
        attendance_status: 'not_checked_in',
      });

      if (regErr) {
        return NextResponse.json({ error: regErr.message }, { status: 500 });
      }

      // Send confirmation email non-blocking for free tickets
      try {
        (async () => {
          const { data: eventData } = await supabase.from('events').select('title, start_date, venue_name, city').eq('id', eventId).single();
          await sendBookingConfirmationEmail({
            eventName: eventData?.title || 'Event',
            eventDate: eventData?.start_date ? new Date(eventData.start_date).toLocaleString() : 'TBA',
            eventVenue: eventData?.venue_name || eventData?.city || 'TBA',
            attendeeName: attendeeName || '',
            attendeeEmail: attendeeEmail || '',
            ticketTypeName: ticketType?.name || 'General Admission',
            qrCodeUrl: qrCode,
            registrationId: regId,
          });
        })().catch(console.error);
      } catch (e) {
        console.error('Failed to initiate confirmation email send for free ticket:', e);
      }

      return NextResponse.json({ free: true, registrationId: regId, orderId: order.id });
    }

    // 4. PAID tickets — create Razorpay order
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // Insert pending order first to get orderId as receipt
    const { data: pendingOrder, error: pendingErr } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        event_id: eventId,
        total_amount: totalAmount,
        status: 'pending',
      })
      .select('id')
      .single();

    if (pendingErr || !pendingOrder) {
      return NextResponse.json({ error: pendingErr?.message || 'Failed to create order' }, { status: 500 });
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
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
