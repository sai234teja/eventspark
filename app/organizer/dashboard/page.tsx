import { createClient } from '../../../supabase/server';
import Link from 'next/link';
import { CalendarDays, Ticket, Clock, PlusCircle, ArrowUpRight } from 'lucide-react';

export default async function OrganizerDashboardPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div className="text-slate-400 font-semibold">Not authenticated.</div>;
  }

  // Fetch organizer's events
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('id, title, status, start_date, category')
    .eq('organizer_id', user.id)
    .order('created_at', { ascending: false });

  if (eventsError) {
    console.error('Dashboard events error:', eventsError);
  }

  const allEvents = events || [];
  const publishedCount = allEvents.filter(e => e.status === 'published').length;
  const now = new Date();
  const upcomingEvents = allEvents
    .filter(e => e.status === 'published' && e.start_date && new Date(e.start_date) > now)
    .slice(0, 5);

  // Count ticket types across all events
  const eventIds = allEvents.map(e => e.id);
  let ticketTypeCount = 0;
  if (eventIds.length > 0) {
    const { count } = await supabase
      .from('ticket_types')
      .select('id', { count: 'exact', head: true })
      .in('event_id', eventIds);
    ticketTypeCount = count || 0;
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Dashboard</h1>
        <p className="text-slate-450 mt-1.5 text-sm">Overview of your organization and event metrics.</p>
      </div>

      {/* Summary cards with gradient backgrounds */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 rounded-[12px] p-6 border border-indigo-900/20 hover:border-indigo-500/20 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Events</p>
            <CalendarDays className="h-5 w-5 text-[#6C47FF]" />
          </div>
          <p className="text-4xl font-extrabold text-white">{allEvents.length}</p>
          <p className="text-slate-500 text-xs mt-1.5 font-medium">{publishedCount} active & published</p>
        </div>

        <div className="bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 rounded-[12px] p-6 border border-purple-900/20 hover:border-purple-500/20 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Ticket Types</p>
            <Ticket className="h-5 w-5 text-purple-400" />
          </div>
          <p className="text-4xl font-extrabold text-white">{ticketTypeCount}</p>
          <p className="text-slate-500 text-xs mt-1.5 font-medium">tiers across all events</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 rounded-[12px] p-6 border border-emerald-900/20 hover:border-emerald-500/20 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Upcoming</p>
            <Clock className="h-5 w-5 text-[#FF6B6B]" />
          </div>
          <p className="text-4xl font-extrabold text-white">{upcomingEvents.length}</p>
          <p className="text-slate-500 text-xs mt-1.5 font-medium">scheduled events ahead</p>
        </div>
      </div>

      {/* Upcoming events list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Upcoming Schedule</h2>
          <Link
            href="/organizer/events/new"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6C47FF] hover:text-[#6C47FF]/90 transition-colors"
          >
            <PlusCircle className="h-4 w-4" /> New Event
          </Link>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="bg-[#111118] rounded-[12px] border border-dashed border-slate-800 p-12 text-center space-y-4">
            <CalendarDays className="h-10 w-10 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <p className="text-slate-350 font-bold text-sm">No upcoming events yet</p>
              <p className="text-slate-500 text-xs max-w-xs mx-auto">Create and publish your first ticket tier event to get started.</p>
            </div>
            <div className="pt-2">
              <Link
                href="/organizer/events/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[#6C47FF] hover:bg-[#6C47FF]/90 text-white text-xs font-bold transition-all"
              >
                <PlusCircle className="h-4 w-4" /> Create Event
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-[#111118] border border-slate-800/80 rounded-[12px] overflow-hidden divide-y divide-slate-800/60 shadow-sm">
            {upcomingEvents.map(event => (
              <div
                key={event.id}
                className="px-5 py-4 flex items-center justify-between hover:bg-slate-800/20 transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-bold text-white text-sm">{event.title}</p>
                  <p className="text-slate-500 text-xs font-medium">
                    {event.start_date
                      ? new Date(event.start_date).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })
                      : 'Date TBA'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-2.5 py-0.5 rounded-[24px] text-[10px] font-bold uppercase tracking-wider bg-indigo-950/60 text-[#6C47FF] border border-indigo-850">
                    {event.category || 'General'}
                  </span>
                  <Link
                    href={`/organizer/events/${event.id}/edit`}
                    className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-0.5 transition-colors"
                  >
                    Edit <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
