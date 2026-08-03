'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLoginHistory } from '@/hooks/useLoginHistory';
import { Loader2, Monitor, Smartphone, Globe, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function LoginHistoryPage() {
  const { loginHistory, isLoading, revokeSession, isRevoking } = useLoginHistory();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const handleRevoke = async (sessionId: string) => {
    try {
      await revokeSession(sessionId);
      toast({ title: 'Session revoked successfully.' });
    } catch (e: any) {
      toast({ title: 'Failed to revoke session', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Login History</h1>
        <p className="text-slate-400">Monitor your account activity and revoke unrecognized sessions.</p>
      </div>

      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
        <CardContent className="pt-6">
          {(!loginHistory || loginHistory.length === 0) ? (
            <div className="text-center py-8 text-slate-500">
              <p>No login history available.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {loginHistory.map(session => (
                <div key={session.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-4">
                    {session.device?.toLowerCase().includes('mobile') ? (
                      <Smartphone className="w-6 h-6 text-slate-400" />
                    ) : (
                      <Monitor className="w-6 h-6 text-slate-400" />
                    )}
                    <div>
                      <p className="text-slate-200 font-medium">
                        {session.operating_system || 'Unknown OS'} • {session.browser || 'Unknown Browser'}
                        {!session.logout_at && (
                          <span className="ml-3 bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded">Active</span>
                        )}
                      </p>
                      <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                        <Globe className="w-3 h-3" />
                        {session.city || 'Unknown City'}, {session.country || 'Unknown Country'} • {session.ip_address?.replace(/\.\d+\.\d+$/, '.xxx.xxx')}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Logged in: {new Date(session.login_at).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {!session.logout_at && session.session_id && (
                    <Button 
                      variant="ghost" 
                      onClick={() => handleRevoke(session.session_id!)}
                      disabled={isRevoking}
                      className="mt-3 md:mt-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
