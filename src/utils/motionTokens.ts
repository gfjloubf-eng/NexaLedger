// Lightweight motion token utilities (local pilot).
// Keep these explicit and Tailwind-class-only.

export const motionFast = [
  'transition-transform',
  'transition-shadow',
  'duration-200',
  'ease-out',
  'will-change-transform',
].join(' ');

// Backwards-compatible semantic alias (keeps token vocabulary explicit).
export const tactilePressSoft = 'active:scale-[0.98]';


export const motionNormal = [
  'transition-transform',
  'transition-shadow',
  'duration-300',
  'ease-out',
].join(' ');

export const hoverLiftSoft = 'hover:-translate-y-0.5';

export const hoverShadowSoft = 'hover:shadow-[0_14px_40px_rgba(0,0,0,0.22)]';

