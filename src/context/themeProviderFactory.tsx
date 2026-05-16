import React from 'react';

// Intentionally kept as a component-only file for react-refresh.
import { useEffect, useMemo, useState } from 'react';

import { applyThemeClass, getInitialMode } from './themeUtils';
import type { ThemeMode } from './themeProviderTypes';
import { ThemeContext } from './themeContextOnlyExports';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => getInitialMode());


  useEffect(() => {
    applyThemeClass(mode);
  }, [mode]);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    try {
      localStorage.setItem('nexaledger_theme_mode', next);
    } catch {
      // ignore
    }
    applyThemeClass(next);
  };

  const value = useMemo(() => {
    const toggle = () =>
      setModeState((prev: ThemeMode) => (prev === 'dark' ? 'light' : 'dark'));

    return { mode, toggle, setMode };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// useTheme exported from themeProviderFactory.useTheme.ts





