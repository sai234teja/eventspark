'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/contexts/AuthContext';
import { EventCard } from '@/components/ui/EventCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Calendar as CalendarIcon, Filter } from 'lucide-react';

export default function EventDiscoveryPage() {
  const [search, setSearch] = useState('');

  const { data: events, isLoading } = useQuery({
    queryKey: ['public-events', search],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select('*')
        .eq('isCompleted', false)
        .order('date', { ascending: true });

      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/30 p-6 rounded-lg border">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discover Events</h1>
          <p className="text-muted-foreground mt-1">Find the best events happening around you.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search events..." 
              className="pl-8" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters Bar (Placeholder for actual filter components) */}
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" className="rounded-full">All</Button>
        <Button variant="ghost" size="sm" className="rounded-full">Technology</Button>
        <Button variant="ghost" size="sm" className="rounded-full">Business</Button>
        <Button variant="ghost" size="sm" className="rounded-full">Music</Button>
        <Button variant="ghost" size="sm" className="rounded-full">Free</Button>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-80 rounded-xl bg-muted animate-pulse"></div>
          ))}
        </div>
      ) : events && events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event) => (
            <EventCard 
              key={event.id}
              event={event}
              onClick={() => window.location.href = `/events/${event.id}`}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/10 rounded-lg border border-dashed">
          <h3 className="text-lg font-semibold">No events found</h3>
          <p className="text-muted-foreground mt-1">Try adjusting your search filters.</p>
        </div>
      )}
    </div>
  );
}
