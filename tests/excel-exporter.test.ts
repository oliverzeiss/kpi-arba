import test from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import type { ExecutiveReportData, KPISubmission, KPITemplate, QuarterlySummary } from '@/types/kpi';
import { buildExcelWorkbook, sanitizeSpreadsheetText } from '@/lib/excel-workbook';

const templates: KPITemplate[] = [
  {
    id: 'tpl-cs',
    positionId: 'pos-cs',
    positionTitle: 'Cleaning Service',
    divisionName: 'Operasional SPBU',
    evaluationCycle: 'Bulanan',
    activePeriod: 'Oktober 2026',
    activeYear: 2026,
    activeMonth: 10,
    activeQuarter: 'Q4',
    updatedAt: '2026-10-01T00:00:00.000Z',
    indicators: [
      {
        id: 'ind-1',
        title: 'Kebersihan Area SPBU',
        description: 'Bersih',
        measurementMethod: 'Inspeksi',
        weight: 20,
        maxTarget: 100,
        category: 'Operasional',
      },
      {
        id: 'ind-2',
        title: 'Kerapian Petugas',
        description: 'Rapi',
        measurementMethod: 'Checklist',
        weight: 80,
        maxTarget: 100,
        category: 'Disiplin',
      },
    ],
  },
  {
    id: 'tpl-it',
    positionId: 'pos-it',
    positionTitle: 'Admin IT',
    divisionName: 'IT',
    evaluationCycle: 'Bulanan',
    activePeriod: 'Oktober 2026',
    activeYear: 2026,
    activeMonth: 10,
    activeQuarter: 'Q4',
    updatedAt: '2026-10-01T00:00:00.000Z',
    indicators: [
      {
        id: 'ind-it-1',
        title: 'Uptime Sistem',
        description: '99.9%',
        measurementMethod: 'Monitoring',
        weight: 40,
        maxTarget: 100,
        category: 'Teknis',
      },
      {
        id: 'ind-it-2',
        title: 'SLA Tiket',
        description: 'Respon cepat',
        measurementMethod: 'Ticketing',
        weight: 30,
        maxTarget: 100,
        category: 'Layanan',
      },
      {
        id: 'ind-it-3',
        title: 'Keamanan Data',
        description: 'Backup rutin',
        measurementMethod: 'Audit',
        weight: 30,
        maxTarget: 100,
        category: 'Keamanan',
      },
    ],
  },
];

async function roundTripWorkbook(wb: ExcelJS.Workbook): Promise<ExcelJS.Workbook> {
  const buffer = await wb.xlsx.writeBuffer();
  const loaded = new ExcelJS.Workbook();
  await loaded.xlsx.load(buffer);
  return loaded;
}

