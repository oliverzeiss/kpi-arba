import { NextResponse } from 'next/server';
import { fetchSubmissionsService } from '@/lib/supabase-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const submissions = await fetchSubmissionsService();
    const uniqueNames = Array.from(new Set(submissions.map(s => s.employeeName))).sort();
    
    return NextResponse.json(uniqueNames);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
