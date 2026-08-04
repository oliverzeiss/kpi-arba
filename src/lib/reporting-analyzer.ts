import {
  KPISubmission,
  ExecutiveReportData,
  BottleneckIndicator,
  DivisionCompletion,
  Division,
  Position,
} from '@/types/kpi';
import { calculateGrade } from './kpi-calculator';

export function generateExecutiveReport(
  submissions: KPISubmission[],
  divisions: Division[] = [],
  positions: Position[] = []
): ExecutiveReportData {
  if (!submissions || submissions.length === 0) {
    return {
      totalSubmissions: 0,
      averageCompanyScore: 0,
      topPerformers: [],
      bottomPerformers: [],
      bottlenecks: [],
      divisionCompletions: [],
      gradeCounts: { 'A+': 0, A: 0, B: 0, C: 0, D: 0 },
      divisionAverages: {},
    };
  }

  // 1. Total Submissions & Overall Company Average
  const totalSubmissions = submissions.length;
  const totalScoreSum = submissions.reduce((acc, curr) => acc + curr.totalScore, 0);
  const averageCompanyScore = Math.round((totalScoreSum / totalSubmissions) * 100) / 100;

  // 2. Grade Counts Distribution
  const gradeCounts: Record<string, number> = { 'A+': 0, A: 0, B: 0, C: 0, D: 0 };
  submissions.forEach((sub) => {
    if (gradeCounts[sub.grade] !== undefined) {
      gradeCounts[sub.grade]++;
    }
  });

  // 3. Division Averages
  const divisionMap: Record<string, { sum: number; count: number }> = {};
  submissions.forEach((sub) => {
    const divName = sub.divisionName || 'Lainnya';
    if (!divisionMap[divName]) {
      divisionMap[divName] = { sum: 0, count: 0 };
    }
    divisionMap[divName].sum += sub.totalScore;
    divisionMap[divName].count++;
  });

  const divisionAverages: Record<string, number> = {};
  Object.keys(divisionMap).forEach((divName) => {
    divisionAverages[divName] =
      Math.round((divisionMap[divName].sum / divisionMap[divName].count) * 100) / 100;
  });

  // 4. Top 5 Star Performers (Sorted by totalScore desc)
  const sortedSubmissions = [...submissions].sort((a, b) => b.totalScore - a.totalScore);
  const topPerformers = sortedSubmissions.slice(0, 5);

  // 5. Bottom Performers (Grade C & D / Skor < 75 sorted asc)
  const bottomPerformers = sortedSubmissions
    .filter((s) => s.totalScore < 75 || s.grade === 'C' || s.grade === 'D')
    .reverse()
    .slice(0, 5);

  // 6. Bottleneck Indicators (Lowest scoring indicators)
  const indicatorMap: Record<string, { sum: number; count: number; divisionName: string }> = {};
  submissions.forEach((sub) => {
    if (sub.scores) {
      Object.keys(sub.scores).forEach((indKey) => {
        const score = sub.scores[indKey];
        const title = indKey.includes('ind-') ? getIndicatorLabel(indKey) : indKey;
        if (!indicatorMap[title]) {
          indicatorMap[title] = { sum: 0, count: 0, divisionName: sub.divisionName };
        }
        indicatorMap[title].sum += score;
        indicatorMap[title].count++;
      });
    }
  });

  const bottlenecks: BottleneckIndicator[] = Object.keys(indicatorMap)
    .map((title) => ({
      indicatorTitle: title,
      averageScore: Math.round((indicatorMap[title].sum / indicatorMap[title].count) * 100) / 100,
      divisionName: indicatorMap[title].divisionName,
      affectedCount: indicatorMap[title].count,
    }))
    .sort((a, b) => a.averageScore - b.averageScore)
    .slice(0, 5);

  // 7. Division Completion Rates
  const divisionCompletions: DivisionCompletion[] = divisions.map((div) => {
    const posInDiv = positions.filter((p) => p.divisionId === div.id);
    const estEmployees = Math.max(posInDiv.length * 3, 5); // Est 3-5 employees per position
    const completedCount = submissions.filter((s) => s.divisionName === div.name).length;
    const percentage = Math.min(100, Math.round((completedCount / estEmployees) * 100));

    return {
      divisionName: div.name,
      completedCount,
      totalEmployees: estEmployees,
      percentage,
    };
  });

  return {
    totalSubmissions,
    averageCompanyScore,
    topPerformers,
    bottomPerformers,
    bottlenecks,
    divisionCompletions,
    gradeCounts,
    divisionAverages,
  };
}

function getIndicatorLabel(key: string): string {
  if (key === 'ind-1') return 'Ketepatan Waktu & Kehadiran';
  if (key === 'ind-2') return 'Keakuratan & Kualitas Hasil Kerja';
  if (key === 'ind-3') return 'Komunikasi & Kerjasama Tim';
  if (key === 'ind-4') return 'Inisiatif & Problem Solving';
  return key;
}