test('buildExcelWorkbook renders compact 4-col wide format for uniform single position', async () => {
  const submissions: KPISubmission[] = [
    {
      id: 'sub-1',
      employeeName: 'Rizal Kasim',
      positionId: 'pos-cs',
      positionTitle: 'Cleaning Service',
      divisionName: 'Operasional SPBU',
      period: 'Oktober 2026',
      year: 2026,
      month: 10,
      quarter: 'Q4',
      scores: { 'ind-1': 88, 'ind-2': 84 },
      totalScore: 84.8,
      grade: 'B',
      gradeDescription: 'Baik',
      supervisorScores: { 'ind-1': 92, 'ind-2': 80 },
      supervisorTotalScore: 82.4,
      supervisorGrade: 'B',
      finalTotalScore: 82.4,
      finalGrade: 'B',
      status: 'approved',
      reviewedBy: 'Pak Manajer',
      reviewerNotes: 'Tingkatkan kerapian area sore',
      achievementNotes: 'Nol komplain pelanggan',
      createdAt: '2026-10-20T09:00:00.000Z',
    },
    {
      id: 'sub-2',
      employeeName: 'Hasan',
      positionId: 'pos-cs',
      positionTitle: 'Cleaning Service',
      divisionName: 'Operasional SPBU',
      period: 'Oktober 2026',
      year: 2026,
      month: 10,
      quarter: 'Q4',
      scores: { 'ind-1': 80, 'ind-2': 85 },
      totalScore: 84,
      grade: 'B',
      gradeDescription: 'Baik',
      status: 'submitted',
      createdAt: '2026-10-21T09:00:00.000Z',
    },
  ];

  const loaded = await roundTripWorkbook(
    await buildExcelWorkbook({ submissions, templates, companyKpiTarget: 75 })
  );

  assert.deepEqual(
    loaded.worksheets.map((s) => s.name),
    ['Rekap Submission', 'Analisis Indikator', 'Gap Analysis']
  );

  const rekap = loaded.getWorksheet('Rekap Submission')!;
  // 2-row merged header in Single-Position mode:
  // Cols 1..6 Identity, Cols 7..14 Indikator 1..2 (2*4), Cols 15..22 Summary & Notes
  assert.equal(rekap.getRow(1).getCell(6).value, 'Periode');
  assert.equal(rekap.getRow(1).getCell(7).value, '1. Kebersihan Area SPBU (20%)');
  assert.equal(rekap.getRow(1).getCell(11).value, '2. Kerapian Petugas (80%)');
  assert.equal(rekap.getRow(1).getCell(15).value, 'Self Score');
  assert.equal(rekap.getRow(2).getCell(7).value, 'Self');
  assert.equal(rekap.getRow(2).getCell(8).value, 'Atasan');
  assert.equal(rekap.getRow(2).getCell(9).value, 'Gap');
  assert.equal(rekap.getRow(2).getCell(10).value, 'Kontribusi');

  // Row 3 = Rizal Kasim (reviewed)
  const row3 = rekap.getRow(3);
  assert.equal(row3.getCell(7).value, 88);
  assert.equal(row3.getCell(8).value, 92);
  assert.equal(row3.getCell(9).value, 4);
  assert.equal(row3.getCell(10).value, 18.4); // 92 * 20 / 100
  assert.equal(row3.getCell(11).value, 84);
  assert.equal(row3.getCell(12).value, 80);
  assert.equal(row3.getCell(13).value, -4);
  assert.equal(row3.getCell(14).value, 64); // 80 * 80 / 100
  assert.equal(row3.getCell(15).value, 84.8); // Self Score after indicators
  assert.equal(row3.getCell(17).value, 82.4); // Final Score
  assert.equal(row3.getCell(18).value, 'B');  // Final Grade
  assert.equal(row3.getCell(20).value, 'Pak Manajer'); // Reviewer
  assert.equal(row3.getCell(22).value, 'Tingkatkan kerapian area sore'); // Catatan Reviewer

  // Row 4 = Hasan (unreviewed)
  const row4 = rekap.getRow(4);
  assert.equal(row4.getCell(7).value, 80);
  assert.equal(row4.getCell(8).value, '-');
  assert.equal(row4.getCell(9).value, '-');
  assert.equal(row4.getCell(10).value, 16); // 80 * 20 / 100
  assert.equal(row4.getCell(15).value, 84);
});

