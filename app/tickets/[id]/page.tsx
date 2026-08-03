'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/contexts/AuthContext";
import { QRCodeSVG } from 'qrcode.react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, MapPin, Download, Share2, 
  Printer, Mail, CalendarPlus, User, ArrowLeft, Send, XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTransfers } from "@/hooks/useTransfers";
import { useCancellations } from "@/hooks/useCancellations";
import { CalendarDropdown } from "@/components/shared/CalendarDropdown";
import { EventShare } from "@/components/shared/EventShare";
import { CalendarEvent } from "@/utils/calendar";

export default function DigitalTicketPage() {
  const params = useParams();
  const id = params?.id as string;
  const { toast } = useToast();
  
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
  }, []);

  const { initiateTransfer } = useTransfers(currentUser?.id);
  const { requestCancellation } = useCancellations(currentUser?.id);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          events (*, organizations(name)),
          ticket_tiers (name)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading ticket...</div>;
  }

  if (!ticket) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Ticket not found</div>;
  }

  const handlePrint = () => {
    window.print();
  };

  const handleTransfer = async () => {
    const email = window.prompt("Enter the email address to transfer this ticket to:");
    if (!email) return;
    
    // We assume ticket.id is both registration_id and ticket_id in this architecture
    const res = await initiateTransfer({ 
      orgId: ticket.events.organization_id, 
      toEmail: email, 
      regId: ticket.id, 
      ticketId: ticket.id 
    });
    
    if (res.success) {
      toast({ title: "Transfer Initiated", description: "The recipient will receive an email to accept the ticket." });
    } else {
      toast({ title: "Transfer Failed", description: res.error, variant: "destructive" });
    }
  };

  const handleCancel = async () => {
    const reason = window.prompt("Reason for cancellation?");
    if (!reason) return;
    
    const res = await requestCancellation({ 
      orgId: ticket.events.organization_id, 
      regId: ticket.id, 
      reason 
    });
    
    if (res.success) {
      toast({ title: "Cancellation Requested", description: "Your cancellation request is under review." });
    } else {
      toast({ title: "Cancellation Failed", description: res.error, variant: "destructive" });
    }
  };

  const calendarEvent: CalendarEvent | null = ticket ? {
    title: ticket.events.title,
    description: ticket.events.description || '',
    location: ticket.events.location,
    startTime: new Date(ticket.events.date),
    endTime: new Date(new Date(ticket.events.date).getTime() + 4 * 60 * 60 * 1000) 
  } : null;

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 md:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/dashboard" className="inline-flex items-center text-slate-400 hover:text-white print:hidden">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Link>

        {/* Action Bar - Hidden on print */}
        <div className="flex flex-wrap gap-3 p-4 bg-slate-900 rounded-xl border border-slate-800 print:hidden justify-between">
           <div className="flex flex-wrap gap-2">
             <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="h-4 w-4 mr-2"/> Print</Button>
             <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2"/> PDF</Button>
             {calendarEvent && <CalendarDropdown event={calendarEvent} variant="outline" className="h-9 px-3" />}
           </div>
           <div className="flex flex-wrap gap-2">
             <EventShare 
               url={`/events/${ticket.events.id}`}
               title={ticket.events.title}
               description={ticket.events.description || 'I got my ticket for this event!'}
               variant="outline"
               className="h-9 px-3"
             />
             <Button variant="outline" size="sm" onClick={handleTransfer} disabled={ticket.status !== 'issued'}>
               <Send className="h-4 w-4 mr-2"/> Transfer
             </Button>
             <Button variant="outline" size="sm" onClick={handleCancel} disabled={ticket.status !== 'issued'} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50">
               <XCircle className="h-4 w-4 mr-2"/> Cancel
             </Button>
           </div>
        </div>

        {/* Digital Ticket */}
        <Card className="overflow-hidden border-0 shadow-2xl bg-white text-slate-900 print:shadow-none print:border">
          {/* Banner */}
          <div className="h-48 w-full relative">
            <img 
              src={ticket.events.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200"} 
              className="w-full h-full object-cover"
              alt="Event Banner"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-between p-6">
               <Badge className="w-max bg-white text-black hover:bg-slate-200">
                 {ticket.ticket_tiers?.name || 'General Admission'}
               </Badge>
               <h1 className="text-3xl font-bold text-white drop-shadow-lg">{ticket.events.title}</h1>
            </div>
          </div>

          <CardContent className="p-0">
            <div className="grid md:grid-cols-3">
              {/* Event Info */}
              <div className="md:col-span-2 p-8 border-r border-dashed border-slate-300">
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wide font-semibold">Organized By</p>
                    <p className="text-lg font-medium">{ticket.events.organizations?.name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-slate-500 uppercase tracking-wide font-semibold mb-1 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" /> Date & Time
                      </p>
                      <p className="font-medium">{ticket.events.date}</p>
                      <p className="text-slate-600">{ticket.events.time}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 uppercase tracking-wide font-semibold mb-1 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" /> Location
                      </p>
                      <p className="font-medium">{ticket.events.location}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wide font-semibold mb-1 flex items-center">
                      <User className="h-4 w-4 mr-1" /> Attendee Details
                    </p>
                    <p className="font-medium">{currentUser?.email || 'Guest User'}</p>
                  </div>
                  
                  <div className="pt-6 mt-6 border-t border-slate-200">
                    <h4 className="font-semibold mb-3 text-slate-700">Ticket Timeline</h4>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full mt-1.5"></div>
                      </div>
                      <div>
                        <p className="font-medium text-emerald-600">Purchased</p>
                        <p className="text-slate-500 text-sm">{new Date(ticket.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="p-8 bg-slate-50 flex flex-col items-center justify-center text-center">
                <div className="bg-white p-4 rounded-xl shadow-sm border mb-4">
                  <QRCodeSVG 
                    value={ticket.qr_token} 
                    size={150}
                    level="H"
                  />
                </div>
                <p className="font-mono text-sm tracking-widest text-slate-600 mb-1">{ticket.qr_token}</p>
                <p className="text-xs text-slate-400">Scan at entrance</p>
                
                <Badge className="mt-6 bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 text-base py-1 px-4">
                  {ticket.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
