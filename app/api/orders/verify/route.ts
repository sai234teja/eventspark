import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import crypto from 'crypto';
import { sendBookingConfirmationEmail } from '../../../../src/utils/email';

function getAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
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
      userId,
      attendeeName,
      attendeeEmail,
      eventId,
    } = body;

    // 1. CRITICAL: Verify Razorpay signature BEFORE any DB update
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('Signature mismatch:', { expected: expectedSignature, received: razorpay_signature });
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    const supabase = getAdminClient();

    // 2. Get current quantity_sold to compute new value
    const { data: ticketType, error: ttErr } = await supabase
      .from('ticket_types')
      .select('quantity_sold, quantity_total')
      .eq('id', ticketTypeId)
      .single();

    if (ttErr || !ticketType) {
      return NextResponse.json({ error: 'Ticket type not found' }, { status: 404 });
    }

    // 3. Update order status to 'paid'
    const { error: orderErr } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        razorpay_payment_id,
      })
      .eq('id', orderId);

    if (orderErr) {
      return NextResponse.json({ error: orderErr.message }, { status: 500 });
    }

    // 4. Increment quantity_sold atomically
    const newSold = (ticketType.quantity_sold || 0) + quantity;
    const { error: ticketUpdateErr } = await supabase
      .from('ticket_types')
      .update({ quantity_sold: newSold })
      .eq('id', ticketTypeId);

    if (ticketUpdateErr) {
      console.error('quantity_sold update error:', ticketUpdateErr);
      // Non-fatal — continue to generate registration
    }

    // 5. Generate QR code
    const { signQrPayload } = await import('@/lib/qrSignature');
    const QRCode = (await import('qrcode')).default;
    const regId = crypto.randomUUID();
    const qrData = signQrPayload(regId, eventId, userId);
    const qrCode = await QRCode.toDataURL(qrData);

    // 6. Insert registration
    const { error: regErr } = await supabase.from('registrations').insert({
      id: regId,
      order_id: orderId,
      ticket_type_id: ticketTypeId,
      user_id: userId,
      attendee_name: attendeeName,
      attendee_email: attendeeEmail,
      qr_code: qrCode,
      attendance_status: 'not_checked_in',
    });

    if (regErr) {
      console.error('Registration insert error:', regErr);
      return NextResponse.json({ error: regErr.message }, { status: 500 });
    }

    // Send confirmation email non-blocking
    try {
      (async () => {
        const [{ data: eventData }, { data: ticketTypeData }] = await Promise.all([
          supabase.from('events').select('title, start_date, venue_name, city').eq('id', eventId).single(),
          supabase.from('ticket_types').select('name').eq('id', ticketTypeId).single()
        ]);
        await sendBookingConfirmationEmail({
          eventName: eventData?.title || 'Event',
          eventDate: eventData?.start_date ? new Date(eventData.start_date).toLocaleString() : 'TBA',
          eventVenue: eventData?.venue_name || eventData?.city || 'TBA',
          attendeeName,
          attendeeEmail,
          ticketTypeName: ticketTypeData?.name || 'General Admission',
          qrCodeUrl: qrCode,
          registrationId: regId,
        });
      })().catch(console.error);
    } catch (e) {
      console.error('Failed to initiate confirmation email send:', e);
    }

    return NextResponse.json({ success: true, registrationId: regId });
  } catch (err: any) {
    console.error('Order verify error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
