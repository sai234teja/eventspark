'use client';

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { OrganizationSwitcher } from "@/components/OrganizationSwitcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Search, Filter, Loader2, CalendarRange, Trash2, Sun, Moon, SlidersHorizontal, ChevronDown } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useSearch } from "@/hooks/useSearch";
import { EventCard } from "@/components/ui/EventCard";
import { createBrowserClient } from "@supabase/ssr";

const CATEGORIES_WITH_DOTS = [
  { slug: "music", name: "Music", dotColor: "bg-purple-500" },
  { slug: "tech", name: "Tech", dotColor: "bg-blue-500" },
  { slug: "sports", name: "Sports", dotColor: "bg-emerald-500" },
  { slug: "food", name: "Food", dotColor: "bg-orange-500" },
  { slug: "arts", name: "Arts", dotColor: "bg-pink-500" },
  { slug: "business", name: "Business", dotColor: "bg-indigo-500" },
];

function EventsDiscoveryContent() {
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<any>(null);
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || "");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(searchParams.get('category') || undefined);
  const [locationFilter, setLocationFilter] = useState(searchParams.get('city') || "");
  const [sortBy, setSortBy] = useState<'date_asc' | 'date_desc' | 'price_asc' | 'price_desc' | 'popularity'>('date_desc');
  const [page, setPage] = useState(1);
  const [isFree, setIsFree] = useState<boolean | undefined>();
  const [hasAvailableSeats, setHasAvailableSeats] = useState<boolean | undefined>();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Simple debounce inline instead of hook for brevity
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('q') || "");
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    setMounted(true);
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
  }, [supabase]);

  // Update debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { events, totalPages, isLoading } = useSearch({
    keyword: debouncedSearch,
    category: categoryFilter,
    location: locationFilter,
    sortBy,
    isFree,
    hasAvailableSeats,
    page,
    limit: 12
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0F] text-slate-900 dark:text-white pb-16 transition-colors duration-300">
      {/* Navbar */}
      <nav className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#0A0A0F]/70 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <BrandLogo />
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
            <Link href="/dashboard">
              <Button variant="ghost" className="text-slate-700 dark:text-slate-300 hover:text-[#6C47FF] hover:bg-slate-100 dark:hover:bg-slate-900 font-semibold rounded-[8px]">
                Dashboard
              </Button>
            </Link>
            <Link href="/create-event">
              <Button className="bg-[#6C47FF] hover:bg-[#6C47FF]/90 text-white font-semibold rounded-[8px]">
                Create Event
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 md:gap-10 items-start">
        
        {/* Filters Sidebar */}
        <aside className="w-full shrink-0 space-y-6 sticky top-24 self-start z-10">
          <div className="bg-white dark:bg-[#111118] border border-slate-200 dark:border-slate-800 rounded-[12px] p-6 shadow-sm flex flex-col">
            
            <button 
              className="md:hidden flex items-center justify-between w-full pb-3 border-b border-slate-200 dark:border-slate-800"
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            >
              <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <SlidersHorizontal className="h-4.5 w-4.5 text-[#6C47FF]" /> Filters
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isMobileFiltersOpen ? 'rotate-180' : ''}`} />
            </button>

            <h2 className="hidden md:flex text-base font-bold text-slate-900 dark:text-white items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <SlidersHorizontal className="h-4.5 w-4.5 text-[#6C47FF]" /> Filter Events
            </h2>
            
            <div className={`space-y-5 pt-4 md:pt-6 md:block overflow-hidden transition-all duration-300 ${isMobileFiltersOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 md:max-h-none md:opacity-100'}`}>
              {/* Search input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-[8px]"
                  />
                </div>
              </div>

              {/* City filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="City..."
                    value={locationFilter}
                    onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }}
                    className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-[8px]"
                  />
                </div>
              </div>

              {/* Sort filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sort By</label>
                <Select value={sortBy} onValueChange={(val: any) => { setSortBy(val); setPage(1); }}>
                  <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-[8px]">
                    <SelectValue placeholder="Sort..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date_desc">Newest First</SelectItem>
                    <SelectItem value="date_asc">Oldest First</SelectItem>
                    <SelectItem value="popularity">Popularity</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category checkboxes with colored dots */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categories</label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 hide-scrollbar">
                  {CATEGORIES_WITH_DOTS.map((cat) => (
                    <label key={cat.slug} className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-350 cursor-pointer hover:text-[#6C47FF] transition-colors">
                      <div className="flex items-center space-x-2.5">
                        <input
                          type="checkbox"
                          checked={categoryFilter === cat.slug}
                          onChange={(e) => {
                            setCategoryFilter(e.target.checked ? cat.slug : undefined);
                            setPage(1);
                          }}
                          className="rounded border-slate-300 dark:border-slate-700 text-[#6C47FF] focus:ring-[#6C47FF] w-4 h-4"
                        />
                        <span className="font-medium">{cat.name}</span>
                      </div>
                      <span className={`w-2.5 h-2.5 rounded-full ${cat.dotColor}`} />
                    </label>
                  ))}
                </div>
              </div>

              {/* Toggle controls */}
              <div className="space-y-3 pt-4 border-t border-slate-250 dark:border-slate-800">
                <label className="flex items-center space-x-2.5 text-sm text-slate-750 dark:text-slate-300 cursor-pointer hover:text-[#6C47FF] transition-colors">
                  <input
                    type="checkbox"
                    checked={isFree || false}
                    onChange={e => { setIsFree(e.target.checked ? true : undefined); setPage(1); }}
                    className="rounded border-slate-300 dark:border-slate-700 text-[#6C47FF] focus:ring-[#6C47FF] w-4 h-4"
                  />
                  <span className="font-semibold text-xs uppercase tracking-wider text-slate-500">Free Events Only</span>
                </label>
                <label className="flex items-center space-x-2.5 text-sm text-slate-750 dark:text-slate-300 cursor-pointer hover:text-[#6C47FF] transition-colors">
                  <input
                    type="checkbox"
                    checked={hasAvailableSeats || false}
                    onChange={e => { setHasAvailableSeats(e.target.checked ? true : undefined); setPage(1); }}
                    className="rounded border-slate-300 dark:border-slate-700 text-[#6C47FF] focus:ring-[#6C47FF] w-4 h-4"
                  />
                  <span className="font-semibold text-xs uppercase tracking-wider text-slate-500">Hide Sold Out</span>
                </label>
              </div>

              {/* Clear button */}
              <Button 
                variant="outline" 
                className="w-full border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-[8px]"
                onClick={() => {
                  setSearchTerm("");
                  setDebouncedSearch("");
                  setCategoryFilter(undefined);
                  setLocationFilter("");
                  setSortBy('date_desc');
                  setIsFree(undefined);
                  setHasAvailableSeats(undefined);
                  setPage(1);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Clear Filters
              </Button>
            </div>
          </div>
        </aside>

        {/* Results */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Explore Events</h1>
            {isLoading && <Loader2 className="h-6 w-6 text-[#6C47FF] animate-spin" />}
          </div>

          {events.length === 0 && !isLoading ? (
            <Card className="bg-white dark:bg-[#111118] border-slate-200 dark:border-slate-800 border-dashed py-20 text-center rounded-[12px] shadow-sm">
              <CardContent className="flex flex-col items-center max-w-sm mx-auto space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">No events found</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  We couldn&apos;t find any events matching your combination of filters. Try clearing them to start over.
                </p>
                <div className="pt-2">
                  <Button 
                    className="bg-[#6C47FF] hover:bg-[#6C47FF]/90 text-white rounded-[8px]"
                    onClick={() => {
                      setSearchTerm("");
                      setDebouncedSearch("");
                      setCategoryFilter(undefined);
                      setLocationFilter("");
                      setSortBy('date_desc');
                      setIsFree(undefined);
                      setHasAvailableSeats(undefined);
                      setPage(1);
                    }}
                  >
                    Reset Search Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {events.map((event: any) => (
                <EventCard key={event.id} event={event} />
              ))}
              {isLoading && events.length === 0 && [1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-[360px] bg-white dark:bg-[#111118] border border-slate-200 dark:border-slate-800 rounded-[12px] animate-pulse"></div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-12">
              <Button 
                variant="outline" 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="bg-white dark:bg-[#111118] border-slate-200 dark:border-slate-850 rounded-[8px]"
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-slate-500 dark:text-slate-450 text-sm font-semibold">
                Page {page} of {totalPages}
              </span>
              <Button 
                variant="outline" 
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="bg-white dark:bg-[#111118] border-slate-200 dark:border-slate-850 rounded-[8px]"
              >
                Next
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function EventsDiscoveryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex justify-center items-center"><Loader2 className="animate-spin text-[#6C47FF] h-8 w-8" /></div>}>
      <EventsDiscoveryContent />
    </Suspense>
  );
}
