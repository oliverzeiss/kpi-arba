import { NextResponse } from 'next/server';
import {
  fetchDivisionsService,
  fetchPositionsService,
  fetchTemplateService,
  fetchAllTemplatesService,
  saveTemplateService,
  addDivisionService,
  editDivisionService,
  deleteDivisionService,
  addPositionService,
  editPositionService,
  deletePositionService,
} from '@/lib/supabase-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const positionId = searchParams.get('positionId');
  const includeAll = searchParams.get('all') === 'true';

  try {
    if (positionId) {
      const template = await fetchTemplateService(positionId);
      // Return a blank template object if not found (or null), matching frontend behavior
      return NextResponse.json(template || null);
    }

    if (includeAll) {
      const [divisions, positions, templates] = await Promise.all([
        fetchDivisionsService(),
        fetchPositionsService(),
        fetchAllTemplatesService(),
      ]);
      return NextResponse.json({ divisions, positions, templates });
    }

    const divisions = await fetchDivisionsService();
    const positions = await fetchPositionsService();

    return NextResponse.json({ divisions, positions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, passcode, data } = body;
    const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || '849235';

    if (passcode !== ADMIN_PASSCODE) {
      return NextResponse.json({ error: 'Passcode 6-Digit Admin Salah!' }, { status: 401 });
    }

    switch (action) {
      case 'VERIFY_PASSCODE':
        return NextResponse.json({ success: true });

      case 'SAVE_TEMPLATE':
        await saveTemplateService(data);
        return NextResponse.json({ success: true });

      case 'ADD_DIVISION': {
        await addDivisionService(data.name);
        const divisions = await fetchDivisionsService();
        return NextResponse.json({ divisions });
      }

      case 'EDIT_DIVISION': {
        await editDivisionService(data.id, data.name);
        const divisions = await fetchDivisionsService();
        return NextResponse.json({ divisions });
      }

      case 'DELETE_DIVISION': {
        await deleteDivisionService(data.id);
        const divisions = await fetchDivisionsService();
        const positions = await fetchPositionsService();
        return NextResponse.json({ divisions, positions });
      }

      case 'ADD_POSITION': {
        const position = await addPositionService(data.title, data.divisionId);
        const positions = await fetchPositionsService();
        return NextResponse.json({ positions, position });
      }

      case 'EDIT_POSITION': {
        await editPositionService(data.id, data.title, data.divisionId);
        const positions = await fetchPositionsService();
        return NextResponse.json({ positions });
      }

      case 'DELETE_POSITION': {
        await deletePositionService(data.id);
        const positions = await fetchPositionsService();
        return NextResponse.json({ positions });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
