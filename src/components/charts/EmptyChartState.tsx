import React from 'react';

import { getReportTokens } from '../../utils/reportThemeTokens';
import type { ThemeMode } from '../../context/themeUtils';

type EmptyChartStateProps = {
  title?: string;
  subtitle?: string;
  mode?: ThemeMode;
};

const EmptyChartState: React.FC<EmptyChartStateProps> = ({
  title = 'لا توجد بيانات',
  subtitle = 'أضف معاملات للبدء في رؤية التحليلات',
  mode,
}) => {
  const inferredMode: ThemeMode = (() => {
    if (mode === 'light' || mode === 'dark') return mode;
    if (typeof document === 'undefined') return 'light';
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  })();

  const t = getReportTokens(inferredMode);

  return (
    <div className="w-full h-full min-h-[240px] flex flex-col items-center justify-center text-right px-6">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{
          background: inferredMode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
          color: t.chart.axisText,
          border: `1px solid ${t.chart.tooltipBorder}`,
        }}
      >
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 6v6l4 2" />
          <path d="M21 12a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z" />
        </svg>
      </div>
      <div className="mt-4 text-base font-semibold" style={{ color: t.primary }}>
        {title}
      </div>
      <div
        className="mt-1 text-sm leading-relaxed"
        style={{ color: t.muted }}
      >
        {subtitle}
      </div>
    </div>
  );
};

export default React.memo(EmptyChartState);

