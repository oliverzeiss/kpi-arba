import { supabase, isSupabaseConfigured } from './supabase-client';
import {
  INITIAL_DIVISIONS,
  INITIAL_POSITIONS,
  INITIAL_TEMPLATES,
  INITIAL_SUBMISSIONS,
} from './storage';
import { Division, Position, KPITemplate, KPISubmission } from '@/types/kpi';
import { calculateTotalScore, calculateGrade } from './kpi-calculator';

// In-memory fallback stores
let inMemoryDivisions: Division[] = [...INITIAL_DIVISIONS];
let inMemoryPositions: Position[] = [...INITIAL_POSITIONS];
let inMemoryTemplates: Record<string, KPITemplate> = { ...INITIAL_TEMPLATES };
let inMemorySubmissions: KPISubmission[] = [...INITIAL_SUBMISSIONS];

// ============================================================================
// DIVISIONS & POSITIONS CRUD
// ============================================================================

export async function fetchDivisionsService(): Promise<Division[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('divisions')
        .select('*')
        .order('name', { ascending: true });
      if (!error && data) {
        return data as Division[];
      }
    } catch (e) {
      console.warn('[SupabaseService] fetchDivisions error, fallback to memory:', e);
    }
  }
  return inMemoryDivisions;
}

export async function addDivisionService(name: string): Promise<Division> {
  const newDiv: Division = {
    id: `div-${Date.now()}`,
    name,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('divisions')
        .insert([{ id: newDiv.id, name: newDiv.name }])
        .select()
        .single();
      if (!error && data) {
        return data as Division;
      }
    } catch (e) {
      console.warn('[SupabaseService] addDivision error:', e);
    }
  }

  inMemoryDivisions.push(newDiv);
  return newDiv;
}

export async function editDivisionService(id: string, name: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('divisions').update({ name }).eq('id', id);
      return;
    } catch (e) {
      console.warn('[SupabaseService] editDivision error:', e);
    }
  }
  inMemoryDivisions = inMemoryDivisions.map((d) => (d.id === id ? { ...d, name } : d));
}

export async function deleteDivisionService(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('divisions').delete().eq('id', id);
      return;
    } catch (e) {
      console.warn('[SupabaseService] deleteDivision error:', e);
    }
  }
  inMemoryDivisions = inMemoryDivisions.filter((d) => d.id !== id);
  inMemoryPositions = inMemoryPositions.filter((p) => p.divisionId !== id);
}

export async function fetchPositionsService(): Promise<Position[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('positions').select('*');
      if (!error && data) {
        return data.map((p: any) => ({
          id: p.id,
          divisionId: p.division_id,
          title: p.title,
        }));
      }
    } catch (e) {
      console.warn('[SupabaseService] fetchPositions error:', e);
    }
  }
  return inMemoryPositions;
}

export async function addPositionService(title: string, divisionId: string): Promise<Position> {
  const newPos: Position = {
    id: `pos-${Date.now()}`,
    divisionId,
    title,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('positions')
        .insert([{ id: newPos.id, division_id: divisionId, title }])
        .select()
        .single();
      if (!error && data) {
        return { id: data.id, divisionId: data.division_id, title: data.title };
      }
    } catch (e) {
      console.warn('[SupabaseService] addPosition error:', e);
    }
  }

  inMemoryPositions.push(newPos);
  return newPos;
}

export async function editPositionService(id: string, title: string, divisionId: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('positions').update({ title, division_id: divisionId }).eq('id', id);
      return;
    } catch (e) {
      console.warn('[SupabaseService] editPosition error:', e);
    }
  }
  inMemoryPositions = inMemoryPositions.map((p) =>
    p.id === id ? { ...p, title, divisionId } : p
  );
}

export async function deletePositionService(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('positions').delete().eq('id', id);
      return;
    } catch (e) {
      console.warn('[SupabaseService] deletePosition error:', e);
    }
  }
  inMemoryPositions = inMemoryPositions.filter((p) => p.id !== id);
}

// ============================================================================
// TEMPLATES CRUD
// ============================================================================

export async function fetchTemplateService(positionId: string): Promise<KPITemplate | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('kpi_templates')
        .select('*')
        .eq('position_id', positionId)
        .single();

      if (!error && data) {
        return {
          id: data.id,
          positionId: data.position_id,
          positionTitle: data.position_title,
          divisionName: data.division_name,
          evaluationCycle: data.evaluation_cycle,
          activePeriod: data.active_period,
          activeYear: data.active_year,
          activeMonth: data.active_month,
          activeQuarter: data.active_quarter,
          indicators: data.indicators_json,
          updatedAt: data.updated_at,
        };
      }
    } catch (e) {
      console.warn('[SupabaseService] fetchTemplate error:', e);
    }
  }

  return inMemoryTemplates[positionId] || null;
}

