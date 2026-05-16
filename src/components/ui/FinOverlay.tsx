import React from 'react';

type FinOverlayProps = {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
  zIndexClassName?: string;
};

const FinOverlay: React.FC<FinOverlayProps> = ({
  isOpen,
  onClose,
  children,
  className,
  zIndexClassName,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={[
        'fixed inset-0 z-50',
        zIndexClassName ?? '',
        // Keep overlay above UI, but allow clicks to be captured only when open.
        'flex items-start justify-center px-4 sm:px-6 py-20',
      ].join(' ')}
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close overlay"
        // Always allow dismissal via backdrop; if no onClose is provided, do nothing.
        onClick={() => {
          onClose?.();
        }}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
      />
      <div
        className={[
          'relative w-full max-w-3xl',
          'animate-[finOverlayIn_160ms_ease-out]',
          className ?? '',
        ].join(' ')}
      >
        {children}
      </div>
    </div>
  );
};


export default FinOverlay;

