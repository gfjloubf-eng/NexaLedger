import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string | null;
};

export default function Input({ label, error = null, className = '', ...props }: Props) {
  return (
    <label className="block">
      {label ? <span className="text-sm font-semibold text-[var(--text-primary)]">{label}</span> : null}
      <input className={`input mt-2 ${className}`} {...props} />
      {error ? <div className="mt-2 text-xs text-rose-400">{error}</div> : null}
    </label>
  );
}
