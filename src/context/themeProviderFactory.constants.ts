import { createContext } from 'react';
import type { ThemeMode } from './themeProviderTypes';

export type ThemeContextValue = {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (next: ThemeMode) => void;
};

// Constant-only exports for react-refresh stability.
export const ThemeContextForRefresh = createContext<ThemeContextValue | null>(null);

