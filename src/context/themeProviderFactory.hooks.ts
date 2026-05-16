import { useContext, useMemo } from 'react';

import { ThemeContext } from './themeContextOnlyExports';
import type { ThemeContextValue } from './themeProviderTypes';

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export function useThemeToggleValue({
  mode,
  setModeState,
}: {
  mode: ThemeContextValue['mode'];
  setModeState: (
    next: ThemeContextValue['mode']
  ) => void | ((updater: (prev: ThemeContextValue['mode']) => ThemeContextValue['mode']) => void);
}) {

  return useMemo(() => {
    const toggle = () => {
      const next = mode === 'dark' ? 'light' : 'dark';
      // setModeState is intentionally typed to accept only ThemeMode values.
      setModeState(next as ThemeContextValue['mode']);
    };

    return { mode, toggle, setMode: setModeState };
  }, [mode, setModeState]);

}

