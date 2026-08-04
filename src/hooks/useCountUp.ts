'use client';

import { useState, useEffect } from 'react';

interface UseCountUpOptions {
  end: number;
  start?: number;
  durationMs?: number;
  decimals?: number;
  delayMs?: number;
}

export function useCountUp({
  end,
  start = 0,
  durationMs = 2000,
  decimals = 1,
  delayMs = 0,
}: UseCountUpOptions) {
  const [value, setValue] = useState(start);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let animationFrameId: number;
    let startTime: number | null = null;

    const timeoutId = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / durationMs, 1);

        // Ease-out cubic formula
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentValue = start + (end - start) * easeOutCubic;

        setValue(Number(currentValue.toFixed(decimals)));

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        } else {
          setValue(end);
          setIsComplete(true);
        }
      };

      animationFrameId = requestAnimationFrame(step);
    }, delayMs);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [end, start, durationMs, decimals, delayMs]);

  return { value, isComplete };
}
