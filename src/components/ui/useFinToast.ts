import { useContext } from 'react';

import { ToastContext } from './FinToastContainer';

export const useFinToast = () => {
  const ctx = useContext(ToastContext);

  if (!ctx) return () => {};

  return ctx.pushToast;
};


