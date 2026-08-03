import { env } from '../src/lib/env';
import { createClient } from '@supabase/supabase-js';

async function verify() {
  console.log("1. Environment variables loaded successfully.");
  console.log("SUPABASE_URL:", env.NEXT_PUBLIC_SUPABASE_URL ? "Exists" : "Missing");
  
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Missing Supabase credentials!");
    process.exit(1);
  }

  // Initialize Supabase
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  console.log("2. Supabase client initialized.");

  // Test Database connectivity
  const { data, error } = await supabase.from('events').select('*').limit(1);
  if (error) {
    console.error("Database read failed:", error.message);
    process.exit(1);
  }
  console.log("3. Database connectivity tested (Read from 'events' successful).");

  // Test Storage connectivity
  const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
  if (storageError) {
    console.error("Storage list failed:", storageError.message);
    process.exit(1);
  }
  console.log("4. Storage connectivity tested (Buckets found: " + buckets.length + ").");

  console.log("Verification checks completed successfully.");
}

verify().catch(console.error);
