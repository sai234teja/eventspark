'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

const createClient = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
import { ChevronLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';

type TicketType = {
  id?: string;
  name: string;
  price: string;
  quantity_total: string;
  description: string;
};

type FormData = {
  title: string;
  description: string;
  category: string;
  city: string;
  venue_name: string;
  venue_address: string;
  banner_url: string;
  start_date: string;
  end_date: string;
  status: string;
  ticket_types: TicketType[];
};

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [form, setForm] = useState<FormData | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      // Fetch categories
      const { data: cats } = await supabase.from('categories').select('id, name');
      if (cats) setCategories(cats);

      // Fetch event
      const { data: event, error: eventErr } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventErr || !event) {
        setError('Event not found or you do not have permission to edit it.');
        setLoading(false);
        return;
      }

      // Fetch ticket types
      const { data: tickets } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', eventId);

      const ticketRows: TicketType[] = (tickets || []).map(t => ({
        id: t.id,
        name: t.name,
        price: String(t.price ?? 0),
        quantity_total: String(t.quantity_total ?? 0),
        description: t.description || '',
      }));

      setForm({
        title: event.title || '',
        description: event.description || '',
        category: event.category || '',
        city: event.city || '',
        venue_name: event.venue_name || '',
        venue_address: event.venue_address || '',
        banner_url: event.banner_url || '',
        start_date: event.start_date ? event.start_date.slice(0, 16) : '',
        end_date: event.end_date ? event.end_date.slice(0, 16) : '',
        status: event.status || 'draft',
        ticket_types: ticketRows.length > 0 ? ticketRows : [{ name: '', price: '0', quantity_total: '100', description: '' }],
      });

      setLoading(false);
    }

    load();
  }, [eventId]);

  const updateForm = (updates: Partial<FormData>) => {
    setForm(prev => prev ? { ...prev, ...updates } : prev);
  };

  const updateTicket = (index: number, updates: Partial<TicketType>) => {
    if (!form) return;
    const updated = form.ticket_types.map((t, i) => i === index ? { ...t, ...updates } : t);
    updateForm({ ticket_types: updated });
  };

  const addTicket = () => {
    if (!form || form.ticket_types.length >= 10) return;
    updateForm({ ticket_types: [...form.ticket_types, { name: '', price: '0', quantity_total: '100', description: '' }] });
  };

  const removeTicket = (index: number) => {
    if (!form || form.ticket_types.length <= 1) return;
    updateForm({ ticket_types: form.ticket_types.filter((_, i) => i !== index) });
  };

  const handleSubmit = async () => {
    if (!form) return;
    setSubmitting(true);
    setError('');
    setSuccess('');

    const supabase = createClient();

    // Update event
    const { error: updateErr } = await supabase
      .from('events')
      .update({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        city: form.city.trim(),
        venue_name: form.venue_name.trim(),
        venue_address: form.venue_address.trim(),
        banner_url: form.banner_url.trim() || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        status: form.status,
      })
      .eq('id', eventId);

    if (updateErr) {
      setError(updateErr.message);
      setSubmitting(false);
      return;
    }

    // Delete existing ticket types and re-insert
    await supabase.from('ticket_types').delete().eq('event_id', eventId);

    const ticketInserts = form.ticket_types.map(t => ({
      event_id: eventId,
      name: t.name.trim(),
      price: parseFloat(t.price) || 0,
      quantity_total: parseInt(t.quantity_total) || 0,
      description: t.description.trim() || null,
    }));

    const { error: ticketErr } = await supabase.from('ticket_types').insert(ticketInserts);

    if (ticketErr) {
      setError(`Event updated but ticket types failed: ${ticketErr.message}`);
    } else {
      setSuccess('Event updated successfully!');
      setTimeout(() => router.push('/organizer/events'), 1500);
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center text-red-400 py-12">
        <p>{error || 'Event not found.'}</p>
        <Link href="/organizer/events" className="text-indigo-400 hover:underline mt-4 block">
          ← Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/organizer/events" className="text-slate-400 hover:text-white">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Edit Event</h1>
          <p className="text-slate-400 mt-0.5 text-sm">ID: {eventId}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-900/30 text-red-400 text-sm border border-red-800">{error}</div>
      )}
      {success && (
        <div className="p-4 rounded-lg bg-emerald-900/30 text-emerald-400 text-sm border border-emerald-800">{success}</div>
      )}

      {/* Event Details */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-5">
        <h2 className="text-base font-semibold text-white border-b border-slate-700 pb-3">Event Details</h2>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-300">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={e => updateForm({ title: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-300">Description</label>
          <textarea
            value={form.description}
            onChange={e => updateForm({ description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-300">Category</label>
            <select
              value={form.category}
              onChange={e => updateForm({ category: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-300">City</label>
            <input
              type="text"
              value={form.city}
              onChange={e => updateForm({ city: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-300">Status</label>
          <select
            value={form.status}
            onChange={e => updateForm({ status: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-300">Banner Image URL</label>
          <input
            type="url"
            value={form.banner_url}
            onChange={e => updateForm({ banner_url: e.target.value })}
            placeholder="https://..."
            className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Venue & Dates */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-5">
        <h2 className="text-base font-semibold text-white border-b border-slate-700 pb-3">Venue & Dates</h2>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-300">Venue Name</label>
          <input
            type="text"
            value={form.venue_name}
            onChange={e => updateForm({ venue_name: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-300">Venue Address</label>
          <input
            type="text"
            value={form.venue_address}
            onChange={e => updateForm({ venue_address: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-300">Start Date</label>
            <input
              type="datetime-local"
              value={form.start_date}
              onChange={e => updateForm({ start_date: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-300">End Date</label>
            <input
              type="datetime-local"
              value={form.end_date}
              onChange={e => updateForm({ end_date: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Ticket Types */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-5">
        <h2 className="text-base font-semibold text-white border-b border-slate-700 pb-3">Ticket Types</h2>
        <p className="text-slate-400 text-sm -mt-2">Saving will replace all existing ticket types for this event.</p>
        <div className="space-y-4">
          {form.ticket_types.map((ticket, index) => (
            <div key={index} className="bg-slate-900 rounded-xl p-4 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Ticket {index + 1}</span>
                {form.ticket_types.length > 1 && (
                  <button onClick={() => removeTicket(index)} className="text-red-400 hover:text-red-300">
                    <span className="text-xs">Remove</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Name *</label>
                  <input
                    type="text"
                    value={ticket.name}
                    onChange={e => updateTicket(index, { name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={ticket.price}
                    onChange={e => updateTicket(index, { price: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={ticket.quantity_total}
                    onChange={e => updateTicket(index, { quantity_total: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Description</label>
                <input
                  type="text"
                  value={ticket.description}
                  onChange={e => updateTicket(index, { description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          ))}
        </div>
        {form.ticket_types.length < 10 && (
          <button
            onClick={addTicket}
            className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            + Add Ticket Type
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Link
          href="/organizer/events"
          className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          Cancel
        </Link>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-40"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {submitting ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
