import type {
  ExecutiveReportData,
  KPISubmission,
  KPITemplate,
  QuarterlySummary,
} from '@/types/kpi';
import ExcelJS from 'exceljs';
import {
  aggregateIndicatorAnalytics,
  buildTemplateMap,
  resolveSubmissionIndicators,
  round2,
  type ResolvedIndicatorScore,
} from './indicator-resolver';

export interface ExportExcelOptions {
  submissions: KPISubmission[];
  templates?: KPITemplate[];
  quarterlySummaries?: QuarterlySummary[];
  report?: ExecutiveReportData | null;
  companyKpiTarget?: number;
  filename?: string;
}

const FORMULA_TRIGGER_RE = /^[=+\-@\t\r]/;
const HEADER_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
};

/**
 * Prevents spreadsheet formula injection by prefixing risky leading characters with a single quote.
 * Preserves bare '-' placeholder strings used for empty numeric cells.
 */
export function sanitizeSpreadsheetText(raw: unknown): string {
  if (raw === null || raw === undefined) return '';
  const text = String(raw);
  if (text === '' || text === '-') return text;
  if (FORMULA_TRIGGER_RE.test(text)) {
    return `'${text}`;
  }
  return text;
}

function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A+':
      return 'FF10B981'; // Emerald
    case 'A':
      return 'FF06B6D4'; // Cyan
    case 'B':
      return 'FFF59E0B'; // Amber
    case 'C':
      return 'FFF97316'; // Orange
    case 'D':
      return 'FFF43F5E'; // Rose
    default:
      return 'FF64748B'; // Slate
  }
}

function getGapColor(gap: number): string {
  if (gap < 0) return 'FFF43F5E';
  if (gap > 0) return 'FF10B981';
  return 'FF64748B';
}

function formatSubmissionStatus(status?: KPISubmission['status']): string {
  if (status === 'approved') return 'Approved by Atasan/Reviewer';
  if (status === 'reviewed') return 'Reviewed';
  return 'Submitted';
}

