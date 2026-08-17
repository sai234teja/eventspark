'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { createBrowserClient } from "@supabase/ssr";
import { Search, MapPin, Compass, ShieldCheck, Award, Sparkles, ArrowRight, Github, Linkedin, Twitter } from "lucide-react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";

import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/ui/EventCard";
import LightPillar from "@/components/ui/LightPillar";
import { LiquidNavbar } from "@/components/ui/LiquidNavbar";

const CATEGORY_CARDS = [
  { name: 'Tech', slug: 'tech', icon: '💻', bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-600 dark:text-blue-400", border: "hover:border-blue-500" },
  { name: 'Music', slug: 'music', icon: '🎵', bg: "bg-purple-50 dark:bg-purple-950/30", text: "text-purple-600 dark:text-purple-400", border: "hover:border-purple-500" },
  { name: 'Food', slug: 'food', icon: '🍕', bg: "bg-orange-50 dark:bg-orange-950/30", text: "text-orange-600 dark:text-orange-400", border: "hover:border-orange-500" },
  { name: 'Workshop', slug: 'workshop', icon: '🛠', bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-600 dark:text-emerald-400", border: "hover:border-emerald-500" },
  { name: 'Sports', slug: 'sports', icon: '⚽', bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-600 dark:text-red-400", border: "hover:border-red-500" },
  { name: 'Arts', slug: 'arts', icon: '🎨', bg: "bg-pink-50 dark:bg-pink-950/30", text: "text-pink-600 dark:text-pink-400", border: "hover:border-pink-500" },
];

function Counter({ from = 0, to, duration = 2 }: { from?: number, to: number, duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const count = useMotionValue(from);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    if (inView) {
      animate(count, to, { duration });
    }
  }, [inView, count, to, duration]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

export default function Home() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<any>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCity, setSearchCity] = useState("");
  
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    setMounted(true);
    
    // Check session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // Fetch featured events (latest 3 published)
    supabase
      .from('events')
      .select('*, ticket_types(price)')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data) {
          const processedData = data.map((event: any) => {
            let minPrice = 0;
            if (event.ticket_types && event.ticket_types.length > 0) {
              minPrice = Math.min(...event.ticket_types.map((t: any) => t.price || 0));
            }
            return {
              ...event,
              price: minPrice
            };
          });
          setFeaturedEvents(processedData);
        }
      });
  }, [supabase]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (searchCity) params.set('city', searchCity);
    router.push(`/events?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0A0A0F] transition-colors duration-300 flex flex-col">
      <LiquidNavbar />

      <section className="relative pt-24 pb-32 px-6 flex flex-col items-center justify-center overflow-hidden border-b border-slate-200 dark:border-slate-800/40">
        <div className="absolute inset-0 -z-10 opacity-70 dark:opacity-40">
          <LightPillar
            topColor="#6C47FF"
            bottomColor="#FF9FFC"
            intensity={1.2}
            rotationSpeed={0.5}
            interactive={true}
            quality="high"
            className="z-0 pointer-events-none opacity-80"
            mixBlendMode="normal"
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#6C47FF]/30 to-[#FF6B6B]/30 rounded-full blur-[120px]"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
          className="max-w-4xl mx-auto text-center space-y-8 relative z-10"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[24px] bg-[#6C47FF]/10 text-[#6C47FF] text-xs font-semibold uppercase tracking-wider mb-2"
          >
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen Ticketing & Discovery
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-4 flex flex-col items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: { transition: { staggerChildren: 0.1 } }
              }}
              className="mb-2"
            >
              {["Discover", "and", "book", "the"].map((word, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                  }}
                  className="inline-block mr-3"
                >
                  {word}
                </motion.span>
              ))}
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } }
              }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C47FF] via-[#8F75FF] to-[#FF6B6B]"
            >
              {["Best", "Experiences"].map((word, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                  }}
                  className="inline-block mr-3"
                >
                  {word}
                </motion.span>
              ))}
            </motion.div>
          </h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Find and book tickets for the best tech conferences, music festivals, food meetups, and workshops happening in your city.
          </motion.p>

          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 1 }}
            onSubmit={handleSearch} 
            className="mt-10 bg-white dark:bg-[#111118] p-2 md:p-3 rounded-[24px] md:rounded-full shadow-lg hover:shadow-xl dark:shadow-[#6C47FF]/5 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-2 max-w-2xl mx-auto transition-all duration-300"
          >
            <div className="flex-1 flex items-center px-4 w-full md:w-auto border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 pb-2 md:pb-0">
              <Search className="w-5 h-5 text-slate-400 mr-2.5 shrink-0" />
              <input 
                type="text" 
                placeholder="Search events, keyword, categories..." 
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex-1 flex items-center px-4 w-full md:w-auto py-2 md:py-0">
              <MapPin className="w-5 h-5 text-slate-400 mr-2.5 shrink-0" />
              <input 
                type="text" 
                placeholder="City (e.g. Hyderabad)" 
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium text-sm"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full md:w-auto rounded-[20px] md:rounded-full bg-[#6C47FF] hover:bg-[#6C47FF]/90 text-white px-8 py-6 font-semibold shadow-md shadow-[#6C47FF]/10 shrink-0">
              Find Events
            </Button>
          </motion.form>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="pt-8 flex flex-wrap justify-center items-center gap-8 md:gap-12 text-slate-400 dark:text-slate-500 text-sm font-semibold"
          >
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#6C47FF]" />
              <span><Counter to={1000} />+ Events</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#6C47FF]" />
              <span><Counter to={50} />K+ Attendees</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#6C47FF]" />
              <span>Secure Payments</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="py-24 px-6 bg-white dark:bg-[#111118]/40">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-between items-end mb-12"
          >
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Featured Events</h2>
              <p className="text-slate-600 dark:text-slate-400">Hand-picked events you don&apos;t want to miss.</p>
            </div>
            <Link href="/events" className="hidden md:flex items-center gap-1.5 text-[#6C47FF] font-semibold hover:underline group">
              View all events <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          
          <div className="flex md:grid md:grid-cols-3 gap-8 overflow-x-auto pb-4 md:pb-0 hide-scrollbar snap-x snap-mandatory">
            {featuredEvents.length > 0 ? (
              featuredEvents.map((event, i) => (
                <motion.div 
                  key={event.id} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="w-[85vw] sm:w-[350px] md:w-auto shrink-0 snap-start snap-always"
                >
                  <EventCard event={event} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center text-slate-450 dark:text-slate-500 font-medium">
                Loading events... (Or no events published yet)
              </div>
            )}
          </div>

          <div className="mt-10 text-center md:hidden">
            <Button asChild variant="outline" className="w-full border-slate-350 text-slate-700 dark:border-slate-800 dark:text-slate-300 font-semibold rounded-[8px]">
              <Link href="/events" className="block w-full">
                View all events &rarr;
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-slate-100/50 dark:bg-[#0A0A0F] border-t border-slate-200 dark:border-slate-850">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3"
          >
            Browse by Category
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-600 dark:text-slate-400 mb-12"
          >
            Discover experiences tailored directly to your passions.
          </motion.p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
            {CATEGORY_CARDS.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link href={`/events?category=${cat.slug}`}>
                  <div className={`p-6 rounded-[12px] bg-white dark:bg-[#111118] border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:scale-105 ${cat.border} transition-all duration-300 group flex flex-col items-center gap-3.5 cursor-pointer`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${cat.bg} group-hover:scale-110 transition-transform duration-300`}>
                      {cat.icon}
                    </div>
                    <span className="font-semibold text-sm text-slate-850 dark:text-slate-200">{cat.name}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-white dark:bg-[#111118]/20 border-y border-slate-200 dark:border-slate-800/40 relative">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-extrabold text-slate-900 dark:text-white text-center mb-20"
          >
            How It Works
          </motion.h2>
          
          <div className="relative grid md:grid-cols-3 gap-16 md:gap-8 text-center">
            <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 border-t-2 border-dashed border-slate-200 dark:border-slate-800 -z-10" />

            {[
              { num: "01", title: "Discover & Search", desc: "Find the perfect experience matching your interests and location with our robust keyword filters.", color: "indigo", text: "text-[#6C47FF]", bg: "bg-indigo-50 dark:bg-indigo-950/40", border: "border-indigo-150/40" },
              { num: "02", title: "Secure Booking", desc: "Book instantly using safe and verified Razorpay checkouts with digital signature audits.", color: "orange", text: "text-[#FF6B6B]", bg: "bg-orange-50 dark:bg-orange-950/40", border: "border-orange-150/40" },
              { num: "03", title: "Access Your Entry Pass", desc: "Get a digital ticket and check-in QR code immediately sent to your inbox and user wallet.", color: "emerald", text: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-150/40" },
            ].map((step, i) => (
              <motion.div 
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="space-y-5 relative group"
              >
                <div className={`w-18 h-18 mx-auto ${step.bg} rounded-full flex items-center justify-center ${step.text} border ${step.border} font-extrabold text-xl shadow-md group-hover:-translate-y-2 group-hover:shadow-lg transition-all duration-300 relative`}>
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1.5, opacity: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, repeat: 0 }}
                    className={`absolute inset-0 rounded-full border-2 border-current opacity-20`}
                  />
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#6C47FF] transition-colors">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-450 text-sm leading-relaxed max-w-xs mx-auto">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 dark:bg-[#0A0A0F] text-slate-400 py-16 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-4">
            <BrandLogo />
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              EventSpark is a next-generation decentralized ticketing and event discovery platform designed for organizers and attendees alike.
            </p>
            <p className="text-slate-400 text-sm font-medium">Built with ❤️ in Hyderabad</p>
            <p className="text-slate-500 text-sm">© {new Date().getFullYear()} EventSpark. All rights reserved.</p>
            <div className="flex gap-4 pt-2">
              <Link href="#" className="text-slate-400 hover:text-white transition-colors"><Github className="w-5 h-5" /></Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></Link>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm tracking-wider uppercase">Platform</h4>
            <div className="flex flex-col gap-2.5 text-sm">
              <Link href="/events" className="hover:text-white transition-colors">Browse Events</Link>
              <Link href="/organizer" className="hover:text-white transition-colors">Organizer Portal</Link>
              <Link href="/dashboard" className="hover:text-white transition-colors">My Passes</Link>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm tracking-wider uppercase">Legal</h4>
            <div className="flex flex-col gap-2.5 text-sm">
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
