import { NextResponse } from 'next/server';
import { fetchAppSettingsService, updateAppSettingsService } from '@/lib/supabase-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await fetchAppSettingsService();
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (typeof body.companyKpiTarget !== 'number') {
      return NextResponse.json({ error: 'Invalid target value' }, { status: 400 });
    }
    
    await updateAppSettingsService(body.companyKpiTarget);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
