import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const SYSTEM_PROMPT = `You are Sparky, the friendly AI assistant for EventSpark, a modern real-time event management platform.
Your goal is to help users find events, check prices, or manage their organizer dashboard.
Keep your answers helpful, concise, and friendly. Use emojis occasionally.

IMPORTANT RULES:
- You have access to LIVE event data from the EventSpark database (provided below).
- ALWAYS use the live event data to answer questions about events, prices, cities, dates, categories, venues, etc.
- If a user asks about ticket prices, look at the ticket_types data and give specific prices in ₹ (INR).
- If a user asks about events in a specific city, filter the data and respond with matching events only.
- If a user asks "how many events", count the events from the data provided.
- If a user asks about the cheapest/lowest ticket, find the minimum price from ticket_types across all events (or in the requested city).
- When users ask about organizing, tell them they can create events easily from the Organizer Dashboard.
- For questions unrelated to events (like general greetings), respond naturally as a friendly assistant.
- Never say "I don't have that information" if the answer is available in the live data below.
- Format your responses nicely with line breaks and emojis for readability.
`;

// Create a lightweight Supabase client for reading public event data (no cookies needed)
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: Request) {
  // Validate API key
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is missing');
    return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
  }

  // Initialize Gemini client
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const { messages } = await req.json();
    console.log('Received messages:', JSON.stringify(messages, null, 2));

    // Always fetch live event data from Supabase
    const supabase = getSupabase();

    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title, description, start_date, end_date, city, venue_name, category, status, ticket_types(name, price, description, quantity_total, quantity_sold)')
      .eq('status', 'published')
      .order('start_date', { ascending: true })
      .limit(20);

    if (eventsError) {
      console.error('Supabase events fetch error:', eventsError.message);
    }

    console.log(`Fetched ${events?.length ?? 0} events from Supabase`);

    // Build a rich context string from the live data
    let siteDataContext = '';
    if (events && events.length > 0) {
      const eventSummaries = events.map((e: any) => {
        const tickets = e.ticket_types?.length
          ? e.ticket_types.map((t: any) => {
              const available = (t.quantity_total || 0) - (t.quantity_sold || 0);
              return `${t.name}: ₹${t.price} (${available} seats left of ${t.quantity_total})`;
            }).join(' | ')
          : 'Free event';
        const startDate = new Date(e.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        const desc = e.description ? e.description.substring(0, 120) : 'No description';
        return `EVENT: "${e.title}" | Date: ${startDate} | City: ${e.city} | Venue: ${e.venue_name || 'TBA'} | Category: ${e.category || 'General'} | Tickets: [${tickets}] | About: ${desc}`;
      });

      siteDataContext = `

--- LIVE EVENTSPARK DATABASE (${events.length} published events as of now) ---
${eventSummaries.join('\n')}
--- END OF LIVE DATA ---

Use ONLY the above data to answer event-related questions. Do NOT make up events or prices.`;
    } else {
      siteDataContext = `

--- LIVE EVENTSPARK DATABASE ---
No published events found at this time.
--- END OF LIVE DATA ---`;
    }

    // Map chat messages to Gemini format (only real user/assistant turns)
    const contents = messages
      .filter((m: any) => m.role === 'user' || m.role === 'assistant')
      .map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

    console.log('Sending to Gemini with', contents.length, 'messages and', events?.length ?? 0, 'events as context');

    // Send to Gemini with system prompt + live site data
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT + siteDataContext }] },
        { role: 'model', parts: [{ text: 'Got it! I have the live EventSpark data loaded. I will use it to answer all questions accurately. ⚡' }] },
        ...contents
      ]
    });

    const reply = response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
    const safeReply = reply || "🤖 I'm here, but I couldn't generate a response right now. Try rephrasing your question!";
    console.log('Gemini reply:', safeReply.substring(0, 200));
    return NextResponse.json({ message: safeReply });
  } catch (error: any) {
    console.error('Chat API Error:', error?.message || error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
