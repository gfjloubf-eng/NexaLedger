import React from 'react';

type FinSkeletonProps = {
  className?: string;
};

const FinSkeleton: React.FC<FinSkeletonProps> = ({ className }) => {
  return (
    <div
      className={[
        'relative overflow-hidden rounded-2xl bg-white/5',
        'before:absolute before:inset-0 before:translate-x-[-100%] before:animate-[shimmer_1.2s_ease-in-out_infinite]',
        'before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)]',
        className ?? '',
      ].join(' ')}
      aria-hidden="true"
    />
  );
};

export default FinSkeleton;

