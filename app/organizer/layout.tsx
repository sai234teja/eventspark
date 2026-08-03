'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  ScanLine,
  LogOut,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';

const navItems = [
  { href: '/organizer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/organizer/events', label: 'My Events', icon: CalendarDays },
  { href: '/organizer/events/new', label: 'Create Event', icon: PlusCircle },
  { href: '/organizer/scanner', label: 'Scanner', icon: ScanLine },
];

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function checkAccess() {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (!user || userError) {
        router.replace('/auth/login');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        router.replace('/dashboard');
        return;
      }

      if (profile.role !== 'organizer' && profile.role !== 'admin') {
        router.replace('/dashboard');
        return;
      }

      setLoading(false);
    }

    checkAccess();
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-[#6C47FF] animate-spin" />
          <p className="text-slate-400 text-sm font-semibold">Loading organizer portal…</p>
        </div>
      </div>
    );
  }

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-[#111118] border-r border-slate-800/60 w-64">
      <div className="px-6 py-6 border-b border-slate-800/60 space-y-1">
        <BrandLogo />
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-1">Organizer Hub</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/organizer/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-[8px] text-sm font-bold transition-all ${
                isActive
                  ? 'bg-[#6C47FF] text-white shadow-md shadow-[#6C47FF]/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-6 border-t border-slate-800/60">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-[8px] text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800/40 w-full transition-all"
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-[#0A0A0F] overflow-hidden text-white">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex flex-col w-64 z-50 animate-in slide-in-from-left duration-200">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-6 py-4 bg-[#111118] border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="text-white font-bold text-sm">Organizer Portal</span>
          </div>
          <Sparkles className="w-5 h-5 text-[#6C47FF]" />
        </div>

        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

import { Loader2 } from 'lucide-react';
