'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useReferrals } from '@/hooks/useReferrals';
import { Loader2, Users, Gift, Link as LinkIcon, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReferralsPage() {
  const { referrals, isLoading } = useReferrals();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const totalEarned = referrals?.reduce((sum, r) => sum + (r.wallet_reward || 0), 0) || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Referral Program</h1>
        <p className="text-slate-400">Invite friends to EventSpark and earn wallet credits.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-indigo-900/50 to-slate-900/50 border-indigo-500/30 backdrop-blur-xl md:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Your Referral Link</CardTitle>
            <CardDescription className="text-indigo-200">Share this link to earn ₹50 for every friend who registers.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
              <code className="flex-1 text-slate-300 font-mono text-sm overflow-hidden text-ellipsis">
                https://eventspark.io/r/USER-REF-CODE
              </code>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">Copy</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <Wallet className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Earned</p>
                <p className="text-2xl font-bold text-white">₹{totalEarned.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white text-lg">Your Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          {(!referrals || referrals.length === 0) ? (
            <div className="text-center py-12 text-slate-500 border border-dashed border-slate-700 rounded-lg">
              <Users className="w-8 h-8 mx-auto mb-3 text-slate-600" />
              <p>You haven&apos;t referred anyone yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {referrals.map(ref => (
                <div key={ref.id} className="flex justify-between items-center p-4 bg-slate-800/30 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${ref.referral_status === 'successful' ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
                    <span className="text-slate-200">Code: {ref.referral_code}</span>
                  </div>
                  <span className="text-sm text-slate-400">+{ref.wallet_reward} Credits</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
