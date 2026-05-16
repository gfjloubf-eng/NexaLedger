import React from 'react';
import FinButton from './FinButton';
import FinCard from './FinCard';

type FinEmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
};

const FinEmptyState: React.FC<FinEmptyStateProps> = ({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}) => {
  return (
    <FinCard className="p-10 text-center" subtleGlow>
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3">
        <div className="text-4xl">{icon ?? '✨'}</div>
        <div className="text-lg font-semibold text-slate-100">{title}</div>
        {subtitle ? <div className="text-sm text-slate-400">{subtitle}</div> : null}
        {actionLabel && onAction ? (
          <div className="mt-3">
            <FinButton onClick={onAction} variant="primary" size="md">
              {actionLabel}
            </FinButton>
          </div>
        ) : null}
      </div>
    </FinCard>
  );
};

export default FinEmptyState;

