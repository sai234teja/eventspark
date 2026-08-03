'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useTransfers } from '@/hooks/useTransfers';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, XCircle, ArrowRightLeft, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function TransfersDashboardPage() {
  const { user } = useAuth();
  const { pendingTransfers, transferHistory, isLoading, acceptTransfer, rejectTransfer, cancelTransfer } = useTransfers(user?.id);
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Ticket Transfers</h1>
        <p className="text-slate-400">Manage incoming and outgoing ticket transfers.</p>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5 text-indigo-500" /> Pending Incoming Transfers
        </h2>
        
        {pendingTransfers.length === 0 ? (
          <Card className="bg-slate-900 border-slate-800 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="h-12 w-12 text-slate-600 mb-4" />
              <p className="text-slate-400">No incoming transfers pending.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingTransfers.map((t: any) => (
              <Card key={t.id} className="bg-slate-900 border-slate-800 p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                  <Badge className="mb-2 bg-indigo-500/20 text-indigo-400">Incoming</Badge>
                  <CardTitle className="text-white mb-1">Transfer Request</CardTitle>
                  <p className="text-sm text-slate-400">Token: <span className="font-mono text-xs">{t.transfer_token}</span></p>
                  <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Expires: {new Date(t.expires_at).toLocaleString()}
                  </p>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto">
                  <Button 
                    className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={async () => {
                      const res = await acceptTransfer({ orgId: t.organization_id, token: t.transfer_token });
                      if(res.success) toast({ title: 'Transfer Accepted', description: 'Ticket is now yours.' });
                      else toast({ title: 'Error', description: res.error, variant: 'destructive' });
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" /> Accept
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full md:w-auto border-rose-500/50 text-rose-500 hover:bg-rose-500/10"
                    onClick={async () => {
                      const res = await rejectTransfer({ orgId: t.organization_id, transferId: t.id });
                      if(res.success) toast({ title: 'Transfer Rejected' });
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" /> Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6 pt-6 border-t border-slate-800">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-slate-400" /> Transfer History
        </h2>
        
        {transferHistory.length === 0 ? (
          <p className="text-slate-500 text-sm">No past transfers.</p>
        ) : (
          <div className="grid gap-4">
            {transferHistory.map((t: any) => (
              <Card key={t.id} className="bg-slate-900/50 border-slate-800 p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={
                      t.status === 'accepted' ? 'text-emerald-500 border-emerald-500/50' :
                      t.status === 'rejected' ? 'text-rose-500 border-rose-500/50' :
                      t.status === 'cancelled' ? 'text-slate-500 border-slate-500/50' :
                      'text-amber-500 border-amber-500/50'
                    }>
                      {t.status.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-slate-500 font-mono">To: {t.to_email}</span>
                  </div>
                  <CardTitle className="text-white text-base">Ticket #{t.old_ticket_id?.split('-')[0]}</CardTitle>
                </div>
                
                {t.status === 'pending' && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-slate-400 hover:text-white"
                    onClick={async () => {
                      const res = await cancelTransfer({ orgId: t.organization_id, transferId: t.id });
                      if(res.success) toast({ title: 'Transfer Cancelled' });
                    }}
                  >
                    Cancel Request
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
