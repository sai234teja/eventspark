'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { LogIn, UserPlus, LayoutDashboard, Compass, Sparkles } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { createBrowserClient } from '@supabase/ssr';
import './LiquidNavbar.css';

export function LiquidNavbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<string>('user');
  const [appStatus, setAppStatus] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    setMounted(true);
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        // Fetch role
        supabase.from('profiles').select('role').eq('id', data.session.user.id).single().then(({ data: profile }) => {
          if (profile) setRole(profile.role);
        });
        // Fetch application status
        supabase.from('organizer_applications').select('status').eq('user_id', data.session.user.id).single().then(({ data: app }) => {
          if (app) setAppStatus(app.status);
        });
      }
    });
  }, [supabase]);

  const tabs = [
    { label: 'Browse Events', href: '/events', icon: <Compass className="w-[18px] h-[18px]" /> },
    ...(!session ? [
      { label: 'Log In', href: '/auth/login', icon: <LogIn className="w-[18px] h-[18px]" /> },
      { label: 'Sign Up', href: '/auth/signup', icon: <UserPlus className="w-[18px] h-[18px]" /> }
    ] : [
      { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
      ...(role === 'organizer' || role === 'admin' 
        ? [{ label: 'Organizer Dashboard', href: '/organizer/dashboard', icon: <Sparkles className="w-[18px] h-[18px]" /> }] 
        : appStatus === 'PENDING'
          ? [{ label: 'Application Pending', href: '/organizer/register', icon: <Sparkles className="w-[18px] h-[18px]" /> }]
          : [{ label: 'Become an Organizer', href: '/organizer/register', icon: <Sparkles className="w-[18px] h-[18px]" /> }]
      )
    ])
  ];

  // Find active tab based on path
  const activeIndex = tabs.findIndex(tab => tab.href === pathname || (pathname.startsWith(tab.href) && tab.href !== '/'));
  // If no tab matches but we're on the landing page, we might just highlight the first one or none.
  const activeTab = activeIndex >= 0 ? activeIndex : 0; 

  const updatePill = (index: number) => {
    if (pillRef.current && navRef.current) {
      const buttons = navRef.current.querySelectorAll('.nav-btn');
      const activeBtn = buttons[index] as HTMLElement;
      if (activeBtn) {
        pillRef.current.style.transition = "transform .5s cubic-bezier(.34,1.2,.64,1), width .5s cubic-bezier(.34,1.2,.64,1)";
        pillRef.current.style.width = `${activeBtn.offsetWidth}px`;
        pillRef.current.style.transform = `translateX(${activeBtn.offsetLeft}px)`;
      }
    }
  };

  useEffect(() => {
    // Initial pill placement
    if (mounted) {
      setTimeout(() => updatePill(activeTab), 50);
    }
    
    const handleResize = () => {
      if (pillRef.current) {
        pillRef.current.style.transition = 'none';
      }
      updatePill(activeTab);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab, mounted, session]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!navRef.current || !glareRef.current) return;
    const rect = navRef.current.getBoundingClientRect();
    glareRef.current.style.setProperty('--x', `${e.clientX - rect.left}px`);
    glareRef.current.style.setProperty('--y', `${e.clientY - rect.top}px`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (!mounted) return null;

  return (
    <div className="w-full flex justify-center sticky top-6 z-50 px-4 pointer-events-none">
      <nav 
        className="liquid-nav pointer-events-auto" 
        id="nav" 
        ref={navRef}
        onMouseMove={handleMouseMove}
      >
        <div className="liquid-glare-container">
          <div className="liquid-glare" id="glare" ref={glareRef}></div>
        </div>

        <div className="pr-4 pl-2 z-10 flex items-center">
          <Link href="/">
            <BrandLogo />
          </Link>
        </div>

        <div className="nav-items relative hidden md:flex">
          <div className="active-pill" id="active-pill" ref={pillRef}></div>

          {tabs.map((tab, idx) => (
            <Link key={tab.label} href={tab.href}>
              <button 
                className={`nav-btn ${activeTab === idx ? 'active' : ''}`}
                onClick={() => updatePill(idx)}
              >
                <div className="btn-content text-sm md:text-[15px]">
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>
              </button>
            </Link>
          ))}
          
          {session && (
            <button 
              className="nav-btn text-rose-500/80 hover:text-rose-500"
              onClick={handleLogout}
            >
              <div className="btn-content text-[15px]">
                <span>Log out</span>
              </div>
            </button>
          )}
        </div>

        <div className="divider hidden md:block"></div>

        <button 
          className="theme-btn" 
          id="theme-btn" 
          aria-label="Dark Mode Toggle"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <div className="theme-icon-wrapper">
            <svg className="sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <svg className="moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </div>
        </button>
      </nav>
    </div>
  );
}
