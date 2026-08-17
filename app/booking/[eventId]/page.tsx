'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Loader2, Ticket, User, Mail, AlertCircle, Calendar, MapPin, ArrowLeft } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import ElectricBorder from '@/components/ui/ElectricBorder';
import SpecularButton from '@/components/ui/SpecularButton';
import Image from 'next/image';
import Link from 'next/link';
import Stepper, { Step } from '@/components/ui/Stepper';
import dynamic from 'next/dynamic';
import { vibrateEngineSpool, playProcessingSound, vibrateClick } from '@/utils/audio';

const Hyperspeed = dynamic(() => import('@/components/ui/Hyperspeed'), { ssr: false });

const hyperspeedPreset = {
  distortion: 'LongRaceDistortion',
  length: 400,
  roadWidth: 10,
  islandWidth: 5,
  lanesPerRoad: 2,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 3,
  carLightsFade: 0.4,
  totalSideLightSticks: 50,
  lightPairsPerRoadWay: 70,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5] as [number, number],
  lightStickHeight: [1.3, 1.7] as [number, number],
  movingAwaySpeed: [60, 80] as [number, number],
  movingCloserSpeed: [-120, -160] as [number, number],
  carLightsLength: [400 * 0.05, 400 * 0.15] as [number, number],
  carLightsRadius: [0.05, 0.14] as [number, number],
  carWidthPercentage: [0.3, 0.5] as [number, number],
  carShiftX: [-0.2, 0.2] as [number, number],
  carFloorSeparation: [0.05, 1] as [number, number],
  colors: {
    roadColor: 0x080808,
    islandColor: 0x0a0a0a,
    background: 0x000000,
    shoulderLines: 0x131318,
    brokenLines: 0x131318,
    leftCars: [0xff5f73, 0xe74d60, 0xff102a],
    rightCars: [0xa4e3e6, 0x80d1d4, 0x53c2c6],
    sticks: 0xa4e3e6
  }
};


