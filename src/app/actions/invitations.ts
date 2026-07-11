"use server";

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

// Initialize a server-side Supabase client using Service Role or authenticated user
// We'll assume you have SUPABASE_URL and SUPABASE_ANON_KEY / SERVICE_ROLE_KEY configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export async function acceptInvitationAction(token: string, userId: string) {
  try {
    // We call the RPC function to handle the transaction securely on the database
    const { error } = await supabase.rpc('accept_invitation', {
      token_val: token,
      user_id_val: userId
    });

    if (error) {
      console.error("RPC Error:", error);
      throw new Error(error.message || 'Failed to accept invitation');
    }

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'An error occurred' };
  }
}