function isUniformSinglePosition(
  submissions: KPISubmission[],
  resolvedList: ResolvedIndicatorScore[][],
  maxIndicators: number
): boolean {
  if (submissions.length === 0 || maxIndicators === 0) return false;
  const firstPos = submissions[0].positionId;
  const baseline = resolvedList[0];
  if (baseline.length !== maxIndicators) return false;

  for (let i = 0; i < submissions.length; i++) {
    if (submissions[i].positionId !== firstPos) return false;
    const current = resolvedList[i];
    if (current.length !== maxIndicators) return false;
    for (let k = 0; k < maxIndicators; k++) {
      if (
        current[k].id !== baseline[k].id ||
        current[k].title !== baseline[k].title ||
        current[k].weight !== baseline[k].weight
      ) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Builds the formatted multi-sheet ExcelJS workbook (pure builder for Node testing & browser export).
 */
export async function buildExcelWorkbook(options: ExportExcelOptions): Promise<ExcelJS.Workbook> {
  const {
    submissions = [],
    templates = [],
    quarterlySummaries = [],
    report = null,
    companyKpiTarget = report?.companyKpiTarget ?? 75,
  } = options;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'KPI Arba System';
  workbook.lastModifiedBy = 'System';
  workbook.created = new Date();
  workbook.modified = new Date();

  const templateMap = buildTemplateMap(templates);
  const resolvedBySubmission = submissions.map((sub) =>
    resolveSubmissionIndicators(sub, templateMap)
  );
  const maxIndicators = resolvedBySubmission.reduce(
    (max, list) => Math.max(max, list.length),
    0
  );
  const singlePositionMode = isUniformSinglePosition(
    submissions,
    resolvedBySubmission,
    maxIndicators
  );

  // ---------------------------------------------------------
  // SHEET 1: REKAP SUBMISSION (IDENTITAS -> INDIKATOR -> TOTAL)
  // ---------------------------------------------------------
  const sheet1 = workbook.addWorksheet('Rekap Submission');

  const identityColumnDefs = [
    { header: 'No', width: 5 },
    { header: 'Timestamp', width: 20 },
    { header: 'Nama Karyawan', width: 25 },
    { header: 'Divisi', width: 26 },
    { header: 'Jabatan', width: 26 },
    { header: 'Periode', width: 16 },
  ];

  const summaryColumnDefs = [
    { header: 'Self Score', width: 13 },
    { header: 'Atasan/Reviewer Score', width: 22 },
    { header: 'Final Score', width: 13 },
    { header: 'Final Grade', width: 13 },
    { header: 'Status', width: 26 },
    { header: 'Reviewer / Atasan', width: 22 },
    { header: 'Catatan Pencapaian', width: 36 },
    { header: 'Catatan Reviewer', width: 36 },
  ];

  const identityColCount = identityColumnDefs.length;
  const colsPerIndicator = singlePositionMode ? 4 : 6;
  const totalIndicatorCols = maxIndicators * colsPerIndicator;
  const summaryStartCol = identityColCount + totalIndicatorCols + 1;

  if (maxIndicators === 0) {
    const allBaseCols = [...identityColumnDefs, ...summaryColumnDefs];
    const headerRow = sheet1.getRow(1);
    allBaseCols.forEach((col, i) => {
      const colIdx = i + 1;
      sheet1.getColumn(colIdx).width = col.width;
      const cell = headerRow.getCell(colIdx);
      cell.value = col.header;
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF991B1B' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = HEADER_BORDER;
    });
    sheet1.views = [{ state: 'frozen', xSplit: 3, ySplit: 1 }];
  } else {
    const row1 = sheet1.getRow(1);
    const row2 = sheet1.getRow(2);
    row1.height = 24;
    row2.height = 22;

    const styleVerticallyMergedHeader = (colIdx: number, header: string, width: number) => {
      sheet1.getColumn(colIdx).width = width;
      const topCell = row1.getCell(colIdx);
      const bottomCell = row2.getCell(colIdx);
      topCell.value = header;
      sheet1.mergeCells(1, colIdx, 2, colIdx);
      [topCell, bottomCell].forEach((c) => {
        c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF991B1B' } };
        c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        c.border = HEADER_BORDER;
      });
    };

    // 1. Identity columns (Cols A..F)
    identityColumnDefs.forEach((col, i) => {
      styleVerticallyMergedHeader(i + 1, col.header, col.width);
    });

    // 2. Indicator columns directly after Periode (Cols G..)
    for (let k = 0; k < maxIndicators; k++) {
      const startCol = identityColCount + k * colsPerIndicator + 1;
      const endCol = startCol + colsPerIndicator - 1;
      sheet1.mergeCells(1, startCol, 1, endCol);

      const groupCell = row1.getCell(startCol);
      if (singlePositionMode) {
        const ref = resolvedBySubmission[0][k];
        const weightSuffix = ref.weight !== null ? ` (${ref.weight}%)` : '';
        groupCell.value = sanitizeSpreadsheetText(`${k + 1}. ${ref.title}${weightSuffix}`);
      } else {
        groupCell.value = `Indikator ${k + 1}`;
      }

      for (let c = startCol; c <= endCol; c++) {
        const cell = row1.getCell(c);
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF991B1B' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = HEADER_BORDER;
      }

      const subHeaders = singlePositionMode
        ? [
            { label: 'Self', width: 10 },
            { label: 'Atasan', width: 10 },
            { label: 'Gap', width: 10 },
            { label: 'Kontribusi', width: 13 },
          ]
        : [
            { label: 'Nama Indikator', width: 30 },
            { label: 'Bobot (%)', width: 11 },
            { label: 'Self', width: 10 },
            { label: 'Atasan', width: 10 },
            { label: 'Gap', width: 10 },
            { label: 'Kontribusi', width: 13 },
          ];

      subHeaders.forEach((subCol, offset) => {
        const colIdx = startCol + offset;
        sheet1.getColumn(colIdx).width = subCol.width;
        const subCell = row2.getCell(colIdx);
        subCell.value = subCol.label;
        subCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7F1D1D' } };
        subCell.alignment = { vertical: 'middle', horizontal: 'center' };
        subCell.border = HEADER_BORDER;
      });
    }

    // 3. Summary totals & notes after all indicator columns
    summaryColumnDefs.forEach((col, i) => {
      styleVerticallyMergedHeader(summaryStartCol + i, col.header, col.width);
    });

    sheet1.views = [{ state: 'frozen', xSplit: 3, ySplit: 2 }];
  }

  submissions.forEach((sub, idx) => {
    const finalGrade = sub.finalGrade ?? sub.supervisorGrade ?? sub.grade;
    const identityValues: Array<string | number> = [
      idx + 1,
      new Date(sub.createdAt).toLocaleString('id-ID'),
      sanitizeSpreadsheetText(sub.employeeName),
      sanitizeSpreadsheetText(sub.divisionName),
      sanitizeSpreadsheetText(sub.positionTitle),
      sanitizeSpreadsheetText(sub.period),
    ];

    const resolved = resolvedBySubmission[idx];
    const indicatorValues: Array<string | number> = [];

    for (let k = 0; k < maxIndicators; k++) {
      const item = resolved[k];
      if (singlePositionMode) {
        if (item) {
          indicatorValues.push(
            item.selfScore ?? '-',
            item.supervisorScore ?? '-',
            item.gap ?? '-',
            item.weightedContribution ?? '-'
          );
        } else {
          indicatorValues.push('-', '-', '-', '-');
        }
      } else if (item) {
        indicatorValues.push(
          sanitizeSpreadsheetText(item.title),
          item.weight ?? '-',
          item.selfScore ?? '-',
          item.supervisorScore ?? '-',
          item.gap ?? '-',
          item.weightedContribution ?? '-'
        );
      } else {
        indicatorValues.push('-', '-', '-', '-', '-', '-');
      }
    }

    const summaryValues: Array<string | number> = [
      sub.totalScore,
      sub.supervisorTotalScore !== undefined ? sub.supervisorTotalScore : '-',
      sub.finalTotalScore ?? sub.supervisorTotalScore ?? sub.totalScore,
      sanitizeSpreadsheetText(finalGrade),
      formatSubmissionStatus(sub.status),
      sanitizeSpreadsheetText(sub.reviewedBy || '-'),
      sanitizeSpreadsheetText(sub.achievementNotes || ''),
      sanitizeSpreadsheetText(sub.reviewerNotes || ''),
    ];

    const dataRow = sheet1.addRow([...identityValues, ...indicatorValues, ...summaryValues]);

    // Bold & color summary score/grade cells
    dataRow.getCell(summaryStartCol).font = { bold: true };
    dataRow.getCell(summaryStartCol + 2).font = { bold: true };
    const gradeCell = dataRow.getCell(summaryStartCol + 3);
    gradeCell.font = { bold: true, color: { argb: getGradeColor(finalGrade) } };

    for (let k = 0; k < maxIndicators; k++) {
      const item = resolved[k];
      const slotStartCol = identityColCount + k * colsPerIndicator + 1;
      const gapColOffset = singlePositionMode ? 2 : 4;
      const gapCell = dataRow.getCell(slotStartCol + gapColOffset);

      if (item && item.gap !== null) {
        gapCell.numFmt = '+0.##;-0.##;0';
        gapCell.font = { bold: true, color: { argb: getGapColor(item.gap) } };
      }

      if (singlePositionMode) {
        for (let offset = 0; offset < 4; offset++) {
          dataRow.getCell(slotStartCol + offset).alignment = { horizontal: 'center' };
        }
      } else {
        for (let offset = 1; offset < 6; offset++) {
          dataRow.getCell(slotStartCol + offset).alignment = { horizontal: 'center' };
        }
      }
    }
  });

  // ---------------------------------------------------------
  // SHEET 2: ANALISIS INDIKATOR (BOTTLENECK & RATA-RATA)
  // ---------------------------------------------------------
  const indicatorAnalytics = aggregateIndicatorAnalytics(
    submissions,
    templateMap,
    companyKpiTarget
  );

  const sheetIndicators = workbook.addWorksheet('Analisis Indikator');
  sheetIndicators.columns = [
    { header: 'No', key: 'no', width: 5 },
    { header: 'Divisi', key: 'divisionName', width: 22 },
    { header: 'Jabatan', key: 'positionTitle', width: 25 },
    { header: 'Nama Indikator', key: 'indicatorTitle', width: 38 },
    { header: 'Kategori', key: 'category', width: 18 },
    { header: 'Bobot (%)', key: 'weight', width: 11 },
    { header: 'Jumlah Dinilai', key: 'totalAssessed', width: 15 },
    { header: 'Sudah Direview', key: 'reviewedCount', width: 15 },
    { header: 'Rata-Rata Self', key: 'avgSelf', width: 15 },
    { header: 'Rata-Rata Atasan', key: 'avgSupervisor', width: 17 },
    { header: 'Rata-Rata Gap', key: 'avgGap', width: 15 },
    { header: 'Skor Efektif Rata-Rata', key: 'avgEffective', width: 21 },
    { header: 'Status Target', key: 'status', width: 26 },
  ];

  sheetIndicators.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheetIndicators.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F766E' },
  };
  sheetIndicators.views = [{ state: 'frozen', ySplit: 1 }];

  indicatorAnalytics.forEach((item, idx) => {
    const row = sheetIndicators.addRow({
      no: idx + 1,
      divisionName: sanitizeSpreadsheetText(item.divisionName),
      positionTitle: sanitizeSpreadsheetText(item.positionTitle),
      indicatorTitle: sanitizeSpreadsheetText(item.indicatorTitle),
      category: sanitizeSpreadsheetText(item.category),
      weight: item.weight ?? '-',
      totalAssessed: item.totalAssessed,
      reviewedCount: item.reviewedCount,
      avgSelf: item.avgSelf ?? '-',
      avgSupervisor: item.avgSupervisor ?? '-',
      avgGap: item.avgGap ?? '-',
      avgEffective: item.avgEffective,
      status: item.meetsTarget
        ? `Memenuhi Target (>= ${companyKpiTarget})`
        : `Perlu Evaluasi (< ${companyKpiTarget})`,
    });

    if (item.avgGap !== null) {
      const gapCell = row.getCell('avgGap');
      gapCell.numFmt = '+0.##;-0.##;0';
      gapCell.font = { bold: true, color: { argb: getGapColor(item.avgGap) } };
    }

    row.getCell('avgEffective').font = { bold: true };
    row.getCell('status').font = {
      bold: true,
      color: { argb: item.meetsTarget ? 'FF10B981' : 'FFF43F5E' },
    };
  });

  // ---------------------------------------------------------
  // SHEET 3: REKAP TRIWULAN
  // ---------------------------------------------------------
  if (quarterlySummaries.length > 0) {
    const sheet2 = workbook.addWorksheet('Rekap Triwulan');
    sheet2.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama Karyawan', key: 'employeeName', width: 25 },
      { header: 'Jabatan', key: 'position', width: 25 },
      { header: 'Divisi', key: 'division', width: 20 },
      { header: 'Kuartal', key: 'quarter', width: 12 },
      { header: 'Bulan 1', key: 'm1', width: 12 },
      { header: 'Bulan 2', key: 'm2', width: 12 },
      { header: 'Bulan 3', key: 'm3', width: 12 },
      { header: 'Rata-Rata Skor', key: 'avgScore', width: 15 },
      { header: 'Grade Triwulan', key: 'grade', width: 22 },
    ];

    sheet2.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet2.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF06B6D4' } };
    sheet2.views = [{ state: 'frozen', ySplit: 1 }];

    quarterlySummaries.forEach((sum, idx) => {
      const row = sheet2.addRow({
        no: idx + 1,
        employeeName: sanitizeSpreadsheetText(sum.employeeName),
        position: sanitizeSpreadsheetText(sum.positionTitle),
        division: sanitizeSpreadsheetText(sum.divisionName),
        quarter: sanitizeSpreadsheetText(sum.quarter),
        m1: sum.month1Score ?? '-',
        m2: sum.month2Score ?? '-',
        m3: sum.month3Score ?? '-',
        avgScore: sum.averageScore,
        grade: `${sum.quarterlyGrade} (${sum.quarterlyDescription})`,
      });

      row.getCell('grade').font = {
        bold: true,
        color: { argb: getGradeColor(sum.quarterlyGrade) },
      };
    });
  }

  // ---------------------------------------------------------
  // SHEET 4: ANALISIS DIVISI
  // ---------------------------------------------------------
  if (report && Object.keys(report.divisionAverages).length > 0) {
    const sheet3 = workbook.addWorksheet('Analisis Divisi');
    sheet3.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Divisi', key: 'division', width: 30 },
      { header: 'Rata-Rata Skor', key: 'avgScore', width: 20 },
      { header: 'Status Performa', key: 'status', width: 26 },
    ];

    sheet3.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet3.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
    sheet3.views = [{ state: 'frozen', ySplit: 1 }];

    Object.entries(report.divisionAverages).forEach(([div, score], idx) => {
      const isAboveTarget = score >= companyKpiTarget;
      const row = sheet3.addRow({
        no: idx + 1,
        division: sanitizeSpreadsheetText(div),
        avgScore: score,
        status: isAboveTarget
          ? `Memenuhi Target (>= ${companyKpiTarget})`
          : `Di Bawah Target (< ${companyKpiTarget})`,
      });

      row.getCell('avgScore').font = { bold: true };
      row.getCell('status').font = {
        bold: true,
        color: { argb: isAboveTarget ? 'FF10B981' : 'FFF43F5E' },
      };
    });
  }

  // ---------------------------------------------------------
  // SHEET 5: GAP ANALYSIS
  // ---------------------------------------------------------
  const sheet4 = workbook.addWorksheet('Gap Analysis');
  sheet4.columns = [
    { header: 'No', key: 'no', width: 5 },
    { header: 'Nama Karyawan', key: 'employeeName', width: 25 },
    { header: 'Jabatan', key: 'position', width: 25 },
    { header: 'Periode', key: 'period', width: 15 },
    { header: 'Self Score', key: 'self', width: 15 },
    { header: 'Atasan/Reviewer Score', key: 'spv', width: 22 },
    { header: 'Gap (Spv - Self)', key: 'gap', width: 18 },
    { header: 'Keterangan', key: 'note', width: 34 },
  ];

  sheet4.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet4.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } };
  sheet4.views = [{ state: 'frozen', ySplit: 1 }];

  let gapIdx = 1;
  submissions.forEach((sub) => {
    if (sub.supervisorTotalScore !== undefined) {
      const gap = round2(sub.supervisorTotalScore - sub.totalScore);
      let note = 'Sesuai ekspektasi';
      if (gap < -5) note = 'Self-assessment terlalu tinggi (Overrated)';
      else if (gap > 5) note = 'Self-assessment terlalu rendah (Underrated)';

      const row = sheet4.addRow({
        no: gapIdx++,
        employeeName: sanitizeSpreadsheetText(sub.employeeName),
        position: sanitizeSpreadsheetText(sub.positionTitle),
        period: sanitizeSpreadsheetText(sub.period),
        self: sub.totalScore,
        spv: sub.supervisorTotalScore,
        gap,
        note,
      });

      const gapCell = row.getCell('gap');
      gapCell.numFmt = '+0.##;-0.##;0';
      gapCell.font = { bold: true, color: { argb: getGapColor(gap) } };
    }
  });

  return workbook;
}
