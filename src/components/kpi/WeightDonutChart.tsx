import React from 'react';
import { Indicator } from '@/types/kpi';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface WeightDonutChartProps {
  indicators: Indicator[];
  dynamicPalette: string[];
  hoveredIndicatorId: string | null;
  onHoverIndicator: (id: string | null) => void;
  onIndicatorClick: (ind: Indicator) => void;
  isDonutMounted: boolean;
}

export const WeightDonutChart: React.FC<WeightDonutChartProps> = ({
  indicators,
  dynamicPalette,
  hoveredIndicatorId,
  onHoverIndicator,
  onIndicatorClick,
  isDonutMounted,
}) => {
  const totalSum = indicators.reduce((acc, curr) => acc + curr.weight, 0);

  return (
    <GlassCard>
      <SectionHeader
        title="Komposisi Bobot"
        action={
          <span className="text-xs text-cyan-300 font-bold bg-[#051520]/90 px-3.5 py-1.5 rounded-full border border-cyan-400/50 font-mono shadow-[0_0_12px_rgba(6,182,212,0.2)] backdrop-blur-md">
            {indicators.length} Segment
          </span>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2 relative z-10">
        {/* SVG 4-Segment Donut Chart */}
        <div className="lg:col-span-5 flex justify-center items-center relative py-4">
          <div className="w-56 h-56 relative flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 36 36">
              {/* Background Track Ring */}
              <path
                className="text-white/10"
                strokeWidth="3.6"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />

              {/* Segments mapped to dynamic contrast palette */}
              {indicators.map((ind, idx) => {
                const color = dynamicPalette[idx % dynamicPalette.length];
                const prevSum = indicators.slice(0, idx).reduce((acc, curr) => acc + curr.weight, 0);

                const slicePercent = (ind.weight / (totalSum || 100)) * 100;
                const strokeDasharray = isDonutMounted ? `${slicePercent} 100` : `0 100`;
                const strokeDashoffset = -((prevSum / (totalSum || 100)) * 100);

                const isHovered = hoveredIndicatorId === ind.id;
                const isAnyHovered = hoveredIndicatorId !== null;

                return (
                  <path
                    key={ind.id}
                    stroke={color}
                    strokeWidth={isHovered ? 5.6 : 4.0}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    className="cursor-pointer transition-all duration-500"
                    style={{
                      transitionDelay: isDonutMounted ? `${idx * 100}ms` : '0ms',
                      opacity: isHovered ? 1 : isAnyHovered ? 0.35 : 1,
                      filter: isHovered ? `drop-shadow(0 0 12px ${color})` : 'none',
                      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                      transformOrigin: '18px 18px',
                    }}
                    onMouseEnter={() => onHoverIndicator(ind.id)}
                    onMouseLeave={() => onHoverIndicator(null)}
                    onClick={() => onIndicatorClick(ind)}
                  />
                );
              })}
            </svg>

            {/* Center Text Labels */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
              {(() => {
                const activeInd = indicators.find((i) => i.id === hoveredIndicatorId);
                const activeIdx = activeInd ? indicators.indexOf(activeInd) : -1;
                const activeColor = activeIdx >= 0 ? dynamicPalette[activeIdx % dynamicPalette.length] : '#ffffff';

                if (activeInd) {
                  return (
                    <div key={activeInd.id} className="animate-hud-fade flex flex-col items-center max-w-[130px]">
                      <span
                        className="text-[11px] uppercase font-bold tracking-wider line-clamp-1 text-center"
                        style={{ color: activeColor }}
                      >
                        {activeInd.title}
                      </span>
                      <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono mt-0.5 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                        {activeInd.weight}%
                      </span>
                    </div>
                  );
                }

                return (
                  <div key="total-hud" className="animate-hud-fade flex flex-col items-center">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                      100%
                    </span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
                      Total Bobot
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Right Legend Breakdown */}
        <div className="lg:col-span-7 space-y-3">
          {indicators.map((ind, idx) => {
            const color = dynamicPalette[idx % dynamicPalette.length];
            const isHovered = hoveredIndicatorId === ind.id;
            const isAnyHovered = hoveredIndicatorId !== null;

            return (
              <div
                key={ind.id}
                onMouseEnter={() => onHoverIndicator(ind.id)}
                onMouseLeave={() => onHoverIndicator(null)}
                onClick={() => onIndicatorClick(ind)}
                className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer border transition-all duration-300 ${
                  isHovered
                    ? 'bg-[#051520] border-cyan-400/70 translate-x-1.5 shadow-[0_4px_20px_rgba(6,182,212,0.3)]'
                    : isAnyHovered
                    ? 'bg-[#051520]/40 border-cyan-500/10 opacity-40'
                    : 'bg-[#051520]/80 border-cyan-500/30 hover:bg-[#071c2b] hover:border-cyan-400/50'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 transition-transform duration-300"
                    style={{
                      backgroundColor: color,
                      boxShadow: isHovered ? `0 0 12px ${color}` : 'none',
                      transform: isHovered ? 'scale(1.3)' : 'scale(1)',
                    }}
                  />
                  <span className={`text-sm ${isHovered ? 'text-white font-bold' : 'text-slate-200 font-medium'} truncate`}>
                    {ind.title}
                  </span>
                </div>

                <span className="text-sm font-bold text-cyan-300 font-mono bg-[#051520]/90 px-3 py-1 rounded-xl border border-cyan-400/40 shrink-0 shadow-inner">
                  {ind.weight}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
};
