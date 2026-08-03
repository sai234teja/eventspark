'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Key, Smartphone, Laptop, Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SecurityPage() {
  const isLoading = false;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Security & Sessions</h1>
        <p className="text-slate-400">Manage your password, 2FA, and active login sessions across devices.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-400" />
              Password & Authentication
            </CardTitle>
            <CardDescription className="text-slate-400">Update your password and secure your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-800">
              <div>
                <p className="text-slate-200 font-medium">Change Password</p>
                <p className="text-sm text-slate-400">Last changed 3 months ago</p>
              </div>
              <Button variant="outline" className="mt-3 md:mt-0 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                Update
              </Button>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-800">
              <div>
                <p className="text-slate-200 font-medium">Two-Factor Authentication (2FA)</p>
                <p className="text-sm text-slate-400">Add an extra layer of security to your account.</p>
              </div>
              <Button className="mt-3 md:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white">
                Enable 2FA
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              Active Sessions
            </CardTitle>
            <CardDescription className="text-slate-400">Devices that are currently logged into your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-indigo-900/50">
              <div className="flex items-center gap-4">
                <Laptop className="w-8 h-8 text-indigo-400" />
                <div>
                  <p className="text-slate-200 font-medium flex items-center gap-2">
                    Windows PC • Chrome
                    <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-0.5 rounded">Current Session</span>
                  </p>
                  <p className="text-sm text-slate-400">Mumbai, India • Active now</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-800">
              <div className="flex items-center gap-4">
                <Smartphone className="w-8 h-8 text-slate-400" />
                <div>
                  <p className="text-slate-200 font-medium">iPhone 13 Pro • Safari</p>
                  <p className="text-sm text-slate-400">Delhi, India • Last active 2 days ago</p>
                </div>
              </div>
              <Button variant="ghost" className="mt-3 md:mt-0 text-red-400 hover:text-red-300 hover:bg-red-900/20">
                <LogOut className="w-4 h-4 mr-2" />
                Revoke
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
