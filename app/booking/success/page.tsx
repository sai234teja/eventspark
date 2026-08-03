'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, Calendar, MapPin, Ticket, ArrowLeft, Download } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const registrationId = searchParams.get('registrationId') || '';

  const [registration, setRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!registrationId) { setError('Invalid registration ID'); setLoading(false); return; }

    supabase
      .from('registrations')
      .select('id, attendee_name, attendee_email, qr_code, attendance_status, ticket_type_id, order_id')
      .eq('id', registrationId)
      .single()
      .then(async ({ data: reg, error: regErr }) => {
        if (regErr || !reg) { setError('Registration not found.'); setLoading(false); return; }

        // Fetch order and ticket type separately
        const [{ data: order }, { data: ticketType }] = await Promise.all([
          supabase.from('orders').select('total_amount, status, event_id').eq('id', reg.order_id).single(),
          supabase.from('ticket_types').select('name, price').eq('id', reg.ticket_type_id).single(),
        ]);

        let event = null;
        if (order?.event_id) {
          const { data: ev } = await supabase
            .from('events')
            .select('title, start_date, venue_name, city, banner_url, category')
            .eq('id', order.event_id)
            .single();
          event = ev;
        }

        setRegistration({ ...reg, order, ticketType, event });
        setLoading(false);
      });
  }, [registrationId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0F] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#6C47FF] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0F] flex items-center justify-center text-center px-4">
        <div>
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <Link href="/events" className="text-[#6C47FF] hover:underline font-semibold flex items-center justify-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const event = registration?.event;
  const ticketType = registration?.ticketType;
  const order = registration?.order;

  const price = ticketType ? Number(ticketType.price) : 0;
  const totalAmount = order ? Number(order.total_amount) : price;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0A0A0F] py-16 px-6 text-slate-900 dark:text-white flex flex-col items-center justify-center">
      
      {/* CSS checkmark animation styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .checkmark {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: block;
          stroke-width: 2;
          stroke: #22c55e;
          stroke-miterlimit: 10;
          box-shadow: inset 0px 0px 0px #22c55e;
          animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out 0s both;
          position: relative;
          top: 5px;
          right: 5px;
          margin: 0 auto;
        }
        .checkmark__circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 2;
          stroke-miterlimit: 10;
          stroke: #22c55e;
          fill: none;
          animation: stroke .6s cubic-bezier(0.650, 0.000, 0.450, 1.000) forwards;
        }
        .checkmark__check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: stroke .3s cubic-bezier(0.650, 0.000, 0.450, 1.000) .8s forwards;
        }
        @keyframes stroke {
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes scale {
          0%, 100% {
            transform: none;
          }
          50% {
            transform: scale3d(1.1, 1.1, 1);
          }
        }
        @keyframes fill {
          100% {
            box-shadow: inset 0px 0px 0px 40px rgba(34, 197, 94, 0.1);
          }
        }
      `}} />

      <div className="max-w-lg w-full space-y-8 text-center">
        
        {/* Celebration header */}
        <div className="space-y-4">
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-sm">
            <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
              <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">Booking Confirmed!</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
            Your pass has been generated. Show the QR code below at the entry gate.
          </p>
        </div>

        {/* QR Code Pass Card */}
        {registration?.qr_code && (
          <div className="bg-white rounded-[12px] p-6 text-center border border-slate-200 dark:border-slate-800 shadow-sm max-w-sm mx-auto space-y-4">
            <div className="flex justify-center p-2 bg-slate-50 rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={registration.qr_code}
                alt="Entry QR Code"
                className="w-48 h-48"
              />
            </div>
            
            <div className="space-y-1">
              <p className="text-slate-500 text-[10px] font-mono break-all leading-none">{registration.id}</p>
              <p className="text-slate-400 text-xs font-semibold">Entry QR Code Pass</p>
            </div>

            <a
              href={registration.qr_code}
              download={`ticket-pass-${registrationId}.png`}
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-[8px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Download Pass Image
            </a>
          </div>
        )}

        {/* Booking details card */}
        <div className="bg-white dark:bg-[#111118] rounded-[12px] border border-slate-200 dark:border-slate-800 text-left overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800/60 max-w-md mx-auto">
          {/* Attendee */}
          <div className="px-5 py-4">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Attendee Info</p>
            <p className="text-slate-900 dark:text-white font-bold text-sm">{registration?.attendee_name}</p>
            <p className="text-slate-500 text-xs mt-0.5">{registration?.attendee_email}</p>
          </div>

          {/* Event info */}
          {event && (
            <div className="px-5 py-4 space-y-2">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Event details</p>
              <div className="flex gap-3">
                {event.banner_url && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden relative shrink-0 bg-slate-105">
                    <Image src={event.banner_url} alt={event.title} fill className="object-cover" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-slate-900 dark:text-white font-bold text-sm truncate">{event.title}</p>
                  {event.start_date && (
                    <p className="text-slate-500 text-xs mt-0.5">
                      {new Date(event.start_date).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                  <p className="text-slate-500 text-xs truncate">
                    {event.venue_name || event.city}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Ticket status */}
          <div className="px-5 py-4 flex justify-between items-center text-sm">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Ticket Type</p>
              <span className="font-semibold text-slate-850 dark:text-white">{ticketType?.name || 'General Admission'}</span>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Paid</p>
              <span className="font-extrabold text-[#6C47FF]">
                {price === 0 ? 'Free' : `₹${totalAmount.toLocaleString('en-IN')}`}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
          <Link
            href="/dashboard"
            className="flex-1 py-3 rounded-[8px] bg-[#6C47FF] hover:bg-[#6C47FF]/90 text-white font-bold text-sm text-center shadow-md shadow-[#6C47FF]/10 transition-colors"
          >
            View My Tickets
          </Link>
          <Link
            href="/events"
            className="flex-1 py-3 rounded-[8px] bg-white hover:bg-slate-100 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-850 dark:text-slate-200 font-bold text-sm text-center transition-colors border border-slate-200 dark:border-slate-850"
          >
            Back to Events
          </Link>
        </div>

      </div>
    </main>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0F] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#6C47FF] animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
