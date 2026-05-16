import React from 'react';

type SwitchProps = {
  checked: boolean;
  onChange?: (next: boolean) => void;
  ariaLabel?: string;
  size?: 'sm' | 'md';
};

const Switch: React.FC<SwitchProps> = ({ checked, onChange, ariaLabel = 'toggle', size = 'md' }) => {
  const width = size === 'sm' ? 'w-10 h-6' : 'w-12 h-7';
  const thumb = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange?.(!checked)}
      className={`inline-flex items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 ${checked ? 'bg-emerald-400/55' : 'bg-white/8'}`}
    >
      <span className={`${width} relative inline-block rounded-full`}>
        <span
          className={`absolute top-0.5 left-0.5 transform transition-transform duration-200 ${thumb} rounded-full bg-white shadow-sm ${checked ? 'translate-x-[1.25rem]' : 'translate-x-0'}`}
        />
      </span>
    </button>
  );
};

export default Switch;
