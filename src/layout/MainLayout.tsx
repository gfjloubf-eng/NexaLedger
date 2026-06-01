 import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { SettingsProvider } from '../context/SettingsContext';
import RouteTransitionWrapper from './RouteTransitionWrapper';

import MobileNavDrawer from './MobileNavDrawer';

const MainLayout: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < 1024
      );
    };

    checkMobile();

    window.addEventListener(
      'resize',
      checkMobile
    );

    return () => {
      window.removeEventListener(
        'resize',
        checkMobile
      );
    };
  }, []);

  return (
    <SettingsProvider>
      <div className="relative min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">

        {/* SIMPLE SAFE SIDEBAR */}
        <aside className="hidden lg:block fixed top-0 right-0 h-screen w-64 z-10">
          <Sidebar />
        </aside>

        {/* MOBILE NOTICE */}
        {isMobile && (
          <div
            className="fixed top-[calc(1rem+env(safe-area-inset-top))] right-4 z-20 rounded-xl bg-slate-900 px-4 py-2 text-sm text-white shadow-lg lg:hidden"
            aria-hidden="true"
          >
            افتح المشروع من الكمبيوتر مؤقتًا
          </div>
        )}


        {/* TOP BAR */}
        <header className="hidden lg:flex fixed top-0 right-0 left-0 h-16 items-center justify-end px-8 z-20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-px bg-white/10 dark:bg-white/5" />

            <ThemeToggle />
          </div>
        </header>

        {/* SAFE BACKGROUND */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-blue-400/20 blur-3xl" />

          <div className="absolute top-20 -right-40 h-[480px] w-[480px] rounded-full bg-emerald-400/15 blur-3xl" />

          <div className="absolute bottom-[-220px] left-[18%] h-[520px] w-[520px] rounded-full bg-cyan-400/10 blur-3xl" />
        </div>

        {/* MAIN CONTENT */}
        <main className="relative z-[1] lg:mr-64 p-6 pt-20 pb-[calc(4.25rem+env(safe-area-inset-bottom))] lg:pb-6">
          <RouteTransitionWrapper>
            <Outlet />
          </RouteTransitionWrapper>
        </main>

        {/* MOBILE NAV: ☰ + RIGHT DRAWER */}
        {isMobile && (
          <>
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => {
                setDrawerOpen(true);
              }}

              className="lg:hidden fixed top-[calc(1rem+env(safe-area-inset-top))] right-4 z-50 h-10 w-10 rounded-xl bg-white/[0.06] ring-1 ring-white/10 backdrop-blur-sm text-[#F8FAFC]"
              style={{ display: 'grid', placeItems: 'center' }}
            >
              <span aria-hidden="true" className="text-xl">☰</span>
            </button>

            <div
              id="nexa-mobile-drawer-open"
              className="lg:hidden"
              style={{ display: 'contents' }}
            />

            <MobileNavDrawer
              open={drawerOpen}
              onOpenChange={setDrawerOpen}
            />

          </>
        )}


      </div>
    </SettingsProvider>
  );
};

export default MainLayout;

