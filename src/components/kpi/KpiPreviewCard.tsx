'use client';

import React, { useState, useCallback } from 'react';
import { useMouseTilt } from '../../hooks/useMouseTilt';
import { ProgressRing } from './ProgressRing';
import { StatCard } from './StatCard';

export interface KpiPreviewData {
  period: string;
  status: string;
  score: number;
  maxScore: number;
  category: string;
  previousScore: number;
  targetScore: number;
  improvement: number;
}

const defaultData: KpiPreviewData = {
  period: 'Periode: Juli 2026',
  status: 'Status: Simulasi',
  score: 86.2,
  maxScore: 100,
  category: 'Kategori: A (Memuaskan)',
  previousScore: 82,
  targetScore: 75,
  improvement: 4.2,
};

export const KpiPreviewCard: React.FC<{ data?: KpiPreviewData }> = ({
  data = defaultData,
}) => {
  const { ref: cardRef, handleMouseMove, handleMouseLeave } = useMouseTilt<HTMLDivElement>();
  const [animationKey, setAnimationKey] = useState<number>(0);

  const handleReplayAnimation = useCallback(() => {
    setAnimationKey((prev) => prev + 1);
  }, []);

  return (
    <div className="relative w-full flex flex-col items-center justify-center p-2 sm:p-4 select-none font-sans">
      {/* Background Radial Ambient Glows */}
      <div className="absolute top-[-10%] left-[20%] w-[300px] h-[300px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none animate-blob-1" />
      <div className="absolute bottom-[-10%] right-[20%] w-[250px] h-[250px] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none animate-blob-2" />

      {/* Main Glassmorphic Card Container */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full max-w-[580px] rounded-[32px] bg-[#090a0f]/80 backdrop-blur-2xl border border-white/10 p-6 sm:p-10 md:px-12 md:py-10 shadow-[0_0_50px_rgba(0,229,255,0.08),0_20px_50px_rgba(0,0,0,0.6)] kpi-card-glow-border overflow-hidden transition-all duration-300 transform-gpu my-auto"
        style={{ perspective: '1200px' }}
      >
        {/* Shimmer Sweep Animation Overlay */}
        <div className="absolute inset-0 pointer-events-none animate-shimmer opacity-20 rounded-[32px]" />

        {/* 1. HEADER BADGES */}
        <div className="relative z-10 flex items-center justify-between gap-3 mb-5 min-w-0 flex-wrap sm:flex-nowrap min-h-[36px]">
          {/* Period Badge (Kiri) */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-cyan-500/30 shadow-inner shrink-0 whitespace-nowrap">
            <svg
              className="w-4 h-4 text-cyan-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs font-bold text-m5-solid shrink-0 whitespace-nowrap">
              {data.period}
            </span>
          </div>

          {/* Status Badge (Kanan) */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-emerald-500/30 shadow-inner shrink-0 whitespace-nowrap">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-xs font-bold text-m5-solid shrink-0 whitespace-nowrap">
              {data.status}
            </span>
          </div>
        </div>

        {/* 2. TITLE SECTION */}
        <div className="relative z-10 text-center mb-2">
          <p className="text-[11px] font-bold tracking-widest uppercase text-cyan-400/90 mb-1">
            PREVIEW SISTEM
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-[42px] font-extrabold leading-tight text-m5-gradient drop-shadow-[0_0_20px_rgba(0,229,255,0.25)]">
            KPI Dashboard
          </h1>
        </div>

        {/* 3. SCORE CIRCLE (SVG Progress Ring + Counter) */}
        <div className="relative z-10 my-2">
          <ProgressRing
            key={animationKey}
            score={data.score}
            maxScore={data.maxScore}
            animationKey={animationKey}
          />
        </div>

        {/* 4. CATEGORY BADGE */}
        <div className="relative z-10 flex justify-center mb-5">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
            <span className="text-base" role="img" aria-label="Trophy">
              🏆
            </span>
            <span className="text-xs sm:text-sm font-bold text-m5-solid">
              {data.category}
            </span>
          </div>
        </div>

        {/* 5. STATS GRID (3 Columns) */}
        {(() => {
          const safeImp = typeof data?.improvement === 'number' && !isNaN(data.improvement) ? data.improvement : 3.8;
          return (
            <div className="relative z-10 grid grid-cols-3 gap-3 sm:gap-4 mb-6">
              <StatCard
                label="NILAI LALU"
                value={data.previousScore ?? 82}
                delayMs={100}
              />
              <StatCard
                label="TARGET"
                value={data.targetScore ?? 75}
                delayMs={200}
              />
              <StatCard
                label="PENINGKATAN"
                value={`${safeImp >= 0 ? '+' : ''}${safeImp.toFixed(1)}`}
                isPositive={safeImp >= 0}
                delayMs={300}
              />
            </div>
          );
        })()}

        {/* 6. FOOTER DISCLAIMER */}
        <div className="relative z-10 flex items-center space-x-3 p-3.5 sm:p-4 rounded-[16px] bg-white/[0.03] border border-white/10 text-white/70 text-xs text-center sm:text-left">
          <span className="text-base leading-none text-cyan-400 shrink-0">ⓘ</span>
          <p className="text-xs leading-relaxed text-slate-200">
            Tampilan ini merupakan{' '}
            <span className="font-bold text-m5-solid underline decoration-cyan-400/50">simulasi preview</span>{' '}
            sistem penilaian KPI. Data yang ditampilkan bersifat contoh dan tidak
            mencerminkan penilaian aktual karyawan.
          </p>
        </div>
      </div>

      {/* 7. REPLAY ANIMATION BUTTON (Below Main Card) */}
      <div className="relative z-20 mt-5 mb-1">
        <button
          onClick={handleReplayAnimation}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-cyan-500/30 text-m5-solid hover:text-cyan-200 text-xs font-bold shadow-[0_4px_16px_rgba(0,229,255,0.1)] hover:shadow-[0_6px_20px_rgba(0,229,255,0.2)] transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-md"
        >
          <span className="text-sm">↻</span>
          <span>Putar Ulang Animasi</span>
        </button>
      </div>
    </div>
  );
};
