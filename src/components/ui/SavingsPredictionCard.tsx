import React from 'react';

import AIInsightCard from './AIInsightCard';

const SavingsPredictionCard: React.FC<{
  projected: string;
  confidence: string;
  summary: string;
}> = ({ projected, confidence, summary }) => {
  return (
    <AIInsightCard
      title="Savings prediction"
      subtitle="Forward-looking"
      tone="blue"
      icon="🧠"
      value={projected}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-slate-200 leading-relaxed">{summary}</div>
        <div className="text-right">
          <div className="text-xs text-slate-500">Confidence</div>
          <div className="mt-1 text-sm font-semibold text-slate-100">{confidence}</div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-xs text-slate-500">What this means</div>
        <div className="mt-2 text-sm text-slate-200">
          UI-only projection placeholder—replace with real model later.
        </div>
      </div>
    </AIInsightCard>
  );
};

export default SavingsPredictionCard;

