"use client";

import React from "react";
import { useTenant } from "@/contexts/TenantContext";
import { useDashboardSummary } from "@/lib/react-query/hooks/useDashboard";
import { useAuditLogs } from "@/lib/react-query/hooks/useAuditLogs";
import { StatCard } from "@/components/ui/StatCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Users, Calendar, Mail, CreditCard, Loader2 } from "lucide-react";
import { format } from "date-fns";

const AdminDashboard = () => {
  const { activeOrganization, currentRole } = useTenant();
  
  const { data: summary, isLoading: isLoadingSummary, error: summaryError } = useDashboardSummary(activeOrganization?.id, currentRole);
  const { data: logsData, isLoading: isLoadingLogs } = useAuditLogs(activeOrganization?.id, currentRole, { page: 1, limit: 5 });

  const isLoading = isLoadingSummary || isLoadingLogs;
  const error = summaryError;

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-red-500 mb-2">Error Loading Dashboard</h3>
        <p className="text-slate-400">{(error as any)?.message || "Failed to load dashboard summary"}</p>
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
          {!logsData?.logs || logsData.logs.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No recent activity found.</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {logsData.logs.map((log) => (
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
