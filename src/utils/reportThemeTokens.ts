import type { ThemeMode } from '../context/themeUtils';

export type ReportTokens = {
  primary: string;
  secondary: string;
  muted: string;
  surface: string;
  voidBase: string;
  cardSurface: string;
  interactiveSurface: string;
  border: string;
  accent: string;

  chart: {
    containerBg: string;
    containerBorder: string;
    gridLine: string;
    axisText: string;
    tooltipBg: string;
    tooltipBorder: string;
    tooltipText: string;
  };

  table: {
    border: string;
    headerText: string;
    bodyText: string;
    rowHoverBg: string;
  };
};

const light: Omit<ReportTokens, 'chart' | 'table'> = {
  primary: '#111827',
  secondary: '#374151',
  muted: '#6B7280',
  surface: '#FFFFFF',
  voidBase: '#FFFFFF',
  cardSurface: '#FFFFFF',
  interactiveSurface: '#F3F4F6',
  border: 'rgba(15,23,42,0.08)',
  accent: '#7CFFB2',
};

const dark: Omit<ReportTokens, 'chart' | 'table'> = {
  primary: '#F4F7FA',
  secondary: '#B7C2CF',
  muted: '#7F8A98',
  surface: '#050816',
  voidBase: '#050816',
  cardSurface: '#121A24',
  interactiveSurface: '#18222F',
  border: 'rgba(255,255,255,0.06)',
  accent: '#7CFFB2',
};

export const getReportTokens = (mode: ThemeMode): ReportTokens => {
  const base = mode === 'dark' ? dark : light;

  return {
    ...base,
    chart: {
      containerBg: mode === 'dark' ? 'rgba(18,26,36,0.72)' : 'rgba(255,255,255,0.85)',
      containerBorder: base.border,
      gridLine:
        mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.10)',
      axisText: mode === 'dark' ? base.secondary : base.secondary,
      tooltipBg:
        mode === 'dark' ? 'rgba(18,26,36,0.92)' : 'rgba(255,255,255,0.96)',
      tooltipBorder: base.border,
      tooltipText: mode === 'dark' ? base.primary : base.primary,
    },
    table: {
      border: base.border,
      headerText: base.secondary,
      bodyText: base.primary,
      rowHoverBg: mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.03)',
    },
  };
};

