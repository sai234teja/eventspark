'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import Image from 'next/image';
import { Ticket, Calendar, MapPin, Loader2, ArrowLeft, Receipt } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';

export default function MyTicketsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payments, setPayments] = useState<any[]>([]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchTickets() {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (!user || userErr) {
        setLoading(false);
        return;
      }

      // Fetch registrations for user and fetch related tables
      const { data, error: fetchErr } = await supabase
        .from('registrations')
        .select('id, attendee_name, attendee_email, qr_code, attendance_status, ticket_type_id, order_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchErr) {
        console.error('Fetch tickets error:', fetchErr);
        setError('Failed to load tickets.');
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setRegistrations([]);
        setLoading(false);
        return;
      }

      // Fetch transaction history
      const { data: paymentsData, error: paymentsErr } = await supabase
        .from('payments')
        .select('id, amount, currency, status, payment_method, created_at, provider_reference')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (!paymentsErr && paymentsData) {
        setPayments(paymentsData);
      }

      // Fetch orders and ticket types and events manually to avoid complex RLS JOIN errors
      try {
        const ticketsWithDetails = await Promise.all(
          data.map(async (reg: any) => {
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
                .select('title, start_date, venue_name, city, banner_url')
                .eq('id', order.event_id)
                .single();
              event = ev;
            }

            return {
              ...reg,
              order,
              ticketType,
              event,
            };
          })
        );
        setRegistrations(ticketsWithDetails);
      } catch (err) {
        console.error(err);
        setError('Error mapping ticket details.');
      }
      setLoading(false);
    }

    fetchTickets();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-12">
      {/* Header Nav */}
      <nav className="px-6 py-4 border-b border-slate-800 bg-slate-950 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <BrandLogo />
          <Link href="/dashboard" className="text-sm font-medium text-slate-400 flex items-center hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Ticket className="h-8 w-8 text-indigo-400" /> My Tickets
          </h1>
          <p className="text-slate-400 mt-1">Here are all your booked event tickets and passes.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-5 text-red-400 text-sm">
            {error}
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center bg-slate-900/50 border border-slate-850 rounded-2xl p-16 space-y-4">
            <Ticket className="h-12 w-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-semibold text-white">No tickets booked yet</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              Browse our current events and book your seats to get your entry passes here!
            </p>
            <div className="pt-2">
              <Link href="/events" className="inline-flex px-5 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium text-sm transition-colors">
                Browse Events
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {registrations.map(reg => {
              const event = reg.event;
              const ticketType = reg.ticketType;
              const order = reg.order;

              return (
                <div key={reg.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-colors">
                  <div className="p-5 flex gap-4">
                    {event?.banner_url && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden relative shrink-0 bg-slate-800">
                        <Image src={event.banner_url} alt={event?.title || 'Event Banner'} fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white truncate text-base">{event?.title || 'Event'}</h4>
                      <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {event?.start_date ? new Date(event.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'}
                      </p>
                      <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {event?.venue_name || event?.city || 'TBA'}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-450 font-medium block">{ticketType?.name || 'Ticket'}</span>
                      <span className="text-slate-500 font-medium">
                        {order?.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                    <div>
                      <Link href={`/dashboard/tickets/${reg.id}`}>
                        <button className="px-3.5 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white font-semibold transition-all">
                          View Ticket
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Transaction History Section */}
        <div className="mt-16 border-t border-slate-800 pt-10">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
            <Receipt className="h-6 w-6 text-indigo-400" /> Transaction History
          </h2>
          
          {payments.length === 0 ? (
            <div className="text-center py-10 bg-slate-900/30 border border-slate-800 rounded-xl">
              <p className="text-slate-500 text-sm">No transaction history found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium rounded-tl-lg">Date</th>
                    <th className="px-4 py-3 font-medium">Transaction ID</th>
                    <th className="px-4 py-3 font-medium">Method</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium rounded-tr-lg">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                  {payments.map(payment => (
                    <tr key={payment.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        {new Date(payment.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-slate-400">
                        {payment.provider_reference || payment.id.split('-')[0]}
                      </td>
                      <td className="px-4 py-4 capitalize">
                        {payment.payment_method || 'Card/UPI'}
                      </td>
                      <td className="px-4 py-4 font-medium text-white">
                        {payment.currency === 'INR' ? '₹' : payment.currency}{payment.amount}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          payment.status === 'completed' || payment.status === 'paid' || payment.status === 'successful'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : payment.status === 'failed'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
