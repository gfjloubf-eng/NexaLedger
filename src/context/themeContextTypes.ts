import type { ThemeMode } from './themeUtils';

export type ThemeContextValue = {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
};

