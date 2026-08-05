import { createClient } from '../../supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Ticket, CalendarDays, Wallet, ArrowRight, Search, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  // Determine greeting based on server time
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';

  // Fetch stats and upcoming events
  // We'll join registrations with events to get the event details
  const { data: registrations } = await supabase
    .from('registrations')
    .select(`
      id,
      status,
      created_at,
      events (
        id,
        title,
        date,
        time,
        location,
        image_url
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const totalTickets = registrations?.length || 0;
  
  // Filter for upcoming (assuming date is in future)
  const now = new Date();
  const upcomingRegistrations = (registrations || []).filter(reg => {
    const event = Array.isArray(reg.events) ? reg.events[0] : reg.events;
    if (!event || !event.date) return false;
    const eventDate = new Date(event.date);
    return eventDate >= now;
  });

  const upcomingCount = upcomingRegistrations.length;
  // Take next 3 upcoming
  const nextThreeEvents = upcomingRegistrations
    .sort((a, b) => {
      const eventA = Array.isArray(a.events) ? a.events[0] : a.events;
      const eventB = Array.isArray(b.events) ? b.events[0] : b.events;
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
          <h1 className="text-3xl font-extrabold text-white mb-2">
            {greeting}, {userName}! 👋
          </h1>
          <p className="text-slate-400 max-w-xl">
            Welcome to your personal dashboard. Track your upcoming events, manage your tickets, and discover new experiences.
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-[#6C47FF]/20 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/events" className="flex flex-col items-center justify-center p-4 bg-[#111118] border border-slate-800/60 rounded-xl hover:bg-slate-800/40 transition-colors group">
          <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Search className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-slate-300">Browse Events</span>
        </Link>
        <Link href="/dashboard/tickets" className="flex flex-col items-center justify-center p-4 bg-[#111118] border border-slate-800/60 rounded-xl hover:bg-slate-800/40 transition-colors group">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Ticket className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-slate-300">My Tickets</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#111118] border-slate-800/60">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Upcoming</p>
                <p className="text-3xl font-extrabold text-white">{upcomingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111118] border-slate-800/60">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Tickets</p>
                <p className="text-3xl font-extrabold text-white">{totalTickets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111118] border-slate-800/60">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Wallet Balance</p>
                <p className="text-3xl font-extrabold text-white">₹{walletBalance}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
            {nextThreeEvents.map((reg) => {
              const event = Array.isArray(reg.events) ? reg.events[0] : reg.events;
              return (
              <Link href={`/dashboard/tickets/${reg.id}`} key={reg.id} className="block group">
                <Card className="bg-[#111118] border-slate-800/60 h-full overflow-hidden hover:border-[#6C47FF]/50 transition-colors">
                  <div className="h-32 w-full overflow-hidden bg-slate-900 relative">
                    {event?.image_url ? (
                      <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-white/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111118] to-transparent opacity-80" />
                  </div>
                  <CardContent className="p-5 -mt-6 relative z-10">
                    <h3 className="font-bold text-white text-lg line-clamp-1 mb-3 group-hover:text-[#6C47FF] transition-colors">{event?.title}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <CalendarDays className="w-4 h-4 shrink-0" />
                        <span>{event?.date ? new Date(event.date).toLocaleDateString() : ''} at {event?.time}</span>
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
