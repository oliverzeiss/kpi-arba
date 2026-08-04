import { KPISubmission, KPITemplate } from '@/types/kpi';

export interface GoogleSheetsSyncResult {
  success: boolean;
  message: string;
  targetTab: string;
}

/**
 * Triggers sync to Google Spreadsheet (via Google Apps Script Webhook or API)
 */
export async function syncSubmissionToGoogleSheets(
  submission: KPISubmission,
  template?: KPITemplate
): Promise<GoogleSheetsSyncResult> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  const payload = {
    action: 'ADD_KPI_SUBMISSION',
    timestamp: new Date().toISOString(),
    employeeName: submission.employeeName,
    positionTitle: submission.positionTitle,
    divisionName: submission.divisionName,
    period: submission.period,
    year: submission.year,
    month: submission.month,
    quarter: submission.quarter,
    totalScore: submission.totalScore,
    grade: submission.grade,
    gradeDescription: submission.gradeDescription,
    indicatorScores: submission.scores,
    targetTab: submission.positionTitle, // Sheet tab per Jabatan (e.g. "Admin IT")
  };

  console.log('[GoogleSheetsSync] Syncing payload to spreadsheet:', payload);

  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Google Sheets webhook returned status ${res.status}`);
      }

      return {
        success: true,
        message: `Berhasil disinkronkan ke Google Spreadsheet tab "${submission.positionTitle}"`,
        targetTab: submission.positionTitle,
      };
    } catch (err: any) {
      console.warn('[GoogleSheetsSync] Webhook push failed, fallback to local log:', err);
    }
  }

  // Fallback / Standalone mode response
  return {
    success: true,
    message: `[Simulasi Auto-Sync] Data berhasil disiapkan untuk Sheet Tab "${submission.positionTitle}"`,
    targetTab: submission.positionTitle,
  };
}
