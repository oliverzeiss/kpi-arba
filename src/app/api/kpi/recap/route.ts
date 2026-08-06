import { NextRequest, NextResponse } from 'next/server';
import { fetchSubmissionsService } from '@/lib/supabase-service';
import { calculateQuarterlyAverage, calculateGrade } from '@/lib/kpi-calculator';
import { QuarterlySummary } from '@/types/kpi';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeName = searchParams.get('employeeName');
    const positionId = searchParams.get('positionId');
    const type = searchParams.get('type');
    const quarterFilter = searchParams.get('quarter');
    const yearFilter = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;
    const divisionNameFilter = searchParams.get('divisionName');

    const filters: any = {};
    if (positionId) filters.positionId = positionId;
    if (yearFilter) filters.year = yearFilter;
    if (divisionNameFilter) filters.divisionName = divisionNameFilter;
    
    const allSubmissions = await fetchSubmissionsService(filters);

    if (type === 'previous_month' && positionId) {
      const matched = allSubmissions
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const previousSubmission = matched.length > 0 ? matched[0] : null;
      return NextResponse.json({
        previousScore: previousSubmission ? previousSubmission.totalScore : 75,
        previousSubmission,
      });
    }

    if (type === 'quarterly_recap') {
      const recapMap: Record<string, QuarterlySummary> = {};

      for (const sub of allSubmissions) {
        const actualQuarter = `Q${Math.ceil(sub.month / 3)}`;
        if (quarterFilter && actualQuarter !== quarterFilter) continue;
        if (employeeName && !sub.employeeName.toLowerCase().includes(employeeName.toLowerCase())) continue;

        const key = `${sub.employeeName}_${sub.positionId}_${actualQuarter}_${sub.year}`;
        
        if (!recapMap[key]) {
          recapMap[key] = {
            employeeName: sub.employeeName.toUpperCase(),
            positionTitle: sub.positionTitle,
            divisionName: sub.divisionName,
            quarter: `${actualQuarter} ${sub.year}`,
            year: sub.year,
            month1Score: undefined,
            month2Score: undefined,
            month3Score: undefined,
            averageScore: 0,
            quarterlyGrade: 'D',
            quarterlyDescription: 'Kurang',
          };
        }

        const monthInQuarter = ((sub.month - 1) % 3) + 1;
        const scoreToUse = sub.finalTotalScore ?? (sub.supervisorTotalScore ?? sub.totalScore);

        if (monthInQuarter === 1 && recapMap[key].month1Score === undefined) recapMap[key].month1Score = scoreToUse;
        if (monthInQuarter === 2 && recapMap[key].month2Score === undefined) recapMap[key].month2Score = scoreToUse;
        if (monthInQuarter === 3 && recapMap[key].month3Score === undefined) recapMap[key].month3Score = scoreToUse;

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
        totalSubmissions: allSubmissions.length,
      });
    }

    return NextResponse.json({
      submissions: allSubmissions,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
