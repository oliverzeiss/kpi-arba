'use client';

import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  isPositive?: boolean;
  valueColor?: string;
  delayMs?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  isPositive = false,
  valueColor,
  delayMs = 0,
}) => {
  const getValueColorClass = () => {
    if (valueColor) return valueColor;
    if (isPositive) return 'text-[#2dd4bf] drop-shadow-[0_0_15px_rgba(45,212,191,0.4)]';
    if (label.toUpperCase().includes('LALU')) return 'text-[#7dd3fc] drop-shadow-[0_0_15px_rgba(125,211,252,0.35)]';
    return 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]';
  };

  return (
    <div
      className="flex flex-col items-center justify-center py-4 sm:py-5 px-3 sm:px-4 rounded-[22px] bg-[#07121a]/90 hover:bg-[#0a1824]/90 border border-cyan-500/35 hover:border-cyan-400/60 shadow-[0_4px_20px_rgba(0,0,0,0.6),0_0_15px_rgba(6,182,212,0.12)] hover:shadow-[0_8px_25px_rgba(6,182,212,0.25)] transition-all duration-300 transform hover:-translate-y-1 cursor-default backdrop-blur-xl min-w-0"
      style={{
        animation: `fadeInUp 0.6s ease-out ${delayMs}ms both`,
      }}
    >
      <span className="text-[11px] sm:text-xs md:text-[13px] font-extrabold tracking-widest uppercase text-cyan-400 mb-2 text-center truncate max-w-full">
        {label}
      </span>
      <span
        className={`text-2xl sm:text-3xl md:text-[34px] font-extrabold tracking-tight leading-none text-center ${getValueColorClass()}`}
      >
        {value}
      </span>
    </div>
  );
};
