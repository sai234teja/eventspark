import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { verifyQrPayload } from '@/lib/qrSignature';
import { createClient as createServerClient } from '../../../supabase/server';

// Service-role client that bypasses RLS for check-in updates
function getAdminClient() {
  return createSupabaseClient(
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

    // 1. First, attempt to verify the HMAC signature of the payload
    const verification = verifyQrPayload(qrData);

    let registrationId: string | null = null;
    let eventId: any = null;

    if (verification.valid && verification.data) {
      registrationId = verification.data.registrationId;
      eventId = verification.data.eventId;
    } else {
      // 2. If signature verification failed, check if this is an organizer entering manually.
      // Allow raw UUID input ONLY if requester is authenticated as organizer or admin.
      const supabaseServer = createServerClient();
      const { data: { user } } = await supabaseServer.auth.getUser();

      let isAuthorizedOrganizer = false;
      if (user) {
        const { data: profile } = await supabaseServer
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile && (profile.role === 'organizer' || profile.role === 'admin')) {
          isAuthorizedOrganizer = true;
        }
      }

      // If they are a verified organizer and input looks like a valid UUID, trust it as a manual fallback
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (isAuthorizedOrganizer && uuidRegex.test(qrData.trim())) {
        registrationId = qrData.trim();
      } else {
        // Return 400 immediately to not leak DB information
        return NextResponse.json({ error: 'Invalid or tampered QR code' }, { status: 400 });
      }
    }

    const supabase = getAdminClient();

    // Fetch the registration details
    const { data: registration, error: regErr } = await supabase
      .from('registrations')
      .select('id, attendee_name, attendee_email, attendance_status, event_id, ticket_type_id, user_id')
      .eq('id', registrationId)
      .single();

    if (regErr || !registration) {
      return NextResponse.json({ error: 'Invalid or tampered QR code' }, { status: 400 });
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
      return NextResponse.json({
        error: 'Attendee already checked in',
        attendeeName: registration.attendee_name,
        ticketTypeName: ticketTypeData?.name || 'General Admission',
        eventName: eventData?.title || 'Event',
        checkedInAt: new Date().toISOString()
      }, { status: 409 });
    }

    // Update attendance_status to 'checked_in'
    const { error: updateErr } = await supabase
      .from('registrations')
      .update({
        attendance_status: 'checked_in'
      })
      .eq('id', registrationId);

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to update attendance status' }, { status: 500 });
    }

    // Issue a certificate of participation
    const credentialId = `CERT-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
    await supabase.from('user_certificates').insert({
      user_id: registration.user_id, // Wait, registration might not select user_id, let me fix this below
      certificate_name: `Certificate of Participation - ${eventData?.title || 'Event'}`,
      issuing_organization: 'EventSpark Platform',
      issue_date: new Date().toISOString(),
      credential_id: credentialId,
      credential_url: `https://eventspark-hzunqozhf-es-bd54.vercel.app/verify/${credentialId}`
    }).select().single();

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
