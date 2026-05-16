import React from 'react';
import FinCard from './FinCard';
import FinSkeleton from './FinSkeleton';

const FinLoadingCard: React.FC = () => {
  return (
    <FinCard subtleGlow>
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <FinSkeleton className="h-3 w-28" />
            <FinSkeleton className="h-4 w-44" />
          </div>
          <FinSkeleton className="h-10 w-20 rounded-2xl" />
        </div>

        <div className="space-y-2">
          <FinSkeleton className="h-3 w-full" />
          <FinSkeleton className="h-3 w-3/4" />
          <FinSkeleton className="h-3 w-2/3" />
        </div>

        <div className="flex gap-3">
          <FinSkeleton className="h-10 flex-1" />
          <FinSkeleton className="h-10 flex-1" />
        </div>
      </div>
    </FinCard>
  );
};

export default FinLoadingCard;

