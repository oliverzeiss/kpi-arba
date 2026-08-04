export interface Indicator {
  id: string;
  title: string;
  description: string; // Penjelasan
  measurementMethod: string; // Cara Ukur & Bukti (e.g., "Kehadiran %")
  weight: number; // e.g. 25 (%)
  maxTarget: number; // Default 100
  category?: string; // e.g. "Core Values", "Target Individu", "Kehadiran"
}

export interface Division {
  id: string;
  name: string;
}

export interface Position {
  id: string;
  divisionId: string;
  title: string;
}

export interface KPITemplate {
  id: string;
  positionId: string;
  positionTitle: string;
  divisionName: string;
  evaluationCycle: 'Bulanan' | 'Triwulanan' | 'Tahunan';
  activePeriod: string; // e.g. "Juli 2026"
  activeYear: number; // e.g. 2026
  activeMonth: number; // e.g. 7
  activeQuarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  indicators: Indicator[];
  updatedAt: string;
}

export interface KPISubmission {
  id: string;
  employeeName: string; // Mandatory Employee Name
  positionId: string;
  positionTitle: string;
  divisionName: string;
  period: string; // e.g. "Juli 2026"
  year: number; // e.g. 2026
  month: number; // 7
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  scores: Record<string, number>; // indicatorId -> score (0-100) (Self-assessment)
  totalScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  gradeDescription: string;
  achievementNotes?: string; // Catatan Pencapaian (Opsional)
  createdAt: string;

  // Supervisor Assessment Fields
  supervisorScores?: Record<string, number>;
  supervisorTotalScore?: number;
  supervisorGrade?: string;
  supervisorGradeDescription?: string;

  // Final Score Fields
  finalTotalScore?: number;
  finalGrade?: string;
  finalGradeDescription?: string;

  // Review & Workflow Status
  status?: 'submitted' | 'reviewed' | 'approved';
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approvedAt?: string;
}

export interface GradeResult {
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  description: 'Sangat Memuaskan' | 'Memuaskan' | 'Baik' | 'Cukup' | 'Kurang';
  color: string;
}

export interface QuarterlySummary {
  employeeName: string;
  positionTitle: string;
  divisionName: string;
  quarter: string; // e.g. "Q3 2026"
  year: number;
  month1Score?: number; // e.g. Juli
  month2Score?: number; // e.g. Agustus
  month3Score?: number; // e.g. September
  averageScore: number;
  quarterlyGrade: 'A+' | 'A' | 'B' | 'C' | 'D';
  quarterlyDescription: string;
}

export interface BottleneckIndicator {
  indicatorTitle: string;
  averageScore: number;
  divisionName: string;
  affectedCount: number;
}

export interface DivisionCompletion {
  divisionName: string;
  completedCount: number;
  totalEmployees: number;
  percentage: number;
}

export interface ExecutiveReportData {
  totalSubmissions: number;
  averageCompanyScore: number;
  topPerformers: KPISubmission[];
  bottomPerformers: KPISubmission[];
  bottlenecks: BottleneckIndicator[];
  divisionCompletions: DivisionCompletion[];
  gradeCounts: Record<string, number>;
  divisionAverages: Record<string, number>;
}

