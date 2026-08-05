import { Indicator, GradeResult } from '@/types/kpi';

/**
 * Calculates weighted KPI total score (0 - 100)
 */
export function calculateTotalScore(
  scores: Record<string, number>,
  indicators: Indicator[]
): number {
  if (!indicators || indicators.length === 0) return 0;
  let total = 0;
  for (const ind of indicators) {
    const rawScore = scores[ind.id];
    const score = rawScore !== undefined && !isNaN(Number(rawScore)) ? Number(rawScore) : 0;
    const weight = Number(ind.weight) || 0;
    total += (score * weight) / 100;
  }
  return Math.round((total || 0) * 100) / 100;
}

/**
 * Maps score to Grade & Description according to official reference table:
 * 95 - 100 | A+ | Sangat Memuaskan
 * 85 - 94  | A  | Memuaskan
 * 75 - 84  | B  | Baik
 * 60 - 74  | C  | Cukup
 * 0 - 59   | D  | Kurang
 */
export function calculateGrade(totalScore: number): GradeResult {
  const rounded = Math.round(totalScore);
  if (rounded >= 95) {
    return { grade: 'A+', description: 'Sangat Memuaskan', color: 'from-emerald-500 to-green-600' };
  }
  if (rounded >= 85) {
    return { grade: 'A', description: 'Memuaskan', color: 'from-blue-500 to-cyan-600' };
  }
  if (rounded >= 75) {
    return { grade: 'B', description: 'Baik', color: 'from-amber-400 to-yellow-500' };
  }
  if (rounded >= 60) {
    return { grade: 'C', description: 'Cukup', color: 'from-orange-500 to-amber-600' };
  }
  return { grade: 'D', description: 'Kurang', color: 'from-rose-600 to-red-700' };
}

/**
 * Validates that total weights sum to 100%
 */
export function validateTotalWeight(indicators: Indicator[]): {
  isValid: boolean;
  totalWeight: number;
} {
  const totalWeight = indicators.reduce((sum, ind) => sum + (Number(ind.weight) || 0), 0);
  return {
    isValid: totalWeight === 100,
    totalWeight,
  };
}

/**
 * Calculates quarterly average KPI score from an array of monthly scores
 */
export function calculateQuarterlyAverage(scores: number[]): number {
  if (!scores || scores.length === 0) return 0;
  const sum = scores.reduce((acc, curr) => acc + curr, 0);
  return Math.round((sum / scores.length) * 100) / 100;
}
