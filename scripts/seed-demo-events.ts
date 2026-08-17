import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read environment variables
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
  console.log("Starting 6 demo events seed...");
  
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
  
  const demoEvents = [
    {
      title: "React India Summit 2026",
      category: "tech",
      description: "Join the biggest gathering of React developers in India. Explore the future of web development, server components, and native apps.",
      city: "Bangalore",
      venue_name: "Whitefield Convention Centre",
      venue_address: "100 IT Park Rd, Bangalore",
      banner_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
      start_date: "2026-06-10T09:00:00",
      end_date: "2026-06-11T18:00:00",
      price: 2999,
      ticketName: "Full Access Pass",
      qty: 500
    },
    {
      title: "Monsoon Music Festival",
      category: "music",
      description: "A three-day open-air music festival celebrating indie, electronic, and folk artists.",
      city: "Mumbai",
      venue_name: "Bandra Fort Grounds",
      venue_address: "Bandra West, Mumbai",
      banner_url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&q=80",
      start_date: "2026-07-20T17:00:00",
      end_date: "2026-07-22T23:30:00",
      price: 1500,
      ticketName: "Festival Entry",
      qty: 2000
    },
    {
      title: "Street Food Carnival",
      category: "food",
      description: "Taste delicacies from 100+ street food vendors across the country in one mega weekend.",
      city: "Delhi",
      venue_name: "JLN Stadium Grounds",
      venue_address: "Pragati Vihar, New Delhi",
      banner_url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80",
      start_date: "2026-08-05T12:00:00",
      end_date: "2026-08-06T22:00:00",
      price: 0,
      ticketName: "Free RSVP",
      qty: 5000
    },
    {
      title: "Pottery & Mindfulness Workshop",
      category: "workshop",
      description: "A hands-on pottery class focusing on mindfulness and creative expression. All materials provided.",
      city: "Hyderabad",
      venue_name: "Creative Hub Studio",
      venue_address: "Jubilee Hills, Hyderabad",
      banner_url: "https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=1200&q=80",
      start_date: "2026-05-15T10:00:00",
      end_date: "2026-05-15T14:00:00",
      price: 800,
      ticketName: "Workshop Pass",
      qty: 30
    },
    {
      title: "Pro Kabaddi Exhibition Match",
      category: "sports",
      description: "Experience the thrill of live Kabaddi as top tier athletes face off in an exhibition match.",
      city: "Hyderabad",
      venue_name: "Gachibowli Indoor Stadium",
      venue_address: "Old Mumbai Hwy, Hyderabad",
      banner_url: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&q=80",
      start_date: "2026-09-01T19:00:00",
      end_date: "2026-09-01T21:30:00",
      price: 500,
      ticketName: "Stadium Seat",
      qty: 1500
    },
    {
      title: "Modern Art Exhibition",
      category: "arts",
      description: "A showcase of contemporary paintings and sculptures by emerging artists.",
      city: "Bangalore",
      venue_name: "National Gallery of Modern Art",
      venue_address: "Vasanth Nagar, Bangalore",
      banner_url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&q=80",
      start_date: "2026-06-25T11:00:00",
      end_date: "2026-06-25T19:00:00",
      price: 250,
      ticketName: "Gallery Access",
      qty: 300
    }
  ];

  for (const ev of demoEvents) {
    const slug = slugify(ev.title) + "-" + Date.now();
    
    // Insert event
    const { data: eventRow, error: eventErr } = await supabase.from('events').insert([{
      title: ev.title,
      slug: slug,
      description: ev.description,
      category: ev.category,
      city: ev.city,
      venue_name: ev.venue_name,
      venue_address: ev.venue_address,
      banner_url: ev.banner_url,
      start_date: ev.start_date,
      end_date: ev.end_date,
      organizer_id: organizerId,
      status: "published"
    }]).select('id').single();
    
    if (eventErr) {
      console.error(`Error inserting event '${ev.title}':`, eventErr.message);
      continue;
    }
    
    // Insert ticket
    const { error: ticketErr } = await supabase.from('ticket_types').insert([{
      event_id: eventRow.id,
      name: ev.ticketName,
      price: ev.price,
      quantity_total: ev.qty,
      description: "Standard access ticket"
    }]);
    
    if (ticketErr) {
      console.error(`Error inserting tickets for '${ev.title}':`, ticketErr.message);
    } else {
      console.log(`Inserted event and tickets: ${ev.title}`);
    }
  }
  
  console.log("Demo events seed completed successfully.");
}

seed();
