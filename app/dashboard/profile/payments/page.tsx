'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CreditCard, Receipt, FileText, ArrowRightLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function PaymentsPage() {
  const { user } = useAuth();
  // TODO: Use existing Payment hooks once mapped
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
        <h1 className="text-2xl font-bold text-white mb-2">Payment History</h1>
        <p className="text-slate-400">View your transaction history, invoices, and refunds.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-400" />
              Recent Transactions
            </CardTitle>
            <CardDescription className="text-slate-400">Your recent payments and refunds on EventSpark.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-slate-500 border border-dashed border-slate-700 rounded-lg">
              <ArrowRightLeft className="w-8 h-8 mx-auto mb-3 text-slate-600" />
              <p>No transactions found.</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <FileText className="w-4 h-4 text-slate-400" />
                Invoices & Tax
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-500 border border-dashed border-slate-700 rounded-lg">
                <p className="text-sm">No invoices available.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <Receipt className="w-4 h-4 text-indigo-400" />
                Refunds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-500 border border-dashed border-slate-700 rounded-lg">
                <p className="text-sm">No refunds processed.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
