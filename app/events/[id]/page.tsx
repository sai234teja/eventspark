'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, ArrowLeft, Share2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RegistrationPanel, TicketTier } from "./components/RegistrationPanel";
import { createRazorpayOrderAction, verifyRazorpayPaymentAction } from "@/app/actions/payments";
import Script from "next/script";

export default function EventDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
  }, []);

  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event-details', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          organizations (name, branding)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    }
  });

  const { data: tiers, isLoading: tiersLoading } = useQuery({
    queryKey: ['event-tiers', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ticket_tiers')
        .select('*')
        .eq('event_id', id)
        .eq('is_active', true)
        .order('price', { ascending: true });
      
      if (error) throw error;
      return data as TicketTier[];
    },
    enabled: !!event
  });

  const handleCheckout = async (tierId: string, quantity: number, couponCode?: string) => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase tickets.",
        variant: "destructive"
      });
      router.push('/login');
      return;
    }

    try {
      setIsProcessing(true);
      const tier = tiers?.find(t => t.id === tierId);
      if (!tier) throw new Error("Invalid tier");

      // 1. Create Razorpay order
      const orderData = await createRazorpayOrderAction(
        event.id, 
        (tier.price * quantity).toString(),
        event.organization_id,
        currentUser.id,
        couponCode
      );

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'mock_key',
        amount: orderData.amount,
        currency: orderData.currency,
        name: event.title,
        description: `Ticket: ${tier.name} x${quantity}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            await verifyRazorpayPaymentAction(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              orderData.paymentRecordId,
              event.id,
              currentUser.id,
              event.organization_id
            );
            
            toast({
              title: "Payment Successful!",
              description: "Your tickets have been booked.",
            });
            router.push('/dashboard');
          } catch (verifyError: any) {
            toast({
              title: "Payment Verification Failed",
              description: verifyError.message,
              variant: "destructive"
            });
          }
        },
        prefill: {
          email: currentUser.email,
        },
        theme: {
          color: event.organizations?.branding?.primaryColor || "#3f51b5"
        }
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
      toast({
        title: "Checkout Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link Copied!" });
  };

  if (eventLoading || tiersLoading) {
    return (
      <div className="container mx-auto py-12 flex justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-64 w-full bg-muted rounded-xl mb-8 max-w-4xl"></div>
          <div className="h-8 w-64 bg-muted mb-4"></div>
          <div className="h-4 w-96 bg-muted"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
        <Button asChild><Link href="/events">Browse Events</Link></Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-transparent pb-20">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      {/* Banner */}
      <div className="w-full h-[40vh] md:h-[50vh] bg-muted relative">
        <img 
          src={event.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80"} 
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end">
          <div className="container mx-auto pb-8">
            <Link href="/events" className="inline-flex items-center text-white/80 hover:text-white mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Events
            </Link>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                {event.category}
              </Badge>
              {event.isCompleted && <Badge variant="destructive">Completed</Badge>}
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 max-w-4xl leading-tight">
              {event.title}
            </h1>
            <p className="text-white/90 text-lg md:text-xl max-w-2xl">
              By {event.organizations?.name || "Event Organizer"}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Details Bar */}
            <Card>
              <CardContent className="flex flex-wrap gap-6 p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-full text-primary">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Date</div>
                    <div className="font-medium">{event.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-full text-primary">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Time</div>
                    <div className="font-medium">{event.time}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-full text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Location</div>
                    <div className="font-medium">{event.location}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold">About This Event</h2>
              <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                {event.description}
              </div>
            </section>

            {/* Google Maps Placeholder */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Venue Map</h2>
              <div className="w-full h-64 bg-muted rounded-xl flex items-center justify-center border">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Google Maps Integration Placeholder</p>
                  <p className="text-sm">Location: {event.location}</p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar / Registration Panel */}
          <div className="lg:col-span-1 space-y-6">
            <RegistrationPanel 
              tiers={tiers || []} 
              eventId={event.id}
              onCheckout={handleCheckout}
              isLoading={isProcessing}
            />

            <Button variant="outline" className="w-full" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" /> Share Event
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
