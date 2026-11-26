import React, { useState } from 'react';
import {
  PieChart as PieIcon,
  Download,
  FileSpreadsheet,
  Printer,
  TrendingUp,
  Search,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { exportToCSV } from '@/lib/excel-exporter';
import { runKpiExcelDownload } from '@/lib/excel-export-client';
import { getSupabaseConfig } from '@/lib/supabase';
import { exportToPDF } from '@/lib/pdf-reporter';
import { GlassCard } from '@/components/ui/GlassCard';
import { PipDashboard } from '@/components/kpi/PipDashboard';
import { useExecutiveAnalytics } from '@/hooks/useExecutiveAnalytics';
import { ExecutiveStatCard } from '@/components/kpi/ExecutiveStatCard';
import { PerformerRow } from '@/components/kpi/PerformerRow';

export const ExecutiveAnalyticsTab: React.FC = () => {
  const supabaseConfig = getSupabaseConfig();
  const [isExporting, setIsExporting] = useState(false);

  const {
    states: {
      selectedMonth,
      selectedYear,
      selectedDivision,
      selectedPosition,
      searchEmployee,
      report,
      submissions,
      divisions,
      templates,
      templatesLoaded,
      isLoading,
      error,
      targetKpi,
      isUpdatingTarget,
      filteredPositions,
      currentYear,
      autocompleteNames
    },
    actions: {
      setSelectedMonth,
      setSelectedYear,
      setSelectedDivision,
      setSelectedPosition,
      setSearchEmployee,
      setTargetKpi,
      handleUpdateTarget,
      refreshTemplates
    }
  } = useExecutiveAnalytics();

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      await runKpiExcelDownload({
        submissions,
        templates: templatesLoaded ? templates : undefined,
        ensureTemplates: refreshTemplates,
        report,
        companyKpiTarget: targetKpi,
      });
    } catch (err: any) {
      alert(err?.message || 'Gagal mengekspor laporan Excel.');
    } finally {
      setIsExporting(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Gagal Memuat Data</h3>
        <p className="text-slate-400">{error}</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="ml-3 text-cyan-300 font-medium">Memuat Analytics...</span>
      </div>
    );
  }

  // Chart Data preparation
  const pieData = [
    { name: 'A+ (Sangat Memuaskan)', value: report.gradeCounts['A+'] || 0, color: '#34d399' },
    { name: 'A (Memuaskan)', value: report.gradeCounts['A'] || 0, color: '#22d3ee' },
    { name: 'B (Baik)', value: report.gradeCounts['B'] || 0, color: '#fbbf24' },
    { name: 'C (Cukup)', value: report.gradeCounts['C'] || 0, color: '#fb923c' },
    { name: 'D (Kurang)', value: report.gradeCounts['D'] || 0, color: '#fb7185' },
  ].filter(d => d.value > 0);

  const barData = Object.keys(report.divisionAverages).map(div => ({
    name: div,
    score: report.divisionAverages[div],
    fill: report.divisionAverages[div] >= (report.companyKpiTarget || 75) ? '#34d399' : '#fb7185'
  })).sort((a, b) => b.score - a.score);

  const trendData = (report.monthlyTrend || []).map(t => ({
    name: `Bulan ${t.month}`,
    score: t.averageScore,
  }));

  const totalUniqueParticipants = new Set(submissions.map(s => s.employeeName)).size;
  const activeDivisions = report.divisionCompletions.filter(d => d.completedCount > 0).length;
  const totalDivisions = report.divisionCompletions.length;

  // Nested Performers Logic
  let currentTopPerformers = report.topPerformers?.all || [];
  let currentBottomPerformers = report.bottomPerformers?.all || [];

  if (selectedPosition && report.topPerformers?.byPosition?.[selectedPosition]) {
    currentTopPerformers = report.topPerformers.byPosition[selectedPosition];
    currentBottomPerformers = report.bottomPerformers.byPosition[selectedPosition];
  } else if (selectedDivision && report.topPerformers?.byDivision?.[selectedDivision]) {
    currentTopPerformers = report.topPerformers.byDivision[selectedDivision];
    currentBottomPerformers = report.bottomPerformers.byDivision[selectedDivision];
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#051520]/90 border border-cyan-500/30 p-3 rounded-xl shadow-xl backdrop-blur-md">
          <p className="text-white text-xs font-bold mb-1">{payload[0].name || payload[0].payload.name}</p>
          <p className="text-cyan-300 font-mono text-sm font-extrabold">{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  const generateAISummary = () => {
    if (!report) return "";
    let summary = `Performa bulan ini berada di angka ${report.averageCompanyScore}. `;
    
    if (searchEmployee) {
      summary = `Menampilkan data khusus karyawan: ${searchEmployee}. Rata-rata skor tercatat ${report.averageCompanyScore}. `;
      const count = report.monthlyTrend?.length;
      if (count > 1) {
        const last = report.monthlyTrend[count-1].averageScore;
        const prev = report.monthlyTrend[count-2].averageScore;
        if (last > prev) summary += `Terjadi tren kenaikan dibanding bulan sebelumnya. `;
        else if (last < prev) summary += `Terdapat penurunan kinerja dibanding bulan sebelumnya. `;
        else summary += `Kinerja stabil. `;
      }
      return summary;
    }

    if (report.averageCompanyScore >= targetKpi) {
      summary += `Target perusahaan (${targetKpi}) berhasil terlampaui dengan memuaskan. `;
    } else {
      summary += `Kinerja saat ini masih di bawah target perusahaan (${targetKpi}). `;
    }
    
    if (report.topPerformers?.all?.length > 0) {
      summary += `Divisi dengan performa tertinggi adalah ${report.topPerformers.all[0].divisionName}. `;
    }
    
    const pipCount = submissions.filter(s => (s.finalTotalScore ?? s.supervisorTotalScore ?? s.totalScore) < targetKpi).length;
    if (pipCount > 0) {
      summary += `Terdapat ${pipCount} karyawan yang masuk dalam zona PIP dan perlu evaluasi.`;
    }
    return summary;
  };

  return (
    <div className="space-y-6 relative z-10">
      <GlassCard className="p-4 bg-gradient-to-r from-cyan-900/40 to-[#051520] border-l-4 border-l-cyan-400">
        <h3 className="text-xs font-bold text-cyan-300 uppercase mb-1 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> AI Executive Summary
        </h3>
        <p className="text-sm text-slate-200 leading-relaxed font-medium">
          {generateAISummary()}
        </p>
      </GlassCard>

      <GlassCard className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-m5-gradient drop-shadow-[0_0_20px_rgba(0,229,255,0.15)] flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-cyan-400" />
            <span>Executive Analytics & HR Reporting</span>
          </h2>
          <p className="text-xs text-slate-300 font-medium mt-0.5">
            Dashboard eksekutif lengkap dengan multi-dimensi filter data.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Target KPI:</span>
            <input 
              type="number" 
              value={targetKpi}
              onChange={(e) => setTargetKpi(Number(e.target.value))}
              className="w-16 bg-[#051520] border border-cyan-500/30 rounded px-2 py-1 text-xs text-white font-mono"
            />
            <button 
              onClick={() => handleUpdateTarget(targetKpi)}
              disabled={isUpdatingTarget}
              className="px-3 py-1 bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold rounded hover:bg-cyan-600/40"
            >
              Update
            </button>
          </div>
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
            onClick={handleExportExcel}
            disabled={isExporting}
            className={`px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer ${isExporting ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            <span>{isExporting ? 'Menyiapkan Excel...' : 'Download Excel (.xlsx)'}</span>
          </button>

          <button
            onClick={() => exportToPDF(report, submissions)}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all border border-cyan-400/40 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </GlassCard>

      <GlassCard className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-[#051520]/60">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value ? Number(e.target.value) : '')}
          className="bg-[#051520] border border-cyan-500/30 rounded-xl px-3 py-2 text-xs font-bold text-cyan-300 focus:outline-none focus:border-cyan-300 w-full"
        >
          <option value="">Semua Bulan</option>
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i+1} value={i+1}>Bulan {i+1}</option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : '')}
          className="bg-[#051520] border border-cyan-500/30 rounded-xl px-3 py-2 text-xs font-bold text-cyan-300 focus:outline-none focus:border-cyan-300 w-full"
        >
          <option value="">Semua Tahun</option>
          {[currentYear - 1, currentYear, currentYear + 1].map((yr) => (
            <option key={yr} value={yr}>{yr}</option>
          ))}
        </select>

        <select
          value={selectedDivision}
          onChange={(e) => {
            setSelectedDivision(e.target.value);
            setSelectedPosition('');
          }}
          className="bg-[#051520] border border-cyan-500/30 rounded-xl px-3 py-2 text-xs font-bold text-cyan-300 focus:outline-none focus:border-cyan-300 w-full"
        >
          <option value="">Semua Divisi</option>
          {divisions.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
        </select>

        <select
          value={selectedPosition}
          onChange={(e) => setSelectedPosition(e.target.value)}
          className="bg-[#051520] border border-cyan-500/30 rounded-xl px-3 py-2 text-xs font-bold text-cyan-300 focus:outline-none focus:border-cyan-300 w-full"
        >
          <option value="">Semua Jabatan</option>
          {filteredPositions.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>

        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500/50" />
          <input
            type="text"
            list="employeeNamesList"
            value={searchEmployee}
            onChange={(e) => setSearchEmployee(e.target.value)}
            placeholder="Cari Karyawan..."
            className="w-full bg-[#051520] border border-cyan-500/30 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-cyan-300 focus:outline-none focus:border-cyan-300 placeholder-cyan-500/50"
          />
          <datalist id="employeeNamesList">
            {autocompleteNames.map((name, i) => <option key={i} value={name} />)}
          </datalist>
        </div>
      </GlassCard>

      {/* Loading Overlay State for Cards & Charts */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 text-cyan-500 animate-spin mr-2" />
          <span className="text-xs text-cyan-400">Menyegarkan data...</span>
        </div>
      )}

      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
        <ExecutiveStatCard 
          title="Total Submission KPI" 
          value={report.totalSubmissions} 
          subtitle="Data tersimpan di Supabase" 
        />
        <ExecutiveStatCard 
          title="Rata-Rata Perusahaan" 
          valueNode={<div className="text-2xl font-black text-emerald-400 font-mono">{report.averageCompanyScore} <span className="text-xs font-normal text-slate-400">/100</span></div>}
          subtitleNode={<p className={`text-xs font-semibold flex items-center gap-1 ${report.averageCompanyScore >= targetKpi ? 'text-emerald-400' : 'text-rose-400'}`}><TrendingUp className="w-3.5 h-3.5" /> {report.averageCompanyScore >= targetKpi ? `Target ${targetKpi} Terlampaui` : `Di bawah Target ${targetKpi}`}</p>}
        />
        <ExecutiveStatCard 
          title="Ratio Grade A+ & A" 
          value={`${Math.round((((report.gradeCounts['A+'] || 0) + (report.gradeCounts['A'] || 0)) / (report.totalSubmissions || 1)) * 100) || 0}%`}
          subtitle="Kategori Memuaskan"
        />
        <ExecutiveStatCard 
          title="Status Supabase Cloud" 
          valueNode={<div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 pt-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />{supabaseConfig.isConfigured ? 'Connected (Active)' : 'Local Direct Fallback'}</div>}
          subtitle="Database Postgres Active"
        />
        <ExecutiveStatCard 
          title="Total Karyawan Dinilai" 
          value={`${totalUniqueParticipants}`}
          subtitle={`${activeDivisions} dari ${totalDivisions} Divisi berpartisipasi`}
        />
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
        <GlassCard className="lg:col-span-7 p-5 space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center justify-between">
            <span className="text-m5-gradient">Rata-Rata Skor KPI per Divisi</span>
            <span className="text-xs text-cyan-300 font-bold">Target: {targetKpi}</span>
          </h3>

          <div className="h-[250px] w-full pt-4">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#06b6d4" strokeOpacity={0.15} />
                  <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={10} tickFormatter={(v) => `${v}`} />
                  <YAxis type="category" dataKey="name" stroke="#cbd5e1" fontSize={10} fontWeight="bold" width={80} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(6,182,212,0.05)' }} />
                  <Bar 
                    dataKey="score" 
                    radius={[0, 4, 4, 0]} 
                    barSize={20}
                    onClick={(data) => {
                      if (data && data.name) {
                        setSelectedDivision(data.name);
                        setSelectedPosition('');
                        setSearchEmployee('');
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Belum ada data untuk filter ini.</div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-5 p-5 space-y-4">
          <h3 className="text-sm font-extrabold text-white">
            <span className="text-m5-gradient">Distribusi Grade Karyawan</span>
          </h3>

          <div className="h-[250px] w-full relative">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Belum ada data untuk filter ini.</div>
            )}
            
            {pieData.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-white font-mono">{report.totalSubmissions}</span>
                <span className="text-[10px] font-bold text-cyan-300">Total</span>
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-12 p-5 space-y-4">
          <h3 className="text-sm font-extrabold text-white">
            <span className="text-m5-gradient">
              Tren Kinerja (Month-over-Month) 
              {searchEmployee ? ` - Karyawan: ${searchEmployee}` : 
               selectedPosition ? ` - Jabatan` : 
               selectedDivision ? ` - Divisi ${selectedDivision}` : 
               ` - Perusahaan`}
            </span>
          </h3>
          <div className="h-[250px] w-full pt-4">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#06b6d4" strokeOpacity={0.15} />
                  <XAxis dataKey="name" stroke="#cbd5e1" fontSize={10} fontWeight="bold" />
                  <YAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="score" stroke="#34d399" strokeWidth={3} dot={{ fill: '#34d399', r: 4 }} activeDot={{ r: 6, fill: '#fff', stroke: '#34d399', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Belum ada data trend bulanan.</div>
            )}
          </div>
        </GlassCard>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
        <GlassCard className="p-5">
          <h3 className="text-sm font-extrabold text-white mb-4">
            <span className="text-m5-gradient">Top 3 Performers {selectedPosition ? '(Jabatan)' : selectedDivision ? '(Divisi)' : '(Perusahaan)'}</span>
          </h3>
          <div className="space-y-3">
            {currentTopPerformers.map((p, i) => (
              <PerformerRow key={p.id || i} performer={p} type="top" />
            ))}
            {currentTopPerformers.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Belum ada data untuk filter ini.</p>}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-sm font-extrabold text-white mb-4">
            <span className="text-m5-gradient">Bottom 3 Performers {selectedPosition ? '(Jabatan)' : selectedDivision ? '(Divisi)' : '(Perusahaan)'}</span>
          </h3>
          <div className="space-y-3">
            {currentBottomPerformers.map((p, i) => (
              <PerformerRow key={p.id || i} performer={p} type="bottom" />
            ))}
            {currentBottomPerformers.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Belum ada data untuk filter ini.</p>}
          </div>
        </GlassCard>
      </div>

      <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
        <PipDashboard submissions={submissions} companyKpiTarget={targetKpi} />
      </div>
    </div>
  );
};
