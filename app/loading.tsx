import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[80vh] w-full flex flex-col items-center justify-center gap-4 bg-transparent text-slate-900 dark:text-white">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full blur-xl bg-[#6C47FF]/20 animate-pulse"></div>
        
        {/* Core spinner */}
        <Loader2 className="w-12 h-12 text-[#6C47FF] animate-spin relative z-10 drop-shadow-md" />
      </div>
      
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse tracking-wide uppercase">
        Loading...
      </p>
    </div>
  );
}
