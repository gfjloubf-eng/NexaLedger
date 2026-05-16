import React from 'react';

interface DashboardCardProps {
  title: string;
  /** Optional legacy props used by src/pages/Reports.tsx */
  gradientBg?: string;
  iconColor?: string;
  borderHover?: string;
  description?: string;
  children: React.ReactNode;
  /** New API (kept for backward compatibility) */
  gradient?: 'blue' | 'green';
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  children,
  gradient,
  gradientBg,
  iconColor,
  borderHover,
}) => {
  const resolvedGradient: 'blue' | 'green' = gradient ?? 'blue';
  const defaultGradientBg = resolvedGradient === 'blue' ? 'from-blue-50/50' : 'from-green-50/50';
  const defaultBorderHover = resolvedGradient === 'blue' ? 'hover:border-blue-200' : 'hover:border-green-200';
  const defaultTextHover = resolvedGradient === 'blue' ? 'group-hover:text-blue-600' : 'group-hover:text-green-600';
  const defaultIconColor = resolvedGradient === 'blue' ? 'text-blue-500' : 'text-green-500';

  const resolvedGradientBg = gradientBg ?? defaultGradientBg;
  const resolvedBorderHover = borderHover ?? defaultBorderHover;
  const resolvedTextHover = defaultTextHover;
  const resolvedIconColor = iconColor ?? defaultIconColor;




  const borderHoverClass = resolvedBorderHover;
  const textHoverClass = resolvedTextHover;

  return (
    <div className={`group bg-white p-12 rounded-3xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-500 border border-gray-100 ${borderHoverClass} cursor-pointer relative overflow-hidden`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${resolvedGradientBg} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

      <svg className={`w-16 h-16 ${resolvedIconColor} mb-6 opacity-75 group-hover:opacity-100 transition-all relative z-10`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 12l2 2 4 -4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <h2 className={`text-4xl font-bold text-gray-900 mb-4 ${textHoverClass} transition-colors relative z-10`}>{title}</h2>
      <p className="text-lg text-gray-600 mb-8 leading-relaxed relative z-10">{description}</p>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default DashboardCard;

