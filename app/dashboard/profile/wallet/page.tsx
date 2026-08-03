'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wallet, CreditCard, Gift, ArrowRightLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function WalletPage() {
  const { user } = useAuth();
  // TODO: Use existing Wallet hooks once mapped
  const isLoading = false;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">My Wallet</h1>
        <p className="text-slate-400">Manage your balances, credits, and view transaction history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl md:col-span-1">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-indigo-400" />
              Available Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white mb-2">₹0.00</div>
            <p className="text-sm text-slate-400 mb-6">Available for ticket purchases</p>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
              Add Funds
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl md:col-span-2">
          <CardHeader>
            <CardTitle className="text-white text-lg">Transaction History</CardTitle>
            <CardDescription className="text-slate-400">Your recent wallet activity.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-slate-500 border border-dashed border-slate-700 rounded-lg">
              <ArrowRightLeft className="w-8 h-8 mx-auto mb-3 text-slate-600" />
              <p>No transactions found.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
