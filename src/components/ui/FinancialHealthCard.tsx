import React, { useMemo } from 'react';

import AIInsightCard from './AIInsightCard';

const FinancialHealthCard: React.FC<{
  score: number;
  tone?: 'blue' | 'emerald' | 'purple' | 'rose';
  summary: string;
}> = ({ score, tone = 'emerald', summary }) => {
  const clamped = Math.max(0, Math.min(100, score));
  const label = clamped >= 80 ? 'ممتاز' : clamped >= 60 ? 'جيد' : 'بحاجة تحسين';

  const ring = useMemo(() => {
    const r = 44;
    const c = 2 * Math.PI * r;
    const pct = clamped / 100;
    const dash = c * pct;
    return { r, c, dash };
  }, [clamped]);

  return (
    <AIInsightCard
      title={label}
      subtitle="Financial health"
      tone={tone}
      icon="📈"
      value={`${clamped}/100`}
    >
      <div className="mt-3 flex items-center gap-6">
        <div className="relative h-28 w-28 shrink-0">
          <div className="absolute inset-0 rounded-full bg-white/5 ring-1 ring-white/10" />
          <svg
            className="absolute inset-0"
            viewBox="0 0 120 120"
            aria-hidden="true"
          >
            <circle
              cx="60"
              cy="60"
              r={ring.r}
              stroke="rgba(255,255,255,0.10)"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="60"
              cy="60"
              r={ring.r}
              stroke="url(#grad)"
              strokeWidth="10"
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={`${ring.dash} ${ring.c}`}
              transform="rotate(-90 60 60)"
            />
            <defs>
              <linearGradient id="grad" x1="20" y1="20" x2="100" y2="100">
                <stop offset="0" stopColor="#3b82f6" stopOpacity="0.9" />
                <stop offset="1" stopColor="#34d399" stopOpacity="0.9" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="flex-1">
          <div className="text-sm text-slate-400">ملخص سريع</div>
          <div className="mt-2 text-sm text-slate-200 leading-relaxed">{summary}</div>

          <div className="mt-3 space-y-2">
            {[
              { k: 'توازن محسّن', v: '↗' },
              { k: 'ادخار قابل للاستمرار', v: '✓' },
              { k: 'إنفاق أكثر وضوحًا', v: '✓' },
            ].map((x) => (
              <div
                key={x.k}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div className="text-xs text-slate-400">{x.k}</div>
                <div className="text-sm font-semibold text-slate-100">{x.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AIInsightCard>
  );
};

export default FinancialHealthCard;

