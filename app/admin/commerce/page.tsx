'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  IndianRupee, Tag, Users, Wallet, RefreshCcw, 
  Receipt, Download, Search, FileText 
} from 'lucide-react';

export default function CommerceDashboard() {
  const { activeOrganization } = useTenant();
  const [activeTab, setActiveTab] = useState('revenue');

  // Fetch overarching commerce stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['commerce-stats', activeOrganization?.id],
    queryFn: async () => {
      if (!activeOrganization) return null;
      
      const { data: payments, error: payError } = await supabase
        .from('payments')
        .select('amount, status, created_at')
        .eq('organization_id', activeOrganization.id)
        .eq('status', 'captured');
        
      const { data: refunds, error: refError } = await supabase
        .from('refunds')
        .select('amount, status')
        .eq('organization_id', activeOrganization.id);
        
      const { data: coupons, error: coupError } = await supabase
        .from('coupons')
        .select('id, code, max_uses, current_uses, is_active')
        .eq('organization_id', activeOrganization.id);
        
      if (payError || refError || coupError) throw payError;

      const totalRevenue = payments?.reduce((acc, p) => acc + Number(p.amount), 0) || 0;
      const totalRefunds = refunds?.reduce((acc, r) => acc + Number(r.amount), 0) || 0;
      const netRevenue = totalRevenue - totalRefunds;
      
      // Approximate base vs GST assuming simple 18% inclusive
      const baseRev = netRevenue / 1.18;
      const gstCollected = netRevenue - baseRev;

      return {
        totalRevenue,
        netRevenue,
        totalRefunds,
        gstCollected,
        paymentsCount: payments?.length || 0,
        activeCoupons: coupons?.filter(c => c.is_active).length || 0,
        totalUses: coupons?.reduce((acc, c) => acc + c.current_uses, 0) || 0,
        coupons
      };
    },
    enabled: !!activeOrganization
  });

  if (isLoading || !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-800 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-800 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Commerce Hub</h1>
          <p className="text-slate-400">Manage revenue, coupons, affiliates, and refunds.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-700 text-slate-300">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button variant="outline" className="border-slate-700 text-slate-300">
            <FileText className="mr-2 h-4 w-4" /> PDF Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-900 border border-slate-800 w-full justify-start overflow-x-auto flex-nowrap hide-scrollbar">
          <TabsTrigger value="revenue" className="data-[state=active]:bg-slate-800">Revenue</TabsTrigger>
          <TabsTrigger value="coupons" className="data-[state=active]:bg-slate-800">Coupons</TabsTrigger>
          <TabsTrigger value="affiliates" className="data-[state=active]:bg-slate-800">Affiliates</TabsTrigger>
          <TabsTrigger value="wallets" className="data-[state=active]:bg-slate-800">Wallets</TabsTrigger>
          <TabsTrigger value="refunds" className="data-[state=active]:bg-slate-800">Refunds</TabsTrigger>
          <TabsTrigger value="gst" className="data-[state=active]:bg-slate-800">GST Reporting</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Net Revenue" 
              value={`₹${stats.netRevenue.toLocaleString()}`}
              icon={IndianRupee}
              description={`Gross: ₹${stats.totalRevenue.toLocaleString()}`}
              trend={{ value: 12, label: 'vs last month', isPositive: true }}
            />
            <StatCard 
              title="Refunds" 
              value={`₹${stats.totalRefunds.toLocaleString()}`}
              icon={RefreshCcw}
              description="Total processed"
            />
            <StatCard 
              title="GST Collected" 
              value={`₹${stats.gstCollected.toFixed(2)}`}
              icon={Receipt}
              description="18% inclusive assumption"
            />
            <StatCard 
              title="Avg Ticket Value" 
              value={stats.paymentsCount > 0 ? `₹${(stats.totalRevenue / stats.paymentsCount).toFixed(2)}` : '₹0'}
              icon={Tag}
              description="Per successful transaction"
            />
          </div>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="text-center py-12 text-slate-500">
                 Transaction history chart and table will be rendered here.
               </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coupons" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="relative w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input placeholder="Search coupons..." className="pl-8 bg-slate-900 border-slate-800" />
            </div>
            <Button>Create Coupon</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
             <StatCard title="Active Coupons" value={stats.activeCoupons} icon={Tag} />
             <StatCard title="Total Uses" value={stats.totalUses} icon={Users} />
             <StatCard title="Total Revenue Impact" value="--" icon={IndianRupee} />
          </div>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-0">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="bg-slate-800/50 text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Code</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Uses</th>
                    <th className="px-6 py-4">Capacity</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.coupons?.map(coupon => (
                    <tr key={coupon.id} className="border-b border-slate-800">
                      <td className="px-6 py-4 font-mono font-bold">{coupon.code}</td>
                      <td className="px-6 py-4">
                        <Badge variant={coupon.is_active ? "default" : "secondary"}>
                          {coupon.is_active ? 'Active' : 'Disabled'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">{coupon.current_uses}</td>
                      <td className="px-6 py-4">{coupon.max_uses || 'Unlimited'}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm">Edit</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Placeholders for remaining tabs leveraging the same structure */}
        <TabsContent value="affiliates">
          <Card className="bg-slate-900 border-slate-800"><CardContent className="py-12 text-center text-slate-500">Affiliate dashboard loading...</CardContent></Card>
        </TabsContent>
        <TabsContent value="wallets">
          <Card className="bg-slate-900 border-slate-800"><CardContent className="py-12 text-center text-slate-500">Wallet dashboard loading...</CardContent></Card>
        </TabsContent>
        <TabsContent value="refunds">
          <Card className="bg-slate-900 border-slate-800"><CardContent className="py-12 text-center text-slate-500">Refund dashboard loading...</CardContent></Card>
        </TabsContent>
        <TabsContent value="gst">
          <Card className="bg-slate-900 border-slate-800"><CardContent className="py-12 text-center text-slate-500">GST Reporting loading...</CardContent></Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
