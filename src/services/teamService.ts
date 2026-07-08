import { supabase } from '@/contexts/AuthContext';
import { Permission, hasPermission, Role } from '@/types/rbac';

export interface OrganizationMember {
  id: number;
  organization_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export const getMembers = async (organizationId: string, role: Role | string): Promise<OrganizationMember[]> => {
  if (!hasPermission(role, Permission.MANAGE_TEAM)) {
    throw new Error('You do not have permission to view the team');
  }

  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      id,
      organization_id,
      user_id,
      role,
      joined_at,
      profiles (
        full_name,
        email
      )
    `)
    .eq('organization_id', organizationId)
    .order('joined_at', { ascending: false });

  if (error) throw error;
  
  return data as unknown as OrganizationMember[];
};

export const updateMemberRole = async (memberId: number, newRole: Role, organizationId: string, currentRole: Role | string) => {
  if (!hasPermission(currentRole, Permission.MANAGE_TEAM)) {
    throw new Error('You do not have permission to manage team members');
  }

  // Verify the target member belongs to the active organization
  const { data: member, error: fetchError } = await supabase
    .from('organization_members')
    .select('id')
    .eq('id', memberId)
    .eq('organization_id', organizationId)
    .single();

  if (fetchError || !member) {
    throw new Error('Member not found or does not belong to this organization');
  }

  const { error } = await supabase
    .from('organization_members')
    .update({ role: newRole })
    .eq('id', memberId);

  if (error) throw error;
  return true;
};

export const removeMember = async (memberId: number, organizationId: string, currentRole: Role | string) => {
  if (!hasPermission(currentRole, Permission.MANAGE_TEAM)) {
    throw new Error('You do not have permission to manage team members');
  }

  const { error } = await supabase
    .from('organization_members')
    .delete()
    .eq('id', memberId)
    .eq('organization_id', organizationId);

  if (error) throw error;
  return true;
};
