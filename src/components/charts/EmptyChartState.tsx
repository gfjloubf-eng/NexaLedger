import React from 'react';

type EmptyChartStateProps = {
  title?: string;
  subtitle?: string;
};

const EmptyChartState: React.FC<EmptyChartStateProps> = ({
  title = 'لا توجد بيانات',
  subtitle = 'أضف معاملات للبدء في رؤية التحليلات',
}) => {
  return (
    <div className="w-full h-full min-h-[240px] flex flex-col items-center justify-center text-right px-6">
      <div className="w-12 h-12 rounded-2xl bg-white/3 text-[#94A3B8] flex items-center justify-center">
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 6v6l4 2" />
          <path d="M21 12a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z" />
        </svg>
      </div>
      <div className="mt-4 text-[#F8FAFC] font-semibold text-base">{title}</div>
      <div className="mt-1 text-[#94A3B8] text-sm leading-relaxed">{subtitle}</div>
    </div>
  );
};

export default React.memo(EmptyChartState);

