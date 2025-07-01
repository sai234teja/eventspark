
import { supabase } from '@/contexts/AuthContext';

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
  created_at: string;
  updated_at: string;
}

export const getEvents = async (): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching events:', error);
    throw new Error('Failed to fetch events');
  }

  return data || [];
};

export const getEventById = async (id: number): Promise<Event | null> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching event:', error);
    return null;
  }

  return data;
};

export const createEvent = async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'organizer_id'>) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to create events');
  }

  const { data, error } = await supabase
    .from('events')
    .insert([{
      ...eventData,
      organizer_id: user.id,
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

export const updateEvent = async (id: number, updates: Partial<Event>) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to update events');
  }

  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .eq('organizer_id', user.id) // Ensure user can only update their own events
    .select()
    .single();

  if (error) {
    console.error('Error updating event:', error);
    throw new Error('Failed to update event');
  }

  return data;
};

export const registerForEvent = async (eventId: number, registrationData: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to register for events');
  }

  const { data, error } = await supabase
    .from('registrations')
    .insert([{
      event_id: eventId,
      user_id: user.id,
      registration_data: registrationData,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error registering for event:', error);
    throw new Error('Failed to register for event');
  }

  return data;
};

export const getUserRegistrations = async () => {
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
        category
      )
    `)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching user registrations:', error);
    throw new Error('Failed to fetch registrations');
  }

  return data || [];
};
