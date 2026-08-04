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

async function seed() {
  console.log("Starting event seed...");
  
  const { data: profiles, error: profileErr } = await supabase.from('profiles').select('*').limit(1);
  if (profileErr) {
    console.error("Error fetching profiles:", profileErr);
    return;
  }
  
  if (!profiles || profiles.length === 0) {
    console.error("No profiles found. Please create an account in the app first so we have a valid user to act as organizer.");
    return;
  }
  
  const organizerId = profiles[0].id;
  const organizationId = profiles[0].organization_id || organizerId;

  const dummyEvents = [
    {
      title: "Global Tech Summit 2026",
      date: "2026-09-15",
      time: "09:00",
      location: "San Jose Convention Center",
      maxCapacity: 1000,
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60",
      category: "Tech",
      price: "299",
      description: "Join industry leaders for a 3-day deep dive into AI, Web3, and the future of computing. Expect keynote speeches from top executives, hands-on workshops, and unparalleled networking opportunities.",
      organizer: "TechFlow Media",
      organizer_id: organizerId,
      organization_id: organizationId,
      isCompleted: false,
      registrationOpen: true
    },
    {
      title: "Neon Nights Music Festival",
      date: "2026-10-22",
      time: "18:00",
      location: "Downtown Arena",
      maxCapacity: 10000,
      image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&auto=format&fit=crop&q=60",
      category: "Music",
      price: "150",
      description: "Experience the ultimate electronic music festival with 3 stages, immersive light shows, and top DJs from around the world. Don't miss out on the biggest party of the year.",
      organizer: "Live Beats Entertainment",
      organizer_id: organizerId,
      organization_id: organizationId,
      isCompleted: false,
      registrationOpen: true
    },
    {
      title: "Modern Art Exhibition",
      date: "2026-11-05",
      time: "10:00",
      location: "City Art Gallery",
      maxCapacity: 300,
      image: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=800&auto=format&fit=crop&q=60",
      category: "Arts",
      price: "0",
      description: "A curated collection of contemporary pieces from emerging artists. Explore various mediums including sculpture, digital art, and classical painting reimagined for the modern era.",
      organizer: "NY Art Collective",
      organizer_id: organizerId,
      organization_id: organizationId,
      isCompleted: false,
      registrationOpen: true
    },
    {
      title: "Founders Pitch Night",
      date: "2026-11-20",
      time: "19:00",
      location: "Innovation Hub",
      maxCapacity: 100,
      image: "https://images.unsplash.com/photo-1515169067868-5387ec356754?w=800&auto=format&fit=crop&q=60",
      category: "Business",
      price: "25",
      description: "Watch 5 exciting early-stage startups pitch their ideas to a panel of top venture capitalists. Great networking opportunity with drinks and appetizers included.",
      organizer: "Bay Area Startups",
      organizer_id: organizerId,
      organization_id: organizationId,
      isCompleted: false,
      registrationOpen: true
    }
  ];

  for (const ev of dummyEvents) {
    const { error } = await supabase.from('events').insert([ev]);
    if (error) {
      console.error(`Error inserting event '${ev.title}':`, error.message);
    } else {
      console.log(`Inserted event: ${ev.title}`);
    }
  }
  
  console.log("Event seed completed.");
}

seed();
