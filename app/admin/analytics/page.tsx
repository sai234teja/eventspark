'use client';

import React, { useState } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatCard } from '@/components/ui/StatCard';
import { ChartCard } from '@/components/ui/charts/ChartCard';
import { LineChart } from '@/components/ui/charts/LineChart';
import { BarChart } from '@/components/ui/charts/BarChart';
import { PieChart } from '@/components/ui/charts/PieChart';
import { AreaChart } from '@/components/ui/charts/AreaChart';
import { DataTable } from '@/components/ui/DataTable';
import { RoleGuard } from '@/components/RoleGuard';
import { Permission } from '@/types/rbac';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { subDays, startOfDay, format } from 'date-fns';
import { downloadAnalyticsExport } from '@/lib/exportUtils';

import {
  useDashboardSummary,
  useRevenueTrend,
  useRegistrationTrend,
  useAttendanceTrend,
  useTopEvents,
  useRecentEvents,
  useCategoryDistribution,
} from '@/lib/react-query/hooks/useAnalytics';

type DateFilter = 'today' | '7d' | '30d' | '90d' | 'all';

export default function AnalyticsPage() {
  return (
    <RoleGuard require={Permission.VIEW_ANALYTICS}>
      <AnalyticsDashboard />
    </RoleGuard>
  );
}

function AnalyticsDashboard() {
  const { activeOrganization } = useTenant();
  const orgId = activeOrganization?.id || null;

  const [dateFilter, setDateFilter] = useState<DateFilter>('30d');

  const getDateRange = () => {
    if (dateFilter === 'all') return { startDate: undefined, endDate: undefined };
    const now = new Date();
    let start = new Date();
    if (dateFilter === 'today') start = startOfDay(now);
    if (dateFilter === '7d') start = subDays(now, 7);
    if (dateFilter === '30d') start = subDays(now, 30);
    if (dateFilter === '90d') start = subDays(now, 90);

    return {
      startDate: start.toISOString(),
      endDate: now.toISOString()
    };
  };

  const dateRange = getDateRange();

  // Queries
  const { data: summary, isLoading: loadingSummary, refetch: refetchSummary } = useDashboardSummary(orgId);
  const { data: revenueTrend, isLoading: loadingRevenue, refetch: refetchRevenue } = useRevenueTrend(orgId, dateRange.startDate, dateRange.endDate);
  const { data: regTrend, isLoading: loadingReg, refetch: refetchReg } = useRegistrationTrend(orgId, dateRange.startDate, dateRange.endDate);
  const { data: attendance, isLoading: loadingAttendance, refetch: refetchAttendance } = useAttendanceTrend(orgId, dateRange.startDate, dateRange.endDate);
  const { data: topEvents, isLoading: loadingTopEvents, refetch: refetchTopEvents } = useTopEvents(orgId, 5);
  const { data: recentEvents, isLoading: loadingRecentEvents, refetch: refetchRecentEvents } = useRecentEvents(orgId, 5);
  const { data: categories, isLoading: loadingCategories, refetch: refetchCategories } = useCategoryDistribution(orgId);

  const handleRefresh = () => {
    refetchSummary();
    refetchRevenue();
    refetchReg();
    refetchAttendance();
    refetchTopEvents();
    refetchRecentEvents();
    refetchCategories();
  };

  const handleExport = () => {
    downloadAnalyticsExport(
      recentEvents || [],
      revenueTrend || [],
      regTrend || [],
      categories || []
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <SectionHeader 
          title="Analytics Overview" 
          description="Monitor your organization's performance and engagement."
        />
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Events"
          value={summary?.total_events ?? 0}
          description="Across all time"
        />
        <StatCard
          title="Upcoming Events"
          value={summary?.upcoming_events ?? 0}
          description="Scheduled for future"
        />
        <StatCard
          title="Registrations"
          value={summary?.total_registrations ?? 0}
          description="Total attendees"
        />
        <StatCard
          title="Revenue"
          value={`$${(summary?.total_revenue ?? 0).toLocaleString()}`}
          description="Total confirmed payments"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Revenue Trend" description="Succeeded payments over time">
          <LineChart 
            data={revenueTrend || []} 
            xDataKey="date" 
            yDataKey="revenue" 
            isLoading={loadingRevenue} 
            valueFormatter={(val) => `$${val}`}
          />
        </ChartCard>

        <ChartCard title="Registration Trend" description="New registrations over time">
          <BarChart 
            data={regTrend || []} 
            xDataKey="date" 
            yDataKey="registration_count" 
            isLoading={loadingReg} 
          />
        </ChartCard>

        <ChartCard title="Attendance Trend" description="Total registrations per event">
          <AreaChart 
            data={attendance || []} 
            xDataKey="title" 
            yDataKey="total_registrations" 
            isLoading={loadingAttendance} 
          />
        </ChartCard>

        <ChartCard title="Category Distribution" description="Registrations split by event category">
          <PieChart 
            data={categories || []} 
            nameKey="category" 
            dataKey="value" 
            isLoading={loadingCategories} 
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Top Events by Registrations</h3>
          <DataTable 
            data={topEvents || []} 
            columns={[
              { header: 'Title', accessorKey: 'title' },
              { header: 'Date', accessorKey: 'date', cell: (val: any) => new Date(val.date).toLocaleDateString() },
              { header: 'Registrations', accessorKey: 'total_registrations' },
            ]} 
            loading={loadingTopEvents}
          />
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Events</h3>
          <DataTable 
            data={recentEvents || []} 
            columns={[
              { header: 'Title', accessorKey: 'title' },
              { header: 'Category', accessorKey: 'category' },
              { header: 'Revenue', accessorKey: 'total_revenue', cell: (val: any) => `$${val.total_revenue || 0}` },
            ]} 
            loading={loadingRecentEvents}
          />
        </div>
      </div>
    </div>
  );
}
