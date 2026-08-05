import { NextResponse } from 'next/server';
import { fetchDivisionsService, addDivisionService } from '@/lib/supabase-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await fetchDivisionsService();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const data = await addDivisionService(body.name);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
