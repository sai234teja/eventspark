'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { z } from 'zod';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const getUserId = async () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id;
};

// Zod schemas for validation
const bioSchema = z.object({
  headline: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal('')),
});

export async function updateProfileBio(formData: FormData) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const rawData = {
    headline: formData.get('headline') as string,
    bio: formData.get('bio') as string,
    location: formData.get('location') as string,
    website: formData.get('website') as string,
  };

  const validatedData = bioSchema.parse(rawData);

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      headline: validatedData.headline,
      bio: validatedData.bio,
      location: validatedData.location,
      website: validatedData.website,
    })
    .eq('id', userId);

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/profile');
  return { success: true };
}

export async function getProfileDetails(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function getUserSkills(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('user_skills')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function addUserSkill(skillName: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const { data, error } = await supabaseAdmin
    .from('user_skills')
    .insert({ user_id: userId, skill_name: skillName })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/profile');
  return data;
}

export async function deleteUserSkill(skillId: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  // Soft delete
  const { error } = await supabaseAdmin
    .from('user_skills')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', skillId)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/profile');
  return { success: true };
}

// Zod schemas for new mutations
const educationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().optional(),
  field_of_study: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().optional(),
});

const experienceSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  location: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().optional(),
});

const socialSchema = z.object({
  platform: z.string().min(1),
  url: z.string().url(),
});

const preferencesSchema = z.object({
  email_notifications: z.boolean().optional(),
  sms_notifications: z.boolean().optional(),
  push_notifications: z.boolean().optional(),
  marketing_emails: z.boolean().optional(),
  reminder_frequency: z.string().optional(),
  theme: z.string().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  date_format: z.string().optional(),
  time_format: z.string().optional(),
  public_profile: z.boolean().optional(),
  hide_email: z.boolean().optional(),
  hide_phone: z.boolean().optional(),
  hide_social_links: z.boolean().optional(),
  hide_activity: z.boolean().optional(),
  allow_organizer_messages: z.boolean().optional(),
});

// Education Actions
export async function addEducationAction(formData: FormData) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');
  
  const rawData: Record<string, any> = Object.fromEntries(formData);
  // parse booleans properly
  if (rawData.current === 'true' || rawData.current === 'on') rawData.current = true;
  else rawData.current = false;
  
  const validatedData = educationSchema.parse(rawData);
  const { error } = await supabaseAdmin.from('user_education').insert({ user_id: userId, ...validatedData });
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/profile');
  return { success: true };
}

export async function deleteEducationAction(id: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');
  const { error } = await supabaseAdmin.from('user_education').update({ deleted_at: new Date().toISOString() }).eq('id', id).eq('user_id', userId);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/profile');
  return { success: true };
}

// Experience Actions
export async function addExperienceAction(formData: FormData) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');
  
  const rawData: Record<string, any> = Object.fromEntries(formData);
  if (rawData.current === 'true' || rawData.current === 'on') rawData.current = true;
  else rawData.current = false;
  
  const validatedData = experienceSchema.parse(rawData);
  const { error } = await supabaseAdmin.from('user_experience').insert({ user_id: userId, ...validatedData });
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/profile');
  return { success: true };
}

export async function deleteExperienceAction(id: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');
  const { error } = await supabaseAdmin.from('user_experience').update({ deleted_at: new Date().toISOString() }).eq('id', id).eq('user_id', userId);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/profile');
  return { success: true };
}

// Social Actions
export async function addSocialLinkAction(formData: FormData) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');
  const validatedData = socialSchema.parse(Object.fromEntries(formData));
  const { error } = await supabaseAdmin.from('user_social_links').upsert({ user_id: userId, ...validatedData }, { onConflict: 'user_id, platform' });
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/profile');
  return { success: true };
}

export async function deleteSocialLinkAction(id: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');
  const { error } = await supabaseAdmin.from('user_social_links').update({ deleted_at: new Date().toISOString() }).eq('id', id).eq('user_id', userId);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/profile');
  return { success: true };
}

// Preferences Action
export async function updatePreferencesAction(formData: FormData) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');
  
  const rawData: any = {};
  formData.forEach((value, key) => {
    if (value === 'true' || value === 'on') rawData[key] = true;
    else if (value === 'false' || value === 'off') rawData[key] = false;
    else rawData[key] = value;
  });
  
  const validatedData = preferencesSchema.parse(rawData);
  const { error } = await supabaseAdmin.from('user_preferences').upsert({ user_id: userId, ...validatedData });
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/profile');
  return { success: true };
}
