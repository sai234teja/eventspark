
import { supabase } from '@/contexts/AuthContext';
import { Permission, hasPermission, Role } from '@/types/rbac';

export interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  city: string;
  country: string;
  attendees: number;
  maxCapacity: number;
  image: string;
  category: string;
  price: string;
  description: string;
  organizer: string;
  organizer_id: string;
  isCompleted: boolean;
  registrationOpen: boolean;
  organization_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export const getEvents = async (organizationId: string): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching events:', error);
    throw new Error('Failed to fetch events');
  }

  return data || [];
};

export const getEventById = async (id: number, organizationId: string): Promise<Event | null> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .single();

  if (error) {
    console.error('Error fetching event:', error);
    return null;
  }

  return data;
};

export const createEvent = async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'organizer_id' | 'organization_id'>, organizationId: string, role: Role | string) => {
  if (!hasPermission(role, Permission.CREATE_EVENT)) {
    throw new Error('You do not have permission to create events');
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to create events');
  }

  const { data, error } = await supabase
    .from('events')
    .insert([{
      ...eventData,
      organizer_id: user.id,
      organization_id: organizationId,
      attendees: 0,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    throw new Error('Failed to create event');
  }

  return data;
};

export const updateEvent = async (id: number, updates: Partial<Event>, organizationId: string, role: Role | string) => {
  if (!hasPermission(role, Permission.EDIT_EVENT)) {
    throw new Error('You do not have permission to edit events');
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to update events');
  }

  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .select()
    .single();

  if (error) {
    console.error('Error updating event:', error);
    throw new Error('Failed to update event');
  }

  return data;
};

export const registerForEvent = async (eventId: number, registrationData: Record<string, unknown>, organizationId: string, role: Role | string) => {
  if (!hasPermission(role, Permission.REGISTER_FOR_EVENT)) {
    throw new Error('You do not have permission to register for events');
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to register for events');
  }

  const { data, error } = await supabase
    .from('registrations')
    .insert([{
      event_id: eventId,
      user_id: user.id,
      organization_id: organizationId,
      registration_data: registrationData,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error registering for event:', error);
    throw new Error('Failed to register for event');
  }
  
  try {
    // Phase 7.5: Auto-issue ticket via Server Action orchestrated by ticketService
    // This executes issue_ticket() RPC transactionally on the server
    const { ticketService } = await import('@/services/ticketService');
    await ticketService.issueTicket(organizationId, eventId, data.id);
  } catch (ticketError) {
    console.error('Failed to issue ticket after registration:', ticketError);
    // Note: Registration succeeded, but ticketing failed. We log the error but return the registration data.
  }

  return data;
};

export const getUserRegistrations = async (organizationId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to view registrations');
  }

  const { data, error } = await supabase
    .from('registrations')
    .select(`
      *,
      events (
        id,
        title,
        date,
        time,
        location,
        city,
        country,
        image,
        category,
        organization_id
      )
    `)
    .eq('user_id', user.id)
    .eq('organization_id', organizationId);

  if (error) {
    console.error('Error fetching user registrations:', error);
    throw new Error('Failed to fetch registrations');
  }

  return data || [];
};
