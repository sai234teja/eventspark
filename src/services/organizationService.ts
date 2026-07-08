import { supabase } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';
import { Permission, hasPermission, Role } from '@/types/rbac';

export type Organization = Database['public']['Tables']['organizations']['Row'];
export type OrganizationMember = Database['public']['Tables']['organization_members']['Row'];

export interface OrganizationWithRole extends Organization {
  role: string;
}

export const getUserOrganizations = async (userId: string): Promise<OrganizationWithRole[]> => {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      role,
      organizations (
        id,
        name,
        slug,
        created_by,
        created_at,
        updated_at,
        deleted_at
      )
    `)
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user organizations:', error);
    throw new Error('Failed to fetch user organizations');
  }

  // The join returns organizations as an object or array. Since it's a many-to-one from member to org, it's a single object.
  return (data || []).map((member: any) => ({
    ...member.organizations,
    role: member.role,
  }));
};

export const createOrganization = async (name: string, userId: string): Promise<OrganizationWithRole> => {
  if (!supabase) throw new Error('Supabase not configured');

  // Generate a basic slug
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);

  // Note: RLS needs to allow the user to create an organization.
  // In a real app, we might need a stored procedure or an edge function to do this transactionally (insert org, insert member).
  // For now, we attempt to do it client-side.
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert([{ name, slug, created_by: userId }])
    .select()
    .single();

  if (orgError) {
    console.error('Error creating organization:', orgError);
    throw new Error('Failed to create organization');
  }

  const { error: memberError } = await supabase
    .from('organization_members')
    .insert([{ organization_id: org.id, user_id: userId, role: 'owner' }]);

  if (memberError) {
    console.error('Error adding user to organization:', memberError);
    // Ideally rollback here
    throw new Error('Failed to add user to organization');
  }

  return { ...org, role: 'owner' };
};

export const updateOrganization = async (
  organizationId: string, 
  updates: Partial<Organization>, 
  currentRole: Role | string
): Promise<Organization> => {
  if (!hasPermission(currentRole, Permission.MANAGE_SETTINGS)) {
    throw new Error('You do not have permission to update organization settings');
  }

  const { data, error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', organizationId)
    .select()
    .single();

  if (error) {
    console.error('Error updating organization:', error);
    throw error;
  }

  return data as Organization;
};
