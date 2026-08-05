import { KPISubmission, QuarterlySummary, ExecutiveReportData } from '@/types/kpi';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

/**
 * Downloads KPI Submissions report as CSV format
 */
export function exportToCSV(submissions: KPISubmission[], filename: string = 'Laporan_KPI_Arba.csv') {
  if (!submissions || submissions.length === 0) return;

  const headers = [
    'ID Submission',
    'Waktu Submit',
    'Nama Karyawan',
    'Divisi',
    'Jabatan',
    'Periode',
    'Tahun',
    'Kuartal',
    'Skor Total',
    'Grade',
    'Keterangan Status',
    'Catatan Pencapaian',
  ];

  const rows = submissions.map((sub) => [
    `"${sub.id}"`,
    `"${new Date(sub.createdAt).toLocaleString('id-ID')}"`,
    `"${sub.employeeName}"`,
    `"${sub.divisionName}"`,
    `"${sub.positionTitle}"`,
    `"${sub.period}"`,
    sub.year,
    `"${sub.quarter}"`,
    sub.totalScore,
    `"${sub.grade}"`,
    `"${sub.gradeDescription}"`,
    `"${sub.achievementNotes || ''}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, filename);
}

/**
 * Generates and downloads a multi-sheet formatted Excel file using exceljs
 */
export async function exportToExcel(
  submissions: KPISubmission[],
  quarterlySummaries: QuarterlySummary[] = [],
  report?: ExecutiveReportData | null,
  filename: string = 'Laporan_KPI_Executive_Arba.xlsx'
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'KPI Arba System';
  workbook.lastModifiedBy = 'System';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Helper for Grade Colors
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return '10B981'; // Emerald
      case 'A': return '06B6D4'; // Cyan
      case 'B': return 'F59E0B'; // Amber
      case 'C': return 'F97316'; // Orange
      case 'D': return 'F43F5E'; // Rose
      default: return '64748B'; // Slate
    }
  };

  // ---------------------------------------------------------
  // SHEET 1: REKAP SUBMISSION
  // ---------------------------------------------------------
  const sheet1 = workbook.addWorksheet('Rekap Submission');
  sheet1.columns = [
    { header: 'No', key: 'no', width: 5 },
    { header: 'Timestamp', key: 'timestamp', width: 20 },
    { header: 'Nama Karyawan', key: 'employeeName', width: 25 },
    { header: 'Divisi', key: 'division', width: 20 },
    { header: 'Jabatan', key: 'position', width: 25 },
    { header: 'Periode', key: 'period', width: 15 },
    { header: 'Self Score', key: 'selfScore', width: 15 },
    { header: 'Atasan/Reviewer Score', key: 'spvScore', width: 22 },
    { header: 'Final Score', key: 'finalScore', width: 15 },
    { header: 'Final Grade', key: 'grade', width: 15 },
    { header: 'Status', key: 'status', width: 25 },
    { header: 'Catatan Pencapaian', key: 'notes', width: 40 },
  ];

  sheet1.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet1.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF991B1B' } };
  sheet1.views = [{ state: 'frozen', ySplit: 1 }];

  submissions.forEach((sub, idx) => {
    const row = sheet1.addRow({
      no: idx + 1,
      timestamp: new Date(sub.createdAt).toLocaleString('id-ID'),
      employeeName: sub.employeeName,
      division: sub.divisionName,
      position: sub.positionTitle,
      period: sub.period,
      selfScore: sub.totalScore,
      spvScore: sub.supervisorTotalScore ?? '-',
      finalScore: sub.finalTotalScore ?? sub.supervisorTotalScore ?? sub.totalScore,
      grade: sub.finalGrade ?? sub.supervisorGrade ?? sub.grade,
      status: sub.status === 'approved' ? 'Approved by Atasan/Reviewer' : (sub.status === 'reviewed' ? 'Reviewed' : 'Submitted'),
      notes: sub.achievementNotes || '',
    });

    const gradeCell = row.getCell('grade');
    gradeCell.font = { bold: true, color: { argb: getGradeColor(gradeCell.value as string) } };
  });

  // ---------------------------------------------------------
  // SHEET 2: REKAP TRIWULAN
  // ---------------------------------------------------------
  if (quarterlySummaries.length > 0) {
    const sheet2 = workbook.addWorksheet('Rekap Triwulan');
    sheet2.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama Karyawan', key: 'employeeName', width: 25 },
      { header: 'Jabatan', key: 'position', width: 25 },
      { header: 'Divisi', key: 'division', width: 20 },
      { header: 'Kuartal', key: 'quarter', width: 10 },
      { header: 'Bulan 1', key: 'm1', width: 12 },
      { header: 'Bulan 2', key: 'm2', width: 12 },
      { header: 'Bulan 3', key: 'm3', width: 12 },
      { header: 'Rata-Rata Skor', key: 'avgScore', width: 15 },
      { header: 'Grade Triwulan', key: 'grade', width: 20 },
    ];

    sheet2.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet2.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF06B6D4' } }; // Cyan
    sheet2.views = [{ state: 'frozen', ySplit: 1 }];

    quarterlySummaries.forEach((sum, idx) => {
      const row = sheet2.addRow({
        no: idx + 1,
        employeeName: sum.employeeName,
        position: sum.positionTitle,
        division: sum.divisionName,
        quarter: sum.quarter,
        m1: sum.month1Score ?? '-',
        m2: sum.month2Score ?? '-',
        m3: sum.month3Score ?? '-',
        avgScore: sum.averageScore,
        grade: `${sum.quarterlyGrade} (${sum.quarterlyDescription})`,
      });

      row.getCell('grade').font = { bold: true, color: { argb: getGradeColor(sum.quarterlyGrade) } };
    });
  }

  // ---------------------------------------------------------
  // SHEET 3: ANALISIS DIVISI
  // ---------------------------------------------------------
  if (report && Object.keys(report.divisionAverages).length > 0) {
    const sheet3 = workbook.addWorksheet('Analisis Divisi');
    sheet3.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Divisi', key: 'division', width: 30 },
      { header: 'Rata-Rata Skor', key: 'avgScore', width: 20 },
      { header: 'Status Performa', key: 'status', width: 25 },
    ];

    sheet3.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet3.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } }; // Emerald
    sheet3.views = [{ state: 'frozen', ySplit: 1 }];

    Object.entries(report.divisionAverages).forEach(([div, score], idx) => {
      const isAboveTarget = score >= 75;
      const row = sheet3.addRow({
        no: idx + 1,
        division: div,
        avgScore: score,
        status: isAboveTarget ? 'Memenuhi Target (>= 75)' : 'Di Bawah Target (< 75)',
      });

      row.getCell('avgScore').font = { bold: true };
      row.getCell('status').font = { bold: true, color: { argb: isAboveTarget ? 'FF10B981' : 'FFF43F5E' } };
    });
  }

  // ---------------------------------------------------------
  // SHEET 4: GAP ANALYSIS
  // ---------------------------------------------------------
  const sheet4 = workbook.addWorksheet('Gap Analysis');
  sheet4.columns = [
    { header: 'No', key: 'no', width: 5 },
    { header: 'Nama Karyawan', key: 'employeeName', width: 25 },
    { header: 'Jabatan', key: 'position', width: 25 },
    { header: 'Periode', key: 'period', width: 15 },
    { header: 'Self Score', key: 'self', width: 15 },
    { header: 'Atasan/Reviewer Score', key: 'spv', width: 20 },
    { header: 'Gap (Spv - Self)', key: 'gap', width: 20 },
    { header: 'Keterangan', key: 'note', width: 30 },
  ];

  sheet4.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet4.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } }; // Amber
  sheet4.views = [{ state: 'frozen', ySplit: 1 }];

  let gapIdx = 1;
  submissions.forEach((sub) => {
    if (sub.supervisorTotalScore !== undefined) {
      const gap = sub.supervisorTotalScore - sub.totalScore;
      let note = 'Sesuai ekspektasi';
      if (gap < -5) note = 'Self-assessment terlalu tinggi (Overrated)';
      else if (gap > 5) note = 'Self-assessment terlalu rendah (Underrated)';

      const row = sheet4.addRow({
        no: gapIdx++,
        employeeName: sub.employeeName,
        position: sub.positionTitle,
        period: sub.period,
        self: sub.totalScore,
        spv: sub.supervisorTotalScore,
        gap: gap.toFixed(2),
        note: note,
      });

      const gapCell = row.getCell('gap');
      gapCell.font = { bold: true, color: { argb: gap < 0 ? 'FFF43F5E' : (gap > 0 ? 'FF10B981' : 'FF64748B') } };
    }
  });

  // Export File
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, filename);
}
