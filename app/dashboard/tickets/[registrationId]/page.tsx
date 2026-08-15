'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, ArrowLeft, Download, Printer, Ticket, Calendar, MapPin, User, Mail, Award } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import dynamic from 'next/dynamic';

const Lanyard = dynamic(() => import('@/components/ui/Lanyard'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-3xl"><Loader2 className="w-8 h-8 text-indigo-400 animate-spin" /></div>
});

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const registrationId = params.registrationId as string;

  const [registration, setRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!registrationId) return;

    async function loadTicket() {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (!user || userErr) {
        router.replace('/auth/login');
        return;
      }

      const { data: reg, error: regErr } = await supabase
        .from('registrations')
        .select('*')
        .eq('id', registrationId)
        .single();

      if (regErr || !reg) {
        setError('Ticket not found or access denied.');
        setLoading(false);
        return;
      }

      // Verify ownership
      if (reg.user_id !== user.id) {
        setError('Access denied. You do not own this ticket.');
        setLoading(false);
        return;
      }

      const { data: order } = await supabase
        .from('orders')
        .select('total_amount, status, event_id')
        .eq('id', reg.order_id)
        .single();

      const { data: ticketType } = await supabase
        .from('ticket_types')
        .select('name, price')
        .eq('id', reg.ticket_type_id)
        .single();

      let event = null;
      if (order?.event_id) {
        const { data: ev } = await supabase
          .from('events')
          .select('title, start_date, venue_name, venue_address, city, banner_url, category')
          .eq('id', order.event_id)
          .single();
        event = ev;
      }

      setRegistration({
        ...reg,
        order,
        ticketType,
        event,
      });
      setLoading(false);
    }

    loadTicket();
  }, [registrationId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-center p-4">
        <div>
          <p className="text-red-400 text-lg mb-4">{error || 'Ticket not found.'}</p>
          <Link href="/dashboard/tickets" className="text-indigo-450 hover:underline">
            ← Back to My Tickets
          </Link>
        </div>
      </div>
    );
  }

  const event = registration.event;
  const ticketType = registration.ticketType;
  const order = registration.order;

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-16 print:bg-white print:text-black">
      {/* Header Nav - Hide on Print */}
      <nav className="px-6 py-4 border-b border-slate-805 bg-slate-950 sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <BrandLogo />
          <Link href="/dashboard/tickets" className="text-sm font-medium text-slate-400 flex items-center hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tickets
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Actions - Hide on Print */}
        <div className="flex justify-between items-center print:hidden">
          <h1 className="text-2xl font-bold">Digital Entry Pass</h1>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-350 hover:text-white text-sm transition-colors"
            >
              <Printer className="w-4 h-4" /> Print Ticket
            </button>
            <Link
              href={`/dashboard/tickets/${registrationId}/invoice`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 text-sm transition-colors"
            >
              <Printer className="w-4 h-4" /> View Invoice
            </Link>
            {registration.qr_code && (
              <a
                href={registration.qr_code}
                download={`ticket-${registrationId}.png`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4" /> Download QR
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Ticket Container (Left) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden print:border-2 print:border-black print:bg-white print:text-black shadow-2xl">
            {/* Event Header Banner */}
            <div className="h-48 relative bg-slate-950">
            {event?.banner_url ? (
              <Image
                src={event.banner_url}
                alt={event.title}
                fill
                className="object-cover opacity-60 print:opacity-40"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent print:from-white" />
            <div className="absolute bottom-5 left-6 right-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-800/40 print:text-black print:border-black print:bg-transparent">
                {event?.category || 'Event Pass'}
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-2 print:text-black truncate">
                {event?.title || 'Event Name'}
              </h2>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Event Meta Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-800 print:border-black/20">
              <div className="flex gap-3">
                <Calendar className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5 print:text-black" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">DATE & TIME</p>
                  <p className="font-semibold text-white print:text-black text-sm">
                    {event?.start_date ? new Date(event.start_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'TBA'}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5 print:text-black" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">VENUE</p>
                  <p className="font-semibold text-white print:text-black text-sm">
                    {event?.venue_name || 'TBA'}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5 print:text-slate-600">
                    {event?.venue_address || event?.city}
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code and Attendance Section */}
            <div className="flex flex-col md:flex-row items-center gap-8 py-4">
              {registration.qr_code && (
                <div className="bg-white p-4 rounded-2xl border border-slate-700/30 print:border-black print:border shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={registration.qr_code}
                    alt="Ticket QR Entry Pass"
                    className="w-40 h-40"
                  />
                  <p className="text-[10px] text-slate-500 font-mono text-center mt-2 break-all max-w-[160px]">
                    ID: {registrationId}
                  </p>
                </div>
              )}
              
              <div className="flex-1 space-y-4 w-full text-center md:text-left">
                <div>
                  <p className="text-xs text-slate-500 font-medium">ATTENDEE</p>
                  <p className="text-lg font-bold text-white print:text-black flex items-center justify-center md:justify-start gap-1.5 mt-0.5">
                    <User className="h-4 w-4 text-indigo-400 print:text-black" />
                    {registration.attendee_name}
                  </p>
                  <p className="text-slate-400 text-xs print:text-slate-700 flex items-center justify-center md:justify-start gap-1.5 mt-0.5">
                    <Mail className="h-3 w-3 text-slate-550" />
                    {registration.attendee_email}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">TICKET TYPE</p>
                    <p className="font-semibold text-indigo-300 print:text-black text-sm mt-0.5">
                      {ticketType?.name || 'General Admission'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">PRICE STATUS</p>
                    <p className="font-semibold text-white print:text-black text-sm mt-0.5">
                      {ticketType?.price === 0 ? 'Free Entry' : `Paid (₹${Number(order?.total_amount || ticketType?.price).toLocaleString('en-IN')})`}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                    registration.attendance_status === 'checked_in'
                      ? 'bg-emerald-950/40 text-emerald-450 border border-emerald-800 print:text-black print:border-black'
                      : 'bg-indigo-950/40 text-indigo-450 border border-indigo-800 print:text-black print:border-black'
                  }`}>
                    {registration.attendance_status === 'checked_in' ? '✓ Checked In' : '• Ready for Check-in'}
                  </span>
                </div>
              </div>
            </div>

            {/* EventSpark Terms / Entry Instructions */}
            <div className="border-t border-slate-805 pt-6 space-y-2 text-xs text-slate-500 print:text-slate-700">
              <p className="font-semibold text-slate-400 print:text-black uppercase tracking-wider">ENTRY INSTRUCTIONS</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Present this digital ticket (or printed copy) at the venue entrance.</li>
                <li>QR code is valid for one-time admission scan only.</li>
                <li>Please bring a valid photo identity proof matching the attendee name.</li>
                <li>Tickets are non-refundable and subject to the organizer&apos;s venue policy.</li>
              </ul>
            </div>
            </div>
          </div>
          
          {/* Lanyard 3D Viewer (Right) */}
          <div className="w-full h-[60vh] lg:h-[800px] bg-slate-950/50 rounded-3xl border border-slate-800 overflow-hidden print:hidden relative lg:sticky lg:top-24">
            <div className="absolute top-4 left-4 z-10">
              <span className="text-xs font-bold text-[#FF9FFC] bg-[#FF9FFC]/10 px-3 py-1.5 rounded-full uppercase tracking-wider border border-[#FF9FFC]/20 shadow-lg shadow-[#FF9FFC]/5 backdrop-blur-md">
                Interactive 3D Pass
              </span>
            </div>
            <Lanyard 
              attendeeName={registration.attendee_name}
              ticketType={ticketType?.name || 'General Admission'}
              avatarUrl={registration.avatar_url || null}
              backImage={registration.qr_code || null}
              fov={25}
              position={[0, 0, 15]}
            />
          </div>

        </div>
      </main>
    </div>
  );
}
