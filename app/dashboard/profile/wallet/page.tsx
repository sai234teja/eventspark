import { createClient } from '../../../../supabase/server';
import { redirect } from 'next/navigation';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, Clock, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function WalletPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch wallet
  let walletBalance = 0;
  let transactions: any[] = [];
  
  const { data: wallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (wallet) {
    walletBalance = wallet.balance || 0;
    
    // Fetch transactions
    const { data: txs } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', wallet.id)
      .order('created_at', { ascending: false });
      
    if (txs) {
      transactions = txs;
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white mb-2">My Wallet</h1>
        <p className="text-slate-400">Manage your EventSpark credits and view transaction history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-indigo-900 to-[#111118] border-indigo-500/30 md:col-span-1 h-full flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Wallet className="w-32 h-32" />
          </div>
          <CardContent className="p-8 flex-1 flex flex-col justify-between relative z-10">
            <div>
              <p className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-2">Available Balance</p>
              <h2 className="text-5xl font-extrabold text-white">₹{walletBalance}</h2>
            </div>
            
            <div className="mt-8">
              <Button className="w-full bg-white text-indigo-900 hover:bg-slate-200 font-bold">
                <Plus className="w-4 h-4 mr-2" />
                Add Money
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Card */}
        <Card className="bg-[#111118] border-slate-800/60 md:col-span-2 h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <History className="w-5 h-5 text-slate-400" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            {transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        tx.type === 'credit' 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-white capitalize">{tx.description || tx.type}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {new Date(tx.created_at).toLocaleDateString()} at {new Date(tx.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className={`font-bold ${tx.type === 'credit' ? 'text-emerald-400' : 'text-white'}`}>
                      {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4">
                  <Wallet className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No transactions yet</h3>
                <p className="text-slate-400 max-w-sm">Your transaction history will appear here once you add money or make a purchase.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
