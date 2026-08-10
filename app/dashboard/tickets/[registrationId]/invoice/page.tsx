'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Loader2, ArrowLeft, Printer, Building2, MapPin, Mail, Phone, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { BrandLogo } from '@/components/ui/BrandLogo';

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const registrationId = params.registrationId as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!registrationId) return;

    async function loadData() {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (!user || userErr) {
        router.replace('/auth/login');
        return;
      }

      // Fetch registration
      const { data: reg, error: regErr } = await supabase
        .from('registrations')
        .select('*')
        .eq('id', registrationId)
        .single();

      if (regErr || !reg) {
        setError('Invoice not found or access denied.');
        setLoading(false);
        return;
      }

      if (reg.user_id !== user.id) {
        setError('Access denied. You do not own this invoice.');
        setLoading(false);
        return;
      }

      // Fetch order
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('id', reg.order_id)
        .single();

      // Fetch ticket type
      const { data: ticketType } = await supabase
        .from('ticket_types')
        .select('name, price')
        .eq('id', reg.ticket_type_id)
        .single();

      // Fetch event
      let event = null;
      if (order?.event_id) {
        const { data: ev } = await supabase
          .from('events')
          .select('title, start_date, venue_name, city')
          .eq('id', order.event_id)
          .single();
        event = ev;
      }

      // Fetch payment
      const { data: payment } = await supabase
        .from('payments')
        .select('amount, payment_method, provider_reference, created_at, status')
        .eq('registration_id', registrationId)
        .single();

      setData({
        registration: reg,
        order,
        ticketType,
        event,
        payment,
      });
      setLoading(false);
    }

    loadData();
  }, [registrationId, router]);

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

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-center p-4">
        <div>
          <p className="text-red-400 text-lg mb-4">{error || 'Invoice not found.'}</p>
          <Link href={`/dashboard/tickets/${registrationId}`} className="text-indigo-450 hover:underline">
            ← Back to Ticket
          </Link>
        </div>
      </div>
    );
  }

  const { registration, order, ticketType, event, payment } = data;
  const invoiceDate = payment?.created_at || order?.created_at || registration.created_at;
  const invoiceNumber = `INV-${(payment?.provider_reference || registrationId).substring(0, 8).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 pb-16 print:bg-white print:text-black">
      {/* Header Nav - Hide on Print */}
      <nav className="px-6 py-4 border-b border-slate-805 bg-slate-950 sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <BrandLogo />
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm transition-colors"
            >
              <Printer className="w-4 h-4" /> Print Invoice
            </button>
            <Link href={`/dashboard/tickets/${registrationId}`} className="text-sm font-medium text-slate-400 flex items-center hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Invoice Paper Layout */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 md:p-12 shadow-2xl print:bg-white print:border-none print:shadow-none print:p-0">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-800 pb-8 mb-8 print:border-slate-300">
            <div>
              <div className="text-3xl font-extrabold text-white mb-1 print:text-black tracking-tight">EventSpark</div>
              <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-2 print:text-slate-700">
                <Building2 className="w-4 h-4" /> EventSpark Platforms Inc.
              </p>
              <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1 print:text-slate-700">
                <Mail className="w-4 h-4" /> billing@eventspark.com
              </p>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-slate-100 print:text-black">INVOICE</h1>
              <p className="text-sm text-slate-500 mt-2 print:text-slate-700 font-mono">#{invoiceNumber}</p>
              <p className="text-sm text-slate-500 mt-1 print:text-slate-700">
                Date: {new Date(invoiceDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Billing Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 print:text-slate-500">Billed To</p>
              <p className="text-base font-semibold text-white print:text-black">{registration.attendee_name}</p>
              <p className="text-sm text-slate-400 mt-1 print:text-slate-800">{registration.attendee_email}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 print:text-slate-500">Event Details</p>
              <p className="text-base font-semibold text-white print:text-black">{event?.title || 'Event Pass'}</p>
              <p className="text-sm text-slate-400 mt-1 flex items-center gap-1.5 print:text-slate-800">
                <CalendarDays className="w-3.5 h-3.5" />
                {event?.start_date ? new Date(event.start_date).toLocaleDateString() : 'TBA'}
              </p>
              <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-1.5 print:text-slate-800">
                <MapPin className="w-3.5 h-3.5" />
                {event?.venue_name}, {event?.city}
              </p>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-800 print:border-slate-300 text-sm text-slate-400 print:text-slate-500">
                  <th className="pb-3 font-semibold uppercase">Description</th>
                  <th className="pb-3 font-semibold uppercase text-center">Qty</th>
                  <th className="pb-3 font-semibold uppercase text-right">Price</th>
                  <th className="pb-3 font-semibold uppercase text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-white print:text-black">
                <tr className="border-b border-slate-800/50 print:border-slate-200">
                  <td className="py-4">
                    <p className="font-medium">{ticketType?.name || 'General Admission'} Ticket</p>
                    <p className="text-xs text-slate-500 mt-1 print:text-slate-600">Ticket ID: {registrationId.split('-')[0]}</p>
                  </td>
                  <td className="py-4 text-center">1</td>
                  <td className="py-4 text-right">₹{Number(order?.total_amount || ticketType?.price || 0).toLocaleString('en-IN')}</td>
                  <td className="py-4 text-right font-medium">₹{Number(order?.total_amount || ticketType?.price || 0).toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-full max-w-sm space-y-3">
              <div className="flex justify-between text-sm text-slate-400 print:text-slate-600">
                <span>Subtotal</span>
                <span>₹{Number(order?.total_amount || ticketType?.price || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-400 print:text-slate-600">
                <span>Tax (0%)</span>
                <span>₹0</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-white pt-3 border-t border-slate-800 print:text-black print:border-slate-300">
                <span>Total</span>
                <span>₹{Number(order?.total_amount || ticketType?.price || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="border-t border-slate-800 pt-8 print:border-slate-300">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 print:text-slate-500">Payment Status</p>
            <div className="flex gap-2 items-center">
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${payment?.status === 'completed' || order?.status === 'completed' || order?.status === 'paid' ? 'bg-emerald-900/40 text-emerald-400 print:bg-transparent print:text-black print:border print:border-black' : 'bg-amber-900/40 text-amber-400 print:bg-transparent print:text-black print:border print:border-black'}`}>
                {payment?.status === 'completed' || order?.status === 'completed' || order?.status === 'paid' ? 'PAID' : 'PENDING'}
              </span>
              <span className="text-sm text-slate-400 print:text-slate-600">
                via {payment?.payment_method || 'Online'}
              </span>
            </div>
            {payment?.provider_reference && (
              <p className="text-xs text-slate-500 mt-2 print:text-slate-600 font-mono">
                Txn ID: {payment.provider_reference}
              </p>
            )}
          </div>
          
          <div className="mt-12 text-center text-xs text-slate-600 print:text-slate-400">
            <p>Thank you for choosing EventSpark. If you have any questions about this invoice, please contact support@eventspark.com.</p>
          </div>

        </div>
      </main>
    </div>
  );
}
