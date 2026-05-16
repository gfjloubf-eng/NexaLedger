import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

export default function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const variantClass =
    variant === 'primary'
      ? 'btn-primary'
      : variant === 'secondary'
      ? 'btn-secondary'
      : 'btn-ghost';

  return (
    <button className={`btn ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
