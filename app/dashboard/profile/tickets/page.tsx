'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Ticket, CalendarX2, ArrowRightLeft, Loader2, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function TicketsPage() {
  const { user } = useAuth();
  // TODO: Use existing Ticket hooks once mapped
  const isLoading = false;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">My Tickets</h1>
        <p className="text-slate-400">View your upcoming events, past attendances, and ticket transfers.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-indigo-400" />
              Upcoming Events
            </CardTitle>
            <CardDescription className="text-slate-400">Events you are registered to attend.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-slate-500 border border-dashed border-slate-700 rounded-lg">
              <Ticket className="w-8 h-8 mx-auto mb-3 text-slate-600" />
              <p>No upcoming tickets found.</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <Clock className="w-4 h-4 text-slate-400" />
                Past Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-500 border border-dashed border-slate-700 rounded-lg">
                <p className="text-sm">No past tickets found.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <CalendarX2 className="w-4 h-4 text-red-400" />
                Cancelled Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-500 border border-dashed border-slate-700 rounded-lg">
                <p className="text-sm">No cancelled tickets.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
