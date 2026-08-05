import { NextResponse } from 'next/server';
import { fetchSubmissionsService } from '@/lib/supabase-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined;
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;
    const divisionName = searchParams.get('divisionName') || undefined;
    const positionId = searchParams.get('positionId') || undefined;
    const status = searchParams.get('status') || undefined;
    const employeeName = searchParams.get('employeeName') || undefined;

    const data = await fetchSubmissionsService({
      month, year, divisionName, positionId, status, employeeName
    });
    
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
