"use client";

import { useState, useRef, useEffect } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { useVerifyTicket, useCheckInTicket } from '@/lib/react-query/hooks/useTickets';
import { RoleGuard } from '@/components/RoleGuard';
import { Permission } from '@/types/rbac';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, ScanLine, Keyboard, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { BrowserMultiFormatReader } from '@zxing/library';

export default function CheckInPage() {
  const { activeOrganization: tenant } = useTenant();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [manualToken, setManualToken] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const verifyTicket = useVerifyTicket();
  const checkInTicket = useCheckInTicket();
  const codeReader = useRef(new BrowserMultiFormatReader());

  useEffect(() => {
    if (activeTab === 'camera') {
      startScanner();
    } else {
      stopScanner();
    }
    return () => stopScanner();
  }, [activeTab]);

  const startScanner = async () => {
    if (!videoRef.current) return;
    try {
      setIsScanning(true);
      const videoInputDevices = await codeReader.current.listVideoInputDevices();
      const selectedDeviceId = videoInputDevices[0]?.deviceId;
      
      codeReader.current.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (result, err) => {
        if (result) {
          handleScan(result.getText());
        }
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to access camera');
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    codeReader.current.reset();
    setIsScanning(false);
  };

  const handleScan = async (token: string, isToken: boolean = true) => {
    if (verifyTicket.isPending || checkInTicket.isPending || !tenant || !user) return;
    stopScanner(); // Pause scanner while processing
    
    try {
      const ticket = await verifyTicket.mutateAsync({ 
        organizationId: tenant.id, 
        identifier: token,
        isToken
      });

      if (!ticket) {
        toast.error('Invalid Ticket');
        setLastScanned({ status: 'invalid', message: 'Ticket not found' });
      } else if ((ticket as any).status === 'checked-in') {
        toast.error('Ticket already checked in!');
        setLastScanned({ status: 'warning', message: 'Already checked in', ticket });
      } else if ((ticket as any).status !== 'issued') {
        toast.error(`Ticket is ${(ticket as any).status}`);
        setLastScanned({ status: 'invalid', message: `Ticket is ${(ticket as any).status}`, ticket });
      } else {
        // Proceed to check in
        await checkInTicket.mutateAsync({
          organizationId: tenant.id,
          ticketId: (ticket as any).id,
          userId: user.id,
          device: navigator.userAgent
        });
        setLastScanned({ status: 'success', message: 'Check-in successful!', ticket });
      }
    } catch (err: any) {
      toast.error('Invalid Ticket or Error');
      setLastScanned({ status: 'invalid', message: err.message });
    }

    // Resume scanner after 2 seconds if on camera tab
    setTimeout(() => {
      setLastScanned(null);
      if (activeTab === 'camera') startScanner();
    }, 3000);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    // Guess if it's a TKT number or UUID
    const isToken = manualToken.length > 20; 
    handleScan(manualToken, isToken);
    setManualToken('');
  };

  return (
    <RoleGuard require={Permission.MANAGE_REGISTRATIONS}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Scanner</h1>
          <p className="text-slate-400 mt-1">Check-in attendees at the door.</p>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-center space-x-4 border-b border-slate-800 p-0">
            <button
              onClick={() => setActiveTab('camera')}
              className={`flex-1 py-4 flex items-center justify-center space-x-2 border-b-2 transition-colors ${
                activeTab === 'camera' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <ScanLine className="h-5 w-5" />
              <span>Camera</span>
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-4 flex items-center justify-center space-x-2 border-b-2 transition-colors ${
                activeTab === 'manual' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Keyboard className="h-5 w-5" />
              <span>Manual Entry</span>
            </button>
          </CardHeader>
          <CardContent className="p-6">
            
            {/* Status Overlay */}
            {lastScanned && (
              <div className={`p-6 rounded-lg flex flex-col items-center justify-center text-center space-y-4 mb-6 ${
                lastScanned.status === 'success' ? 'bg-green-500/10 border border-green-500/20' :
                lastScanned.status === 'warning' ? 'bg-yellow-500/10 border border-yellow-500/20' :
                'bg-red-500/10 border border-red-500/20'
              }`}>
                {lastScanned.status === 'success' && <CheckCircle2 className="h-16 w-16 text-green-500" />}
                {lastScanned.status === 'warning' && <CheckCircle2 className="h-16 w-16 text-yellow-500" />}
                {lastScanned.status === 'invalid' && <XCircle className="h-16 w-16 text-red-500" />}
                
                <div>
                  <h3 className={`text-2xl font-bold ${
                    lastScanned.status === 'success' ? 'text-green-400' :
                    lastScanned.status === 'warning' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {lastScanned.message}
                  </h3>
                  {lastScanned.ticket && (
                    <div className="mt-2 text-slate-300">
                      <p className="font-mono">{lastScanned.ticket.ticket_number}</p>
                      <p>{lastScanned.ticket.event?.title}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'camera' ? (
              <div className="relative rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800">
                {!isScanning && !lastScanned && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-900/50">
                    <QrCode className="h-12 w-12 mb-4 opacity-50" />
                    <p>Initializing Camera...</p>
                  </div>
                )}
                <video ref={videoRef} className="w-full h-full object-cover" />
                
                {/* Scanner reticle overlay */}
                {isScanning && !lastScanned && (
                  <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40">
                    <div className="w-full h-full border-2 border-purple-500/50 relative">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-purple-500 -mt-0.5 -ml-0.5" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-purple-500 -mt-0.5 -mr-0.5" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-purple-500 -mb-0.5 -ml-0.5" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-purple-500 -mb-0.5 -mr-0.5" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Ticket Number or Token</label>
                  <Input
                    autoFocus
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="e.g. TKT-A1B2C3D4"
                    className="bg-slate-950 border-slate-800 text-white font-mono h-14 text-lg text-center"
                    disabled={verifyTicket.isPending || checkInTicket.isPending}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white font-bold"
                  disabled={!manualToken.trim() || verifyTicket.isPending || checkInTicket.isPending}
                >
                  {(verifyTicket.isPending || checkInTicket.isPending) ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    'Verify & Check In'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
