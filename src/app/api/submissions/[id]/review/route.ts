import { NextResponse } from 'next/server';
import { updateSubmissionReviewService, fetchSubmissionsService, fetchTemplateService } from '@/lib/supabase-service';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { supervisorScores, reviewerNotes, status, reviewerName } = body;

    if (!supervisorScores || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const subs = await fetchSubmissionsService();
    const sub = subs.find(s => s.id === params.id);
    if (!sub) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const template = await fetchTemplateService(sub.positionId);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    await updateSubmissionReviewService(
      params.id,
      supervisorScores,
      template.indicators,
      reviewerNotes || '',
      status as 'reviewed' | 'approved',
      reviewerName
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
