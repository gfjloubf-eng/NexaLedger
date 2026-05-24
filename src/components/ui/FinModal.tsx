import React, { useEffect, useRef } from 'react';
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
  const sectionRef = useRef<HTMLElement | null>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save focus for interruption-safe recovery.
    lastActiveElementRef.current = document.activeElement as HTMLElement | null;

    const sectionEl = sectionRef.current;

    // Basic focus trap + focus move into the modal.
    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const focusFirst = () => {
      if (!sectionEl) return;
      const focusables = Array.from(
        sectionEl.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter((el) => !el.hasAttribute('disabled'));

      const target = focusables[0] ?? sectionEl;
      target.focus?.({ preventScroll: true });
    };

    // Move focus on open (avoid visual changes + reduce focus bounce).
    // requestAnimationFrame waits for overlay/layout to commit.
    const rafId = window.requestAnimationFrame(() => focusFirst());

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== 'Tab') return;
      if (!sectionEl) return;

      const focusables = Array.from(
        sectionEl.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter((el) => !el.hasAttribute('disabled') && !el.hasAttribute('aria-hidden'));

      if (focusables.length === 0) {
        e.preventDefault();
        sectionEl.focus?.({ preventScroll: true });
        return;
      }

      const current = document.activeElement as HTMLElement | null;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (current === first || current === sectionEl || !focusables.includes(current as HTMLElement)) {
          e.preventDefault();
          last.focus?.({ preventScroll: true });
        }
      } else {
        if (current === last) {
          e.preventDefault();
          first.focus?.({ preventScroll: true });
        }
      }

      // If current isn't in the list, send focus to first.
      if (!current || !focusables.includes(current)) {
        e.preventDefault();
        focusFirst();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.cancelAnimationFrame(rafId);

      window.removeEventListener('keydown', onKeyDown);

      // Restore focus on close.
      const last = lastActiveElementRef.current;
      if (last && typeof last.focus === 'function') {
        try {
          last.focus({ preventScroll: true });
        } catch {
          last.focus();
        }
      }
    };
  }, [isOpen, onClose]);

  return (
    <FinOverlay isOpen={isOpen} onClose={onClose}>
      <section
        ref={sectionRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
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


