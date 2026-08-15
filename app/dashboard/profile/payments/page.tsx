import { createClient } from '../../../../supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CreditCard, Receipt, FileText, ArrowRightLeft } from 'lucide-react';
import ElectricBorder from '@/components/ui/ElectricBorder';
import { StaggeredList } from '@/components/ui/StaggeredList';

export default async function PaymentsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch orders for this user
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id,
      total_amount,
      status,
      created_at,
      events (
        title
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Payment History</h1>
        <p className="text-slate-400">View your transaction history, invoices, and refunds.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ElectricBorder color="#6C47FF" speed={0.8} chaos={0.15} borderRadius={12}>
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl h-full">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                Recent Transactions
              </CardTitle>
              <CardDescription className="text-slate-400">Your recent payments and refunds on EventSpark.</CardDescription>
            </CardHeader>
            <CardContent>
              {orders && orders.length > 0 ? (
                <div className="space-y-4">
                  <StaggeredList>
                    {orders.map((order: any) => {
                      const event = Array.isArray(order.events) ? order.events[0] : order.events;
                      return (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                          <div>
                            <p className="font-bold text-white">{event?.title || 'Event Registration'}</p>
                            <p className="text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString()} • Order #{order.id.slice(0, 8)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-white text-lg">
                              {order.total_amount === 0 ? <span className="text-emerald-400">FREE</span> : `₹${order.total_amount}`}
                            </p>
                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                              order.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                              'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </StaggeredList>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 border border-dashed border-slate-700 rounded-lg">
                  <ArrowRightLeft className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                  <p>No transactions found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </ElectricBorder>

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
