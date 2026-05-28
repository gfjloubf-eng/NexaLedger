import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

import { ReportChartSurface } from './ReportChartSurface';
import { getReportTokens } from '../../utils/reportThemeTokens';
import type { ThemeMode } from '../../context/themeUtils';

export type CategoryTotal = {
  name: string;
  value: number;
  color: string;
};

type Props = {
  data: Array<{ name: string; value: number }>;
  mode?: ThemeMode;
};

// Institutional palette: stable, low-saturation (no neon).
const palette = [
  '#22C55E', // emerald
  '#3B82F6', // blue
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#64748B', // slate
  '#06B6D4', // cyan
  '#EF4444', // red
];

const ExpenseDistributionChart: React.FC<Props> = ({ data, mode }) => {
  const inferredMode: ThemeMode = (() => {
    if (mode === 'light' || mode === 'dark') return mode;
    if (typeof document === 'undefined') return 'light';
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  })();

  const t = getReportTokens(inferredMode);

  const chartData: CategoryTotal[] = useMemo(() => {
    const safe = data ?? [];
    return safe
      .filter(
        (d) =>
          d && typeof d.value === 'number' && Number.isFinite(d.value) && d.value > 0
      )
      .map((d, idx) => ({
        name: d.name,
        value: d.value,
        color: palette[idx % palette.length],
      }));
  }, [data]);

  return (
    <ReportChartSurface mode={inferredMode}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              wrapperStyle={{ direction: 'rtl' }}
              cursor={false}
              contentStyle={{
                borderRadius: 12,
                border: `1px solid ${t.chart.tooltipBorder}`,
                background: t.chart.tooltipBg,
                color: t.chart.tooltipText,
              }}
              formatter={(value: unknown, name: unknown) => {
                const n = typeof value === 'number' ? value : Number(value);
                const label = typeof name === 'string' ? name : '';
                if (!Number.isFinite(n)) return '—';
                return [`${n.toLocaleString('ar-SA')}`, `${label}`];
              }}
            />

            <Legend
              align="right"
              verticalAlign="middle"
              iconType="circle"
              formatter={(value) => (typeof value === 'string' ? value : '')}
              wrapperStyle={{ color: t.chart.axisText }}
            />

            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="40%"
              cy="50%"
              outerRadius={95}
              innerRadius={50}
              paddingAngle={2}
              stroke="none"
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ReportChartSurface>
  );
};

export default React.memo(ExpenseDistributionChart);

