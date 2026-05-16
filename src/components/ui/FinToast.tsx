import React from 'react';

type FinToastProps = {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
};

const typeStyles: Record<FinToastProps['type'], string> = {
  success:
    'border-emerald-400/20 bg-emerald-500/10 text-emerald-100',
  error: 'border-rose-400/20 bg-rose-500/10 text-rose-100',
  warning:
    'border-amber-400/20 bg-amber-500/10 text-amber-100',
  info: 'border-cyan-400/20 bg-cyan-500/10 text-cyan-100',
};

const FinToast: React.FC<FinToastProps> = ({ type, title, message, onClose }) => {
  return (
    <div
      className={[
        'rounded-2xl border backdrop-blur px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)]',
        typeStyles[type],
        'animate-[finToastIn_200ms_ease-out]',
        'min-w-[280px] max-w-[420px]',
      ].join(' ')}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {title ? (
            <div className="font-semibold text-sm">{title}</div>
          ) : null}
          <div className="mt-0.5 text-sm opacity-90 leading-relaxed">{message}</div>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-white/5 transition text-slate-200"
            aria-label="Dismiss toast"
          >
            ✕
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default FinToast;

