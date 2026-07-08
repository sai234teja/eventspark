"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { getAuditLogs, AuditLog, AuditLogFilters } from "@/services/auditService";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const AuditPage = () => {
  const { activeOrganization, currentRole } = useTenant();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  // In a real app we'd fetch total counts and handle server-side pagination, 
  // but we can fetch a chunk and paginate client-side or use a lightweight approach
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 100, // Fetch 100 items at a time
  });
  
  const { toast } = useToast();

  useEffect(() => {
    if (activeOrganization && currentRole) {
      loadLogs();
    }
  }, [activeOrganization, currentRole, filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await getAuditLogs(activeOrganization!.id, currentRole!, filters);
      setLogs(data.logs);
      // data.totalCount can be used if we switch DataTable to fully controlled server-side pagination
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to load audit logs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    toast({ title: "Export Started", description: "Your CSV is being prepared." });
    // Placeholder for actual CSV generation
  };

  const columns: ColumnDef<AuditLog>[] = [
    {
      header: "Timestamp",
      cell: (log) => (
        <span className="text-slate-300 font-mono text-xs whitespace-nowrap">
          {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
        </span>
      )
    },
    {
      header: "User",
      cell: (log) => (
        <span className="text-slate-300">
          {log.profiles?.email || 'System'}
        </span>
      )
    },
    {
      header: "Action",
      cell: (log) => (
        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-slate-800 text-slate-300">
          {log.action}
        </span>
      )
    },
    {
      header: "Entity",
      cell: (log) => (
        <span className="text-slate-400 text-sm">
          {log.entity_type} {log.entity_id ? `(${log.entity_id.substring(0, 8)}...)` : ''}
        </span>
      )
    }
  ];

  const exportActions = (
    <Button variant="outline" onClick={handleExportCsv} className="border-slate-800 bg-slate-950 text-slate-300 hover:text-white">
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <SectionHeader 
        title="Audit Logs" 
        description="Track administrative actions and security events."
        actions={exportActions}
      />

      <DataTable 
        columns={columns} 
        data={logs} 
        loading={loading}
        searchable
        searchKey="action" // Filter by action locally
        filterOptions={{
          label: "Action Type",
          key: "action",
          options: [
            { label: "Settings Updated", value: "SETTINGS_UPDATED" },
            { label: "Member Added", value: "MEMBER_ADDED" },
            { label: "Member Removed", value: "MEMBER_REMOVED" },
            { label: "Role Changed", value: "ROLE_CHANGED" },
            { label: "Invite Sent", value: "INVITE_SENT" },
          ],
          filterFn: (log, value) => log.action === value
        }}
        emptyMessage="No activity recorded yet."
        itemsPerPage={15}
      />
    </div>
  );
};

export default AuditPage;
