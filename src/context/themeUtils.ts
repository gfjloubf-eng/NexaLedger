export type ThemeMode = 'light' | 'dark';

export const STORAGE_KEY = 'nexaledger_theme_mode';


export const applyThemeClass = (mode: ThemeMode) => {
  const root = document.documentElement;
  if (mode === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
};

export const getInitialMode = (): ThemeMode => {
  // IMPORTANT: system-driven by default.
  // If user previously forced a theme, respect it.
  // Otherwise follow OS via prefers-color-scheme.
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // ignore
  }

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

export const syncThemeToSystem = (onChange: (mode: ThemeMode) => void) => {
  const mql = window.matchMedia?.('(prefers-color-scheme: dark)');
  if (!mql) return () => {};

  const handler = () => onChange(mql.matches ? 'dark' : 'light');

  // Some older browsers use addListener/removeListener.
  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }

  mql.addListener(handler);
  return () => mql.removeListener(handler);

};


