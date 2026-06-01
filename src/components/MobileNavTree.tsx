import React, { useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

type NavItem = {
  id: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
};

type NavSection = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  items: NavItem[];
};

const SECTION_CLASSES =
  'rounded-3xl border border-white/5 bg-[rgba(255,255,255,0.02)] shadow-sm backdrop-blur';

const TreeButton: React.FC<{
  expanded: boolean;
  label: string;
  onClick: () => void;
}> = ({ expanded, label, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl transition-colors ' +
        'hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35'
      }

    >
      <span className="text-sm font-semibold text-[#F8FAFC]">{label}</span>
      <span
        aria-hidden="true"
        className={
          'text-lg transition-transform duration-200 ' +
          (expanded ? 'rotate-90' : 'rotate-0')
        }
      >
        ▸
      </span>
    </button>
  );
};

const NavRow: React.FC<{ item: NavItem; depth?: number }> = ({ item, depth = 0 }) => {
  return (
    <NavLink
      to={item.path}
      end
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-2xl px-5 py-2 transition-colors duration-150 text-sm ` +
        `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35 ` +
        `${isActive ? 'bg-white/[0.05] ring-1 ring-white/10' : 'hover:bg-white/[0.02]'}`
      }
      style={{ paddingRight: depth ? 24 : undefined }}
    >
      {item.icon ? (
        <span className="w-7 h-7 rounded-xl flex items-center justify-center bg-white/[0.02] ring-1 ring-white/10">
          {item.icon}
        </span>
      ) : null}
      <span className="text-[#F8FAFC]">{item.label}</span>
    </NavLink>
  );
};

export default function MobileNavTree({
  defaultExpandedSection,
  onNavigate,
}: {
  defaultExpandedSection: string;
  onNavigate?: () => void;
}) {
  const location = useLocation();

  const sections: NavSection[] = useMemo(
    () => [
      {
        id: 'customers',
        label: 'إدارة العملاء',
        items: [
          { id: 'customers-root', label: 'العملاء', path: '/customers', icon: '🏢' },
          { id: 'invoices', label: 'الفواتير', path: '/invoices', icon: '🧾' },
          { id: 'payments', label: 'المدفوعات', path: '/transactions', icon: '💳' },
        ],
      },
      {
        id: 'analytics',
        label: 'التحليلات',
        items: [
          { id: 'business-pulse', label: 'نبض الأعمال', path: '/business-pulse', icon: '📈' },
          { id: 'reports', label: 'التقارير', path: '/reports', icon: '📊' },
        ],
      },
      {
        id: 'system',
        label: 'النظام',
        items: [{ id: 'settings', label: 'الإعدادات', path: '/settings', icon: '⚙️' }],
      },
    ],
    []
  );

  const findSectionIdForPath = (pathname: string) => {
    for (const section of sections) {
      if (section.items.some((i) => i.path === pathname)) return section.id;
      // handle nested paths if any (future-proof)
      if (section.items.some((i) => pathname.startsWith(i.path + '/'))) return section.id;
    }
    return null;
  };

  const derivedDefaultExpanded =
    findSectionIdForPath(location.pathname) ?? defaultExpandedSection;

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const m: Record<string, boolean> = {};
    for (const s of sections) m[s.id] = s.id === derivedDefaultExpanded;
    return m;
  });

  // Derived for default “active section open” behavior.
  // Keep lint-safe.
  void useMemo(() => {
    const m: Record<string, boolean> = { ...expanded };
    if (derivedDefaultExpanded) m[derivedDefaultExpanded] = true;
    return m;
  }, [expanded, derivedDefaultExpanded]);

  return (
    <div dir="rtl" className="space-y-3" onClickCapture={() => onNavigate?.()}>
      {sections.map((section) => {
        const isOpen = !!expanded[section.id];
        return (
          <div key={section.id} className={SECTION_CLASSES}>
            <TreeButton
              expanded={isOpen}
              label={section.label}
              onClick={() =>
                setExpanded((prev) => ({ ...prev, [section.id]: !prev[section.id] }))
              }
            />

            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  key={section.id + ':panel'}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-2 pb-3">
                    <div className="space-y-2">
                      {section.items.map((item) => (
                        <NavRow key={item.id} item={item} depth={1} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

