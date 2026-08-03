'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useReminders } from '@/hooks/useReminders';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Trash2, Calendar as CalendarIcon, Settings } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CalendarDropdown } from '@/components/shared/CalendarDropdown';
import { CalendarEvent } from '@/utils/calendar';

export default function RemindersDashboardPage() {
  const { user } = useAuth();
  const { reminders, preferences, isLoading, toggleReminder, deleteReminder } = useReminders(user?.id);
  const { toast } = useToast();

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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
            <Bell className="h-8 w-8 text-indigo-500" /> Event Reminders
          </h1>
          <p className="text-slate-400">Manage your event notifications and preferences.</p>
        </div>
        <Button variant="outline" className="border-slate-700 bg-slate-900 text-slate-300">
          <Settings className="h-4 w-4 mr-2" /> Preferences
        </Button>
      </div>

      {preferences && (
        <Card className="bg-slate-900 border-slate-800">
           <CardContent className="p-4 flex gap-4 text-sm text-slate-400">
             <span>Active Channels:</span>
             {preferences.email && <Badge variant="secondary" className="bg-slate-800">Email</Badge>}
             {preferences.sms && <Badge variant="secondary" className="bg-slate-800">SMS</Badge>}
             {preferences.push && <Badge variant="secondary" className="bg-slate-800">Push</Badge>}
           </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {reminders.length === 0 ? (
          <Card className="bg-slate-900 border-slate-800 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BellOff className="h-12 w-12 text-slate-600 mb-4" />
              <p className="text-slate-400">You have no active reminders.</p>
              <Link href="/events" className="mt-4 text-indigo-500 hover:text-indigo-400">Browse Events</Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {reminders.map((r: any) => (
              <Card key={r.id} className={`bg-slate-900 border-slate-800 p-6 flex flex-col gap-4 transition-opacity ${!r.is_enabled ? 'opacity-50' : ''}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-indigo-500/20 text-indigo-400">{r.interval}</Badge>
                      <span className="text-xs text-slate-500 flex gap-1">
                        {r.types.map((t: string) => <Badge key={t} variant="outline" className="text-[10px] py-0">{t}</Badge>)}
                      </span>
                    </div>
                    <CardTitle className="text-white text-lg">{r.events?.title}</CardTitle>
                    <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                      <CalendarIcon className="h-3 w-3" /> {new Date(r.events?.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-800">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={r.is_enabled ? "text-amber-500 hover:text-amber-600" : "text-emerald-500 hover:text-emerald-600"}
                    onClick={async () => {
                      await toggleReminder({ reminderId: r.id, isEnabled: !r.is_enabled });
                      toast({ title: r.is_enabled ? "Reminder Disabled" : "Reminder Enabled" });
                    }}
                  >
                    {r.is_enabled ? <BellOff className="h-4 w-4 mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
                    {r.is_enabled ? 'Disable' : 'Enable'}
                  </Button>
                  
                  <div className="flex gap-2">
                    {r.events && (
                      <CalendarDropdown 
                        event={{
                          title: r.events.title,
                          description: '',
                          location: r.events.location || '',
                          startTime: new Date(r.events.date),
                          endTime: new Date(new Date(r.events.date).getTime() + 4 * 60 * 60 * 1000)
                        }} 
                        variant="ghost"
                        className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                      />
                    )}
                    <Link href={`/events/${r.event_id}`}>
                      <Button variant="outline" size="sm" className="border-slate-700">View</Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                      onClick={async () => {
                        await deleteReminder({ reminderId: r.id });
                        toast({ title: "Reminder Deleted" });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
