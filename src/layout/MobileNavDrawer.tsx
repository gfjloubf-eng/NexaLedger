import { useEffect } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

import MobileNavTree from '../components/MobileNavTree';

type MobileNavDrawerProps = {
  open: boolean;
  onOpenChange: (nextOpen: boolean) => void;
};

export default function MobileNavDrawer({
  open,
  onOpenChange,
}: MobileNavDrawerProps) {
  const location = useLocation();

  const close = () => onOpenChange(false);

  // Close on route change
  useEffect(() => {
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Escape key support
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          {/* Backdrop */}
          <motion.div
            key="mobile-nav-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
            onClick={close}
          />

          {/* Drawer (RTL-first: open from RIGHT -> LEFT) */}
          <motion.aside
            key="mobile-nav-drawer"
            dir="rtl"
            initial={{ translateX: '30%', opacity: 0 }}
            animate={{ translateX: '0%', opacity: 1 }}
            exit={{ translateX: '30%', opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed top-0 right-0 z-[70] h-screen w-[320px] max-w-[85vw] bg-white/95 dark:bg-[rgba(15,23,42,0.78)] backdrop-blur-xl border-l border-white/10"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-[#F8FAFC]">التنقل</div>

                <button
                  type="button"
                  onClick={close}
                  className="h-9 w-9 rounded-xl bg-white/[0.06] ring-1 ring-white/10 text-[#F8FAFC] hover:bg-white/[0.09] transition"
                  aria-label="Close navigation"
                >
                  ✕
                </button>
              </div>

              <div className="h-[calc(100vh-3.5rem)] overflow-y-auto">
                <MobileNavTree
                  defaultExpandedSection="customers"
                  onNavigate={close}
                />
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

