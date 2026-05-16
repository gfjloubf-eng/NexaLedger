import React from 'react';

import AIInsightCard from './AIInsightCard';

const SpendingTrendCard: React.FC<{
  changePct: number;
  summary: string;
}> = ({ changePct, summary }) => {
  const tone = changePct <= 0 ? 'emerald' : 'rose';
  const arrow = changePct <= 0 ? '↘' : '↗';

  return (
    <AIInsightCard
      title={changePct <= 0 ? 'انخفاض في الإنفاق' : 'ارتفاع في الإنفاق'}
      subtitle="Spending trend"
      tone={tone}
      icon={changePct <= 0 ? '🟢' : '🔴'}
      value={`${Math.abs(Math.round(changePct))}% ${arrow}`}
    >
      <div className="text-sm text-slate-200 leading-relaxed">{summary}</div>
      <div className="mt-4">
        <div className="text-xs text-slate-500">Trend is computed locally from transactions (placeholder logic safe).</div>
      </div>
    </AIInsightCard>
  );
};

export default SpendingTrendCard;

