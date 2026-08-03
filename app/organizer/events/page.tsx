'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

const createClient = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { CalendarDays, PlusCircle, Pencil, Trash2, Globe, FileText } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  published: 'bg-emerald-900/50 text-emerald-400 border border-emerald-800',
  draft: 'bg-slate-700 text-slate-300 border border-slate-600',
  cancelled: 'bg-red-900/50 text-red-400 border border-red-800',
};

export default function OrganizerEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEvents = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('events')
      .select('id, title, slug, status, start_date, category, city')
      .eq('organizer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch events error:', error);
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    const supabase = createClient();
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', deleteTarget.id);

    if (error) {
      console.error('Delete error:', error);
      alert(`Failed to delete: ${error.message}`);
    } else {
      setEvents(prev => prev.filter(e => e.id !== deleteTarget.id));
    }

    setDeleting(false);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Events</h1>
          <p className="text-slate-400 mt-1">Manage all your events.</p>
        </div>
        <Link
          href="/organizer/events/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle className="h-4 w-4" /> New Event
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-slate-800 rounded-xl border border-dashed border-slate-700 p-14 text-center">
          <CalendarDays className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No events yet.</p>
          <p className="text-slate-600 text-sm mt-1">Create your first event to get started.</p>
          <Link
            href="/organizer/events/new"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
          >
            <PlusCircle className="h-4 w-4" /> Create Event
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(event => (
            <div
              key={event.id}
              className="bg-slate-800 rounded-xl border border-slate-700 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="font-semibold text-white truncate">{event.title}</p>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[event.status] || STATUS_STYLES.draft}`}>
                    {event.status}
                  </span>
                </div>
                <p className="text-slate-500 text-sm mt-1">
                  {event.start_date
                    ? new Date(event.start_date).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })
                    : 'No date set'}
                  {event.city && ` · ${event.city}`}
                  {event.category && ` · ${event.category}`}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {event.slug && (
                  <Link
                    href={`/events/${event.slug}`}
                    target="_blank"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <Globe className="h-4 w-4" /> View
                  </Link>
                )}
                <Link
                  href={`/organizer/events/${event.id}/edit`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-indigo-400 hover:text-white hover:bg-indigo-700 transition-colors"
                >
                  <Pencil className="h-4 w-4" /> Edit
                </Link>
                <button
                  onClick={() => setDeleteTarget({ id: event.id, title: event.title })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-400 hover:text-white hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Event"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone and will also remove all associated ticket types.`}
        confirmText="Delete Event"
        isDestructive
        isLoading={deleting}
      />
    </div>
  );
}
