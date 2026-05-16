import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export type CategoryTotal = {
  name: string;
  value: number;
  color: string;
};

type Props = {
  data: Array<{ name: string; value: number }>;
};

const palette = ['#10B981', '#2563EB', '#F59E0B', '#8B5CF6', '#64748B', '#06B6D4', '#EF4444'];

const ExpenseDistributionChart: React.FC<Props> = ({ data }) => {
  const chartData: CategoryTotal[] = useMemo(() => {
    const safe = data ?? [];
    return safe
      .filter(
        (d) => d && typeof d.value === 'number' && Number.isFinite(d.value) && d.value > 0
      )
      .map((d, idx) => ({
        name: d.name,
        value: d.value,
        color: palette[idx % palette.length],
      }));
  }, [data]);



  return (
    <div className="relative w-full h-[260px] rounded-3xl bg-[rgba(15,23,42,0.72)] border border-white/6 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(37,99,235,0.03),transparent_60%),radial-gradient(circle_at_80%_70%,rgba(16,185,129,0.02),transparent_60%)] mix-blend-overlay" />
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            wrapperStyle={{ direction: 'rtl' }}
            contentStyle={{ borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15,23,42,0.9)', color: '#F8FAFC' }}
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
            wrapperStyle={{ color: '#94A3B8' }}
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
  );
};

export default React.memo(ExpenseDistributionChart);


