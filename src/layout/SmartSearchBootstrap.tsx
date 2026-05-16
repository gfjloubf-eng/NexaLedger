import React, { useEffect, useState } from 'react';

import FinSearchOverlay from '../components/ui/FinSearchOverlay';

const SmartSearchBootstrap: React.FC = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const mod = isMac ? e.metaKey : e.ctrlKey;

      // Secondary shortcut: Ctrl+Shift+K opens Smart Search
      if (mod && e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }

      if (!open) return;
      if (e.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return <FinSearchOverlay open={open} onOpenChange={setOpen} />;
};

export default SmartSearchBootstrap;

