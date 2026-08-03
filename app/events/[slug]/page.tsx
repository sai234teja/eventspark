import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '../../../supabase/server';
import { Calendar, MapPin, Building, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { TicketBookingWidget } from './TicketBookingWidget';

import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { slug } = params;

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !event) {
    notFound();
  }

  // Fetch ticket types for this event
  const { data: ticketTypes } = await supabase
    .from('ticket_types')
    .select('id, name, price, quantity_total, quantity_sold, description')
    .eq('event_id', event.id)
    .order('price', { ascending: true });

  const { data: { session } } = await supabase.auth.getSession();

  const mapQuery = encodeURIComponent(event.venue_address || event.city || '');
  const mapUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0A0A0F] text-slate-900 dark:text-white pb-20">
      {/* Nav */}
      <nav className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#0A0A0F]/70 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <BrandLogo />
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/events" className="text-sm font-semibold text-slate-650 dark:text-slate-350 hover:text-[#6C47FF] dark:hover:text-[#6C47FF] transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2 inline" /> Back to Events
            </Link>
          </div>
        </div>
      </nav>

      {/* Banner Hero */}
      <div className="w-full h-[400px] relative bg-slate-900">
        <Image
          src={event.banner_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80"}
          alt={event.title}
          fill
          priority
          className="object-cover opacity-60 dark:opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full px-6 pb-12">
          <div className="max-w-5xl mx-auto space-y-4">
            <Badge className="bg-[#6C47FF] hover:bg-[#6C47FF]/90 text-white border-none px-3.5 py-1 text-xs font-semibold rounded-[24px] uppercase tracking-wider">
              {event.category}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-10">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2.5">
              About this event
            </h2>
            <p className="text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
              {event.description}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2.5">
              Location
            </h2>
            <div className="rounded-[12px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm h-[300px] md:h-[380px]">
              <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </section>
        </div>

        {/* Sidebar - Sticky on Desktop */}
        <div className="space-y-6">
          {/* Event meta card */}
          <div className="bg-white dark:bg-[#111118] rounded-[12px] border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center shrink-0 text-[#6C47FF]">
                <Calendar className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Date & Time</h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5 leading-relaxed">
                  {event.start_date ? new Date(event.start_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'TBA'}
                  {event.end_date && ` – ${new Date(event.end_date).toLocaleString('en-IN', { timeStyle: 'short' })}`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center shrink-0 text-[#6C47FF]">
                <Building className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Venue</h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">{event.venue_name || 'TBA'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center shrink-0 text-[#6C47FF]">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Address</h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">{event.venue_address || event.city}</p>
              </div>
            </div>
          </div>

          {/* Ticket booking widget (client component) */}
          <div className="sticky top-28">
            <TicketBookingWidget
              event={event}
              ticketTypes={ticketTypes || []}
              isLoggedIn={!!session}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
