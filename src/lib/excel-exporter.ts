import { KPISubmission, QuarterlySummary } from '@/types/kpi';

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
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Downloads KPI Submissions & Quarterly Recap as native Excel XML (.xls) formatted with table styling
 */
export function exportToExcel(
  submissions: KPISubmission[],
  quarterlySummaries: QuarterlySummary[] = [],
  filename: string = 'Laporan_KPI_Executive_Arba.xls'
) {
  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th { background-color: #991B1B; color: #FFFFFF; font-weight: bold; padding: 8px; border: 1px solid #7F1D1D; text-align: center; }
        td { padding: 6px 8px; border: 1px solid #CBD5E1; text-align: left; }
        .num { text-align: center; font-weight: bold; }
        .badge { font-weight: bold; text-align: center; }
      </style>
    </head>
    <body>
      <h2>LAPORAN PENILAIAN KPI - ARBA GROUP</h2>
      <p>Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID')} | Total Record: ${submissions.length}</p>

      <h3>1. Log Submission Penilaian Karyawan</h3>
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Timestamp</th>
            <th>Nama Karyawan</th>
            <th>Divisi</th>
            <th>Jabatan</th>
            <th>Periode</th>
            <th>Skor Total</th>
            <th>Grade</th>
            <th>Keterangan Status</th>
            <th>Catatan Pencapaian</th>
          </tr>
        </thead>
        <tbody>
  `;

  submissions.forEach((sub, idx) => {
    html += `
      <tr>
        <td class="num">${idx + 1}</td>
        <td>${new Date(sub.createdAt).toLocaleString('id-ID')}</td>
        <td><b>${sub.employeeName}</b></td>
        <td>${sub.divisionName}</td>
        <td>${sub.positionTitle}</td>
        <td class="num">${sub.period}</td>
        <td class="num">${sub.totalScore}</td>
        <td class="badge">${sub.grade}</td>
        <td>${sub.gradeDescription}</td>
        <td>${sub.achievementNotes || ''}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>

      <h3>2. Rekapan Rata-Rata KPI Triwulanan</h3>
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Karyawan</th>
            <th>Jabatan</th>
            <th>Divisi</th>
            <th>Triwulan</th>
            <th>Rata-Rata Skor</th>
            <th>Grade Triwulan</th>
          </tr>
        </thead>
        <tbody>
  `;

  quarterlySummaries.forEach((sum, idx) => {
    html += `
      <tr>
        <td class="num">${idx + 1}</td>
        <td><b>${sum.employeeName}</b></td>
        <td>${sum.positionTitle}</td>
        <td>${sum.divisionName}</td>
        <td class="num">${sum.quarter}</td>
        <td class="num">${sum.averageScore}</td>
        <td class="badge">${sum.quarterlyGrade} (${sum.quarterlyDescription})</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
