import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envLocalPath, 'utf8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1]] = match[2].trim().replace(/^"|"$/g, '');
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function seed() {
  console.log("Starting event seed with correct schema...");
  
  const { data: profiles, error: profileErr } = await supabase.from('profiles').select('*').limit(1);
  if (profileErr) {
    console.error("Error fetching profiles:", profileErr);
    return;
  }
  
  if (!profiles || profiles.length === 0) {
    console.error("No profiles found. Please create an account in the app first.");
    return;
  }
  
  const organizerId = profiles[0].id;
  
  const dummyEvents = [
    {
      title: "Global Tech Summit 2026",
      slug: slugify("Global Tech Summit 2026") + "-" + Date.now(),
      description: "Join industry leaders for a 3-day deep dive into AI, Web3, and the future of computing.",
      category: "Technology",
      city: "San Jose",
      venue_name: "San Jose Convention Center",
      venue_address: "150 W San Carlos St, San Jose, CA 95113",
      banner_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
      start_date: "2026-09-15T09:00:00",
      end_date: "2026-09-17T17:00:00",
      organizer_id: organizerId,
      status: "published",
      ticket: {
        name: "General Admission",
        price: 299,
        quantity_total: 1000,
        description: "Full access to all keynote sessions and workshops"
      }
    },
    {
      title: "Neon Nights Music Festival",
      slug: slugify("Neon Nights Music Festival") + "-" + Date.now(),
      description: "Experience the ultimate electronic music festival with 3 stages and immersive light shows.",
      category: "Music",
      city: "Austin",
      venue_name: "Downtown Arena",
      venue_address: "100 Austin Blvd, Austin, TX",
      banner_url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&auto=format&fit=crop&q=80",
      start_date: "2026-10-22T18:00:00",
      end_date: "2026-10-23T02:00:00",
      organizer_id: organizerId,
      status: "published",
      ticket: {
        name: "VIP Pass",
        price: 150,
        quantity_total: 500,
        description: "Includes backstage access and free drinks"
      }
    }
  ];

  for (const ev of dummyEvents) {
    const { ticket, ...eventData } = ev;
    
    // Insert event
    const { data: eventRow, error: eventErr } = await supabase.from('events').insert([eventData]).select('id').single();
    if (eventErr) {
      console.error(`Error inserting event '${ev.title}':`, eventErr.message);
      continue;
    }
    
    // Insert ticket
    const { error: ticketErr } = await supabase.from('ticket_types').insert([{
      event_id: eventRow.id,
      name: ticket.name,
      price: ticket.price,
      quantity_total: ticket.quantity_total,
      description: ticket.description
    }]);
    
    if (ticketErr) {
      console.error(`Error inserting tickets for '${ev.title}':`, ticketErr.message);
    } else {
      console.log(`Inserted event and tickets: ${ev.title}`);
    }
  }
  
  console.log("Event seed completed.");
}

seed();
