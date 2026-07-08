"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, ScrollText, Calendar as CalendarIcon } from "lucide-react";
import { supabase } from "@/contexts/AuthContext";

const AdminDashboard = () => {
  const { activeOrganization } = useTenant();
  const [stats, setStats] = useState({
    members: 0,
    events: 0,
    pendingInvites: 0,
    recentAudits: 0
  });

  useEffect(() => {
    if (activeOrganization) {
      const fetchStats = async () => {
        // Since we don't have all services fully implemented yet, we can do some direct queries 
        // or just placeholders. Let's do simple counts.
        try {
          const { count: membersCount } = await supabase
            .from('organization_members')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', activeOrganization.id);
            
          const { count: eventsCount } = await supabase
            .from('events')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', activeOrganization.id);

          setStats({
            members: membersCount || 0,
            events: eventsCount || 0,
            pendingInvites: 0, // Placeholder until invite service is connected
            recentAudits: 0 // Placeholder
          });
        } catch (error) {
          console.error("Failed to fetch admin stats", error);
        }
      };

      fetchStats();
    }
  }, [activeOrganization]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Admin Overview</h1>
        <p className="text-slate-400 mt-2">
          Manage {activeOrganization?.name || 'your organization'} settings, team members, and billing.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Members</CardTitle>
            <Users className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.members}</div>
            <p className="text-xs text-slate-500">Active users in organization</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Events</CardTitle>
            <CalendarIcon className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.events}</div>
            <p className="text-xs text-slate-500">Events managed</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Pending Invites</CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-300">{stats.pendingInvites}</div>
            <p className="text-xs text-slate-500">Awaiting acceptance</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Subscription</CardTitle>
            <CreditCard className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-300">Free</div>
            <p className="text-xs text-slate-500">Upgrade for more features</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
