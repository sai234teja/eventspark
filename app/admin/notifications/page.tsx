"use client";

import { useTenant } from '@/contexts/TenantContext';
import { useNotifications, useResendNotification } from '@/lib/react-query/hooks/useNotifications';
import { DataTable } from '@/components/ui/DataTable';
import { RoleGuard } from '@/components/RoleGuard';
import { Permission } from '@/types/rbac';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, RefreshCw } from 'lucide-react';

export default function NotificationsPage() {
  const { activeOrganization: tenant } = useTenant();
  const { data: notifications, isLoading } = useNotifications(tenant?.id || '');
  const resendNotification = useResendNotification();

  const handleResend = (notificationId: string) => {
    if (!tenant) return;
    resendNotification.mutate({ notificationId, organizationId: tenant.id });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered': return <Badge className="bg-green-500/20 text-green-400">Delivered</Badge>;
      case 'failed': return <Badge className="bg-red-500/20 text-red-400">Failed</Badge>;
      default: return <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>;
    }
  };

  return (
    <RoleGuard require={Permission.MANAGE_SETTINGS}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Notifications</h1>
          <p className="text-slate-400 mt-1">View history of emails, SMS, and system notifications.</p>
        </div>

        <DataTable
          data={notifications || []}
          loading={isLoading}
          searchable={true}
          searchKey={(item: any) => `${item.subject} ${item.template} ${item.profile?.full_name}`}
          filterOptions={{
            key: 'delivery_status',
            label: 'Status',
            options: [
              { label: 'Delivered', value: 'delivered' },
              { label: 'Pending', value: 'pending' },
              { label: 'Failed', value: 'failed' }
            ],
            filterFn: (item: any, value) => item.delivery_status === value
          }}
          columns={[
            { 
              header: 'Template', 
              accessorKey: 'template',
              cell: (val: any) => (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-purple-400" />
                  <span className="font-medium">{val.template}</span>
                </div>
              )
            },
            { 
              header: 'Recipient', 
              cell: (val: any) => val.profile?.full_name || 'Unknown User'
            },
            { 
              header: 'Subject', 
              accessorKey: 'subject'
            },
            { 
              header: 'Status', 
              accessorKey: 'delivery_status',
              cell: (val: any) => getStatusBadge(val.delivery_status)
            },
            { 
              header: 'Sent At', 
              accessorKey: 'created_at',
              cell: (val: any) => new Date(val.created_at).toLocaleString()
            },
            {
              header: 'Actions',
              cell: (val: any) => (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleResend(val.id)}
                  disabled={resendNotification.isPending}
                  className="text-slate-400 hover:text-white h-8"
                  title="Resend Notification"
                >
                  <RefreshCw className={`h-4 w-4 ${resendNotification.isPending ? 'animate-spin' : ''}`} />
                </Button>
              )
            }
          ]}
          emptyMessage="No notifications have been sent yet."
        />
      </div>
    </RoleGuard>
  );
}
