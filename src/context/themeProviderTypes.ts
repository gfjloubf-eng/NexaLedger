export type ThemeMode = 'light' | 'dark';

export type ThemeContextValue = {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
};

