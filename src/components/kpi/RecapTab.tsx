import React, { useState } from 'react';
import { BarChart3, Download, RefreshCw } from 'lucide-react';
import { QuarterlySummary, KPISubmission } from '@/types/kpi';
import { exportToExcel } from '@/lib/excel-exporter';
import { GlassCard } from '@/components/ui/GlassCard';

interface RecapTabProps {
  recapSummaries: QuarterlySummary[];
  submissions: KPISubmission[];
  onRefreshData?: () => void;
}

const QUARTER_MONTHS: Record<string, [string, string, string]> = {
  Q1: ['Januari', 'Februari', 'Maret'],
  Q2: ['April', 'Mei', 'Juni'],
  Q3: ['Juli', 'Agustus', 'September'],
  Q4: ['Oktober', 'November', 'Desember'],
};

export const RecapTab: React.FC<RecapTabProps> = ({
  recapSummaries,
  submissions,
  onRefreshData,
}) => {
  const [selectedQuarter, setSelectedQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q3');
  const monthNames = QUARTER_MONTHS[selectedQuarter] || QUARTER_MONTHS.Q3;

  const filteredSummaries = recapSummaries.filter((s) => s.quarter.includes(selectedQuarter));

  return (
    <GlassCard className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cyan-500/20 pb-4 relative z-10">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-m5-gradient drop-shadow-[0_0_20px_rgba(0,229,255,0.15)] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <span>Rekapitulasi Rata-Rata KPI Triwulan</span>
          </h2>
          <p className="text-xs text-slate-300 font-medium mt-0.5">
            Melihat tren kinerja berjenjang dan rata-rata skor per triwulan (Q1, Q2, Q3, Q4).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Select Quarter */}
          <select
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value as any)}
            className="bg-[#051520] border border-cyan-400/50 rounded-xl px-3 py-2 text-xs font-bold text-cyan-300 focus:outline-none focus:border-cyan-300 cursor-pointer"
          >
            <option value="Q1">Kuartal 1 (Q1)</option>
            <option value="Q2">Kuartal 2 (Q2)</option>
            <option value="Q3">Kuartal 3 (Q3)</option>
            <option value="Q4">Kuartal 4 (Q4)</option>
          </select>

          <button
            onClick={() => exportToExcel(submissions, recapSummaries)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Excel (.xls)</span>
          </button>

          {onRefreshData && (
            <button
              onClick={onRefreshData}
              className="px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto relative z-10">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-cyan-500/20 text-cyan-300 font-bold uppercase text-[11px] tracking-wider">
              <th className="py-3 px-4 whitespace-nowrap">Nama Karyawan</th>
              <th className="py-3 px-4 whitespace-nowrap">Jabatan</th>
              <th className="py-3 px-4 whitespace-nowrap">Triwulan</th>
              <th className="py-3 px-4 text-center whitespace-nowrap">{monthNames[0]}</th>
              <th className="py-3 px-4 text-center whitespace-nowrap">{monthNames[1]}</th>
              <th className="py-3 px-4 text-center whitespace-nowrap">{monthNames[2]}</th>
              <th className="py-3 px-4 text-center whitespace-nowrap">Rata-Rata Skor</th>
              <th className="py-3 px-4 text-center whitespace-nowrap">Grade Triwulan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyan-500/15 font-medium">
            {filteredSummaries.map((sum, idx) => (
              <tr key={idx} className="hover:bg-[#071c2b] transition-colors">
                <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                  {sum.employeeName}
                </td>
                <td className="py-3.5 px-4 text-slate-200 whitespace-nowrap">{sum.positionTitle}</td>
                <td className="py-3.5 px-4 font-semibold text-cyan-300 whitespace-nowrap">
                  {sum.quarter}
                </td>
                <td className="py-3.5 px-4 text-center font-mono text-slate-300 whitespace-nowrap">
                  {sum.month1Score !== undefined ? sum.month1Score : '-'}
                </td>
                <td className="py-3.5 px-4 text-center font-mono text-slate-300 whitespace-nowrap">
                  {sum.month2Score !== undefined ? sum.month2Score : '-'}
                </td>
                <td className="py-3.5 px-4 text-center font-mono text-slate-300 whitespace-nowrap">
                  {sum.month3Score !== undefined ? sum.month3Score : '-'}
                </td>
                <td className="py-3.5 px-4 text-center font-mono font-extrabold text-cyan-300 text-sm whitespace-nowrap">
                  {sum.averageScore}
                </td>
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-400/40 backdrop-blur-md">
                    {sum.quarterlyGrade} ({sum.quarterlyDescription})
                  </span>
                </td>
              </tr>
            ))}

            {filteredSummaries.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                  Belum ada data rekapan triwulan untuk {selectedQuarter}. Data akan otomatis terisi saat pengisian KPI dilakukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
};
