import { Division, Position, KPITemplate, KPISubmission } from '@/types/kpi';

// Default initial state matching screenshots
export const INITIAL_DIVISIONS: Division[] = [
  { id: 'div-1', name: 'Direksi' },
  { id: 'div-2', name: 'HRD & GA' },
  { id: 'div-3', name: 'IT' },
  { id: 'div-4', name: 'IT & Digital' },
  { id: 'div-5', name: 'Keuangan & Akuntansi' },
  { id: 'div-6', name: 'Operasional SPBU' },
];

export const INITIAL_POSITIONS: Position[] = [
  { id: 'pos-1', divisionId: 'div-1', title: 'Direktur Utama' },
  { id: 'pos-2', divisionId: 'div-2', title: 'Manager HRD' },
  { id: 'pos-3', divisionId: 'div-3', title: 'Admin IT' },
  { id: 'pos-4', divisionId: 'div-5', title: 'Manager Keuangan' },
  { id: 'pos-5', divisionId: 'div-6', title: 'Operator SPBU' },
  { id: 'pos-6', divisionId: 'div-6', title: 'Supervisor SPBU' },
];

export const INITIAL_TEMPLATES: Record<string, KPITemplate> = {
  'pos-3': {
    id: 'tpl-admin-it',
    positionId: 'pos-3',
    positionTitle: 'Admin IT',
    divisionName: 'IT',
    evaluationCycle: 'Bulanan',
    activePeriod: 'Juli 2026',
    activeYear: 2026,
    activeMonth: 7,
    activeQuarter: 'Q3',
    indicators: [
      {
        id: 'ind-1',
        title: 'Ketepatan Waktu & Kehadiran',
        description: 'Tingkat kedisiplinan absensi dan ketepatan kehadiran kerja',
        measurementMethod: 'Kehadiran %',
        weight: 25,
        maxTarget: 100,
        category: 'Kehadiran',
      },
      {
        id: 'ind-2',
        title: 'Keakuratan & Kualitas Hasil Kerja',
        description: 'Bebas dari kesalahan input data dan performa sistem yang optimal',
        measurementMethod: 'Laporan Bug & Error Rate %',
        weight: 35,
        maxTarget: 100,
        category: 'Target Individu',
      },
      {
        id: 'ind-3',
        title: 'Komunikasi & Kerjasama Tim',
        description: 'Kecepatan respon tiket bantuan IT dan komunikasi lintas divisi',
        measurementMethod: 'Rating Kepuasan Pengguna / SLA Ticket',
        weight: 20,
        maxTarget: 100,
        category: 'Core Values',
      },
      {
        id: 'ind-4',
        title: 'Inisiatif & Problem Solving',
        description: 'Proaktif memberikan solusi dan improvisasi alur kerja IT',
        measurementMethod: 'Jumlah Inovasi / Modifikasi Sistem',
        weight: 20,
        maxTarget: 100,
        category: 'Core Values',
      },
    ],
    updatedAt: new Date().toISOString(),
  },
  'pos-1': {
    id: 'tpl-direktur-utama',
    positionId: 'pos-1',
    positionTitle: 'Direktur Utama',
    divisionName: 'Direksi',
    evaluationCycle: 'Bulanan',
    activePeriod: 'Juli 2026',
    activeYear: 2026,
    activeMonth: 7,
    activeQuarter: 'Q3',
    indicators: [
      {
        id: 'ind-dir-1',
        title: 'Pencapaian Target Pendapatan Perusahaan',
        description: 'Pencapaian omzet dan profitabilitas bulanan Arba Group',
        measurementMethod: 'Laporan Keuangan Konsolidasi %',
        weight: 40,
        maxTarget: 100,
        category: 'Target Utama',
      },
      {
        id: 'ind-dir-2',
        title: 'Kepemimpinan Strategis & Ekspansi Bisnis',
        description: 'Eksekusi program strategis dan pembukaan unit bisnis baru',
        measurementMethod: 'Milestone Project Completed',
        weight: 30,
        maxTarget: 100,
        category: 'Strategis',
      },
      {
        id: 'ind-dir-3',
        title: 'Manajemen Risiko & Kepatuhan Operational',
        description: 'Memastikan seluruh prosedur compliance dan audit internal berjalan',
        measurementMethod: 'Hasil Audit Compliance',
        weight: 30,
        maxTarget: 100,
        category: 'Tata Kelola',
      },
    ],
    updatedAt: new Date().toISOString(),
  },
};

// Initial mock past submission for July 2026 (for showing Month-over-Month history in August)
export const INITIAL_SUBMISSIONS: KPISubmission[] = [
  {
    id: 'sub-past-1',
    employeeName: 'Budi Santoso',
    positionId: 'pos-3',
    positionTitle: 'Admin IT',
    divisionName: 'IT',
    period: 'Juli 2026',
    year: 2026,
    month: 7,
    quarter: 'Q3',
    scores: {
      'ind-1': 80,
      'ind-2': 80,
      'ind-3': 85,
      'ind-4': 85,
    },
    totalScore: 82,
    grade: 'B',
    gradeDescription: 'Baik',
    createdAt: '2026-07-28T10:00:00.000Z',
  },
];

// Submissions in-memory store
export const submissionsStore: KPISubmission[] = [...INITIAL_SUBMISSIONS];

