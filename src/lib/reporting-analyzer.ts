import type {
  KPISubmission,
  ExecutiveReportData,
  BottleneckIndicator,
  DivisionCompletion,
  Division,
  Position,
  KPITemplate,
} from '@/types/kpi';
import { calculateGrade } from './kpi-calculator';
import { buildTemplateMap, resolveSubmissionIndicators, round2 } from './indicator-resolver';

export function generateExecutiveReport(
  submissions: KPISubmission[],
  divisions: Division[] = [],
  positions: Position[] = [],
  templates: KPITemplate[] = [],
  companyKpiTarget: number = 75
): ExecutiveReportData {
  if (!submissions || submissions.length === 0) {
    return {
      totalSubmissions: 0,
      averageCompanyScore: 0,
      topPerformers: { all: [], byDivision: {}, byPosition: {} },
      bottomPerformers: { all: [], byDivision: {}, byPosition: {} },
      bottlenecks: [],
      divisionCompletions: [],
      gradeCounts: { 'A+': 0, A: 0, B: 0, C: 0, D: 0 },
      divisionAverages: {},
      monthlyTrend: [],
      companyKpiTarget
    };
  }

  // Convert templates to a Map for O(1) lookup
  const templateMap = buildTemplateMap(templates);

  // 1. Total Submissions & Overall Company Average
  const totalSubmissions = submissions.length;
  // Use final score if approved
  const getScore = (sub: KPISubmission) => sub.finalTotalScore ?? (sub.supervisorTotalScore ?? sub.totalScore);
  const getGrade = (sub: KPISubmission) => sub.finalGrade ?? (sub.supervisorGrade ?? sub.grade);

  const totalScoreSum = submissions.reduce((acc, curr) => acc + getScore(curr), 0);
  const averageCompanyScore = Math.round((totalScoreSum / totalSubmissions) * 100) / 100;

  // 2. Grade Counts Distribution
  const gradeCounts: Record<string, number> = { 'A+': 0, A: 0, B: 0, C: 0, D: 0 };
  submissions.forEach((sub) => {
    const grade = getGrade(sub);
    if (gradeCounts[grade] !== undefined) {
      gradeCounts[grade]++;
    } else {
      gradeCounts[grade] = 1;
    }
  });

  // 3. Division Averages & Monthly Trend
  const divisionMap: Record<string, { sum: number; count: number }> = {};
  const monthlyMap: Record<number, { sum: number; count: number }> = {};
  
  submissions.forEach((sub) => {
    const divName = sub.divisionName || 'Lainnya';
    const score = getScore(sub);
    
    // Division
    if (!divisionMap[divName]) divisionMap[divName] = { sum: 0, count: 0 };
    divisionMap[divName].sum += score;
    divisionMap[divName].count++;
    
    // Monthly trend
    if (sub.month) {
      if (!monthlyMap[sub.month]) monthlyMap[sub.month] = { sum: 0, count: 0 };
      monthlyMap[sub.month].sum += score;
      monthlyMap[sub.month].count++;
    }
  });

  const divisionAverages: Record<string, number> = {};
  Object.keys(divisionMap).forEach((divName) => {
    divisionAverages[divName] =
      Math.round((divisionMap[divName].sum / divisionMap[divName].count) * 100) / 100;
  });
  
  const monthlyTrend = Object.keys(monthlyMap).map(m => ({
    month: Number(m),
    averageScore: Math.round((monthlyMap[Number(m)].sum / monthlyMap[Number(m)].count) * 100) / 100
  })).sort((a, b) => a.month - b.month);

  // 4. Nested Performers
  const sortedSubmissions = [...submissions].sort((a, b) => getScore(b) - getScore(a));
  
  // All Top/Bottom
  const allTop = sortedSubmissions.slice(0, 5);
  const allBottom = sortedSubmissions
    .filter((s) => getScore(s) < companyKpiTarget || getGrade(s) === 'C' || getGrade(s) === 'D')
    .reverse()
    .slice(0, 5);

  // By Division
  const topByDiv: Record<string, KPISubmission[]> = {};
  const bottomByDiv: Record<string, KPISubmission[]> = {};
  
  // By Position
  const topByPos: Record<string, KPISubmission[]> = {};
  const bottomByPos: Record<string, KPISubmission[]> = {};
  
  divisions.forEach(div => {
    const divSubs = sortedSubmissions.filter(s => s.divisionName === div.name);
    topByDiv[div.name] = divSubs.slice(0, 3);
    bottomByDiv[div.name] = divSubs
      .filter((s) => getScore(s) < companyKpiTarget || getGrade(s) === 'C' || getGrade(s) === 'D')
      .reverse()
      .slice(0, 3);
  });
  
  positions.forEach(pos => {
    const posSubs = sortedSubmissions.filter(s => s.positionId === pos.id);
    topByPos[pos.id] = posSubs.slice(0, 3);
    bottomByPos[pos.id] = posSubs
      .filter((s) => getScore(s) < companyKpiTarget || getGrade(s) === 'C' || getGrade(s) === 'D')
      .reverse()
      .slice(0, 3);
  });

  const topPerformers = { all: allTop, byDivision: topByDiv, byPosition: topByPos };
  const bottomPerformers = { all: allBottom, byDivision: bottomByDiv, byPosition: bottomByPos };

  // 6. Bottleneck Indicators (Lowest scoring indicators)
  const indicatorMap: Record<string, { sum: number; count: number; divisionName: string }> = {};
  submissions.forEach((sub) => {
    const resolvedIndicators = resolveSubmissionIndicators(sub, templateMap);
    resolvedIndicators.forEach((item) => {
      if (item.effectiveScore === null) return;
      if (!indicatorMap[item.title]) {
        indicatorMap[item.title] = { sum: 0, count: 0, divisionName: sub.divisionName };
      }
      indicatorMap[item.title].sum += item.effectiveScore;
      indicatorMap[item.title].count++;
    });
  });

  const bottlenecks: BottleneckIndicator[] = Object.keys(indicatorMap)
    .map((title) => ({
      indicatorTitle: title,
      averageScore: round2(indicatorMap[title].sum / indicatorMap[title].count),
      divisionName: indicatorMap[title].divisionName,
      affectedCount: indicatorMap[title].count,
    }))
    .sort((a, b) => a.averageScore - b.averageScore)
    .slice(0, 5);

  // 7. Division Completion Rates (No longer using guessed denominators)
  const divisionCompletions: DivisionCompletion[] = divisions.map((div) => {
    const divSubmissions = submissions.filter((s) => s.divisionName === div.name);
    const completedCount = divSubmissions.length;
    const uniqueEmployees = new Set(divSubmissions.map(s => s.employeeName)).size;

    return {
      divisionName: div.name,
      completedCount,
      totalEmployees: uniqueEmployees, // Repurposed: Total unique participants in this division
      percentage: 100, // Deprecated, percentage is not applicable for dynamic employee counts
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
    monthlyTrend,
    companyKpiTarget
  };
}
