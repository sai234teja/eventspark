import { supabase } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';
import { Permission, hasPermission, Role } from '@/types/rbac';

export type Organization = Database['public']['Tables']['organizations']['Row'];
export type OrganizationSettings = Database['public']['Tables']['organization_settings']['Row'];
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
  return (data || []).map((member: { organizations: unknown, role: unknown }) => ({
    ...(member.organizations as Organization),
    role: member.role as string,
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

export const getOrganizationSettings = async (organizationId: string): Promise<OrganizationSettings> => {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('organization_settings')
    .select('*')
    .eq('organization_id', organizationId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is not found
    console.error('Error fetching organization settings:', error);
    throw error;
  }

  // If no settings exist yet, return a default object
  if (!data) {
    return {
      organization_id: organizationId,
      logo_url: null,
      favicon_url: null,
      primary_color: null,
      secondary_color: null,
      accent_color: null,
      website: null,
      timezone: null,
      font_family: null,
      border_radius: null,
      theme_preference: null,
      feature_flags: null,
      updated_at: new Date().toISOString(),
      updated_by: null
    };
  }

  return data as OrganizationSettings;
};

export const updateOrganizationSettings = async (
  organizationId: string, 
  updates: Partial<OrganizationSettings>, 
  currentRole: Role | string
): Promise<OrganizationSettings> => {
  if (!hasPermission(currentRole, Permission.MANAGE_SETTINGS)) {
    throw new Error('You do not have permission to update organization settings');
  }

  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('organization_settings')
    .upsert({ ...updates, organization_id: organizationId })
    .select()
    .single();

  if (error) {
    console.error('Error updating organization settings:', error);
    throw error;
  }

  return data as OrganizationSettings;
};

export const uploadBrandAsset = async (
  organizationId: string,
  file: File,
  assetType: 'logo' | 'favicon',
  currentRole: Role | string
): Promise<string> => {
  if (!hasPermission(currentRole, Permission.MANAGE_SETTINGS)) {
    throw new Error('You do not have permission to upload brand assets');
  }

  if (!supabase) throw new Error('Supabase not configured');

  // Generate a unique filename: brand-assets/{organizationId}/{assetType}-{timestamp}.ext
  const fileExt = file.name.split('.').pop();
  const filePath = `${organizationId}/${assetType}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('brand-assets')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    console.error('Error uploading asset:', uploadError);
    throw new Error('Failed to upload asset: ' + uploadError.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from('brand-assets')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};
