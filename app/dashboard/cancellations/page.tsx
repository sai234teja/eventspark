'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useCancellations } from '@/hooks/useCancellations';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { XCircle, Ticket, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CancellationsDashboardPage() {
  const { user } = useAuth();
  const { userCancellations, isLoading } = useCancellations(user?.id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-800 rounded w-48 animate-pulse"></div>
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-800 rounded-xl animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">My Cancellations</h1>
        <p className="text-slate-400">View the status of your ticket cancellation and refund requests.</p>
      </div>

      <div className="space-y-6">
        {userCancellations.length === 0 ? (
          <Card className="bg-slate-900 border-slate-800 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <XCircle className="h-12 w-12 text-slate-600 mb-4" />
              <p className="text-slate-400">You have no cancellation requests.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {userCancellations.map((c: any) => {
              const statusColors = {
                requested: 'bg-amber-500/20 text-amber-500 border-amber-500/50',
                approved: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50',
                rejected: 'bg-rose-500/20 text-rose-500 border-rose-500/50',
                processing: 'bg-blue-500/20 text-blue-500 border-blue-500/50',
                refunded: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50',
                completed: 'bg-slate-500/20 text-slate-500 border-slate-500/50',
              } as Record<string, string>;
              
              return (
                <Card key={c.id} className="bg-slate-900 border-slate-800 p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex justify-between md:justify-start items-center gap-4">
                      <Badge variant="outline" className={statusColors[c.status] || 'bg-slate-500/20'}>
                        {c.status.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-slate-500"><Clock className="h-3 w-3 inline mr-1"/> {new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">{c.registrations?.events?.title || 'Unknown Event'}</CardTitle>
                      <p className="text-sm text-slate-400 mt-1">Reason: "{c.reason}"</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end w-full md:w-auto mt-4 md:mt-0">
                    <Link href={`/tickets/${c.registration_id}`}>
                      <Button variant="outline" className="border-slate-700 w-full">View Ticket</Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
