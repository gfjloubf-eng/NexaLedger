import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import FinOverlay from './FinOverlay';

type CommandGroup = {
  title: string;
  items: Array<{
    id: string;
    label: string;
    shortcut?: string;
    path: string;
    icon: string;
    kind?: 'nav' | 'ai';
  }>;
};

const FinCommandPalette: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const groups: CommandGroup[] = useMemo(
    () => [
      {
        title: 'Navigation',
        items: [
          {
            id: 'dashboard',
            label: 'Dashboard',
            shortcut: 'G D',
            path: '/',
            icon: '▣',
            kind: 'nav',
          },
          {
            id: 'transactions',
            label: 'Transactions',
            shortcut: 'G T',
            path: '/transactions',
            icon: '≋',
            kind: 'nav',
          },
          {
            id: 'wallets',
            label: 'Wallets',
            shortcut: 'G W',
            path: '/wallets',
            icon: '◈',
            kind: 'nav',
          },
          {
            id: 'goals',
            label: 'Goals',
            shortcut: 'G G',
            path: '/goals',
            icon: '⌁',
            kind: 'nav',
          },
          {
            id: 'ai',
            label: 'AI Assistant',
            shortcut: 'G A',
            path: '/ai',
            icon: '✦',
            kind: 'nav',
          },
          {
            id: 'settings',
            label: 'Settings',
            shortcut: 'G S',
            path: '/settings',
            icon: '⚙',
            kind: 'nav',
          },
        ],
      },
      {
        title: 'AI Quick Actions (UI only)',
        items: [
          {
            id: 'ai-insights',
            label: 'Generate smart insights',
            shortcut: 'AI ⏎',
            path: '/ai',
            icon: '⟡',
            kind: 'ai',
          },
          {
            id: 'ai-forecast',
            label: 'Forecast next savings trend',
            shortcut: 'AI ⏎',
            path: '/goals',
            icon: '⟐',
            kind: 'ai',
          },
        ],
      },
    ],
    []
  );

  const allItems = useMemo(() => groups.flatMap((g) => g.items.map((i) => ({ ...i, groupTitle: g.title }))), [groups]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter((i) => {
      const hay = `${i.label} ${i.path} ${i.groupTitle}`.toLowerCase();
      return hay.includes(q);
    });
  }, [allItems, query]);

  // Recent actions placeholders (no persistence, UI only)
  const recent = useMemo(
    () => [
      { id: 'r1', label: 'Open Wallets', path: '/wallets', icon: '◈' },
      { id: 'r2', label: 'View Goals', path: '/goals', icon: '⌁' },
      { id: 'r3', label: 'Ask AI', path: '/ai', icon: '✦' },
    ],
    []
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
        return;
      }

      if (!open) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        setQuery('');
        setActiveIndex(0);
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((x) => Math.min(filtered.length - 1, x + 1));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((x) => Math.max(0, x - 1));
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const target = filtered[activeIndex];
        if (target) {
          setOpen(false);
          setQuery('');
          setActiveIndex(0);
          navigate(target.path);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, filtered, navigate, open]);

  useEffect(() => {
    if (!open) return;
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  const overlay = (
    <div className="relative w-full max-w-2xl">
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-[0_25px_80px_rgba(0,0,0,0.55)] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-r from-blue-500/20 to-emerald-400/15 ring-1 ring-white/10 flex items-center justify-center text-lg">
              ⌘
            </div>
            <div className="flex-1">
              <label className="sr-only" htmlFor="fin-cp-search">Search</label>
              <input
                id="fin-cp-search"
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                placeholder="Search commands…"
                className="w-full p-4 rounded-2xl border border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
                dir="rtl"
              />
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>Recent</span>
                <span className="opacity-80">Ctrl K</span>
              </div>
            </div>
          </div>

          {query.trim().length === 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {recent.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setQuery('');
                    setActiveIndex(0);
                    navigate(r.path);
                  }}
                  className="px-3 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition text-xs text-slate-200 flex items-center gap-2"
                >
                  <span aria-hidden="true">{r.icon}</span>
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="p-3 sm:p-4 max-h-[56vh] overflow-auto">
          {filtered.length === 0 ? (
            <div className="py-10 text-center">
              <div className="text-4xl">🛰️</div>
              <div className="mt-3 text-slate-100 font-semibold">No results</div>
              <div className="mt-1 text-xs text-slate-500">Try a different keyword.</div>
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map((g) => {
                const items = filtered.filter((i) => i.groupTitle === g.title);
                if (!items.length) return null;
                return (
                  <div key={g.title}>
                    <div className="px-2 mb-2 text-xs text-slate-500">{g.title}</div>
                    <div className="space-y-2">
                      {items.map((i) => {
                        const idx = filtered.findIndex((x) => x.id === i.id);
                        const active = idx === activeIndex;
                        return (
                          <button
                            key={i.id}
                            type="button"
                            onMouseEnter={() => setActiveIndex(idx)}
                            onClick={() => {
                              setOpen(false);
                              setQuery('');
                              setActiveIndex(0);
                              navigate(i.path);
                            }}
                            className={
                              'w-full text-right px-4 py-3 rounded-2xl border transition ' +
                              (active
                                ? 'border-blue-500/40 bg-blue-500/10'
                                : 'border-white/10 bg-white/5 hover:bg-white/10')
                            }
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-2xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center text-sm">
                                  {i.icon}
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-slate-100">
                                    {i.label}
                                  </div>
                                  <div className="text-xs text-slate-500">{i.path}</div>
                                </div>
                              </div>
                              {i.shortcut ? (
                                <div className="text-[10px] text-slate-400 border border-white/10 rounded-full px-2 py-1">
                                  {i.shortcut}
                                </div>
                              ) : null}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              AI mode: placeholders only • Keyboard navigation enabled
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-[11px] text-slate-200">↑</kbd>
              <kbd className="px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-[11px] text-slate-200">↓</kbd>
              <kbd className="px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-[11px] text-slate-200">Enter</kbd>
              <kbd className="px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-[11px] text-slate-200">Esc</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <FinOverlay isOpen={open} onClose={() => { setOpen(false); setQuery(''); setActiveIndex(0); }}>
      {overlay}
    </FinOverlay>
  );
};

export default FinCommandPalette;