test('buildExcelWorkbook renders 6-col wide format for mixed positions, archived indicators, zero scores, and extra sheets', async () => {
  const submissions: KPISubmission[] = [
    {
      id: 'sub-cs-zero',
      employeeName: '=CMD|calc',
      positionId: 'pos-cs',
      positionTitle: 'Cleaning Service',
      divisionName: 'Operasional SPBU',
      period: 'Oktober 2026',
      year: 2026,
      month: 10,
      quarter: 'Q4',
      scores: { 'ind-1': 0, 'ind-2': 60 },
      supervisorScores: { 'ind-1': 0, 'ind-2': 50 },
      totalScore: 48,
      grade: 'D',
      gradeDescription: 'Kurang',
      supervisorTotalScore: 40,
      finalTotalScore: 40,
      finalGrade: 'D',
      status: 'approved',
      reviewedBy: '+Reviewer',
      achievementNotes: '@notes',
      reviewerNotes: '-urgent',
      createdAt: '2026-10-20T09:00:00.000Z',
    },
    {
      id: 'sub-it-1',
      employeeName: 'Noldi',
      positionId: 'pos-it',
      positionTitle: 'Admin IT',
      divisionName: 'IT',
      period: 'Oktober 2026',
      year: 2026,
      month: 10,
      quarter: 'Q4',
      scores: { 'ind-it-1': 95, 'ind-it-2': 90, 'ind-it-3': 85, 'ind-legacy': 75 },
      supervisorScores: { 'ind-it-1': 95, 'ind-it-2': 90, 'ind-it-3': 85 },
      totalScore: 89.5,
      grade: 'A',
      gradeDescription: 'Memuaskan',
      supervisorTotalScore: 89.5,
      finalTotalScore: 89.5,
      finalGrade: 'A',
      status: 'approved',
      createdAt: '2026-10-21T09:00:00.000Z',
    },
  ];

  const quarterlySummaries: QuarterlySummary[] = [
    {
      employeeName: 'NOLDI',
      positionTitle: 'Admin IT',
      divisionName: 'IT',
      quarter: 'Q4 2026',
      year: 2026,
      month1Score: 89.5,
      averageScore: 89.5,
      quarterlyGrade: 'A',
      quarterlyDescription: 'Memuaskan',
    },
  ];

  const report: ExecutiveReportData = {
    totalSubmissions: 2,
    averageCompanyScore: 64.75,
    topPerformers: { all: [], byDivision: {}, byPosition: {} },
    bottomPerformers: { all: [], byDivision: {}, byPosition: {} },
    bottlenecks: [],
    divisionCompletions: [],
    gradeCounts: { 'A+': 0, A: 1, B: 0, C: 0, D: 1 },
    divisionAverages: { 'Operasional SPBU': 40, IT: 89.5 },
    monthlyTrend: [],
    companyKpiTarget: 75,
  };

  const loaded = await roundTripWorkbook(
    await buildExcelWorkbook({
      submissions,
      templates,
      quarterlySummaries,
      report,
      companyKpiTarget: 75,
    })
  );

  assert.deepEqual(
    loaded.worksheets.map((s) => s.name),
    ['Rekap Submission', 'Analisis Indikator', 'Rekap Triwulan', 'Analisis Divisi', 'Gap Analysis']
  );

  const rekap = loaded.getWorksheet('Rekap Submission')!;
  // Mixed-position mode: Cols 1..6 Identity, Cols 7..30 Indikator 1..4 (4*6), Cols 31..38 Summary & Notes
  assert.equal(rekap.getRow(1).getCell(6).value, 'Periode');
  assert.equal(rekap.getRow(1).getCell(7).value, 'Indikator 1');
  assert.equal(rekap.getRow(1).getCell(31).value, 'Self Score');
  assert.equal(rekap.getRow(2).getCell(7).value, 'Nama Indikator');
  assert.equal(rekap.getRow(2).getCell(8).value, 'Bobot (%)');
  assert.equal(rekap.getRow(2).getCell(9).value, 'Self');
  assert.equal(rekap.getRow(2).getCell(10).value, 'Atasan');
  assert.equal(rekap.getRow(2).getCell(11).value, 'Gap');
  assert.equal(rekap.getRow(2).getCell(12).value, 'Kontribusi');

  // Formula injection sanitization & zero score check on row 3
  const row3 = rekap.getRow(3);
  assert.equal(row3.getCell(3).value, "'=CMD|calc");
  assert.equal(row3.getCell(9).value, 0); // zero self score preserved
  assert.equal(row3.getCell(10).value, 0); // zero spv score preserved
  assert.equal(row3.getCell(11).value, 0);
  assert.equal(row3.getCell(12).value, 0);
  // Slot 3 & 4 padded with '-' for shorter position (slot 3 starts at col 6 + 2*6 + 1 = 19)
  assert.equal(row3.getCell(19).value, '-');
  // Summary & Notes columns start at col 31
  assert.equal(row3.getCell(31).value, 48); // Self Score
  assert.equal(row3.getCell(36).value, "'+Reviewer");
  assert.equal(row3.getCell(37).value, "'@notes");
  assert.equal(row3.getCell(38).value, "'-urgent");

  // Row 4 slot 4 has archived orphan indicator (starts at col 6 + 3*6 + 1 = 25)
  const row4 = rekap.getRow(4);
  const slot4Start = 6 + 3 * 6 + 1; // col 25
  assert.equal(row4.getCell(slot4Start).value, '[Indikator Terarsip: ind-legacy]');
  assert.equal(row4.getCell(slot4Start + 1).value, '-');
  assert.equal(row4.getCell(slot4Start + 2).value, 75);
  assert.equal(row4.getCell(31).value, 89.5); // Self Score after all 4 indicator slots

  // Analisis Indikator sorted ascending (score 0 first!)
  const analisis = loaded.getWorksheet('Analisis Indikator')!;
  assert.equal(analisis.getRow(2).getCell(4).value, 'Kebersihan Area SPBU');
  assert.equal(analisis.getRow(2).getCell(12).value, 0);
  assert.equal(analisis.getRow(2).getCell(13).value, 'Perlu Evaluasi (< 75)');
});

