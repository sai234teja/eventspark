'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useWaitlist } from '@/hooks/useWaitlist';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, TimerOff, Ticket, Info, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function WaitlistDashboardPage() {
  const { user } = useAuth();
  const { allWaitlists, isLoading, leaveWaitlist } = useWaitlist(user?.id);
  const { toast } = useToast();

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

  const handleLeave = async (eventId: number) => {
    try {
      await leaveWaitlist(eventId);
      toast({ title: 'Left Waitlist', description: 'You have been removed from the waitlist.' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">My Waitlists</h1>
        <p className="text-slate-400">View and manage the events you are waiting for.</p>
      </div>

      {allWaitlists.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-slate-600 mb-4" />
            <p className="text-slate-400">You are not on any waitlists right now.</p>
            <Link href="/events" className="mt-4 text-emerald-500 hover:text-emerald-400">Discover Events</Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allWaitlists.map((entry: any) => {
            const isPromoted = entry.status === 'promoted';
            const isExpired = entry.status === 'expired';
            
            return (
              <Card key={entry.id} className="bg-slate-900 border-slate-800 overflow-hidden flex flex-col group relative">
                <div className="h-32 bg-muted relative">
                  <img src={entry.events?.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87"} className="w-full h-full object-cover" alt="Event" />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {isPromoted && <Badge className="bg-emerald-500 text-white border-none">Action Required</Badge>}
                    {isExpired && <Badge variant="secondary">Expired</Badge>}
                    {!isPromoted && !isExpired && <Badge className="bg-amber-500 text-white border-none">Waiting</Badge>}
                  </div>
                </div>
                
                <div className="p-4 flex-1 space-y-3">
                  <div>
                    <CardTitle className="text-lg text-white mb-1 line-clamp-1">{entry.events?.title}</CardTitle>
                    <p className="text-xs text-slate-400 font-medium">{entry.events?.date}</p>
                  </div>

                  <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Tier:</span>
                      <span className="text-white font-medium">{entry.ticket_tiers?.name || 'Any'}</span>
                    </div>
                    
                    {!isPromoted && !isExpired && (
                      <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-800">
                        <span className="text-slate-400 flex items-center gap-1"><Info className="h-3 w-3" /> Position:</span>
                        <span className="text-amber-500 font-bold">#{entry.position}</span>
                      </div>
                    )}

                    {isPromoted && (
                      <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-800 text-emerald-400">
                        <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Promoted!</span>
                        <span className="font-medium">Ticket Reserved</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-800/30 flex flex-col gap-2 border-t border-slate-800">
                  {isPromoted ? (
                    <>
                      <p className="text-xs text-slate-400 text-center flex justify-center items-center gap-1 mb-1">
                        <Clock className="h-3 w-3 text-amber-500" /> 
                        Expires at {new Date(entry.reservation_expires_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                      <Link href={`/events/${entry.event_id}`} className="w-full">
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Claim Ticket</Button>
                      </Link>
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <Link href={`/events/${entry.event_id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full border-slate-700">View Event</Button>
                      </Link>
                      {!isExpired && (
                        <Button variant="ghost" size="sm" onClick={() => handleLeave(entry.event_id)} className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10">
                          <TimerOff className="h-4 w-4 mr-1" /> Leave
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
