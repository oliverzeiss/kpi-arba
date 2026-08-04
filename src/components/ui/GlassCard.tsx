import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'emerald' | 'amber' | 'rose';
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glowColor = 'cyan',
  hoverEffect = true,
}) => {
  const glowStyles = {
    cyan: 'border-cyan-400/50 shadow-[0_12px_50px_rgba(0,0,0,0.8),0_0_50px_rgba(6,182,212,0.25)] hover:border-cyan-300',
    emerald: 'border-emerald-400/50 shadow-[0_12px_50px_rgba(0,0,0,0.8),0_0_50px_rgba(16,185,129,0.25)] hover:border-emerald-300',
    amber: 'border-amber-400/50 shadow-[0_12px_50px_rgba(0,0,0,0.8),0_0_50px_rgba(245,158,11,0.25)] hover:border-amber-300',
    rose: 'border-rose-400/50 shadow-[0_12px_50px_rgba(0,0,0,0.8),0_0_50px_rgba(244,63,94,0.25)] hover:border-rose-300',
  };

  return (
    <div
      className={`rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col gap-5 sm:gap-6 
      bg-gradient-to-r from-[#061e2b] via-[#08283a] to-[#061f2c] transition-all duration-300 border ${
        glowStyles[glowColor]
      } ${hoverEffect ? 'apple-glass-hover' : ''} ${className}`}
    >
      {/* Multi-Directional Ambient Glow Mesh */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-400/25 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-[30%] w-96 h-96 bg-sky-500/20 rounded-full blur-[100px] pointer-events-none" />

      {children}
    </div>
  );
};