test('buildExcelWorkbook handles zero supervisorTotalScore and empty submissions safely', async () => {
  const emptyWb = await roundTripWorkbook(
    await buildExcelWorkbook({ submissions: [], templates: [] })
  );
  const emptyRekap = emptyWb.getWorksheet('Rekap Submission')!;
  assert.equal(emptyRekap.getRow(1).getCell(1).value, 'No');
  assert.equal(emptyRekap.rowCount, 1);

  const zeroSpvSub: KPISubmission = {
    id: 'sub-zero',
    employeeName: 'Zero Tester',
    positionId: 'pos-cs',
    positionTitle: 'Cleaning Service',
    divisionName: 'Operasional SPBU',
    period: 'Oktober 2026',
    year: 2026,
    month: 10,
    quarter: 'Q4',
    scores: { 'ind-1': 50, 'ind-2': 50 },
    supervisorScores: { 'ind-1': 0, 'ind-2': 0 },
    totalScore: 50,
    grade: 'D',
    gradeDescription: 'Kurang',
    supervisorTotalScore: 0,
    finalTotalScore: 0,
    finalGrade: 'D',
    status: 'approved',
    createdAt: '2026-10-20T09:00:00.000Z',
  };

  const zeroWb = await roundTripWorkbook(
    await buildExcelWorkbook({ submissions: [zeroSpvSub], templates })
  );
  const gapSheet = zeroWb.getWorksheet('Gap Analysis')!;
  assert.equal(gapSheet.getRow(2).getCell(6).value, 0);
  assert.equal(gapSheet.getRow(2).getCell(7).value, -50);
});

test('sanitizeSpreadsheetText preserves bare placeholder hyphen', () => {
  assert.equal(sanitizeSpreadsheetText('-'), '-');
  assert.equal(sanitizeSpreadsheetText('=1+1'), "'=1+1");
  assert.equal(sanitizeSpreadsheetText('+cmd'), "'+cmd");
  assert.equal(sanitizeSpreadsheetText('-cmd'), "'-cmd");
  assert.equal(sanitizeSpreadsheetText('@SUM'), "'@SUM");
  assert.equal(sanitizeSpreadsheetText('Normal text'), 'Normal text');
});
