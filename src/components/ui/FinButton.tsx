import React from 'react';

import { motionFast, tactilePressSoft } from '../../utils/motionTokens';


export type FinButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';
export type FinButtonSize = 'sm' | 'md' | 'lg';


type FinButtonProps = {
  variant?: FinButtonVariant;
  size?: FinButtonSize;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  ariaLabel?: string;
};

const sizeStyles: Record<FinButtonSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-sm sm:text-base',
  lg: 'px-5 py-4 text-sm sm:text-base',
};

const variantStyles: Record<FinButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-blue-500 to-emerald-400 text-slate-950 shadow-sm hover:brightness-110',
  secondary:
    'bg-white/5 border border-white/10 text-slate-100 hover:bg-white/10',
  ghost: 'bg-transparent border border-transparent text-slate-100 hover:bg-white/5 hover:border-white/10',
  danger: 'bg-rose-500/15 border border-rose-400/20 text-rose-200 hover:bg-rose-500/25',
  icon: 'bg-white/5 border border-white/10 text-slate-100 hover:bg-white/10',
};

const disabledStyles = 'opacity-40 cursor-not-allowed hover:brightness-100';

const FinButton: React.FC<FinButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  className,
  children,
  icon,
  type = 'button',
  onClick,
  ariaLabel,
}) => {
  const isDisabled = Boolean(disabled || loading);

  const base =
    `inline-flex items-center justify-center gap-2 rounded-2xl transition focus:outline-none ${tactilePressSoft}`;


  const focus =
    'focus-visible:ring-2 focus-visible:ring-blue-500/35 focus-visible:ring-offset-0';

  const motion =
    // prefers-reduced-motion safe: Tailwind only, no JS.
    motionFast;

  const finalVariant =
    variant === 'icon'
      ? `${variantStyles.icon} p-2 ${sizeStyles[size]}`
      : `${variantStyles[variant]} ${sizeStyles[size]}`;


  return (
    <button
      type={type}
      aria-label={ariaLabel}
      disabled={isDisabled}
      onClick={() => {
        if (isDisabled) return;
        onClick?.();
      }}
      className={[base, focus, motion, finalVariant, isDisabled ? disabledStyles : '', className ?? ''].join(' ')}
    >
      {loading ? (
        <span className="inline-flex h-4 w-4 items-center justify-center">
          <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white/70 animate-spin" />
        </span>
      ) : icon ? (
        <span className="inline-flex items-center justify-center">{icon}</span>
      ) : null}
      {variant !== 'icon' && children ? children : null}
    </button>
  );
};

export default FinButton;

