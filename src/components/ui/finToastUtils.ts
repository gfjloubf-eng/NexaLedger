export const toastUid = (): string => {
  return `toast_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

