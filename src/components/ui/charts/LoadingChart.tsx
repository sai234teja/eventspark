import { Loader2 } from 'lucide-react';

export const LoadingChart = () => {
  return (
    <div className="flex items-center justify-center h-full min-h-[300px] w-full bg-slate-50/50 dark:bg-slate-900/20 rounded-md border border-slate-100 dark:border-slate-800">
      <div className="flex flex-col items-center justify-center space-y-4 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" />
        <p className="text-sm font-medium">Loading analytics...</p>
      </div>
    </div>
  );
};
