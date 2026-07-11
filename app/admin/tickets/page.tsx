"use client";

import { useTenant } from '@/contexts/TenantContext';
import { useTickets, useCancelTicket } from '@/lib/react-query/hooks/useTickets';
import { DataTable } from '@/components/ui/DataTable';
import { RoleGuard } from '@/components/RoleGuard';
import { Permission } from '@/types/rbac';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QrCode, Ticket as TicketIcon, SearchX, Download } from 'lucide-react';
import { exportToCSV } from '@/lib/exportUtils';
import { QRCodeSVG } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function TicketsPage() {
  const { activeOrganization: tenant } = useTenant();
  const { data: tickets, isLoading } = useTickets(tenant?.id || '');
  const cancelTicket = useCancelTicket();

  const handleCancel = (ticketId: string) => {
    if (confirm('Are you sure you want to cancel this ticket?')) {
      cancelTicket.mutate({ organizationId: tenant!.id, ticketId });
    }
  };

  const handleExport = () => {
    if (!tickets) return;
    const exportData = tickets.map(t => ({
      TicketNumber: t.ticket_number,
      Event: t.event?.title || 'Unknown Event',
      Status: t.status,
      IssuedAt: new Date(t.issued_at).toLocaleString(),
      CheckedInAt: t.checked_in_at ? new Date(t.checked_in_at).toLocaleString() : 'N/A',
      Token: t.qr_token
    }));
    exportToCSV(exportData, `tickets-${tenant?.slug || 'export'}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'issued': return <Badge className="bg-blue-500/20 text-blue-400">Issued</Badge>;
      case 'checked-in': return <Badge className="bg-green-500/20 text-green-400">Checked In</Badge>;
      case 'cancelled': return <Badge className="bg-red-500/20 text-red-400">Cancelled</Badge>;
      case 'expired': return <Badge className="bg-slate-500/20 text-slate-400">Expired</Badge>;
      default: return <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>;
    }
  };

  return (
    <RoleGuard require={Permission.MANAGE_REGISTRATIONS}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Tickets</h1>
            <p className="text-slate-400 mt-1">Manage and verify event tickets.</p>
          </div>
          <Button onClick={handleExport} variant="outline" className="border-slate-800 bg-slate-900 text-white hover:bg-slate-800">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>

        <DataTable
          data={tickets || []}
          loading={isLoading}
          searchable={true}
          searchKey={(item: any) => `${item.ticket_number} ${item.qr_token}`}
          filterOptions={{
            key: 'status',
            label: 'Status',
            options: [
              { label: 'Issued', value: 'issued' },
              { label: 'Checked In', value: 'checked-in' },
              { label: 'Cancelled', value: 'cancelled' },
              { label: 'Expired', value: 'expired' }
            ],
            filterFn: (item: any, value) => item.status === value
          }}
          columns={[
            { 
              header: 'Ticket #', 
              accessorKey: 'ticket_number',
              cell: (val: any) => (
                <div className="flex items-center space-x-2">
                  <TicketIcon className="h-4 w-4 text-purple-400" />
                  <span className="font-mono text-sm">{val.ticket_number}</span>
                </div>
              )
            },
            { 
              header: 'Event', 
              accessorKey: 'event',
              cell: (val: any) => val.event?.title || 'Unknown Event'
            },
            { 
              header: 'Status', 
              accessorKey: 'status',
              cell: (val: any) => getStatusBadge(val.status)
            },
            { 
              header: 'Issued', 
              accessorKey: 'issued_at',
              cell: (val: any) => new Date(val.issued_at).toLocaleDateString()
            },
            { 
              header: 'QR', 
              cell: (val: any) => (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white">
                    <DialogHeader>
                      <DialogTitle>Ticket QR Code</DialogTitle>
                      <DialogDescription className="text-slate-400">
                        Scan this code at the event entrance.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg mt-4">
                      <QRCodeSVG value={val.qr_token} size={256} />
                      <p className="mt-4 text-slate-900 font-mono font-bold tracking-wider">{val.ticket_number}</p>
                    </div>
                  </DialogContent>
                </Dialog>
              )
            },
            {
              header: 'Actions',
              cell: (val: any) => (
                val.status === 'issued' && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleCancel(val.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-8"
                  >
                    Cancel
                  </Button>
                )
              )
            }
          ]}
          emptyMessage="No tickets found in this organization."
        />
      </div>
    </RoleGuard>
  );
}
