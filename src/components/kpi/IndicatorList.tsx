import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Indicator } from '@/types/kpi';
import { calculateGrade } from '@/lib/kpi-calculator';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface IndicatorListProps {
  indicators: Indicator[];
  scores: Record<string, number>;
  dynamicPalette: string[];
  onIndicatorClick: (ind: Indicator) => void;
}

function getGradeBadgeStyle(grade: string) {
  switch (grade) {
    case 'A+':
      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_12px_rgba(52,211,153,0.15)]';
    case 'A':
      return 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]';
    case 'B':
      return 'text-amber-400 bg-amber-500/10 border-amber-500/30 shadow-[0_0_12px_rgba(251,191,36,0.15)]';
    case 'C':
      return 'text-orange-400 bg-orange-500/10 border-orange-500/30 shadow-[0_0_12px_rgba(251,146,60,0.15)]';
    case 'D':
    default:
      return 'text-rose-400 bg-rose-500/10 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.15)]';
  }
}

export const IndicatorList: React.FC<IndicatorListProps> = ({
  indicators,
  scores,
  dynamicPalette,
  onIndicatorClick,
}) => {
  return (
    <GlassCard>
      <SectionHeader
        title="Detail Indikator"
        badge="Evaluasi Mandiri"
      />

      <div className="space-y-3.5 relative z-10">
        {indicators.map((ind, idx) => {
          const currentScore = scores[ind.id] !== undefined ? scores[ind.id] : 85;
          const indGrade = calculateGrade(currentScore);
          const indBadgeClass = getGradeBadgeStyle(indGrade.grade);
          const cardColor = dynamicPalette[idx % dynamicPalette.length];

          return (
            <div
              key={ind.id}
              onClick={() => onIndicatorClick(ind)}
              className="flex items-center justify-between p-5 rounded-2xl bg-[#051520]/80 hover:bg-[#071c2b] border border-cyan-400/30 hover:border-cyan-300 hover:translate-x-1.5 transition duration-300 relative overflow-hidden group cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-md"
            >
              {/* Left Accent Line */}
              <div
                className="w-1 absolute left-0 top-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ backgroundColor: cardColor, boxShadow: `0 0 10px ${cardColor}` }}
              />

              {/* Number Badge & Info */}
              <div className="flex items-center gap-4 min-w-0 pr-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/40 font-bold text-sm text-cyan-300 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.15)] group-hover:scale-105 group-hover:border-cyan-300 transition-all">
                  {idx + 1}
                </div>

                <div className="min-w-0">
                  <h3 className="text-base font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                    {ind.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
                    Indikator Utama • Bobot: <span className="text-slate-100 font-semibold">{ind.weight}%</span>
                  </p>
                </div>
              </div>

              {/* Right Score & Status */}
              <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                <span className={`hidden sm:inline-block text-xs font-bold px-3 py-1 rounded-full border backdrop-blur-md shrink-0 ${indBadgeClass}`}>
                  {indGrade.description} ({indGrade.grade})
                </span>

                <div className="px-3.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 font-extrabold text-xl sm:text-2xl font-mono tracking-tight shadow-[0_0_15px_rgba(6,182,212,0.2)] shrink-0 flex items-center justify-center min-w-[56px] text-center">
                  {currentScore}
                </div>

                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-300 group-hover:translate-x-1.5 transition-all duration-300 shrink-0" />
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};
