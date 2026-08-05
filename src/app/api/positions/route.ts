import { NextResponse } from 'next/server';
import { fetchPositionsService, addPositionService } from '@/lib/supabase-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await fetchPositionsService();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.divisionId) {
      return NextResponse.json({ error: 'Title and divisionId are required' }, { status: 400 });
    }
    const data = await addPositionService(body.title, body.divisionId);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
