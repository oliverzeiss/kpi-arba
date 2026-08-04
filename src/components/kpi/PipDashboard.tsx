import React from 'react';
import { AlertTriangle, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { KPISubmission } from '@/types/kpi';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface PipDashboardProps {
  submissions: KPISubmission[];
}

export const PipDashboard: React.FC<PipDashboardProps> = ({ submissions }) => {
  // Filter submissions with grade C or D
  const pipSubmissions = submissions.filter(
    (s) => s.grade === 'C' || s.grade === 'D' || s.totalScore < 75
  );

  return (
    <GlassCard glowColor="rose">
      <div className="flex items-center justify-between border-b border-rose-500/20 pb-3 relative z-10">
        <div className="flex items-center gap-2 text-rose-400 font-extrabold text-sm sm:text-base">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Performance Improvement Plan (PIP)</span>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
          {pipSubmissions.length} Karyawan Perlu Pembinaan
        </span>
      </div>

      <div className="overflow-x-auto relative z-10">
        {pipSubmissions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-medium">
            ✅ Tidak ada karyawan dalam kategori PIP (Semua skor ≥ 75 / Grade B ke atas).
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-cyan-500/20 text-cyan-300 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Nama Karyawan</th>
                <th className="py-3 px-4">Divisi & Jabatan</th>
                <th className="py-3 px-4 text-center">Skor Final</th>
                <th className="py-3 px-4 text-center">Grade</th>
                <th className="py-3 px-4 text-center">Status Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/15 font-medium">
              {pipSubmissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-[#071c2b] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                    {sub.employeeName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                    {sub.divisionName} • <span className="text-slate-400">{sub.positionTitle}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-extrabold text-rose-400 text-sm whitespace-nowrap">
                    {sub.totalScore}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <StatusBadge statusOrGrade={sub.grade} />
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/40">
                      ⚠️ Program Pembinaan Required
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </GlassCard>
  );
};
