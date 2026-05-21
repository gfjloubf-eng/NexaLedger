import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

interface SidebarItem {
  id: string;
  path: string;
  label: string;
  icon: string;
}

const Sidebar: React.FC = () => {
  const { signOut } = useAuth();

  const sidebarItems: SidebarItem[] = [
    { id: 'dashboard', path: '/', label: 'لوحة التحكم', icon: '🏠' },
    { id: 'transactions', path: '/transactions', label: 'المعاملات', icon: '💳' },
    { id: 'reports', path: '/reports', label: 'التقارير', icon: '📊' },
    { id: 'settings', path: '/settings', label: 'الإعدادات', icon: '⚙️' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <aside className="fixed top-0 right-0 h-full w-64 bg-[rgba(15,23,42,0.78)] border-l border-white/6 text-[#F8FAFC] z-40 backdrop-blur-sm">

      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-10 p-3 rounded-xl bg-white/3 ring-1 ring-white/6">

          <div className="w-11 h-11 rounded-xl flex items-center justify-center ring-1 ring-white/10 bg-white/[0.02]">
            <svg
              width="42"
              height="42"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle cx="32" cy="32" r="16" stroke="#F8FAFC" strokeOpacity="0.92" strokeWidth="2" />
              <path
                d="M 20 32 A 12 12 0 0 1 44 32"
                stroke="#F8FAFC"
                strokeOpacity="0.75"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="44" cy="32" r="3.1" fill="#F8FAFC" fillOpacity="0.95" />
              <path
                d="M 27 18 C 37 20 45 28 46 38"
                stroke="#F8FAFC"
                strokeOpacity="0.35"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#F8FAFC] leading-tight">NexaLedger</h3>
            <p className="text-xs text-[#94A3B8]">الإصدار 1.0</p>

          </div>
        </div>
        <nav className="flex-1 space-y-2" aria-label="Primary">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35 focus-visible:ring-offset-0 active:scale-[0.98] ${
                  isActive
                    ? 'bg-white/6 text-[#F8FAFC] border-l-4 border-emerald-500/90 shadow-sm'
                    : 'text-[#94A3B8] hover:bg-white/3'
                }`
              }

              aria-label={item.label}
            >

              <span className="flex items-center justify-center w-9 h-9 rounded-lg text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-6">
          <div className="border-t border-white/6 pt-4">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-end gap-3 px-4 py-2 rounded-xl text-[#94A3B8] hover:bg-white/3 transition-colors duration-150 text-right"
            >
              <span>تسجيل الخروج</span>
              <span aria-hidden="true">🚪</span>
            </button>
            <div className="flex flex-col items-end gap-1 mt-4 pr-1">
              <div className="text-[11px] text-slate-500/80">NexaLedger v1.0</div>
              <div className="text-[11px] text-slate-500/70">المهندس عمار المصوعي — فريق NexaLedger</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
