import type { KPISubmission } from '@/types/kpi';
import { saveAs } from 'file-saver';
import {
  buildExcelWorkbook,
  sanitizeSpreadsheetText,
  type ExportExcelOptions,
} from './excel-workbook';

export { buildExcelWorkbook, sanitizeSpreadsheetText, type ExportExcelOptions };

function escapeCSVCell(raw: unknown): string {
  const sanitized = sanitizeSpreadsheetText(raw).replace(/"/g, '""');
  return `"${sanitized}"`;
}

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
    escapeCSVCell(sub.id),
    escapeCSVCell(new Date(sub.createdAt).toLocaleString('id-ID')),
    escapeCSVCell(sub.employeeName),
    escapeCSVCell(sub.divisionName),
    escapeCSVCell(sub.positionTitle),
    escapeCSVCell(sub.period),
    sub.year,
    escapeCSVCell(sub.quarter),
    sub.totalScore,
    escapeCSVCell(sub.grade),
    escapeCSVCell(sub.gradeDescription),
    escapeCSVCell(sub.achievementNotes || ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, filename);
}

/**
 * Generates and downloads a multi-sheet formatted Excel file using exceljs
 */
export async function exportToExcel(options: ExportExcelOptions): Promise<void> {
  const filename = options.filename || 'Laporan_KPI_Executive_Arba.xlsx';
  const workbook = await buildExcelWorkbook(options);
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, filename);
}
