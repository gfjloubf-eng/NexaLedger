import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import FinOverlay from './FinOverlay';

type SearchCard = {
  id: string;
  title: string;
  subtitle: string;
  path: string;
  icon: string;
};

const FinSearchOverlay: React.FC<{ open: boolean; onOpenChange: (v: boolean) => void }> = ({
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const cards: SearchCard[] = useMemo(
    () => [
      {
        id: 's-dashboard',
        title: 'Dashboard',
        subtitle: 'Overview & analytics',
        path: '/',
        icon: '▣',
      },
      {
        id: 's-transactions',
        title: 'Transactions',
        subtitle: 'History & categories',
        path: '/transactions',
        icon: '≋',
      },
      {
        id: 's-wallets',
        title: 'Wallets',
        subtitle: 'Balances & transfer UI',
        path: '/wallets',
        icon: '◈',
      },
      {
        id: 's-goals',
        title: 'Goals',
        subtitle: 'Savings progress cards',
        path: '/goals',
        icon: '⌁',
      },
      {
        id: 's-ai',
        title: 'AI Assistant',
        subtitle: 'Smart insights placeholders',
        path: '/ai',
        icon: '✦',
      },
      {
        id: 's-settings',
        title: 'Settings',
        subtitle: 'Profile, notifications, support',
        path: '/settings',
        icon: '⚙',
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter((c) => (c.title + ' ' + c.subtitle + ' ' + c.path).toLowerCase().includes(q));
  }, [cards, query]);

  const recent = useMemo(
    () => [
      { id: 'r1', label: 'wallets', path: '/wallets', icon: '◈' },
      { id: 'r2', label: 'goals', path: '/goals', icon: '⌁' },
      { id: 'r3', label: 'transactions', path: '/transactions', icon: '≋' },
    ],
    []
  );

  useEffect(() => {
    if (!open) return;
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
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
          onOpenChange(false);
          setQuery('');
          setActiveIndex(0);
          navigate(target.path);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, filtered, navigate, onOpenChange, open]);

  return (
    <FinOverlay isOpen={open} onClose={() => onOpenChange(false)}>
      <div className="relative w-full max-w-xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-[0_25px_80px_rgba(0,0,0,0.55)] overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-r from-blue-500/20 to-emerald-400/15 ring-1 ring-white/10 flex items-center justify-center text-lg">
                🔎
              </div>
              <div className="flex-1">
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(0);
                  }}
                  placeholder="Search…"
                  className="w-full p-4 rounded-2xl border border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
                  dir="rtl"
                />
                <div className="mt-2 text-xs text-slate-400">Smart search overlay • keyboard enabled</div>
              </div>
            </div>

            {query.trim().length === 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {recent.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      onOpenChange(false);
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

          <div className="p-3 sm:p-4 max-h-[56vh] overflow-auto pb-[calc(env(safe-area-inset-bottom)+0px)]">

            {filtered.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-4xl">🫥</div>
                <div className="mt-3 text-slate-100 font-semibold">Nothing found</div>
                <div className="mt-1 text-xs text-slate-500">Try another keyword.</div>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((c, idx) => {
                  const active = idx === activeIndex;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => {
                        onOpenChange(false);
                        setQuery('');
                        setActiveIndex(0);
                        navigate(c.path);
                      }}
                      className={
                        'w-full text-right px-4 py-4 rounded-2xl border transition ' +
                        (active
                          ? 'border-blue-500/40 bg-blue-500/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10')
                      }
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 rounded-2xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center text-sm">
                            {c.icon}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-100">{c.title}</div>
                            <div className="text-xs text-slate-500">{c.subtitle}</div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400">{c.path}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-4 sm:p-5 border-t border-white/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
              <span>Press Esc to close</span>
              <span>↑ ↓ to navigate • Enter to open</span>
            </div>
          </div>
        </div>
      </div>
    </FinOverlay>
  );
};

export default FinSearchOverlay;

