import { NextResponse } from 'next/server';
import { editPositionService, deletePositionService } from '@/lib/supabase-service';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    if (!body.title || !body.divisionId) {
      return NextResponse.json({ error: 'Title and divisionId are required' }, { status: 400 });
    }
    await editPositionService(params.id, body.title, body.divisionId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await deletePositionService(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
