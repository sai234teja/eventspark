'use client';

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useTheme } from 'next-themes';
import { LoadingChart } from './LoadingChart';
import { EmptyChartState } from './EmptyChartState';

interface AreaChartProps {
  data: Record<string, unknown>[];
  xDataKey: string;
  yDataKey: string;
  isLoading?: boolean;
  valueFormatter?: (value: number) => string;
}

export const AreaChart = ({ 
  data, 
  xDataKey, 
  yDataKey, 
  isLoading = false,
  valueFormatter = (value) => `${value}` 
}: AreaChartProps) => {
  const { resolvedTheme } = useTheme();
  
  if (isLoading) return <LoadingChart />;
  if (!data || data.length === 0) return <EmptyChartState />;

  const isDark = resolvedTheme === 'dark';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorBrand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis 
            dataKey={xDataKey} 
            stroke={textColor} 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            stroke={textColor} 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={valueFormatter}
            width={50}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              borderColor: isDark ? '#334155' : '#e2e8f0',
              borderRadius: '8px',
              color: isDark ? '#f8fafc' : '#0f172a'
            }}
            formatter={(value: number) => [valueFormatter(value), 'Value']}
            labelStyle={{ color: textColor, marginBottom: '4px' }}
          />
          <Area 
            type="monotone" 
            dataKey={yDataKey} 
            stroke="var(--brand-primary)" 
            fillOpacity={1} 
            fill="url(#colorBrand)" 
            strokeWidth={3}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};
