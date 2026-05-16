import React, { useEffect } from 'react';
import FinOverlay from './FinOverlay';

type FinModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

const FinModal: React.FC<FinModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  return (
    <FinOverlay
      isOpen={isOpen}
      onClose={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        className={[
          'rounded-3xl border border-white/10 bg-white/5 backdrop-blur',
          'shadow-[0_20px_60px_rgba(0,0,0,0.45)]',
          'overflow-hidden',
          className ?? '',
        ].join(' ')}
      >
        {title || description ? (
          <header className="p-5 sm:p-6 border-b border-white/10">
            {title ? (
              <div className="text-slate-100 font-semibold text-lg">{title}</div>
            ) : null}
            {description ? (
              <div className="mt-1 text-sm text-slate-400">{description}</div>
            ) : null}
          </header>
        ) : null}

        <div className="p-5 sm:p-6">{children}</div>
      </section>
    </FinOverlay>
  );
};

export default FinModal;

