"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRequirePermission } from "@/hooks/useRBAC";
import { Permission } from "@/types/rbac";
import { LayoutDashboard, Users, Settings, CreditCard, ScrollText, ArrowLeft, BarChart3, Ticket, ScanLine, Bell, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/ui/BrandLogo";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthorized, isLoading } = useRequirePermission(Permission.MANAGE_TEAM);
  const pathname = usePathname();

  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Admin Portal...</div>;
  }

  if (!isAuthorized) {
    return null; // The hook handles redirection
  }

  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Commerce", href: "/admin/commerce", icon: Store },
    { name: "Tickets", href: "/admin/tickets", icon: Ticket },
    { name: "Check-In", href: "/admin/checkin", icon: ScanLine },
    { name: "Team", href: "/admin/team", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
    { name: "Notifications", href: "/admin/notifications", icon: Bell },
    { name: "Billing & Usage", href: "/admin/billing", icon: CreditCard },
    { name: "Audit Logs", href: "/admin/audit", icon: ScrollText },
  ];

  return (
    <div className="min-h-screen bg-black text-slate-300 font-sans flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col p-4">
        <div className="mb-8 px-2">
          <BrandLogo />
          <div className="text-sm font-medium text-slate-400 mt-2 pl-2 tracking-wide uppercase">Admin Portal</div>
        </div>
        <nav className="space-y-2 flex-grow">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start ${isActive ? 'bg-purple-900/50 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>
        <div className="mt-8 pt-4 border-t border-slate-800">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to App
            </Button>
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-black">
        <div className="p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
