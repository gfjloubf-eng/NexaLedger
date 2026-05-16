import { createContext } from 'react';
import type { ThemeMode } from './themeProviderTypes';

export type ThemeContextValue = {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (next: ThemeMode) => void;
};

// NOTE: Fast-refresh expects only components to be exported from *.tsx.
// This file exports only a context constant.
export const ThemeContext = createContext<ThemeContextValue | null>(null);

// Compatibility hook
export { useTheme } from './themeProviderFactory.useTheme';





