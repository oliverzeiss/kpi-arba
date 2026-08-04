import { NextRequest, NextResponse } from 'next/server';
import { submissionsStore } from '@/lib/storage';
import { calculateQuarterlyAverage, calculateGrade } from '@/lib/kpi-calculator';
import { QuarterlySummary } from '@/types/kpi';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const employeeName = searchParams.get('employeeName');
  const positionId = searchParams.get('positionId');
  const period = searchParams.get('period');
  const type = searchParams.get('type'); // 'previous_month' | 'quarterly_recap' | 'all'

  // Get previous month score for a specific employee & position
  if (type === 'previous_month' && positionId) {
    const matched = submissionsStore
      .filter((s) => s.positionId === positionId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const previousSubmission = matched.length > 0 ? matched[0] : null;
    return NextResponse.json({
      previousScore: previousSubmission ? previousSubmission.totalScore : 75,
      previousSubmission,
    });
  }

  // Generate Quarterly Summary (Q1-Q4)
  if (type === 'quarterly_recap') {
    const recapMap: Record<string, QuarterlySummary> = {};

    for (const sub of submissionsStore) {
      const key = `${sub.employeeName}_${sub.positionId}_${sub.quarter}_${sub.year}`;
      
      if (!recapMap[key]) {
        recapMap[key] = {
          employeeName: sub.employeeName,
          positionTitle: sub.positionTitle,
          divisionName: sub.divisionName,
          quarter: `${sub.quarter} ${sub.year}`,
          year: sub.year,
          month1Score: undefined,
          month2Score: undefined,
          month3Score: undefined,
          averageScore: 0,
          quarterlyGrade: 'D',
          quarterlyDescription: 'Kurang',
        };
      }

      // Map scores based on month index in quarter
      // Q3 -> July (7), August (8), September (9)
      const monthInQuarter = ((sub.month - 1) % 3) + 1;
      if (monthInQuarter === 1) recapMap[key].month1Score = sub.totalScore;
      if (monthInQuarter === 2) recapMap[key].month2Score = sub.totalScore;
      if (monthInQuarter === 3) recapMap[key].month3Score = sub.totalScore;

      const availableScores: number[] = [];
      if (recapMap[key].month1Score !== undefined) availableScores.push(recapMap[key].month1Score!);
      if (recapMap[key].month2Score !== undefined) availableScores.push(recapMap[key].month2Score!);
      if (recapMap[key].month3Score !== undefined) availableScores.push(recapMap[key].month3Score!);

      const avg = calculateQuarterlyAverage(availableScores);
      const gradeRes = calculateGrade(avg);

      recapMap[key].averageScore = avg;
      recapMap[key].quarterlyGrade = gradeRes.grade;
      recapMap[key].quarterlyDescription = gradeRes.description;
    }

    return NextResponse.json({
      summaries: Object.values(recapMap),
      totalSubmissions: submissionsStore.length,
    });
  }

  return NextResponse.json({
    submissions: submissionsStore,
  });
}
