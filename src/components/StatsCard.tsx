import React from 'react';

interface StatsCardProps {
  label: string;
  value: string;
  change: string;
  /**
   * Optional backward-compatible API.
   * - If `color` is provided, it drives the display.
   * - If `isPositive` is provided, it is mapped to `color`.
   */
  color?: 'green' | 'red';
  isPositive?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, change, color, isPositive }) => {
  const derivedIsPositive =
    typeof isPositive === 'boolean'
      ? isPositive
      : color === 'green';
  const resolvedColor: 'green' | 'red' = derivedIsPositive ? 'green' : 'red';
  const iconColor = resolvedColor === 'green' ? 'text-green-500' : 'text-red-500';
  const bgColor = resolvedColor === 'green' ? 'bg-emerald-50/70 dark:bg-emerald-400/10' : 'bg-rose-50/70 dark:bg-rose-400/10';

  return (
    <div
      className={`p-8 rounded-2xl ${bgColor} border border-gray-200/60 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 group`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
          {label}
        </span>
        <div className={`w-3 h-3 rounded-full ${iconColor}`} aria-hidden="true" />
      </div>

      <div className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-1 tabular-nums leading-none group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
        {value}
      </div>

      <div className={`text-sm font-medium ${iconColor} dark:text-opacity-90`}>
        {change} {isPositive ? '↗' : '↘'}
      </div>
    </div>
  );
};

export default StatsCard;