function BookingContent({ eventId }: { eventId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketTypeId = searchParams.get('ticketTypeId') || '';
  const quantity = parseInt(searchParams.get('quantity') || '1');

  const [user, setUser] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [ticketType, setTicketType] = useState<any>(null);
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1 = Details, 2 = Payment

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadData() {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (!user || userErr) { router.replace('/auth/login'); return; }
      setUser(user);

      // Prefill attendee from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      setAttendeeName(profile?.full_name || user.user_metadata?.full_name || '');
      setAttendeeEmail(profile?.email || user.email || '');

      // Load event
      const { data: ev } = await supabase
        .from('events')
        .select('id, title, slug, start_date, venue_name, city, banner_url, category')
        .eq('id', eventId)
        .single();
      setEvent(ev);

      // Load ticket type
      const { data: tt } = await supabase
        .from('ticket_types')
        .select('id, name, price, quantity_total, quantity_sold, description')
        .eq('id', ticketTypeId)
        .single();
      setTicketType(tt);

      setLoading(false);
    }
    loadData();
  }, [eventId, ticketTypeId]);

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

  const handleBooking = async () => {
    if (!attendeeName.trim() || !attendeeEmail.trim()) {
      setError('Please fill in your name and email.');
      return;
    }

    const totalAmount = ticketType.price * quantity;

    if (totalAmount > 0 && !avatarFile) {
      setError('A profile picture is required for paid event ID passes.');
      return;
    }

    setProcessing(true);
    vibrateEngineSpool(); // Trigger warp engine haptics
    playProcessingSound(); // Play techy scanning sound
    setError('');

    try {
      let avatarUrl = null;
      
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile);
          
        if (uploadErr) {
          throw new Error('Failed to upload profile picture: ' + uploadErr.message);
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
          
        avatarUrl = publicUrl;
      }

      // Call create order API
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketTypeId,
          quantity,
          eventId,
          userId: user.id,
          attendeeName: attendeeName.trim(),
          attendeeEmail: attendeeEmail.trim(),
          avatarUrl: avatarUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create order');

      // FREE ticket flow
      if (data.free) {
        router.push(`/booking/success?registrationId=${data.registrationId}`);
        return;
      }

      // Move to payment step
      setStep(2);

      // PAID: load Razorpay
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Failed to load payment gateway. Please try again.');

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'EventSpark',
        description: `${event?.title} — ${ticketType.name} × ${quantity}`,
        image: '/logo.png',
        order_id: data.razorpayOrderId,
        prefill: {
          name: attendeeName,
          email: attendeeEmail,
        },
        theme: { color: '#6C47FF' },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            setStep(1);
            setError('Payment was cancelled. You can try again.');
          },
        },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/orders/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: data.orderId,
                ticketTypeId,
                quantity,
                userId: user.id,
                attendeeName: attendeeName.trim(),
                attendeeEmail: attendeeEmail.trim(),
                eventId,
                avatarUrl: avatarUrl,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || 'Payment verification failed');

            router.push(`/booking/success?registrationId=${verifyData.registrationId}`);
          } catch (verifyErr: any) {
            setError(verifyErr.message);
            setProcessing(false);
            setStep(1);
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message);
      setProcessing(false);
      setStep(1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0F] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#6C47FF] animate-spin" />
      </div>
    );
  }

  const totalAmount = ticketType ? ticketType.price * quantity : 0;

  return (
    <>
      {processing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <Hyperspeed effectOptions={hyperspeedPreset} className="absolute inset-0 z-0 opacity-80" />
          <div className="z-10 bg-black/40 backdrop-blur-md px-6 sm:px-10 py-8 mx-4 sm:mx-0 text-center rounded-2xl flex flex-col items-center gap-4 text-white border border-white/10 shadow-2xl">
            <Loader2 className="h-10 w-10 animate-spin text-[#FF6B6B]" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Securing Checkout...</h2>
            <p className="text-xs sm:text-sm font-medium text-slate-300">Initiating Hyperspeed Payment Tunnel</p>
          </div>
        </div>
      )}
      <main className="min-h-screen bg-slate-50 dark:bg-[#0A0A0F] text-slate-905 dark:text-white py-6 sm:py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Nav header */}
        <div className="flex items-center justify-between">
          <Link href={event?.slug ? `/events/${event.slug}` : '/events'} className="text-slate-500 hover:text-[#6C47FF] text-sm flex items-center gap-1 font-semibold transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Event
          </Link>
          
          {/* Progress Indicator */}
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-slate-400">
            <span className={step === 1 ? "text-[#6C47FF]" : "text-slate-500"}>1. Details</span>
            {totalAmount > 0 && (
              <>
                <span className="text-slate-600">→</span>
                <span className={step === 2 ? "text-[#6C47FF]" : "text-slate-500"}>2. Payment</span>
              </>
            )}
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Complete Booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Left Column: Form Details */}
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
            <div className="bg-white dark:bg-[#111118] rounded-[12px] border border-slate-200 dark:border-slate-800 p-2 shadow-sm">
              <Stepper
                initialStep={1}
                activeStep={step}
                footerClassName="hidden"
              >
                <Step>
                  <div className="space-y-5 py-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Attendee Details</h2>
                      <p className="text-slate-500 text-sm">Please verify the name and email for your entry pass.</p>
                    </div>

                    {error && (
                      <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-[8px] text-red-650 dark:text-red-400 text-sm">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <p className="font-medium">{error}</p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            value={attendeeName}
                            onChange={e => setAttendeeName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-[8px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#6C47FF] transition-all text-sm font-semibold"
                            placeholder="Attendee full name"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                          <input
                            type="email"
                            value={attendeeEmail}
                            onChange={e => setAttendeeEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-[8px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#6C47FF] transition-all text-sm font-semibold"
                            placeholder="attendee@email.com"
                          />
                        </div>
                      </div>

                      {totalAmount > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                            <span>Profile Picture</span>
                            <span className="text-red-500">* Required for Paid ID</span>
                          </label>
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={e => setAvatarFile(e.target.files?.[0] || null)}
                              className="w-full px-4 py-2.5 rounded-[8px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#6C47FF] transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-300"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end pt-4">
                      <button
                        onClick={() => {
                          vibrateClick();
                          if (!attendeeName.trim() || !attendeeEmail.trim()) {
                            setError('Please fill in your name and email.');
                            return;
                          }
                          if (totalAmount > 0 && !avatarFile) {
                            setError('A profile picture is required for paid event ID passes.');
                            return;
                          }
                          setError('');
                          if (totalAmount === 0) {
                            handleBooking();
                          } else {
                            setStep(2);
                          }
                        }}
                        className="duration-350 flex items-center justify-center rounded-full bg-[#6C47FF] py-2.5 px-6 font-medium tracking-tight text-white transition hover:bg-[#5a3ae0]"
                      >
                        {totalAmount === 0 ? 'Register Free' : 'Continue to Payment'}
                      </button>
                    </div>
                  </div>
                </Step>
                <Step>
                  <div className="space-y-5 py-4 text-center">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Confirm & Pay</h2>
                      <p className="text-slate-500 text-sm mt-2">
                        You are about to secure your ticket for {event?.title}. 
                      </p>
                    </div>
                    {/* CTA action button */}
                    <div className="w-full relative mt-4 block">
                      <SpecularButton
                        onClick={() => {
                          vibrateClick();
                          handleBooking();
                        }}
                        disabled={processing}
                        className="w-full !px-0 !py-4 flex items-center justify-center gap-2 font-bold text-base shadow-lg shadow-[#FF6B6B]/10"
                        radius={8}
                        tint="#FF6B6B"
                        tintOpacity={1}
                        baseColor="#FF6B6B"
                        lineColor="#ffffff"
                        textColor="#ffffff"
                        intensity={1}
                        thickness={1}
                        speed={0.4}
                        followMouse
                      >
                        {processing ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Securing checkout…
                          </>
                        ) : totalAmount === 0 ? (
                          'Confirm Free Ticket →'
                        ) : (
                          `Proceed to Payment (₹${totalAmount.toLocaleString('en-IN')})`
                        )}
                      </SpecularButton>
                    </div>
                  </div>
                </Step>
              </Stepper>
            </div>
          </div>

          {/* Right Column: Order Summary Sticky Card */}
          <div className="space-y-6 lg:sticky lg:top-28 self-start order-1 lg:order-2">
            <div className="bg-white dark:bg-[#111118] rounded-[12px] border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                Order Summary
              </h2>

              {/* Event Mini Details */}
              {event && (
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 relative">
                    <Image
                      src={event.banner_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&q=80"}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate text-sm">{event.title}</p>
                    <p className="text-slate-500 text-xs mt-1 flex items-center gap-1 font-medium">
                      <Calendar className="h-3 w-3 text-indigo-500" />
                      {event.start_date ? new Date(event.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'TBA'}
                    </p>
                    <p className="text-slate-550 text-xs truncate mt-0.5 flex items-center gap-1 font-medium">
                      <MapPin className="h-3 w-3 text-indigo-500" />
                      {event.venue_name || event.city}
                    </p>
                  </div>
                </div>
              )}

              {/* Cost breakdown */}
              <div className="space-y-3.5 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                {totalAmount > 0 ? (
                  <>
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="font-medium">{ticketType?.name} × {quantity}</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        ₹{(ticketType?.price * quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="font-medium">Booking Fee</span>
                      <span className="font-semibold text-emerald-650 dark:text-emerald-400">FREE</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm font-bold pt-3.5 border-t border-slate-100 dark:border-slate-850">
                      <span className="text-slate-900 dark:text-white uppercase tracking-wider text-xs">Total Amount</span>
                      <span className="text-[#6C47FF] text-base font-extrabold">
                        ₹{totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center text-sm font-bold pt-1">
                    <span className="text-slate-900 dark:text-white uppercase tracking-wider text-xs">Ticket Cost</span>
                    <span className="text-emerald-500 text-base font-extrabold bg-emerald-500/10 px-2 py-1 rounded-md">
                      FREE
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
        </div>
      </main>
    </>
  );
}

export default function BookingPage({ params }: { params: { eventId: string } }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0F] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#6C47FF] animate-spin" />
      </div>
    }>
      <BookingContent eventId={params.eventId} />
    </Suspense>
  );
}
