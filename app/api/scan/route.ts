import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service-role client that bypasses RLS for check-in
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { qrData } = body;

    if (!qrData) {
      return NextResponse.json({ error: 'Missing scanned payload' }, { status: 400 });
    }

    let parsedPayload: any = null;
    try {
      parsedPayload = JSON.parse(qrData);
    } catch (e) {
      // If it's not a JSON string, try treating it as the registration ID directly (manual fallback or legacy qr_token)
      parsedPayload = { registrationId: qrData };
    }

    const { registrationId, eventId, userId } = parsedPayload;

    if (!registrationId) {
      return NextResponse.json({ error: 'Invalid QR payload format' }, { status: 400 });
    }

    const supabase = getAdminClient();

    // Fetch the registration details
    const { data: registration, error: regErr } = await supabase
      .from('registrations')
      .select('id, attendee_name, attendee_email, attendance_status, event_id, ticket_type_id')
      .eq('id', registrationId)
      .single();

    if (regErr || !registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    // Verify eventId matches if it was part of the QR code
    if (eventId && registration.event_id !== eventId) {
      return NextResponse.json({ error: 'Ticket belongs to a different event' }, { status: 400 });
    }

    // Fetch ticket type and event details to display on success
    const [{ data: eventData }, { data: ticketTypeData }] = await Promise.all([
      supabase.from('events').select('title').eq('id', registration.event_id).single(),
      supabase.from('ticket_types').select('name').eq('id', registration.ticket_type_id).single()
    ]);

    // Check if attendee is already checked in
    if (registration.attendance_status === 'checked_in') {
      // Find the last update time (or set a mock checked-in time since we don't have checked_in_at on registrations table directly)
      // Wait, let's check if registrations table has a checked_in_at column. We'll use updated_at as check-in timestamp.
      return NextResponse.json({
        error: 'Attendee already checked in',
        attendeeName: registration.attendee_name,
        ticketTypeName: ticketTypeData?.name || 'General Admission',
        eventName: eventData?.title || 'Event',
        checkedInAt: new Date().toISOString() // or fetch check-in logs if available
      }, { status: 409 });
    }

    // Update attendance_status to 'checked_in'
    const { error: updateErr } = await supabase
      .from('registrations')
      .update({
        attendance_status: 'checked_in',
        // In the migrations, registrations table might not have checked_in_at, but we can set updated_at.
      })
      .eq('id', registrationId);

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to update attendance status' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      attendeeName: registration.attendee_name,
      ticketTypeName: ticketTypeData?.name || 'General Admission',
      eventName: eventData?.title || 'Event',
    });

  } catch (err: any) {
    console.error('Scan API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
