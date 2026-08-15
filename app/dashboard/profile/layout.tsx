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
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl overflow-hidden shadow-xl min-h-[500px]">
        {children}
      </div>
    </div>
  );
}
