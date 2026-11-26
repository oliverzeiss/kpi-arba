import type { ExecutiveReportData, KPISubmission, KPITemplate, QuarterlySummary } from '@/types/kpi';
import { exportToExcel } from './excel-exporter';

export async function fetchAllTemplatesClient(): Promise<KPITemplate[]> {
  const res = await fetch(`/api/kpi/master?all=true&t=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Gagal memuat master indikator KPI dari server.');
  }
  const data = await res.json();
  return Array.isArray(data?.templates) ? data.templates : [];
}

export interface RunExcelDownloadParams {
  submissions: KPISubmission[];
  templates?: KPITemplate[];
  ensureTemplates?: () => Promise<KPITemplate[]>;
  quarterlySummaries?: QuarterlySummary[];
  report?: ExecutiveReportData | null;
  companyKpiTarget?: number;
  filename?: string;
}

/**
 * Coordinates template loading, empty-state validation, and workbook export for UI tabs.
 */
export async function runKpiExcelDownload(params: RunExcelDownloadParams): Promise<void> {
  const {
    submissions,
    templates,
    ensureTemplates,
    quarterlySummaries = [],
    report = null,
    companyKpiTarget,
    filename,
  } = params;

  if (submissions.length === 0 && quarterlySummaries.length === 0) {
    throw new Error('Belum ada data penilaian yang sesuai dengan filter saat ini.');
  }

  const resolvedTemplates =
    templates && templates.length > 0
      ? templates
      : await (ensureTemplates ? ensureTemplates() : fetchAllTemplatesClient());

  await exportToExcel({
    submissions,
    templates: resolvedTemplates,
    quarterlySummaries,
    report,
    companyKpiTarget,
    filename,
  });
}
