import React from 'react';

import {
  motionNormal,
  hoverLiftSoft,
  hoverShadowSoft,
} from '../../utils/motionTokens';

type FinCardProps = {
  children: React.ReactNode;
  className?: string;
  subtleGlow?: boolean;
};


const FinCard: React.FC<FinCardProps> = ({ children, className, subtleGlow }) => {
  return (
    <div
      className={[
        'group rounded-3xl border border-white/10 bg-white/5 backdrop-blur',
        'shadow-[0_10px_30px_rgba(0,0,0,0.18)]',
        subtleGlow
          ? 'shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_0_40px_rgba(59,130,246,0.10)]'
          : '',
        // Premium hover feel (CSS-only, prefers-reduced-motion safe)
        motionNormal,
        hoverLiftSoft,
        hoverShadowSoft,
        // Keep separate will-change for rendering stability
        'will-change-transform',

        className ?? '',
      ].join(' ')}

    >
      {children}
    </div>
  );
};

export default FinCard;

