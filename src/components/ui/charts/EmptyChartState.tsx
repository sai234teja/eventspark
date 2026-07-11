import { BarChart3 } from 'lucide-react';

interface EmptyChartStateProps {
  title?: string;
  description?: string;
}

export const EmptyChartState = ({ 
  title = "No data available", 
  description = "There is not enough data to generate this chart for the selected period." 
}: EmptyChartStateProps) => {
  return (
    <div className="flex items-center justify-center h-full min-h-[300px] w-full bg-slate-50/30 dark:bg-slate-900/10 rounded-md border border-dashed border-slate-200 dark:border-slate-800">
      <div className="flex flex-col items-center justify-center space-y-3 p-6 text-center max-w-sm">
        <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <BarChart3 className="h-6 w-6 text-slate-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-500">{description}</p>
      </div>
    </div>
  );
};
