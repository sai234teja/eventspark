'use client';

import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export function AddMoneyButton() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise(resolve => {
      if ((window as any).Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleAddMoney = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const amount = 500; // Hardcoded default top-up amount for demo

      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, userId: user.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initialize top-up');

      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Failed to load payment gateway');

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'EventSpark Wallet',
        description: 'Wallet Top-up',
        order_id: data.orderId,
        theme: { color: '#6C47FF' },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast({ title: 'Payment cancelled' });
          }
        },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/wallet/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...response,
                userId: user.id,
                amount
              }),
            });
            
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || 'Verification failed');

            toast({ title: 'Success!', description: `₹${amount} added to your wallet.` });
            router.refresh();
          } catch (err: any) {
            toast({ variant: 'destructive', title: 'Verification Error', description: err.message });
          } finally {
            setLoading(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
      setLoading(false);
    }
  };

  return (
    <Button 
      className="w-full bg-white text-indigo-900 hover:bg-slate-200 font-bold"
      onClick={handleAddMoney}
      disabled={loading}
    >
      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
      Add Money (₹500)
    </Button>
  );
}