export async function saveTemplateService(template: KPITemplate): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const row = {
        id: template.id,
        position_id: template.positionId,
        position_title: template.positionTitle,
        division_name: template.divisionName,
        evaluation_cycle: template.evaluationCycle,
        active_period: template.activePeriod,
        active_year: template.activeYear,
        active_month: template.activeMonth,
        active_quarter: template.activeQuarter,
        indicators_json: template.indicators,
        updated_at: new Date().toISOString(),
      };

      await supabase.from('kpi_templates').upsert(row);
      return;
    } catch (e) {
      console.warn('[SupabaseService] saveTemplate error:', e);
    }
  }

  inMemoryTemplates[template.positionId] = template;
}

export async function fetchAllTemplatesService(): Promise<KPITemplate[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('kpi_templates').select('*');
      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          positionId: d.position_id,
          positionTitle: d.position_title,
          divisionName: d.division_name,
          evaluationCycle: d.evaluation_cycle,
          activePeriod: d.active_period,
          activeYear: d.active_year,
          activeMonth: d.active_month,
          activeQuarter: d.active_quarter,
          indicators: d.indicators_json,
          updatedAt: d.updated_at,
        }));
      }
    } catch (e) {
      console.warn('[SupabaseService] fetchAllTemplates error:', e);
    }
  }
  return Object.values(inMemoryTemplates);
}

// ============================================================================
// SUBMISSIONS CRUD (DUAL-ASSESSMENT & STATUS WORKFLOW)
// ============================================================================

export async function fetchSubmissionsService(filters?: {
  month?: number;
  year?: number;
  divisionName?: string;
  positionId?: string;
  status?: string;
  employeeName?: string;
}): Promise<KPISubmission[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('kpi_submissions').select('*').order('created_at', { ascending: false });

      if (filters?.month) query = query.eq('month', filters.month);
      if (filters?.year) query = query.eq('year', filters.year);
      if (filters?.divisionName) query = query.eq('division_name', filters.divisionName);
      if (filters?.positionId) query = query.eq('position_id', filters.positionId);
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.employeeName) query = query.ilike('employee_name', `%${filters.employeeName}%`);

      const { data, error } = await query;
      if (!error && data) {
        return data.map((s: any) => ({
          id: s.id,
          employeeName: s.employee_name,
          positionId: s.position_id,
          positionTitle: s.position_title,
          divisionName: s.division_name,
          period: s.period,
          year: s.year,
          month: s.month,
          quarter: s.quarter,
          scores: s.self_scores_json || s.scores_json || {},
          totalScore: Number(s.self_total_score || s.total_score || 0),
          grade: s.self_grade || s.grade,
          gradeDescription: s.self_grade_description || s.grade_description,
          supervisorScores: s.supervisor_scores_json,
          supervisorTotalScore: s.supervisor_total_score ? Number(s.supervisor_total_score) : undefined,
          supervisorGrade: s.supervisor_grade,
          supervisorGradeDescription: s.supervisor_grade_description,
          finalTotalScore: s.final_total_score ? Number(s.final_total_score) : undefined,
          finalGrade: s.final_grade,
          finalGradeDescription: s.final_grade_description,
          status: s.status || 'submitted',
          reviewerNotes: s.reviewer_notes,
          reviewedBy: s.reviewed_by,
          reviewedAt: s.reviewed_at,
          approvedAt: s.approved_at,
          achievementNotes: s.achievement_notes,
          createdAt: s.created_at,
        }));
      }
    } catch (e) {
      console.warn('[SupabaseService] fetchSubmissions error:', e);
    }
  }

  // Filter in-memory submissions
  let result = [...inMemorySubmissions];
  if (filters?.month) result = result.filter((s) => s.month === filters.month);
  if (filters?.year) result = result.filter((s) => s.year === filters.year);
  if (filters?.divisionName) result = result.filter((s) => s.divisionName === filters.divisionName);
  if (filters?.positionId) result = result.filter((s) => s.positionId === filters.positionId);
  if (filters?.status) result = result.filter((s) => (s.status || 'submitted') === filters.status);
  if (filters?.employeeName) result = result.filter((s) => s.employeeName.toLowerCase().includes(filters.employeeName!.toLowerCase()));

  return result;
}

