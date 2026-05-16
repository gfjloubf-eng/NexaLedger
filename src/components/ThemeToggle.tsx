import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { mode, toggle } = useTheme();
  const isDark = mode === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="inline-flex items-center justify-center rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:bg-white dark:border-slate-700/60 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-900"
    >
      <span className="mr-2 text-base" aria-hidden="true">
        {isDark ? '🌙' : '☀️'}
      </span>
      {isDark ? 'داكن' : 'فاتح'}
    </button>
  );
};

export default React.memo(ThemeToggle);

