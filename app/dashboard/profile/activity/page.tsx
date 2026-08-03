'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ShieldAlert, ShieldCheck, MapPin, Monitor, Clock, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getLoginHistory } from "../../../actions/auth";

export default function ActivityPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    try {
      const data = await getLoginHistory(user!.id);
      setHistory(data);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-indigo-500/20 rounded-lg">
          <Activity className="h-6 w-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Login History</h1>
          <p className="text-slate-400 text-sm">Review recent sign-ins to your account</p>
        </div>
      </div>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
          <CardDescription className="text-slate-400">
            If you notice any suspicious activity, we recommend changing your password immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-6"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
          ) : history.length === 0 ? (
            <p className="text-slate-400 text-sm">No recent login activity found.</p>
          ) : (
            <div className="relative border-l border-slate-800 ml-3 space-y-6">
              {history.map((log, idx) => {
                const isMobile = log.user_agent?.toLowerCase().includes('mobile');
                const isSuccess = log.success;
                
                return (
                  <div key={idx} className="relative pl-6">
                    {/* Timeline dot */}
                    <div className={`absolute -left-2.5 top-1 p-1 rounded-full ${isSuccess ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                      {isSuccess ? <ShieldCheck className="w-3 h-3 text-emerald-500" /> : <ShieldAlert className="w-3 h-3 text-rose-500" />}
                    </div>
                    
                    <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/50">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-200 flex items-center">
                            {isSuccess ? 'Successful Sign In' : 'Failed Sign In Attempt'}
                            {!isSuccess && <span className="ml-2 text-xs text-rose-400 bg-rose-950 px-2 py-0.5 rounded-full">Blocked</span>}
                          </p>
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-slate-400 flex items-center">
                              <MapPin className="w-3 h-3 mr-2" /> {log.ip_address || 'Unknown IP'}
                            </p>
                            <p className="text-xs text-slate-400 flex items-center">
                              <Monitor className="w-3 h-3 mr-2" /> {log.user_agent?.substring(0, 40) || 'Unknown Browser'}...
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 flex items-center justify-end">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(log.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
