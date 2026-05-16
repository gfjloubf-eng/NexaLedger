export type ThemeMode = 'light' | 'dark';

export const STORAGE_KEY = 'nexaledger_theme_mode';


export const applyThemeClass = (mode: ThemeMode) => {
  const root = document.documentElement;
  if (mode === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
};

export const getInitialMode = (): ThemeMode => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // ignore
  }

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

