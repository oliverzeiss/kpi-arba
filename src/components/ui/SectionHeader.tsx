import React from 'react';

interface SectionHeaderProps {
  title: string;
  badge?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  badge,
  subtitle,
  action,
}) => {
  return (
    <div className="space-y-1 relative z-10">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight text-m5-gradient drop-shadow-[0_0_20px_rgba(0,229,255,0.15)]">
            {title}
          </h2>
          {badge && (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold border border-cyan-400/50 bg-[#051520]/90 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)] backdrop-blur-md">
              {badge}
            </span>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      {subtitle && (
        <p className="text-xs sm:text-sm text-slate-300 font-medium">{subtitle}</p>
      )}
    </div>
  );
};
