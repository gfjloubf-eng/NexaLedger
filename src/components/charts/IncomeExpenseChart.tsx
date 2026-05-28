import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

import { ReportChartSurface } from './ReportChartSurface';
import { getReportTokens } from '../../utils/reportThemeTokens';
import type { ThemeMode } from '../../context/themeUtils';

export type IncomeExpensePoint = {
  label: string;
  income: number;
  expense: number;
};

type Props = {
  data: IncomeExpensePoint[];
  mode?: ThemeMode;
};

const IncomeExpenseChart: React.FC<Props> = ({ data, mode }) => {
  const safeData = data ?? [];

  const inferredMode: ThemeMode = (() => {
    if (mode === 'light' || mode === 'dark') return mode;
    if (typeof document === 'undefined') return 'light';
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  })();

  const t = getReportTokens(inferredMode);

  return (
    <ReportChartSurface mode={inferredMode}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={safeData}
            margin={{ top: 12, right: 10, left: 0, bottom: 6 }}
          >
            <defs>
              <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.18} />
              </linearGradient>
              <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.18} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="2 6"
              vertical={false}
              stroke={t.chart.gridLine}
            />

            <XAxis
              dataKey="label"
              tick={{ fill: t.chart.axisText, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
            />

            <YAxis
              tick={{ fill: t.chart.axisText, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickMargin={6}
            />

            <Tooltip
              wrapperStyle={{ direction: 'rtl' }}
              cursor={false}
              contentStyle={{
                borderRadius: 12,
                border: `1px solid ${t.chart.tooltipBorder}`,
                background: t.chart.tooltipBg,
                color: t.chart.tooltipText,
              }}
              formatter={(value: unknown) => {
                const n = typeof value === 'number' ? value : Number(value);
                if (!Number.isFinite(n)) return '—';
                return `${n.toLocaleString('ar-SA')}`;
              }}
              labelFormatter={() => ''}
            />

            <Bar
              dataKey="income"
              name="الدخل"
              fill="url(#incomeFill)"
              radius={[12, 12, 0, 0]}
              maxBarSize={70}
            />
            <Bar
              dataKey="expense"
              name="المصروفات"
              fill="url(#expenseFill)"
              radius={[12, 12, 0, 0]}
              maxBarSize={70}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ReportChartSurface>
  );
};

export default React.memo(IncomeExpenseChart);