export async function createSubmissionService(
  employeeName: string,
  template: KPITemplate,
  scores: Record<string, number>,
  achievementNotes?: string
): Promise<KPISubmission> {
  const selfTotal = calculateTotalScore(scores, template.indicators);
  const selfGrade = calculateGrade(selfTotal);

  const newSub: KPISubmission = {
    id: `sub-${Date.now()}`,
    employeeName: employeeName.trim(),
    positionId: template.positionId,
    positionTitle: template.positionTitle,
    divisionName: template.divisionName,
    period: template.activePeriod || 'Juli 2026',
    year: template.activeYear || 2026,
    month: template.activeMonth || 7,
    quarter: template.activeQuarter || 'Q3',
    scores,
    totalScore: selfTotal,
    grade: selfGrade.grade,
    gradeDescription: selfGrade.description,
    status: 'submitted',
    achievementNotes: achievementNotes || '',
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const row = {
        id: newSub.id,
        employee_name: newSub.employeeName,
        position_id: newSub.positionId,
        position_title: newSub.positionTitle,
        division_name: newSub.divisionName,
        period: newSub.period,
        year: newSub.year,
        month: newSub.month,
        quarter: newSub.quarter,
        self_scores_json: scores,
        self_total_score: selfTotal,
        self_grade: selfGrade.grade,
        self_grade_description: selfGrade.description,
        status: 'submitted',
        achievement_notes: achievementNotes || '',
      };

      const { error } = await supabase.from('kpi_submissions').insert([row]);
      if (error) {
        if (error.code === '23505') {
          throw new Error(`Karyawan "${employeeName}" sudah mengirim penilaian untuk periode ${newSub.period}!`);
        }
        throw new Error(error.message);
      }
      return newSub;
    } catch (e: any) {
      console.warn('[SupabaseService] createSubmission error:', e);
      if (e.message && e.message.includes('sudah mengirim')) throw e;
    }
  }

  // Prevent duplicate in-memory
  const dupIndex = inMemorySubmissions.findIndex(
    (s) =>
      s.employeeName === employeeName.trim() &&
      s.positionId === template.positionId &&
      s.period === newSub.period
  );
  if (dupIndex >= 0) {
    throw new Error(`Karyawan "${employeeName}" sudah mengirim penilaian untuk periode ${newSub.period}!`);
  }

  inMemorySubmissions.push(newSub);
  return newSub;
}

export async function updateSubmissionReviewService(
  submissionId: string,
  supervisorScores: Record<string, number>,
  indicators: any[],
  reviewerNotes: string,
  status: 'reviewed' | 'approved',
  reviewerName?: string
) {
  const supTotal = calculateTotalScore(supervisorScores, indicators);
  const supGrade = calculateGrade(supTotal);

  if (isSupabaseConfigured && supabase) {
    try {
      const updates: any = {
        supervisor_scores_json: supervisorScores,
        supervisor_total_score: supTotal,
        supervisor_grade: supGrade.grade,
        supervisor_grade_description: supGrade.description,
        reviewer_notes: reviewerNotes,
        status,
        reviewed_at: new Date().toISOString(),
        ...(reviewerName && { reviewed_by: reviewerName }),
      };

      if (status === 'approved') {
        updates.final_total_score = supTotal;
        updates.final_grade = supGrade.grade;
        updates.final_grade_description = supGrade.description;
        updates.approved_at = new Date().toISOString();
      }

      await supabase.from('kpi_submissions').update(updates).eq('id', submissionId);
      return;
    } catch (e) {
      console.warn('[SupabaseService] updateSubmissionReview error:', e);
    }
  }

  // In-memory update
  inMemorySubmissions = inMemorySubmissions.map((sub) => {
    if (sub.id === submissionId) {
      const updated = {
        ...sub,
        supervisorScores,
        supervisorTotalScore: supTotal,
        supervisorGrade: supGrade.grade,
        supervisorGradeDescription: supGrade.description,
        reviewerNotes,
        status,
        reviewedAt: new Date().toISOString(),
        ...(reviewerName && { reviewedBy: reviewerName }),
      };
      if (status === 'approved') {
        updated.finalTotalScore = supTotal;
        updated.finalGrade = supGrade.grade;
        updated.finalGradeDescription = supGrade.description;
        updated.approvedAt = new Date().toISOString();
      }
      return updated;
    }
    return sub;
  });
}

// ============================================================================
// APP SETTINGS CRUD
// ============================================================================
import { AppSettings } from '@/types/kpi';

let inMemorySettings: AppSettings = {
  id: 'default',
  companyKpiTarget: 75,
  updatedAt: new Date().toISOString(),
};

export async function fetchAppSettingsService(): Promise<AppSettings> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('id', 'default')
        .single();
      if (!error && data) {
        return {
          id: data.id,
          companyKpiTarget: Number(data.company_kpi_target),
          updatedAt: data.updated_at,
        };
      }
    } catch (e) {
      console.warn('[SupabaseService] fetchAppSettings error:', e);
    }
  }
  return inMemorySettings;
}

export async function updateAppSettingsService(target: number): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('app_settings').upsert({
        id: 'default',
        company_kpi_target: target,
        updated_at: new Date().toISOString(),
      });
      return;
    } catch (e) {
      console.warn('[SupabaseService] updateAppSettings error:', e);
    }
  }
  inMemorySettings.companyKpiTarget = target;
  inMemorySettings.updatedAt = new Date().toISOString();
}
