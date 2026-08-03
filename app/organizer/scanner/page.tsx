import { redirect } from 'next/navigation';

export default function OrganizerScannerPage() {
  // Scanner functionality is not in scope for Stage 4
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-3">
        <p className="text-3xl">🔍</p>
        <h2 className="text-xl font-bold text-white">QR Scanner</h2>
        <p className="text-slate-400">Scanner feature coming in a future stage.</p>
      </div>
    </div>
  );
}
