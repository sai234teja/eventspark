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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function update() {
  await supabase.from('events').update({ banner_url: '/images/events/hackathon_banner.jpg' }).like('title', '%Open Source Hackathon%');
  await supabase.from('events').update({ banner_url: '/images/events/yoga_banner.jpg' }).like('title', '%Community Yoga%');
  await supabase.from('events').update({ banner_url: '/images/events/artist_showcase_banner.jpg' }).like('title', '%Local Artist Showcase%');
  console.log("Images updated.");
}

update();
