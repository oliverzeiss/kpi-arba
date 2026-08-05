import { NextRequest, NextResponse } from 'next/server';
import { createSubmissionService } from '@/lib/supabase-service';

import { KPITemplate } from '@/types/kpi';

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

    if (!employeeName || !employeeName.trim()) {
      return NextResponse.json({ error: 'Nama Karyawan wajib diisi!' }, { status: 400 });
    }

    if (!template || !template.positionId) {
      return NextResponse.json({ error: 'Jabatan belum dipilih atau template tidak valid!' }, { status: 400 });
    }

    for (const ind of template.indicators) {
      if (scores[ind.id] === undefined || scores[ind.id] === null) {
        return NextResponse.json({ error: `Harap isi nilai untuk indikator "${ind.title}"` }, { status: 400 });
      }
    }

    const submission = await createSubmissionService(employeeName, template, scores, achievementNotes);



    return NextResponse.json({
      success: true,
      submission,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Gagal mengirim penilaian KPI' },
      { status: 500 }
    );
  }
}
