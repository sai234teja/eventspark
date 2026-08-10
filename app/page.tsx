'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { createBrowserClient } from "@supabase/ssr";
import { Search, MapPin, Calendar, Compass, Ticket, Sun, Moon, ArrowRight, ShieldCheck, Award, Sparkles, Check, Play } from "lucide-react";

import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/ui/EventCard";
import BlurText from "@/components/ui/BlurText";
import { SoftAurora } from "@/components/ui/SoftAurora";
import LightPillar from "@/components/ui/LightPillar";

const CATEGORY_COLORS: Record<string, { bg: string, text: string, border: string }> = {
  music: { bg: "bg-purple-50 dark:bg-purple-950/30", text: "text-purple-600 dark:text-purple-400", border: "hover:border-purple-500" },
  tech: { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-600 dark:text-blue-400", border: "hover:border-blue-500" },
  sports: { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-600 dark:text-emerald-400", border: "hover:border-emerald-500" },
  food: { bg: "bg-orange-50 dark:bg-orange-950/30", text: "text-orange-600 dark:text-orange-400", border: "hover:border-orange-500" },
  arts: { bg: "bg-pink-50 dark:bg-pink-950/30", text: "text-pink-600 dark:text-pink-400", border: "hover:border-pink-500" },
  business: { bg: "bg-indigo-50 dark:bg-indigo-950/30", text: "text-indigo-650 dark:text-indigo-400", border: "hover:border-indigo-500" },
};

export default function Home() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<any>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCity, setSearchCity] = useState("");
  
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
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
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data) setFeaturedEvents(data);
      });

    // Fetch categories
    supabase
      .from('categories')
      .select('*')
      .limit(6)
      .then(({ data }) => {
        if (data) setCategories(data);
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
      {/* Navbar */}
      <nav className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#0A0A0F]/70 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <BrandLogo />
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/events" className="text-sm font-semibold text-slate-600 dark:text-slate-350 hover:text-[#6C47FF] dark:hover:text-[#6C47FF] transition-colors">
                Browse Events
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2.5 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800"
                aria-label="Toggle Dark Mode"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
            
            {session ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setSession(null);
                  }}
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  Log out
                </button>
                <Button asChild className="bg-[#6C47FF] hover:bg-[#6C47FF]/90 text-white rounded-[8px] font-semibold">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              </div>
            ) : (
              <>
                <Button asChild variant="ghost" className="text-slate-700 dark:text-slate-300 hover:text-[#6C47FF] hover:bg-slate-100 dark:hover:bg-slate-900 font-semibold rounded-[8px]">
                  <Link href="/auth/login">Log in</Link>
                </Button>
                <Button asChild className="bg-[#6C47FF] hover:bg-[#6C47FF]/90 text-white font-semibold rounded-[8px]">
                  <Link href="/auth/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="relative pt-24 pb-32 px-6 flex flex-col items-center justify-center overflow-hidden border-b border-slate-200 dark:border-slate-800/40">
        {/* Animated backgrounds */}
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
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[24px] bg-[#6C47FF]/10 text-[#6C47FF] text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen Ticketing & Discovery
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-4 flex flex-col items-center">
            <BlurText
              text="Discover and book the"
              delay={50}
              animateBy="words"
              direction="top"
              className="mb-2"
            />
            <BlurText
              text="Best Experiences"
              delay={100}
              animateBy="letters"
              direction="bottom"
              className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C47FF] via-[#8F75FF] to-[#FF6B6B]"
            />
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Find and book tickets for the best tech conferences, music festivals, food meetups, and workshops happening in your city.
          </p>

          {/* Interactive, animated search bar */}
          <form onSubmit={handleSearch} className="mt-10 bg-white dark:bg-[#111118] p-2 md:p-3 rounded-full md:rounded-full shadow-lg hover:shadow-xl dark:shadow-[#6C47FF]/5 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-2 max-w-2xl mx-auto transition-all duration-300">
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
            <Button type="submit" className="w-full md:w-auto rounded-full bg-[#6C47FF] hover:bg-[#6C47FF]/90 text-white px-8 py-6 font-semibold shadow-md shadow-[#6C47FF]/10 shrink-0">
              Find Events
            </Button>
          </form>

          {/* Trust Badges */}
          <div className="pt-8 flex flex-wrap justify-center items-center gap-8 md:gap-12 text-slate-400 dark:text-slate-500 text-sm font-semibold">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#6C47FF]" />
              <span>1,000+ Events</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#6C47FF]" />
              <span>50K+ Attendees</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#6C47FF]" />
              <span>Secure Payments</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-24 px-6 bg-white dark:bg-[#111118]/40">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Featured Events</h2>
              <p className="text-slate-600 dark:text-slate-400">Hand-picked events you don't want to miss.</p>
            </div>
            <Link href="/events" className="hidden md:flex items-center gap-1.5 text-[#6C47FF] font-semibold hover:underline group">
              View all events <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {/* 3-col grid desktop, horizontal scroll on mobile */}
          <div className="flex md:grid md:grid-cols-3 gap-8 overflow-x-auto pb-4 md:pb-0 hide-scrollbar snap-x snap-mandatory">
            {featuredEvents.length > 0 ? (
              featuredEvents.map(event => (
                <div key={event.id} className="w-[85vw] sm:w-[350px] md:w-auto shrink-0 snap-start snap-always">
                  <EventCard event={event} />
                </div>
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

      {/* Categories Grid */}
      <section className="py-24 px-6 bg-slate-100/50 dark:bg-[#0A0A0F] border-t border-slate-200 dark:border-slate-850">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">Browse by Category</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-12">Discover experiences tailored directly to your passions.</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
            {categories.map((cat) => {
              const themeStyles = CATEGORY_COLORS[cat.slug] || { bg: "bg-slate-50 dark:bg-slate-900/30", text: "text-slate-600 dark:text-slate-400", border: "hover:border-slate-500" };
              return (
                <Link key={cat.id} href={`/events?category=${cat.slug}`}>
                  <div className={`p-6 rounded-[12px] bg-white dark:bg-[#111118] border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md ${themeStyles.border} transition-all duration-300 group flex flex-col items-center gap-3.5 cursor-pointer`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${themeStyles.bg} group-hover:scale-110 transition-transform duration-300`}>
                      {cat.icon}
                    </div>
                    <span className="font-semibold text-sm text-slate-850 dark:text-slate-200">{cat.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-white dark:bg-[#111118]/20 border-y border-slate-200 dark:border-slate-800/40 relative">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white text-center mb-20">How It Works</h2>
          
          {/* Steps wrapper */}
          <div className="relative grid md:grid-cols-3 gap-16 md:gap-8 text-center">
            {/* Dotted Connection line for desktop */}
            <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 border-t-2 border-dashed border-slate-200 dark:border-slate-800 -z-10" />

            <div className="space-y-5 relative">
              <div className="w-18 h-18 mx-auto bg-indigo-50 dark:bg-indigo-950/40 rounded-full flex items-center justify-center text-[#6C47FF] border border-indigo-150/40 font-extrabold text-xl shadow-md">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Discover & Search</h3>
              <p className="text-slate-600 dark:text-slate-450 text-sm leading-relaxed max-w-xs mx-auto">
                Find the perfect experience matching your interests and location with our robust keyword filters.
              </p>
            </div>

            <div className="space-y-5 relative">
              <div className="w-18 h-18 mx-auto bg-orange-50 dark:bg-orange-950/40 rounded-full flex items-center justify-center text-[#FF6B6B] border border-orange-150/40 font-extrabold text-xl shadow-md">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Secure Booking</h3>
              <p className="text-slate-600 dark:text-slate-450 text-sm leading-relaxed max-w-xs mx-auto">
                Book instantly using safe and verified Razorpay checkouts with digital signature audits.
              </p>
            </div>

            <div className="space-y-5 relative">
              <div className="w-18 h-18 mx-auto bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-150/40 font-extrabold text-xl shadow-md">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Access Your Entry Pass</h3>
              <p className="text-slate-600 dark:text-slate-450 text-sm leading-relaxed max-w-xs mx-auto">
                Get a digital ticket and check-in QR code immediately sent to your inbox and user wallet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-[#0A0A0F] text-slate-400 py-16 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-4">
            <BrandLogo />
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              EventSpark is a next-generation decentralized ticketing and event discovery platform designed for organizers and attendees alike.
            </p>
            <p className="text-slate-600 text-xs">© {new Date().getFullYear()} EventSpark. All rights reserved.</p>
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
