'use client';

import React, { useState, useEffect } from 'react';
import { useCountUp } from '../../hooks/useCountUp';
import { AnimatedCounter } from './AnimatedCounter';

interface ProgressRingProps {
  score: number;
  maxScore?: number;
  label?: string;
  animationKey?: number;
}

interface Particle {
  id: number;
  tx: number;
  ty: number;
  size: number;
  color: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  score = 86.2,
  maxScore = 100,
  label = 'SKOR SIMULASI',
  animationKey = 0,
}) => {
  const radius = 100;
  const circumference = 2 * Math.PI * radius; // ~628.32
  const [dashOffset, setDashOffset] = useState(circumference);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Reset and count up score logic
  const { value: animatedScore, isComplete } = useCountUp({
    end: score,
    start: 0.0,
    durationMs: 2000,
    decimals: 1,
    delayMs: 150,
  });

  // Re-trigger progress ring animation whenever animationKey changes
  useEffect(() => {
    setDashOffset(circumference);
    const timer = setTimeout(() => {
      const targetOffset = circumference - (score / maxScore) * circumference;
      setDashOffset(targetOffset);
    }, 150);

    return () => clearTimeout(timer);
  }, [score, maxScore, circumference, animationKey]);

  // Particle burst trigger when count up completes
  useEffect(() => {
    if (isComplete) {
      const colors = ['#80deea', '#4dd0e1', '#00bcd4', '#4db6ac', '#00e5ff'];
      const newParticles: Particle[] = Array.from({ length: 20 }, (_, i) => {
        const angle = (i / 20) * 2 * Math.PI;
        const distance = 40 + Math.random() * 50;
        return {
          id: i,
          tx: Math.cos(angle) * distance,
          ty: Math.sin(angle) * distance,
          size: 4 + Math.random() * 6,
          color: colors[Math.floor(Math.random() * colors.length)],
        };
      });

      setParticles(newParticles);

      const cleanupTimer = setTimeout(() => {
        setParticles([]);
      }, 1000);

      return () => clearTimeout(cleanupTimer);
    }
  }, [isComplete, animationKey]);

  return (
    <div className="relative flex items-center justify-center my-4 sm:my-6">
      {/* Background Radial Glow */}
      <div
        className="absolute w-[240px] h-[240px] rounded-full animate-glow-pulse pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0,188,212,0.14) 0%, transparent 70%)',
        }}
      />

      {/* SVG Ring Container */}
      <div className="relative w-[180px] h-[180px] sm:w-[220px] sm:h-[220px]">
        <svg
          viewBox="0 0 220 220"
          className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_12px_rgba(0,188,212,0.25)]"
        >
          <defs>
            <linearGradient id="scoreRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4dd0e1" />
              <stop offset="50%" stopColor="#80deea" />
              <stop offset="100%" stopColor="#4db6ac" />
            </linearGradient>
          </defs>

          {/* Track Circle */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            stroke="rgba(0, 150, 136, 0.1)"
            strokeWidth="10"
            fill="transparent"
          />

          {/* Progress Fill Circle */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            stroke="url(#scoreRingGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition: 'stroke-dashoffset 2.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </svg>

        {/* Center Score Overlay */}
        <div className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-out transform">
          <AnimatedCounter score={animatedScore} maxScore={maxScore} label={label} />
        </div>

        {/* Particle Burst Overlay */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute top-1/2 left-1/2 rounded-full pointer-events-none"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              animation: 'particleFly 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              '--tx': `${p.tx}px`,
              '--ty': `${p.ty}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
};
