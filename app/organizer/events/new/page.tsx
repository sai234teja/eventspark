'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

const createClient = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
import { ChevronRight, ChevronLeft, Check, Plus, Trash2, Loader2 } from 'lucide-react';

const STORAGE_KEY = 'organizer_new_event_form';

const STEPS = ['Event Details', 'Venue & Dates', 'Ticket Types', 'Review & Publish'];

type TicketType = {
  type: 'free' | 'paid';
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
  id_template_url: string;
  start_date: string;
  end_date: string;
  ticket_types: TicketType[];
};

const EMPTY_TICKET: TicketType = { type: 'paid', name: '', price: '', quantity_total: '100', description: '' };

const INITIAL_FORM: FormData = {
  title: '',
  description: '',
  category: '',
  city: '',
  venue_name: '',
  venue_address: '',
  banner_url: '',
  id_template_url: '',
  start_date: '',
  end_date: '',
  ticket_types: [{ ...EMPTY_TICKET }],
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function NewEventPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load persisted form from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setForm(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Fetch categories for dropdown
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('categories')
      .select('id, name, slug')
      .then(({ data }) => { if (data) setCategories(data); });
  }, []);

  // Persist form to localStorage on every change
  const updateForm = (updates: Partial<FormData>) => {
    setForm(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const updateTicket = (index: number, updates: Partial<TicketType>) => {
    const updated = form.ticket_types.map((t, i) => i === index ? { ...t, ...updates } : t);
    updateForm({ ticket_types: updated });
  };

  const addTicket = () => {
    if (form.ticket_types.length >= 10) return;
    updateForm({ ticket_types: [...form.ticket_types, { ...EMPTY_TICKET }] });
  };

  const removeTicket = (index: number) => {
    if (form.ticket_types.length <= 1) return;
    updateForm({ ticket_types: form.ticket_types.filter((_, i) => i !== index) });
  };

  // Validation per step
  const isStepValid = () => {
    switch (step) {
      case 0:
        return form.title.trim() && form.category && form.city.trim();
      case 1:
        return form.venue_name.trim() && form.start_date && form.end_date;
      case 2:
        return form.ticket_types.every(t => t.name.trim() && parseInt(t.quantity_total) > 0);
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('You must be logged in to create events.');
      setSubmitting(false);
      return;
    }

    const slug = slugify(form.title) + '-' + Date.now();

    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        title: form.title.trim(),
        slug,
        description: form.description.trim(),
        category: form.category,
        city: form.city.trim(),
        venue_name: form.venue_name.trim(),
        venue_address: form.venue_address.trim(),
        banner_url: form.banner_url.trim() || null,
        id_template_url: form.id_template_url.trim() || null,
        start_date: form.start_date,
        end_date: form.end_date,
        organizer_id: user.id,
        status: 'published',
      })
      .select('id')
      .single();

    if (eventError || !event) {
      setError(eventError?.message || 'Failed to create event.');
      setSubmitting(false);
      return;
    }

    const ticketInserts = form.ticket_types.map(t => ({
      event_id: event.id,
      name: t.name.trim(),
      price: parseFloat(t.price) || 0,
      quantity_total: parseInt(t.quantity_total) || 0,
      description: t.description.trim() || null,
    }));

    const { error: ticketError } = await supabase
      .from('ticket_types')
      .insert(ticketInserts);

    if (ticketError) {
      setError(`Event created but ticket types failed: ${ticketError.message}`);
      setSubmitting(false);
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
    router.push('/organizer/events');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Create New Event</h1>
        <p className="text-slate-400 mt-1">Fill in the details to publish your event.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                i < step
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : i === step
                  ? 'bg-slate-900 border-indigo-500 text-indigo-400'
                  : 'bg-slate-800 border-slate-700 text-slate-600'
              }`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className="text-xs mt-1 text-slate-500 hidden sm:block whitespace-nowrap">{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 ${i < step ? 'bg-indigo-600' : 'bg-slate-700'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Form card */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-5">
        {/* Step 0: Event Details */}
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-white">{STEPS[0]}</h2>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-300">Event Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => updateForm({ title: e.target.value })}
                placeholder="e.g. Hyderabad Tech Summit 2026"
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-300">Description</label>
              <textarea
                value={form.description}
                onChange={e => updateForm({ description: e.target.value })}
                placeholder="What is this event about?"
                rows={4}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-300">Category *</label>
                <select
                  value={form.category}
                  onChange={e => updateForm({ category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-300">City *</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={e => updateForm({ city: e.target.value })}
                  placeholder="e.g. Hyderabad"
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-300">ID Pass Template URL</label>
                <input
                  type="url"
                  value={form.id_template_url}
                  onChange={e => updateForm({ id_template_url: e.target.value })}
                  placeholder="Optional background for 3D Lanyard"
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Venue & Dates */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-white">{STEPS[1]}</h2>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-300">Venue Name *</label>
              <input
                type="text"
                value={form.venue_name}
                onChange={e => updateForm({ venue_name: e.target.value })}
                placeholder="e.g. HICC Convention Center"
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-300">Venue Address (for Maps)</label>
              <input
                type="text"
                value={form.venue_address}
                onChange={e => updateForm({ venue_address: e.target.value })}
                placeholder="e.g. Novotel Hyderabad, Madhapur"
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-300">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  value={form.start_date}
                  onChange={e => updateForm({ start_date: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-300">End Date & Time *</label>
                <input
                  type="datetime-local"
                  value={form.end_date}
                  onChange={e => updateForm({ end_date: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Ticket Types */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-white">{STEPS[2]}</h2>
            <p className="text-slate-400 text-sm">Add at least 1 ticket type. Price 0 = Free.</p>
            <div className="space-y-4">
              {form.ticket_types.map((ticket, index) => (
                <div key={index} className="bg-slate-900 rounded-xl p-4 border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-400">Ticket {index + 1}</span>
                    {form.ticket_types.length > 1 && (
                      <button
                        onClick={() => removeTicket(index)}
                        className="text-red-400 hover:text-red-300 p-1 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-slate-400">Name *</label>
                      <input
                        type="text"
                        value={ticket.name}
                        onChange={e => updateTicket(index, { name: e.target.value })}
                        placeholder="e.g. General Admission"
                        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-slate-400">Type *</label>
                      <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                        <button
                          type="button"
                          onClick={() => updateTicket(index, { type: 'free', price: '0' })}
                          className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${
                            ticket.type === 'free' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Free
                        </button>
                        <button
                          type="button"
                          onClick={() => updateTicket(index, { type: 'paid', price: '' })}
                          className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${
                            ticket.type === 'paid' ? 'bg-[#6C47FF]/20 text-[#6C47FF]' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Paid
                        </button>
                      </div>
                    </div>
                    {ticket.type === 'paid' ? (
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-slate-400">Price (₹) *</label>
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          value={ticket.price}
                          onChange={e => updateTicket(index, { price: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                          placeholder="e.g. 500"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-slate-400">Price</label>
                        <div className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-emerald-400 font-bold text-sm flex items-center">
                          FREE
                        </div>
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-slate-400">Quantity *</label>
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
                    <label className="block text-xs font-medium text-slate-400">Description (optional)</label>
                    <input
                      type="text"
                      value={ticket.description}
                      onChange={e => updateTicket(index, { description: e.target.value })}
                      placeholder="e.g. Includes lunch"
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>
            {form.ticket_types.length < 10 && (
              <button
                onClick={addTicket}
                className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add Another Ticket Type
              </button>
            )}
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-white">{STEPS[3]}</h2>
            <div className="space-y-4 text-sm">
              <ReviewRow label="Title" value={form.title} />
              <ReviewRow label="Category" value={form.category} />
              <ReviewRow label="City" value={form.city} />
              {form.description && <ReviewRow label="Description" value={form.description} />}
              <ReviewRow label="Venue" value={form.venue_name} />
              {form.venue_address && <ReviewRow label="Address" value={form.venue_address} />}
              <ReviewRow
                label="Start"
                value={form.start_date ? new Date(form.start_date).toLocaleString() : '-'}
              />
              <ReviewRow
                label="End"
                value={form.end_date ? new Date(form.end_date).toLocaleString() : '-'}
              />
              <div className="border-t border-slate-700 pt-4 space-y-2">
                <p className="text-slate-400 font-medium">Ticket Types</p>
                {form.ticket_types.map((t, i) => (
                  <div key={i} className="bg-slate-900 rounded-lg px-3 py-2 flex items-center justify-between">
                    <span className="text-white">{t.name}</span>
                    <span className="text-slate-400">
                      {parseFloat(t.price) === 0 ? 'Free' : `₹${parseFloat(t.price).toFixed(2)}`}
                      {' · '}{t.quantity_total} seats
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {error && (
              <div className="p-4 rounded-lg bg-red-900/30 text-red-400 text-sm border border-red-800">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!isStepValid()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {submitting ? 'Publishing…' : 'Publish Event'}
          </button>
        )}
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 py-2 border-b border-slate-700/50 last:border-0">
      <span className="text-slate-500 w-28 shrink-0">{label}</span>
      <span className="text-white">{value || '—'}</span>
    </div>
  );
}
