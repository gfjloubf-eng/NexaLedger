import React from 'react';

type Props = {
  children?: React.ReactNode;
  className?: string;
};

export default function Card({ children, className = '' }: Props) {
  return <div className={`card rounded-3xl p-6 ${className}`}>{children}</div>;
}
