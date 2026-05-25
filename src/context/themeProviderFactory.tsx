import React from 'react';

// Intentionally kept as a component-only file for react-refresh.
import { useEffect, useMemo, useState } from 'react';

import { applyThemeClass, getInitialMode, syncThemeToSystem, STORAGE_KEY } from './themeUtils';
import type { ThemeMode } from './themeProviderTypes';
import { ThemeContext } from './themeContextOnlyExports';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => getInitialMode());

  useEffect(() => {
    applyThemeClass(mode);
  }, [mode]);

  useEffect(() => {
    // Keep theme in sync with OS when user hasn't forced a value.
    const initialSaved = (() => {
      try {
        return localStorage.getItem(STORAGE_KEY);
      } catch {
        return null;
      }
    })();

    // If saved is 'dark'/'light' => user explicitly forced it; don't override.
    if (initialSaved === 'dark' || initialSaved === 'light') return;

    const stop = syncThemeToSystem((next) => {
      setModeState(next);
      applyThemeClass(next);
    });

    return stop;
  }, []);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    applyThemeClass(next);
  };

  const value = useMemo(() => {
    const toggle = () => {
      const next: ThemeMode = mode === 'dark' ? 'light' : 'dark';
      setMode(next);
    };

    return { mode, toggle, setMode };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// useTheme exported from themeProviderFactory.useTheme.ts











