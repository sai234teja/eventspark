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
  console.log("Starting free event seed...");
  
  const { data: profiles, error: profileErr } = await supabase.from('profiles').select('*').limit(1);
  if (profileErr || !profiles || profiles.length === 0) {
    console.error("No profiles found. Please create an account in the app first.");
    return;
  }
  
  const organizerId = profiles[0].id;
  
  const freeEvents = [
    {
      title: "Open Source Hackathon 2026",
      slug: slugify("Open Source Hackathon 2026") + "-" + Date.now(),
      description: "Join us for an incredible weekend of building open source tools!\n\nWhether you're a seasoned developer or just starting out, this hackathon is the perfect place to learn, collaborate, and create something amazing. We will have mentors available across various tech stacks.\n\nHighlights:\n• Free entry for all skill levels\n• Free food and energy drinks all weekend\n• Swag bags for all attendees\n• Exciting prizes for top projects\n\nAgenda:\nDay 1:\n- 09:00 AM: Registration & Breakfast\n- 10:30 AM: Opening Ceremony & Idea Pitching\n- 12:00 PM: Hacking Begins\n\nDay 2:\n- 12:00 PM: Project Submissions\n- 01:00 PM: Presentations\n- 03:00 PM: Awards Ceremony\n\nPlease bring your own laptop and charger. See you there!",
      category: "Technology",
      city: "Seattle",
      venue_name: "Innovation Hub",
      venue_address: "400 Broad St, Seattle, WA 98109",
      banner_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80",
      start_date: "2026-11-10T09:00:00",
      end_date: "2026-11-11T15:00:00",
      organizer_id: organizerId,
      status: "published",
      ticket: {
        name: "Hacker Pass (Free)",
        price: 0,
        quantity_total: 300,
        description: "General admission for developers and designers"
      }
    },
    {
      title: "Community Yoga in the Park",
      slug: slugify("Community Yoga in the Park") + "-" + Date.now(),
      description: "Start your weekend right with a relaxing and rejuvenating free yoga session in the park!\n\nThis event is open to everyone, regardless of experience level. Our certified instructors will guide you through a gentle flow designed to improve flexibility, balance, and mental clarity.\n\nWhat to bring:\n• A yoga mat or a large towel\n• Comfortable clothing\n• A water bottle\n• A positive attitude!\n\nLocation details:\nWe will be meeting near the main fountain in Central Park. Look for the EventSpark banners!\n\nInstructor:\nSarah Jenkins - 10 years of experience in Vinyasa flow.\n\nNote: In case of rain, the event will be postponed to the following weekend.",
      category: "Sports",
      city: "New York",
      venue_name: "Central Park Main Fountain",
      venue_address: "Central Park, New York, NY",
      banner_url: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=1200&auto=format&fit=crop&q=80",
      start_date: "2026-08-30T08:00:00",
      end_date: "2026-08-30T09:30:00",
      organizer_id: organizerId,
      status: "published",
      ticket: {
        name: "Participant Registration",
        price: 0,
        quantity_total: 100,
        description: "RSVP to reserve your spot!"
      }
    },
    {
      title: "Local Artist Showcase & Mixer",
      slug: slugify("Local Artist Showcase & Mixer") + "-" + Date.now(),
      description: "Support local talent at our monthly free Artist Showcase!\n\nDiscover up-and-coming painters, sculptors, and digital artists from around the city. This is a fantastic opportunity to network, appreciate beautiful art, and connect with the local creative community.\n\nFeaturing:\n• Live painting sessions\n• Digital art installations\n• Networking with gallery owners\n• Free appetizers\n\nSchedule:\n- 6:00 PM: Doors Open & Networking\n- 7:00 PM: Featured Artist Q&A\n- 8:00 PM: Live Art Auction (Optional bidding)\n\nThis event is 100% free to attend, but registration is required as venue capacity is strictly limited to 150 guests.",
      category: "Arts",
      city: "Chicago",
      venue_name: "The Canvas Gallery",
      venue_address: "123 Art Ave, Chicago, IL 60601",
      banner_url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&auto=format&fit=crop&q=80",
      start_date: "2026-09-05T18:00:00",
      end_date: "2026-09-05T21:00:00",
      organizer_id: organizerId,
      status: "published",
      ticket: {
        name: "Guest List",
        price: 0,
        quantity_total: 150,
        description: "Free entry on the guest list"
      }
    }
  ];

  for (const ev of freeEvents) {
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
      console.log(`Inserted FREE event and tickets: ${ev.title}`);
    }
  }
  
  console.log("Free Event seed completed.");
}

seed();
