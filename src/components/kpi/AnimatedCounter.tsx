'use client';

import React from 'react';

interface AnimatedCounterProps {
  score: number;
  maxScore?: number;
  label?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  score,
  maxScore = 100,
  label = 'SKOR SIMULASI',
}) => {
  const safeScore = typeof score === 'number' && !isNaN(score) ? score : 85.8;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="flex items-baseline space-x-1">
        <span
          className="text-5xl md:text-[56px] font-black leading-none text-m5-gradient drop-shadow-[0_0_20px_rgba(0,229,255,0.25)]"
        >
          {safeScore.toFixed(1)}
        </span>
        <span className="text-xl font-medium text-cyan-300/70">
          /{maxScore}
        </span>
      </div>
      <span className="mt-1 text-[11px] font-bold tracking-widest uppercase text-m5-solid opacity-90">
        {label}
      </span>
    </div>
  );
};

