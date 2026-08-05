import { NextResponse } from 'next/server';
import { fetchSubmissionsService, fetchDivisionsService, fetchPositionsService, fetchAllTemplatesService, fetchAppSettingsService } from '@/lib/supabase-service';
import { generateExecutiveReport } from '@/lib/reporting-analyzer';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined;
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;
    const divisionName = searchParams.get('divisionName') || undefined;
    const positionId = searchParams.get('positionId') || undefined;
    const employeeName = searchParams.get('employeeName') || undefined;

    const [submissions, divisions, positions, templates, appSettings] = await Promise.all([
      fetchSubmissionsService({ month, year, divisionName, positionId, employeeName }),
      fetchDivisionsService(),
      fetchPositionsService(),
      fetchAllTemplatesService(),
      fetchAppSettingsService()
    ]);

    const report = generateExecutiveReport(submissions, divisions, positions, templates, appSettings.companyKpiTarget);

    return NextResponse.json(report);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
