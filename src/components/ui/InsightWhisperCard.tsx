import React from 'react';

export type InsightWhisper = {
  id: string;
  message: string;
};

const InsightWhisperCard: React.FC<{
  title?: string;
  insights: InsightWhisper[];
}> = ({ title = 'ملحوظة مالية هادئة', insights }) => {
  if (insights.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.92] p-4 backdrop-blur-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:bg-white/[0.02]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-black dark:text-zinc-200/90">{title}</div>
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight mt-1">
            {insights.length === 1 ? '—' : 'معًا'}
          </div>
        </div>
        <div className="text-xs text-emerald-700 dark:text-emerald-200/80">✦</div>
      </div>

      <div className="mt-3 space-y-2">
        {insights.slice(0, 3).map((ins) => (
          <div
            key={ins.id}
            className="text-sm leading-relaxed text-zinc-900 dark:text-zinc-200"
          >
            {ins.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsightWhisperCard;

