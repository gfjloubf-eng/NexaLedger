import React from 'react';

const BrandSignature: React.FC<{
  className?: string;
  versionText?: string;
  byText?: string;
}> = ({ className, versionText = 'NexaLedger v1.0', byText = 'Crafted by Ammar' }) => {
  return (
    <div
      className={[
        'flex flex-col gap-0.5 leading-tight text-right',
        'text-xs text-slate-500',
        className ?? '',
      ].join(' ')}
    >
      <div className="text-[11px] tracking-wide text-slate-500/90">{versionText}</div>
      <div className="text-[11px] text-slate-500/80">{byText}</div>
    </div>
  );
};

export default BrandSignature;

