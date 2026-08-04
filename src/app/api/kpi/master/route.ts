import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_DIVISIONS, INITIAL_POSITIONS, INITIAL_TEMPLATES } from '@/lib/storage';
import { Division, Position, KPITemplate } from '@/types/kpi';

export const dynamic = 'force-dynamic';

// Global in-memory cache for dev server lifetime
let divisionsStore: Division[] = [...INITIAL_DIVISIONS];
let positionsStore: Position[] = [...INITIAL_POSITIONS];
let templatesStore: Record<string, KPITemplate> = { ...INITIAL_TEMPLATES };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const positionId = searchParams.get('positionId');

  if (positionId) {
    const template = templatesStore[positionId];
    if (!template) {
      const pos = positionsStore.find((p) => p.id === positionId);
      const div = pos ? divisionsStore.find((d) => d.id === pos.divisionId) : null;
      
      // Return a default template skeleton if none exists yet
      return NextResponse.json({
        id: `tpl-${positionId}`,
        positionId,
        positionTitle: pos ? pos.title : 'Jabatan Baru',
        divisionName: div ? div.name : 'Divisi Utama',
        evaluationCycle: 'Bulanan',
        activePeriod: 'Juli 2026',
        activeYear: 2026,
        activeMonth: 7,
        activeQuarter: 'Q3',
        indicators: [
          {
            id: `ind-${Date.now()}-1`,
            title: 'Indikator Kinerja Utama 1',
            description: 'Deskripsi dan kriteria pengukuran indikator 1',
            measurementMethod: 'Capaian Target %',
            weight: 50,
            maxTarget: 100,
            category: 'Target Utama',
          },
          {
            id: `ind-${Date.now()}-2`,
            title: 'Indikator Kinerja Utama 2',
            description: 'Deskripsi dan kriteria pengukuran indikator 2',
            measurementMethod: 'Capaian Target %',
            weight: 50,
            maxTarget: 100,
            category: 'Target Utama',
          },
        ],
        updatedAt: new Date().toISOString(),
      });
    }
    return NextResponse.json(template);
  }

  return NextResponse.json({
    divisions: divisionsStore,
    positions: positionsStore,
    templates: templatesStore,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, passcode, data } = body;

    // Check 6-digit passcode for admin mutations
    const expectedPasscode = process.env.ADMIN_PASSCODE || '123456';
    if (passcode !== expectedPasscode) {
      return NextResponse.json(
        { error: 'Passcode 6-Digit Admin Salah!' },
        { status: 401 }
      );
    }

    if (action === 'VERIFY_PASSCODE') {
      return NextResponse.json({ success: true, message: 'Passcode Valid' });
    }

    if (action === 'ADD_DIVISION') {
      const newDiv: Division = {
        id: `div-${Date.now()}`,
        name: data.name,
      };
      divisionsStore.push(newDiv);
      return NextResponse.json({ success: true, division: newDiv, divisions: divisionsStore });
    }

    if (action === 'EDIT_DIVISION') {
      divisionsStore = divisionsStore.map((d) =>
        d.id === data.id ? { ...d, name: data.name } : d
      );
      return NextResponse.json({ success: true, divisions: divisionsStore });
    }

    if (action === 'DELETE_DIVISION') {
      // Cascade delete positions belonging to this division
      const divPositions = positionsStore.filter((p) => p.divisionId === data.id);
      divPositions.forEach((p) => {
        delete templatesStore[p.id];
      });
      positionsStore = positionsStore.filter((p) => p.divisionId !== data.id);
      divisionsStore = divisionsStore.filter((d) => d.id !== data.id);

      return NextResponse.json({
        success: true,
        divisions: divisionsStore,
        positions: positionsStore,
      });
    }

    if (action === 'ADD_POSITION') {
      const newPos: Position = {
        id: `pos-${Date.now()}`,
        divisionId: data.divisionId,
        title: data.title,
      };
      positionsStore.push(newPos);
      return NextResponse.json({ success: true, position: newPos, positions: positionsStore });
    }

    if (action === 'EDIT_POSITION') {
      positionsStore = positionsStore.map((p) =>
        p.id === data.id ? { ...p, title: data.title, divisionId: data.divisionId || p.divisionId } : p
      );
      if (templatesStore[data.id]) {
        templatesStore[data.id].positionTitle = data.title;
      }
      return NextResponse.json({ success: true, positions: positionsStore });
    }

    if (action === 'DELETE_POSITION') {
      positionsStore = positionsStore.filter((p) => p.id !== data.id);
      delete templatesStore[data.id];
      return NextResponse.json({ success: true, positions: positionsStore });
    }

    if (action === 'SAVE_TEMPLATE') {
      const templateData: KPITemplate = data;
      templateData.updatedAt = new Date().toISOString();
      templatesStore[templateData.positionId] = templateData;
      return NextResponse.json({ success: true, template: templateData });
    }

    return NextResponse.json({ error: 'Aksi tidak dikenali' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

