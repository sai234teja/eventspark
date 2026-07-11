import { supabase } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';
import { acceptInvitationAction } from '@/app/actions/invitations';

export type OrganizationInvite = Database['public']['Tables']['organization_invites']['Row'];

export const getPendingInvitations = async (email: string): Promise<OrganizationInvite[]> => {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('organization_invites')
    .select('*')
    .eq('email', email)
    .gt('expires_at', new Date().toISOString());

  if (error) {
    console.error('Error fetching invitations:', error);
    throw new Error('Failed to fetch invitations');
  }

  return data || [];
};

export const acceptInvitation = async (token: string, userId: string): Promise<void> => {
  const result = await acceptInvitationAction(token, userId);
  if (!result.success) {
    throw new Error(result.error);
  }
};

export const inviteUser = async (organizationId: string, email: string, role: string, currentRole: string) => {
  // Simple mock invite logic for now
  if (!supabase) throw new Error('Supabase not configured');
  
  const { error } = await supabase
    .from('organization_invites')
    .insert([{
      organization_id: organizationId,
      email: email,
      role: role,
      token: Math.random().toString(36).substring(2) + Date.now().toString(36),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }]);

  if (error) {
    throw new Error('Failed to create invitation: ' + error.message);
  }
};
