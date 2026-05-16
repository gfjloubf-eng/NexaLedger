import React, { createContext, useCallback, useMemo, useState } from 'react';

import FinToast from './FinToast';
import { toastUid } from './finToastUtils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

type ToastItem = {
  id: string;
  title?: string;
  message: string;
  type?: ToastType;
};

type ToastContextValue = {
  pushToast: (toast: Omit<ToastItem, 'id'>) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export { ToastContext };

type Props = {

  children?: React.ReactNode;
};

const FinToastContainer: React.FC<Props> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = toastUid();

      const nextToast: ToastItem = {
        id,
        ...toast,
      };

      setToasts((prev) => [...prev, nextToast].slice(-4));

      window.setTimeout(() => {
        removeToast(id);
      }, 3200);
    },
    [removeToast]
  );

  const value = useMemo(
    () => ({
      pushToast,
    }),
    [pushToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-full max-w-sm flex-col gap-3"
        dir="rtl"
      >
        {toasts.map((toast) => (
          <FinToast
            key={toast.id}
            title={toast.title}
            message={toast.message}
            type={toast.type ?? 'info'}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default FinToastContainer;

