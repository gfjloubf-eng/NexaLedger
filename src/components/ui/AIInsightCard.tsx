import React from 'react';

const AIInsightCard: React.FC<{
  title: string;
  subtitle?: string;
  value?: string;
  tone?: 'blue' | 'emerald' | 'purple' | 'rose';
  icon?: string;
  children?: React.ReactNode;
}> = ({ title, subtitle, value, tone = 'blue', icon = '✦', children }) => {
  const toneGrad =
    tone === 'emerald'
      ? 'from-emerald-500/20 to-cyan-400/10'
      : tone === 'purple'
        ? 'from-purple-500/20 to-indigo-400/10'
        : tone === 'rose'
          ? 'from-rose-500/20 to-pink-400/10'
          : 'from-blue-500/20 to-emerald-400/10';

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 transition hover:bg-white/10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className={`h-12 w-12 rounded-3xl bg-gradient-to-br ${toneGrad} ring-1 ring-white/10 flex items-center justify-center text-xl`}
            aria-hidden="true"
          >
            {icon}
          </div>
          <div>
            <div className="text-sm text-slate-300">{subtitle ?? 'AI Insight'}</div>
            <div className="text-lg font-semibold text-slate-100 mt-1">{title}</div>
          </div>
        </div>

        {value ? (
          <div className="text-right">
            <div className="text-2xl font-black text-slate-100">{value}</div>
          </div>
        ) : null}
      </div>

      {children ? <div className="mt-4">{children}</div> : null}

      <div className="mt-4 text-xs text-slate-500">
        UI-only • derived from your local data
      </div>
    </div>
  );
};

export default AIInsightCard;

