'use client';

import { useState, useRef, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { BrowserMultiFormatReader } from '@zxing/library';
import { QrCode, ScanLine, Keyboard, CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function OrganizerScannerPage() {
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [manualToken, setManualToken] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
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
      if (!videoInputDevices || videoInputDevices.length === 0) {
        console.warn('No video input devices found.');
        setIsScanning(false);
        return;
      }
      const selectedDeviceId = videoInputDevices[0]?.deviceId;
      
      codeReader.current.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (result, err) => {
        if (result) {
          handleScan(result.getText());
        }
      });
    } catch (err) {
      console.error('Failed to access camera:', err);
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    codeReader.current.reset();
    setIsScanning(false);
  };

  const handleScan = async (qrText: string) => {
    if (processing) return;
    setProcessing(true);
    stopScanner(); // Pause scanner while processing

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrData: qrText }),
      });

      const result = await response.json();

      if (response.ok) {
        setLastScanned({
          status: 'success',
          message: 'Check-in Successful!',
          attendeeName: result.attendeeName,
          ticketTypeName: result.ticketTypeName,
          eventName: result.eventName,
        });
      } else {
        setLastScanned({
          status: result.error === 'Attendee already checked in' ? 'warning' : 'error',
          message: result.error || 'Check-in Failed',
          attendeeName: result.attendeeName,
          ticketTypeName: result.ticketTypeName,
          eventName: result.eventName,
        });
      }
    } catch (err: any) {
      setLastScanned({
        status: 'error',
        message: err.message || 'Network error occurred',
      });
    } finally {
      setProcessing(false);
    }

    // Auto-resume scanner after 4 seconds
    setTimeout(() => {
      setLastScanned(null);
      if (activeTab === 'camera') {
        startScanner();
      }
    }, 4000);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    handleScan(manualToken.trim());
    setManualToken('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <QrCode className="h-8 w-8 text-[#6C47FF]" /> QR Ticket Scanner
        </h1>
        <p className="text-slate-400 mt-1">Scan visitor passes or enter registration IDs manually.</p>
      </div>

      <Card className="bg-[#111118] border-slate-800/80 rounded-[12px] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-center border-b border-slate-800/60 p-0">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-4 flex items-center justify-center space-x-2 border-b-2 text-sm font-bold transition-all ${
              activeTab === 'camera'
                ? 'border-[#6C47FF] text-[#6C47FF]'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/20'
            }`}
          >
            <ScanLine className="h-4.5 w-4.5" />
            <span>Live Camera Scanner</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-4 flex items-center justify-center space-x-2 border-b-2 text-sm font-bold transition-all ${
              activeTab === 'manual'
                ? 'border-[#6C47FF] text-[#6C47FF]'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/20'
            }`}
          >
            <Keyboard className="h-4.5 w-4.5" />
            <span>Manual Entry Fallback</span>
          </button>
        </CardHeader>
        <CardContent className="p-6">
          {/* Scan Results Overlay */}
          {lastScanned && (
            <div
              className={`p-6 rounded-[12px] flex flex-col items-center justify-center text-center space-y-3 mb-6 transition-all animate-in fade-in duration-200 ${
                lastScanned.status === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-450'
                  : lastScanned.status === 'warning'
                  ? 'bg-amber-500/10 border border-amber-500/25 text-amber-450'
                  : 'bg-rose-500/10 border border-rose-500/25 text-rose-450'
              }`}
            >
              {lastScanned.status === 'success' && <CheckCircle2 className="h-14 w-14 text-emerald-500" />}
              {lastScanned.status === 'warning' && <CheckCircle2 className="h-14 w-14 text-amber-500" />}
              {lastScanned.status === 'error' && <XCircle className="h-14 w-14 text-rose-500" />}

              <div>
                <h3 className="text-xl font-bold">{lastScanned.message}</h3>
                {lastScanned.attendeeName && (
                  <div className="mt-2 text-slate-350 space-y-1 text-sm font-medium">
                    <p className="text-white font-bold text-base">{lastScanned.attendeeName}</p>
                    <p>Ticket: {lastScanned.ticketTypeName}</p>
                    <p className="text-slate-400">Event: {lastScanned.eventName}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'camera' ? (
            <div className="relative rounded-[12px] overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800/60 shadow-inner">
              {!isScanning && !lastScanned && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-900/50 space-y-2">
                  <QrCode className="h-12 w-12 opacity-40 animate-pulse" />
                  <p className="text-sm font-bold">Accessing camera stream…</p>
                  <p className="text-xs text-slate-400">Please verify camera permissions if it hangs.</p>
                </div>
              )}
              <video ref={videoRef} className="w-full h-full object-cover" />

              {/* Scan Overlay Overlay */}
              {isScanning && !lastScanned && (
                <div className="absolute inset-0 pointer-events-none border-[30px] sm:border-[40px] border-[#0A0A0F]/70">
                  <div className="w-full h-full border border-purple-500/40 relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#6C47FF] -mt-[1px] -ml-[1px]" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#6C47FF] -mt-[1px] -mr-[1px]" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#6C47FF] -mb-[1px] -ml-[1px]" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#6C47FF] -mb-[1px] -mr-[1px]" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registration ID</label>
                <Input
                  autoFocus
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Enter registration UUID"
                  className="bg-slate-950/60 border-slate-800 text-white font-mono h-14 text-center text-lg focus:border-[#6C47FF] focus:ring-1 focus:ring-[#6C47FF] rounded-[8px]"
                  disabled={processing}
                />
              </div>
              <Button
                type="submit"
                className="w-full h-14 bg-[#6C47FF] hover:bg-[#6C47FF]/90 text-white font-bold text-base rounded-[8px] transition-all flex items-center justify-center gap-2"
                disabled={!manualToken.trim() || processing}
              >
                {processing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="h-4.5 w-4.5" />
                    Verify & Check In
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
