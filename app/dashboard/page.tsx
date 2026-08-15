import { createClient } from '../../supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Ticket, CalendarDays, Wallet, ArrowRight, Search, Clock, MapPin, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { ClientGreeting } from './ClientGreeting';
import MagicBento from '@/components/ui/MagicBento';

export default async function DashboardOverview() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const userName = profile?.full_name?.split(' ')[0] || 'User';

  // Fetch stats and upcoming events
  // We'll join registrations with events to get the event details
  // Fetch registrations and their respective orders
  const { data: registrations, error: regError } = await supabase
    .from('registrations')
    .select('id, attendance_status, created_at, order_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (regError) {
    console.error("Error fetching registrations:", regError);
  }

  // Get unique order IDs
  const orderIds = registrations ? Array.from(new Set(registrations.map(r => r.order_id))) : [];

  let eventsMap: Record<string, any> = {};

  if (orderIds.length > 0) {
    const { data: orders } = await supabase
      .from('orders')
      .select('id, event_id')
      .in('id', orderIds);
    
    if (orders && orders.length > 0) {
      const eventIds = Array.from(new Set(orders.map(o => o.event_id)));
      
      if (eventIds.length > 0) {
        const { data: events, error: evError } = await supabase
          .from('events')
          .select('id, title, date:start_date, location:venue_name, image_url:banner_url')
          .in('id', eventIds);
          
        if (evError) console.error("Error fetching events:", evError);
          
        if (events) {
          eventsMap = events.reduce((acc, ev) => {
            acc[ev.id] = ev;
            return acc;
          }, {});
        }
      }
      
      // Attach events to registrations via order
      if (registrations) {
        registrations.forEach(reg => {
          const order = orders.find(o => o.id === reg.order_id);
          if (order && eventsMap[order.event_id]) {
            (reg as any).events = eventsMap[order.event_id];
          }
        });
      }
    }
  }

  const totalTickets = registrations?.length || 0;
  
  // Filter for upcoming (assuming date is in future)
  const now = new Date();
  const upcomingRegistrations = (registrations || []).filter(reg => {
    const event = (reg as any).events;
    if (!event || !event.date) return false;
    const eventDate = new Date(event.date);
    return eventDate >= now;
  });

  const upcomingCount = upcomingRegistrations.length;
  // Take next 3 upcoming
  const nextThreeEvents = upcomingRegistrations
    .sort((a, b) => {
      const eventA = (a as any).events;
      const eventB = (b as any).events;
      return new Date(eventA.date).getTime() - new Date(eventB.date).getTime();
    })
    .slice(0, 3);

  // Wallet balance (mock for now, or fetch from wallet table if exists)
  let walletBalance = 0;
  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance')
    .eq('user_id', user.id)
    .single();
  if (wallet) {
    walletBalance = wallet.balance || 0;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-slate-800/60 rounded-2xl p-8 relative overflow-hidden">
        <div className="relative z-10">
          <ClientGreeting userName={userName} />
          <p className="text-slate-400 max-w-xl">
            Welcome to your personal dashboard. Track your upcoming events, manage your tickets, and discover new experiences.
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-[#6C47FF]/20 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Quick Actions & Stats Bento */}
      <MagicBento 
        textAutoHide={false}
        enableStars
        enableSpotlight
        enableBorderGlow={true}
        enableTilt={true}
        enableMagnetism={true}
        clickEffect
        spotlightRadius={400}
        particleCount={12}
        glowColor="108, 71, 255"
        disableAnimations={false}
        cards={[
          {
            color: '#111118',
            title: 'Upcoming Events',
            description: `${upcomingCount} events registered`,
            label: 'Stats'
          },
          {
            color: '#111118',
            title: 'Total Tickets',
            description: `${totalTickets} passes secured`,
            label: 'Stats'
          },
          {
            color: '#111118',
            title: 'Wallet Balance',
            description: `₹${walletBalance} available`,
            label: 'Wallet'
          },
          {
            color: '#111118',
            title: 'Browse Events',
            description: 'Discover new experiences in your city',
            label: 'Quick Action'
          },
          {
            color: '#111118',
            title: 'My Tickets',
            description: 'View and download your digital passes',
            label: 'Quick Action'
          },
          {
            color: '#111118',
            title: 'Profile Settings',
            description: 'Manage your account details',
            label: 'Quick Action'
          }
        ]}
      />

      {/* Upcoming Events List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Your Next Events</h2>
          <Link href="/dashboard/tickets" className="text-sm font-bold text-[#6C47FF] hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {nextThreeEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {nextThreeEvents.map((reg: any) => {
              const event = Array.isArray(reg.events) ? reg.events[0] : reg.events;
              return (
              <Link href={`/dashboard/tickets/${reg.id}`} key={reg.id} className="block group">
                <Card className="bg-[#111118] border-slate-800/60 h-full overflow-hidden hover:border-[#6C47FF]/50 transition-colors">
                  <div className="h-32 w-full overflow-hidden bg-slate-900 relative">
                    {event?.image_url ? (
                      <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-900/80 to-purple-900/80 flex flex-col items-center justify-center p-4 text-center">
                        <CalendarDays className="w-8 h-8 text-indigo-300 mb-2 opacity-80" />
                        <span className="text-white text-xs font-semibold opacity-90 line-clamp-2">{event?.title || 'Event Pass'}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111118] to-transparent opacity-80" />
                  </div>
                  <CardContent className="p-5 -mt-6 relative z-10">
                    <h3 className="font-bold text-white text-lg line-clamp-1 mb-3 group-hover:text-[#6C47FF] transition-colors">{event?.title}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <CalendarDays className="w-4 h-4 shrink-0" />
                        <span>{event?.date ? new Date(event.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : ''}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="truncate">{event?.location}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )})}
          </div>
        ) : (
          <Card className="bg-[#111118] border-slate-800/60 border-dashed">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No upcoming events</h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">You don't have any upcoming event registrations. Discover amazing events happening near you!</p>
              <Link href="/events">
                <button className="bg-[#6C47FF] hover:bg-[#6C47FF]/90 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-colors">
                  Explore Events
                </button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
