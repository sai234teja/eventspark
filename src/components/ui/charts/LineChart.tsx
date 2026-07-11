'use client';

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from 'next-themes';
import { LoadingChart } from './LoadingChart';
import { EmptyChartState } from './EmptyChartState';

interface LineChartProps {
  data: Record<string, unknown>[];
  xDataKey: string;
  yDataKey: string;
  isLoading?: boolean;
  valueFormatter?: (value: number) => string;
}

export const LineChart = ({ 
  data, 
  xDataKey, 
  yDataKey, 
  isLoading = false,
  valueFormatter = (value) => `${value}` 
}: LineChartProps) => {
  const { resolvedTheme } = useTheme();
  
  if (isLoading) return <LoadingChart />;
  if (!data || data.length === 0) return <EmptyChartState />;

  const isDark = resolvedTheme === 'dark';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis 
            dataKey={xDataKey} 
            stroke={textColor} 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            padding={{ left: 10, right: 10 }}
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
          <Line 
            type="monotone" 
            dataKey={yDataKey} 
            stroke="var(--brand-primary)" 
            strokeWidth={3}
            dot={{ fill: 'var(--brand-primary)', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};
