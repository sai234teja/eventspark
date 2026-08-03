import Link from "next/link";
import { User, Shield, Activity, Settings, Bell, Lock } from "lucide-react";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      {/* Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-1">
        <h2 className="text-xl font-semibold text-white mb-4 px-2">Account Settings</h2>
        
        <Link href="/dashboard/profile/edit" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:text-white hover:bg-slate-800">
          <User className="h-4 w-4 mr-3" />
          Profile Details
        </Link>
        <Link href="/dashboard/profile/security" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:text-white hover:bg-slate-800">
          <Shield className="h-4 w-4 mr-3" />
          Security & Sessions
        </Link>
        <Link href="/dashboard/profile/activity" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:text-white hover:bg-slate-800">
          <Activity className="h-4 w-4 mr-3" />
          Login History
        </Link>
        <Link href="/dashboard/profile/preferences" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:text-white hover:bg-slate-800">
          <Settings className="h-4 w-4 mr-3" />
          Preferences
        </Link>
        <Link href="/dashboard/profile/privacy" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:text-white hover:bg-slate-800">
          <Lock className="h-4 w-4 mr-3" />
          Privacy
        </Link>
        <Link href="/dashboard/profile/wallet" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:text-white hover:bg-slate-800">
          <svg className="h-4 w-4 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
          Wallet
        </Link>
        <Link href="/dashboard/profile/tickets" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:text-white hover:bg-slate-800">
          <svg className="h-4 w-4 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
          Tickets
        </Link>
        <Link href="/dashboard/profile/payments" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:text-white hover:bg-slate-800">
          <svg className="h-4 w-4 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          Payments
        </Link>
        <Link href="/dashboard/profile/badges" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:text-white hover:bg-slate-800">
          <svg className="h-4 w-4 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
          Badges
        </Link>
        <Link href="/dashboard/profile/certificates" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:text-white hover:bg-slate-800">
          <svg className="h-4 w-4 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="M8 18v-1"/><path d="M16 18v-3"/></svg>
          Certificates
        </Link>
        <Link href="/dashboard/profile/referrals" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:text-white hover:bg-slate-800">
          <svg className="h-4 w-4 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Referrals
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl overflow-hidden shadow-xl min-h-[500px]">
        {children}
      </div>
    </div>
  );
}
