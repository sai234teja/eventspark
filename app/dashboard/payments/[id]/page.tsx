'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, CheckCircle2, AlertCircle, Clock, 
  IndianRupee, Download, RefreshCcw, FileText, Activity, Receipt 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { createRazorpayOrderAction } from "@/app/actions/payments";

export default function PaymentDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { toast } = useToast();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
  }, []);

  const { data: payment, isLoading } = useQuery({
    queryKey: ['payment-details', id],
    queryFn: async () => {
      if (!currentUser) return null;
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          events (title, id, organization_id)
        `)
        .eq('id', id)
        .eq('user_id', currentUser.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentUser
  });

  const handleRetryPayment = async () => {
    if (!payment || payment.status !== 'failed') return;
    try {
      setIsRetrying(true);
      
      // Attempt to re-create the order
      const orderData = await createRazorpayOrderAction(
        payment.events.id, 
        payment.amount.toString(),
        payment.events.organization_id,
        currentUser.id,
        payment.coupon_code
      );

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'mock_key',
        amount: orderData.amount,
        currency: orderData.currency,
        name: payment.events.title,
        description: `Retry Payment for Order`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // A real implementation would hit a verify endpoint here
          toast({
            title: "Payment Successful!",
            description: "Your payment has been completed.",
          });
          window.location.reload();
        },
        prefill: { email: currentUser.email },
        theme: { color: "#3f51b5" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast({
          title: "Payment Failed",
          description: response.error.description,
          variant: "destructive"
        });
      });
      rzp.open();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsRetrying(false);
    }
  };

  const calculateGST = (amount: number) => {
    // Basic calculation assuming 18% GST was added on top of base
    const baseAmount = amount / 1.18;
    const gstAmount = amount - baseAmount;
    return { base: baseAmount.toFixed(2), gst: gstAmount.toFixed(2) };
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-purple-200">Loading payment details...</p>
      </div>
    </div>;
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center flex-col p-6 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Payment Not Found</h1>
        <p className="text-purple-200 mb-6">This transaction might not exist or you do not have permission to view it.</p>
        <Link href="/dashboard"><Button>Return to Dashboard</Button></Link>
      </div>
    );
  }

  const { base, gst } = calculateGST(payment.amount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pb-20">
      <nav className="px-6 py-4 border-b border-purple-800/50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <BrandLogo />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link href="/dashboard" className="inline-flex items-center text-purple-200 hover:text-white mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-white/10 backdrop-blur-sm border-purple-300/20">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-2xl flex items-center gap-2">
                      <Receipt className="h-6 w-6" /> Payment Details
                    </CardTitle>
                    <CardDescription className="text-purple-200 mt-1">
                      Transaction ID: {payment.razorpay_payment_id || 'Pending'}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className={`
                    text-base px-3 py-1 uppercase
                    ${payment.status === 'captured' ? 'border-green-500 text-green-400 bg-green-500/10' : ''}
                    ${payment.status === 'failed' ? 'border-red-500 text-red-400 bg-red-500/10' : ''}
                    ${payment.status === 'pending' ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10' : ''}
                  `}>
                    {payment.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-purple-300 text-sm mb-1">Date</p>
                    <p className="text-white font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-400" />
                      {new Date(payment.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm mb-1">Order ID</p>
                    <p className="text-white font-medium break-all">{payment.razorpay_order_id}</p>
                  </div>
                  <div className="col-span-2 border-t border-purple-800/30 pt-4 mt-2">
                    <p className="text-purple-300 text-sm mb-1">Related Event</p>
                    <p className="text-white font-medium text-lg">{payment.events?.title}</p>
                  </div>
                </div>

                <div className="bg-black/20 p-4 rounded-lg border border-purple-800/30">
                  <h4 className="text-white font-semibold mb-4 border-b border-purple-800/30 pb-2">Amount Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-purple-200">
                      <span>Base Ticket Price</span>
                      <span>₹{base}</span>
                    </div>
                    <div className="flex justify-between text-purple-200">
                      <span>GST (18%)</span>
                      <span>₹{gst}</span>
                    </div>
                    {payment.coupon_code && (
                      <div className="flex justify-between text-green-400">
                        <span>Coupon Applied ({payment.coupon_code})</span>
                        <span>- Included in base -</span>
                      </div>
                    )}
                    <div className="flex justify-between text-white font-bold text-lg border-t border-purple-800/30 pt-2 mt-2">
                      <span>Total Paid</span>
                      <span>₹{payment.amount}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-purple-300/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5" /> Payment Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mt-1.5"></div>
                      <div className="w-0.5 h-full bg-purple-500/50 my-1"></div>
                    </div>
                    <div className="pb-4">
                      <p className="text-white font-medium">Order Created</p>
                      <p className="text-purple-300 text-sm">{new Date(payment.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {payment.status === 'pending' && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mt-1.5 animate-pulse"></div>
                      </div>
                      <div className="pb-4">
                        <p className="text-yellow-400 font-medium">Awaiting Payment</p>
                        <p className="text-purple-300 text-sm">Proceed to checkout to complete your order</p>
                      </div>
                    </div>
                  )}

                  {payment.status === 'captured' && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                      </div>
                      <div className="pb-4">
                        <p className="text-green-400 font-medium">Payment Captured</p>
                        <p className="text-purple-300 text-sm">Transaction verified successfully</p>
                      </div>
                    </div>
                  )}

                  {payment.status === 'failed' && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5"></div>
                      </div>
                      <div className="pb-4">
                        <p className="text-red-400 font-medium">Payment Failed</p>
                        <p className="text-purple-300 text-sm">The transaction was declined or cancelled.</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-white/10 backdrop-blur-sm border-purple-300/20">
              <CardHeader>
                <CardTitle className="text-white">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {payment.status === 'captured' && (
                  <>
                    <Button variant="outline" className="w-full justify-start border-purple-500/30 text-purple-100 hover:bg-purple-500/20">
                      <FileText className="h-4 w-4 mr-2" /> Download Receipt
                    </Button>
                    <Button variant="outline" className="w-full justify-start border-purple-500/30 text-purple-100 hover:bg-purple-500/20">
                      <Download className="h-4 w-4 mr-2" /> Download GST Invoice
                    </Button>
                  </>
                )}
                
                {payment.status === 'failed' && (
                  <Button 
                    onClick={handleRetryPayment}
                    disabled={isRetrying}
                    className="w-full justify-start bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isRetrying ? (
                      <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCcw className="h-4 w-4 mr-2" /> 
                    )}
                    Retry Failed Payment
                  </Button>
                )}
                
                {payment.status === 'pending' && (
                  <Button 
                    onClick={handleRetryPayment}
                    className="w-full justify-start bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    <IndianRupee className="h-4 w-4 mr-2" /> Complete Payment
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
