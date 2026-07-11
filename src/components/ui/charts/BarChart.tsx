'use client';

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useTheme } from 'next-themes';
import { LoadingChart } from './LoadingChart';
import { EmptyChartState } from './EmptyChartState';

interface BarChartProps {
  data: Record<string, unknown>[];
  xDataKey: string;
  yDataKey: string;
  isLoading?: boolean;
  valueFormatter?: (value: number) => string;
}

export const BarChart = ({ 
  data, 
  xDataKey, 
  yDataKey, 
  isLoading = false,
  valueFormatter = (value) => `${value}` 
}: BarChartProps) => {
  const { resolvedTheme } = useTheme();
  
  if (isLoading) return <LoadingChart />;
  if (!data || data.length === 0) return <EmptyChartState />;

  const isDark = resolvedTheme === 'dark';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
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
            cursor={{ fill: isDark ? '#334155' : '#f1f5f9' }}
            contentStyle={{ 
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              borderColor: isDark ? '#334155' : '#e2e8f0',
              borderRadius: '8px',
              color: isDark ? '#f8fafc' : '#0f172a'
            }}
            formatter={(value: number) => [valueFormatter(value), 'Value']}
            labelStyle={{ color: textColor, marginBottom: '4px' }}
          />
          <Bar 
            dataKey={yDataKey} 
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="var(--brand-primary)" />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};
