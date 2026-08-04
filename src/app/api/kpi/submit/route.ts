import { NextRequest, NextResponse } from 'next/server';
import { calculateTotalScore, calculateGrade } from '@/lib/kpi-calculator';
import { submissionsStore } from '@/lib/storage';
import { syncSubmissionToGoogleSheets } from '@/lib/googleSheets';
import { KPISubmission, KPITemplate } from '@/types/kpi';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeName, template, scores, achievementNotes } = body as {
      employeeName: string;
      template: KPITemplate;
      scores: Record<string, number>;
      achievementNotes?: string;
    };


    // Validation 1: Employee Name is Mandatory
    if (!employeeName || !employeeName.trim()) {
      return NextResponse.json(
        { error: 'Nama Karyawan wajib diisi!' },
        { status: 400 }
      );
    }

    if (!template || !template.positionId) {
      return NextResponse.json(
        { error: 'Jabatan belum dipilih atau template tidak valid!' },
        { status: 400 }
      );
    }

    // Validation 2: Ensure all indicators are scored
    for (const ind of template.indicators) {
      if (scores[ind.id] === undefined || scores[ind.id] === null) {
        return NextResponse.json(
          { error: `Harap isi nilai untuk indikator "${ind.title}"` },
          { status: 400 }
        );
      }
    }

    // Pure calculation
    const totalScore = calculateTotalScore(scores, template.indicators);
    const gradeResult = calculateGrade(totalScore);

    const submission: KPISubmission = {
      id: `sub-${Date.now()}`,
      employeeName: employeeName.trim(),
      positionId: template.positionId,
      positionTitle: template.positionTitle,
      divisionName: template.divisionName,
      period: template.activePeriod || 'Juli 2026',
      year: template.activeYear || 2026,
      month: template.activeMonth || 7,
      quarter: template.activeQuarter || 'Q3',
      scores,
      totalScore,
      grade: gradeResult.grade,
      gradeDescription: gradeResult.description,
      achievementNotes: achievementNotes || '',
      createdAt: new Date().toISOString(),
    };

    submissionsStore.push(submission);

    // Auto-sync to Google Spreadsheet
    const sheetsResult = await syncSubmissionToGoogleSheets(submission, template);

    return NextResponse.json({
      success: true,
      submission,
      gradeResult,
      sheetsResult,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Gagal mengirim penilaian KPI' },
      { status: 500 }
    );
  }
}
