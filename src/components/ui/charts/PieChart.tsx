'use client';

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useTheme } from 'next-themes';
import { LoadingChart } from './LoadingChart';
import { EmptyChartState } from './EmptyChartState';

interface PieChartProps {
  data: any[];
  nameKey: string;
  dataKey: string;
  isLoading?: boolean;
  valueFormatter?: (value: number) => string;
}

export const PieChart = ({ 
  data, 
  nameKey, 
  dataKey, 
  isLoading = false,
  valueFormatter = (value) => `${value}` 
}: PieChartProps) => {
  const { resolvedTheme } = useTheme();
  
  if (isLoading) return <LoadingChart />;
  if (!data || data.length === 0) return <EmptyChartState />;

  const isDark = resolvedTheme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  // Extract CSS variables for brand colors (we'll just use a palette that includes brand colors)
  // Recharts needs valid CSS colors or variables, so we provide an array of strings
  const COLORS = [
    'var(--brand-primary)',
    'var(--brand-secondary)',
    'var(--brand-accent)',
    '#94a3b8',
    '#cbd5e1'
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              borderColor: isDark ? '#334155' : '#e2e8f0',
              borderRadius: '8px',
              color: isDark ? '#f8fafc' : '#0f172a'
            }}
            formatter={(value: number) => [valueFormatter(value), 'Value']}
            itemStyle={{ color: textColor }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px', color: textColor }}
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};
