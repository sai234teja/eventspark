'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/hooks/useWishlist';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Trash2, Calendar, MapPin, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
  const { user } = useAuth();
  const { wishlist, isLoading, removeEvent, unfollowOrganizer } = useWishlist(user?.id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-800 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-800 rounded-xl animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  const savedEvents = wishlist.filter((item: any) => item.entity_type === 'event');
  const favoriteOrgs = wishlist.filter((item: any) => item.entity_type === 'organizer');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">My Wishlist</h1>
        <p className="text-slate-400">Manage your saved events and favorite organizers.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Heart className="h-5 w-5 text-rose-500" /> Saved Events ({savedEvents.length})
        </h2>
        
        {savedEvents.length === 0 ? (
          <Card className="bg-slate-900 border-slate-800 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-slate-600 mb-4" />
              <p className="text-slate-400">You haven't saved any events yet.</p>
              <Link href="/events" className="mt-4 text-emerald-500 hover:text-emerald-400">Discover Events</Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedEvents.map((item: any) => (
              <Card key={item.id} className="bg-slate-900 border-slate-800 overflow-hidden flex flex-col group relative">
                <div className="p-4 flex-1">
                  <div className="text-xs text-slate-500 font-mono mb-2">Event ID: {item.entity_id}</div>
                  <CardTitle className="text-lg text-white mb-2">Saved Event</CardTitle>
                </div>
                <div className="p-4 bg-slate-800/50 flex justify-between items-center border-t border-slate-800">
                   <Link href={`/events/${item.entity_id}`}>
                     <Button variant="outline" size="sm" className="border-slate-700">View Event</Button>
                   </Link>
                   <Button variant="ghost" size="sm" onClick={() => removeEvent(item.entity_id)} className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10">
                     <Trash2 className="h-4 w-4" />
                   </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4 pt-6 border-t border-slate-800">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-500" /> Favorite Organizers ({favoriteOrgs.length})
        </h2>
        
        {favoriteOrgs.length === 0 ? (
          <Card className="bg-slate-900 border-slate-800 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-slate-600 mb-4" />
              <p className="text-slate-400">You haven't followed any organizers yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteOrgs.map((item: any) => (
              <Card key={item.id} className="bg-slate-900 border-slate-800 flex items-center justify-between p-6">
                <div>
                  <div className="text-xs text-slate-500 font-mono mb-1">Org ID: {item.entity_id}</div>
                  <CardTitle className="text-white text-base">Favorite Organizer</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={() => unfollowOrganizer(item.entity_id)} className="text-slate-400 hover:text-white">
                  Unfollow
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
