import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { verifyQrPayload } from '@/lib/qrSignature';
import { createClient as createServerClient } from '../../../supabase/server';
import crypto from 'crypto';

// Service-role client that bypasses RLS for check-in updates
function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  try {
    // 1. Authenticate caller
    const supabaseServer = createServerClient();
    const { data: { user }, error: authErr } = await supabaseServer.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { qrData } = body;

    if (!qrData) {
      return NextResponse.json({ error: 'Missing scanned payload' }, { status: 400 });
    }

    // 2 & 3. Parse and validate QR payload / Verify HMAC signature
    const verification = verifyQrPayload(qrData);

    let registrationId: string | null = null;
    let eventId: any = null;

    if (verification.valid && verification.data) {
      registrationId = verification.data.registrationId;
      eventId = verification.data.eventId;
    } else {
      // Manual UUID fallback
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(qrData.trim())) {
        registrationId = qrData.trim();
      } else {
        return NextResponse.json({ error: 'Invalid or tampered QR code' }, { status: 400 });
      }
    }

    const supabase = getAdminClient();

    // 4. Resolve registration
    const { data: registration, error: regErr } = await supabase
      .from('registrations')
      .select('id, attendee_name, attendee_email, attendance_status, event_id, ticket_type_id, user_id')
      .eq('id', registrationId)
      .single();

    if (regErr || !registration) {
      return NextResponse.json({ error: 'Invalid or tampered QR code' }, { status: 400 });
    }

    if (eventId && registration.event_id !== eventId) {
      return NextResponse.json({ error: 'Ticket belongs to a different event' }, { status: 400 });
    }

    // 5 & 6. Determine event ownership and Authorize caller
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    let isAuthorized = false;

    if (profile?.role === 'admin') {
      isAuthorized = true;
    } else {
      // Check event ownership
      const { data: eventAuth } = await supabase
        .from('events')
        .select('created_by, organization_id')
        .eq('id', registration.event_id)
        .single();
      
      if (eventAuth) {
        if (eventAuth.created_by === user.id) {
          isAuthorized = true;
        } else if (eventAuth.organization_id) {
          // Check if staff member of the organization
          const { data: member } = await supabase
            .from('organization_members')
            .select('id')
            .eq('organization_id', eventAuth.organization_id)
            .eq('user_id', user.id)
            .single();
          if (member) {
            isAuthorized = true;
          }
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized to scan tickets for this event' }, { status: 403 });
    }

    // Fetch ticket type and event details
    const [{ data: eventData }, { data: ticketTypeData }] = await Promise.all([
      supabase.from('events').select('title').eq('id', registration.event_id).single(),
      supabase.from('ticket_types').select('name').eq('id', registration.ticket_type_id).single()
    ]);

    if (registration.attendance_status === 'checked_in') {
      return NextResponse.json({
        error: 'Attendee already checked in',
        attendeeName: registration.attendee_name,
        ticketTypeName: ticketTypeData?.name || 'General Admission',
        eventName: eventData?.title || 'Event',
        checkedInAt: new Date().toISOString()
      }, { status: 409 });
    }

    // 7. Process check-in
    const { error: updateErr } = await supabase
      .from('registrations')
      .update({ attendance_status: 'checked_in' })
      .eq('id', registrationId);

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to update attendance status' }, { status: 500 });
    }

    // Issue a certificate of participation
    const credentialId = `CERT-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
    await supabase.from('user_certificates').insert({
      user_id: registration.user_id,
      certificate_name: `Certificate of Participation - ${eventData?.title || 'Event'}`,
      issuing_organization: 'EventSpark Platform',
      issue_date: new Date().toISOString(),
      credential_id: credentialId,
      credential_url: `https://eventspark-hzunqozhf-es-bd54.vercel.app/verify/${credentialId}`
    });

    return NextResponse.json({
      success: true,
      attendeeName: registration.attendee_name,
      ticketTypeName: ticketTypeData?.name || 'General Admission',
      eventName: eventData?.title || 'Event',
    });

  } catch (err: any) {
    console.error('Scan API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
