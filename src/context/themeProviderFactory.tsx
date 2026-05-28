import { useEffect, useMemo, useState } from 'react';

// Intentionally kept as a component-only file for react-refresh.

import { applyThemeClass, syncThemeToSystem, STORAGE_KEY } from './themeUtils';
import type { ThemeMode } from './themeProviderTypes';
import { ThemeContext } from './themeContextOnlyExports';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Operational stability: force LIGHT mode until dark reporting continuity is fully stabilized.
  const [mode, setModeState] = useState<ThemeMode>(() => 'light');

  useEffect(() => {
    // Always apply light mode on mount.
    applyThemeClass('light');
  }, []);

  useEffect(() => {
    // Keep theme in sync with OS when user hasn't forced a value.
    // In this executive build, we intentionally force LIGHT mode only,
    // but we still avoid subscribing in a way that can conflict with user storage.
    const initialSaved = (() => {
      try {
        return localStorage.getItem(STORAGE_KEY);
      } catch {
        return null;
      }
    })();

    // If user explicitly forced a theme, do nothing.
    if (initialSaved === 'dark' || initialSaved === 'light') return;

    // Force LIGHT mode; do not restore dark or apply OS changes.
    // syncThemeToSystem signature in this repo requires an argument.
    const stop = syncThemeToSystem(() => {
      // keep light pinned
      setModeState('light');
      applyThemeClass('light');
    });

    return stop;
  }, []);

  // Keep API surface compatible with ThemeContext.
  const setMode = (next: ThemeMode) => {
    // Disabled: force LIGHT mode only.
    void next;
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
      setMode('light');
    };

    return { mode, toggle, setMode };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// useTheme exported from themeProviderFactory.useTheme.ts












