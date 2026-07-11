"use server";

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export async function issueTicketAction(organizationId: string, eventId: number, registrationId: string) {
  try {
    const { data, error } = await supabase.rpc('issue_ticket', {
      p_organization_id: organizationId,
      p_event_id: eventId,
      p_registration_id: registrationId
    } as any);

    if (error) {
      console.error("RPC Error:", error);
      throw new Error(error.message || 'Failed to issue ticket');
    }

    return { success: true, ticket: data };
  } catch (err: any) {
    return { success: false, error: err.message || 'An error occurred' };
  }
}
