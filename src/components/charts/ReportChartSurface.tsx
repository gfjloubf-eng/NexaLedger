import React from 'react';

import type { ThemeMode } from '../../context/themeUtils';
import { getReportTokens } from '../../utils/reportThemeTokens';

/**
 * Chart surface used by report charts only.
 * Theme-safe (no hard-coded dark assumptions).
 */
export const ReportChartSurface: React.FC<{
  mode?: ThemeMode;
  className?: string;
  children: React.ReactNode;
}> = ({ mode, className, children }) => {
  // If theme mode isn't provided, infer from Tailwind's `dark` class.
  const inferredMode: ThemeMode = (() => {
    if (mode === 'light' || mode === 'dark') return mode;
    if (typeof document === 'undefined') return 'light';
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  })();

  const t = getReportTokens(inferredMode);

  return (
    <div
      className={
        className ?? 'relative w-full h-[260px] rounded-3xl overflow-hidden border'
      }
      style={{
        background: t.chart.containerBg,
        borderColor: t.chart.containerBorder,
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            inferredMode === 'dark'
              ? 'radial-gradient(circle at 30% 0%, rgba(37,99,235,0.06), transparent 70%), radial-gradient(circle at 80% 30%, rgba(16,185,129,0.05), transparent 70%)'
              : 'radial-gradient(circle at 30% 0%, rgba(37,99,235,0.05), transparent 70%), radial-gradient(circle at 80% 30%, rgba(16,185,129,0.04), transparent 70%)',
          mixBlendMode: 'normal',
        }}
      />
      {children}
    </div>
  );
};

