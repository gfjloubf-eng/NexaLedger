import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';


export type IncomeExpensePoint = {
  label: string;
  income: number;
  expense: number;
};

type Props = {
  data: IncomeExpensePoint[];
};

const IncomeExpenseChart: React.FC<Props> = ({ data }) => {
  // Keep it lightweight: simple 2-series chart.
  const safeData = data ?? [];

  return (
    <div className="relative w-full h-[260px] rounded-3xl bg-[rgba(15,23,42,0.72)] border border-white/6 overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(37,99,235,0.04),transparent_70%),radial-gradient(circle_at_80%_30%,rgba(16,185,129,0.03),transparent_70%)] mix-blend-overlay" />
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={safeData} margin={{ top: 12, right: 10, left: 0, bottom: 6 }}>

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

          <CartesianGrid strokeDasharray="2 6" vertical={false} stroke="rgba(255,255,255,0.03)" />
          <XAxis dataKey="label" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} tickMargin={8} />
          <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} tickMargin={6} />


          <Tooltip
            wrapperStyle={{ direction: 'rtl' }}
            cursor={false}
            contentStyle={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15,23,42,0.88)', color: '#F8FAFC' }}
            formatter={(value: unknown) => {
              const n = typeof value === 'number' ? value : Number(value);
              if (!Number.isFinite(n)) return '—';
              return `${n.toLocaleString('ar-SA')}`;
            }}
            labelFormatter={() => ''}
          />


          <Bar dataKey="income" name="الدخل" fill="url(#incomeFill)" radius={[12, 12, 0, 0]} maxBarSize={70} />
          <Bar dataKey="expense" name="المصروفات" fill="url(#expenseFill)" radius={[12, 12, 0, 0]} maxBarSize={70} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default React.memo(IncomeExpenseChart);

