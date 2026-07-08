"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { getDashboardSummary, DashboardSummary } from "@/services/adminService";
import { getAuditLogs, AuditLog } from "@/services/auditService";
import { StatCard } from "@/components/ui/StatCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Users, Calendar, Mail, CreditCard, Loader2 } from "lucide-react";
import { format } from "date-fns";

const AdminDashboard = () => {
  const { activeOrganization, currentRole } = useTenant();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeOrganization && currentRole) {
      loadDashboard();
    }
  }, [activeOrganization, currentRole]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [summaryData, logsData] = await Promise.all([
        getDashboardSummary(activeOrganization!.id, currentRole!),
        getAuditLogs(activeOrganization!.id, currentRole!, { page: 1, limit: 5 })
      ]);
      setSummary(summaryData);
      setRecentLogs(logsData.logs);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !summary) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <SectionHeader 
        title="Admin Dashboard" 
        description={`Overview for ${activeOrganization?.name}`} 
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Members"
          value={summary.membersCount}
          icon={Users}
        />
        <StatCard
          title="Active Events"
          value={summary.eventsCount}
          icon={Calendar}
        />
        <StatCard
          title="Pending Invites"
          value={summary.pendingInvitesCount}
          icon={Mail}
        />
        <StatCard
          title="Current Plan"
          value={summary.subscriptionPlan}
          icon={CreditCard}
        />
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium text-white mb-4">Recent Activity</h3>
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          {recentLogs.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No recent activity found.</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {recentLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-300">
                      {log.profiles?.email || 'System'} <span className="text-slate-500 font-normal">performed</span> {log.action}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {log.entity_type} {log.entity_id ? `(${log.entity_id.substring(0, 8)})` : ''}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                    {format(new Date(log.created_at), 'MMM d, h:mm a')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
