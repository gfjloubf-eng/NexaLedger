import React from 'react';

// Intentionally kept as a component-only file for react-refresh.
import { useEffect, useMemo, useState } from 'react';

import { applyThemeClass, syncThemeToSystem, STORAGE_KEY } from './themeUtils';
import type { ThemeMode } from './themeProviderTypes';
import { ThemeContext } from './themeContextOnlyExports';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Operational stability: force LIGHT mode until dark reporting continuity is fully stabilized.
  const [mode, setModeState] = useState<ThemeMode>(() => 'light');

  useEffect(() => {
    applyThemeClass('light');
  }, []);


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
    // Disable dark mode restoration completely.
    // Even if user previously saved 'dark', ignore it.
    if (initialSaved === 'dark' || initialSaved === 'light') return;

    // syncThemeToSystem currently does not accept an argument in this project build.
    // For stability we keep LIGHT mode only and do not subscribe to OS theme changes.
    syncThemeToSystem();
    const stop = () => {};


    return stop;
  }, []);

  // Keep API surface compatible with ThemeContext.
  const setMode = () => {
    // Disabled: force LIGHT mode only.
    setModeState('light');
    try {
      localStorage.setItem(STORAGE_KEY, 'light');
    } catch {
      // ignore
    }
    applyThemeClass('light');
  };


  const value = useMemo(() => {
    const toggle = () => {
      // Disabled: force LIGHT mode only.
      setMode('light');
    };

    return { mode, toggle, setMode };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// useTheme exported from themeProviderFactory.useTheme.ts











