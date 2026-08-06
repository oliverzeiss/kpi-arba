import React from 'react';
import { AlertTriangle, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { KPISubmission } from '@/types/kpi';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface PipDashboardProps {
  submissions: KPISubmission[];
  companyKpiTarget?: number;
}

export const PipDashboard: React.FC<PipDashboardProps> = ({ submissions, companyKpiTarget = 75 }) => {
  // Filter submissions with grade C or D or final score < target
  const pipSubmissions = submissions.filter((s) => {
    const finalScore = s.finalTotalScore ?? s.supervisorTotalScore ?? s.totalScore;
    const finalGrade = s.finalGrade ?? s.supervisorGrade ?? s.grade;
    return finalGrade === 'C' || finalGrade === 'D' || finalScore < companyKpiTarget;
  });

  const getLowestIndicator = (sub: KPISubmission) => {
    const scores = sub.supervisorScores || sub.scores;
    if (!scores || Object.keys(scores).length === 0) return 'Data Kosong';
    
    let lowestKey = '';
    let lowestScore = Infinity;
    Object.entries(scores).forEach(([key, score]) => {
      if (score < lowestScore) {
        lowestScore = score;
        lowestKey = key;
      }
    });

    // We don't have the template here to map key to name, so we show the key or format it
    // Often keys are 'ind-1', etc.
    if (lowestKey.startsWith('ind-')) {
      return `Indikator ${lowestKey.split('-')[1]} (Skor: ${lowestScore})`;
    }
    return `${lowestKey} (${lowestScore})`;
  };



  return (
    <GlassCard glowColor="rose">
      <div className="flex items-center justify-between border-b border-rose-500/20 pb-3 relative z-10">
        <div className="flex items-center gap-2 text-rose-400 font-extrabold text-sm sm:text-base">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Performance Improvement Plan (PIP) Dashboard</span>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
          {pipSubmissions.length} Karyawan Perlu Pembinaan
        </span>
      </div>

      <div className="w-full overflow-x-auto relative z-10 pt-4">
        {pipSubmissions.length === 0 ? (
          <div className="py-5 text-center text-slate-400 text-xs font-medium border border-dashed border-cyan-500/20 rounded-xl bg-[#051520]/50">
            ✅ Tidak ada karyawan dalam kategori PIP (Semua skor ≥ {companyKpiTarget} / Grade B ke atas).
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-rose-500/20 text-rose-300/80 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4 whitespace-nowrap">Nama Karyawan</th>
                <th className="py-3 px-4 whitespace-nowrap">Divisi & Jabatan</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Skor Final</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Grade</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Titik Terlemah</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Status Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-500/10 font-medium">
              {pipSubmissions.map((sub) => {
                const finalScore = sub.finalTotalScore ?? sub.supervisorTotalScore ?? sub.totalScore;
                const finalGrade = sub.finalGrade ?? sub.supervisorGrade ?? sub.grade;

                return (
                  <tr key={sub.id} className="hover:bg-rose-500/5 transition-colors">
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      {sub.employeeName}
                    </td>
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      {sub.divisionName} • <span className="text-slate-400">{sub.positionTitle}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-extrabold text-rose-400 text-sm whitespace-nowrap">
                      {finalScore}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <StatusBadge statusOrGrade={finalGrade} />
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap text-amber-400 font-semibold text-[11px]">
                      ⚠️ {getLowestIndicator(sub)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.1)]">
                        Wajib Pembinaan 3 Bulan
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </GlassCard>
  );
};
