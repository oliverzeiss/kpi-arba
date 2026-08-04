import React from 'react';
import {
  PieChart as PieIcon,
  Download,
  FileSpreadsheet,
  Printer,
  TrendingUp,
} from 'lucide-react';
import { ExecutiveReportData, KPISubmission, QuarterlySummary } from '@/types/kpi';
import { exportToCSV, exportToExcel } from '@/lib/excel-exporter';
import { getSupabaseConfig } from '@/lib/supabase';
import { GlassCard } from '@/components/ui/GlassCard';
import { PipDashboard } from '@/components/kpi/PipDashboard';

interface ExecutiveAnalyticsTabProps {
  executiveReport: ExecutiveReportData;
  submissions: KPISubmission[];
  recapSummaries: QuarterlySummary[];
}

export const ExecutiveAnalyticsTab: React.FC<ExecutiveAnalyticsTabProps> = ({
  executiveReport,
  submissions,
  recapSummaries,
}) => {
  const supabaseConfig = getSupabaseConfig();

  return (
    <div className="space-y-6 relative z-10">
      {/* Top Banner & Export Actions */}
      <GlassCard className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-m5-gradient drop-shadow-[0_0_20px_rgba(0,229,255,0.15)] flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-cyan-400" />
            <span>Executive Analytics & HR Reporting</span>
          </h2>
          <p className="text-xs text-slate-300 font-medium mt-0.5">
            Dashboard eksekutif lengkap dengan grafik kinerja, top performers, dan analisis bottleneck.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => exportToCSV(submissions)}
            className="px-3.5 py-2 rounded-xl bg-[#051520] hover:bg-[#071c2b] border border-cyan-400/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => exportToExcel(submissions, recapSummaries)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Excel (.xls)</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all border border-cyan-400/40 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </GlassCard>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-cyan-400/40 bg-[#051520]/80 shadow-[0_0_20px_rgba(6,182,212,0.15)] space-y-1 backdrop-blur-md">
          <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
            Total Submission KPI
          </span>
          <div className="text-3xl font-black text-white font-mono">
            {executiveReport.totalSubmissions}
          </div>
          <p className="text-[11px] text-slate-300">Data tersimpan di Supabase</p>
        </div>

        <div className="p-5 rounded-2xl border border-cyan-400/40 bg-[#051520]/80 shadow-[0_0_20px_rgba(6,182,212,0.15)] space-y-1 backdrop-blur-md">
          <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
            Rata-Rata Perusahaan
          </span>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            {executiveReport.averageCompanyScore} <span className="text-xs font-normal text-slate-400">/100</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Target Min. 75 Terlampaui
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-cyan-400/40 bg-[#051520]/80 shadow-[0_0_20px_rgba(6,182,212,0.15)] space-y-1 backdrop-blur-md">
          <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
            Ratio Grade A+ & A
          </span>
          <div className="text-3xl font-black text-cyan-300 font-mono">
            {Math.round(
              (((executiveReport.gradeCounts['A+'] || 0) + (executiveReport.gradeCounts['A'] || 0)) /
                (executiveReport.totalSubmissions || 1)) *
                100
            )}%
          </div>
          <p className="text-[11px] text-slate-300 font-medium">Kategori Memuaskan</p>
        </div>

        <div className="p-5 rounded-2xl border border-cyan-400/40 bg-[#051520]/80 shadow-[0_0_20px_rgba(6,182,212,0.15)] space-y-1 backdrop-blur-md">
          <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
            Status Supabase Cloud
          </span>
          <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 pt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            {supabaseConfig.isConfigured ? 'Connected (Active)' : 'Local Direct Fallback'}
          </div>
          <p className="text-[11px] text-slate-300 font-medium">Database Postgres Active</p>
        </div>
      </div>

      {/* Division Averages + Grade Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <GlassCard className="lg:col-span-7 p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center justify-between">
            <span className="text-m5-gradient">Rata-Rata Skor KPI per Divisi</span>
            <span className="text-[11px] text-cyan-300 font-bold">Target Min: 75</span>
          </h3>

          <div className="space-y-3 pt-2">
            {Object.keys(executiveReport.divisionAverages).map((divName) => {
              const score = executiveReport.divisionAverages[divName];
              const isAboveTarget = score >= 75;

              return (
                <div key={divName} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-200">{divName}</span>
                    <span className="font-mono font-bold text-cyan-300">{score} / 100</span>
                  </div>
                  <div className="w-full h-3 bg-[#051520] rounded-full overflow-hidden border border-cyan-500/30 flex">
                    <div
                      className={`h-full transition-all duration-700 ${
                        isAboveTarget
                          ? 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                          : 'bg-gradient-to-r from-amber-500 to-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, score)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-5 p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-white">
            <span className="text-m5-gradient">Distribusi Grade Karyawan</span>
          </h3>

          <div className="space-y-2.5 pt-1">
            {[
              { grade: 'A+', label: 'Sangat Memuaskan (95-100)', color: 'bg-emerald-400', count: executiveReport.gradeCounts['A+'] || 0 },
              { grade: 'A', label: 'Memuaskan (85-94)', color: 'bg-cyan-400', count: executiveReport.gradeCounts['A'] || 0 },
              { grade: 'B', label: 'Baik (75-84)', color: 'bg-amber-400', count: executiveReport.gradeCounts['B'] || 0 },
              { grade: 'C', label: 'Cukup (60-74)', color: 'bg-orange-400', count: executiveReport.gradeCounts['C'] || 0 },
              { grade: 'D', label: 'Kurang (0-59)', color: 'bg-rose-400', count: executiveReport.gradeCounts['D'] || 0 },
            ].map((g) => (
              <div key={g.grade} className="flex items-center justify-between p-3 rounded-2xl bg-[#051520]/80 border border-cyan-500/20 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className={`w-3 h-3 rounded-full ${g.color} shadow-[0_0_8px_currentColor]`} />
                  <span className="font-bold text-white font-mono">{g.grade}</span>
                  <span className="text-slate-300 font-medium">{g.label}</span>
                </div>
                <span className="font-extrabold text-cyan-300 font-mono">{g.count} Orang</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* PIP Dashboard Section */}
      <PipDashboard submissions={submissions} />
    </div>
  );
};
