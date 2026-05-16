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

          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-emerald-400 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg">N</span>
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
                `relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 text-right ${
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
