import React from 'react';

interface Performer {
  id?: string | number;
  employeeName: string;
  divisionName: string;
  positionTitle: string;
  finalTotalScore?: number;
  supervisorTotalScore?: number;
  totalScore?: number;
  finalGrade?: string;
  supervisorGrade?: string;
  grade?: string;
}

interface PerformerRowProps {
  performer: Performer;
  type: 'top' | 'bottom';
}

export const PerformerRow: React.FC<PerformerRowProps> = ({ performer: p, type }) => (
  <div className={`flex justify-between items-center p-3 rounded-xl bg-[#051520]/50 border shadow-sm ${type === 'top' ? 'border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.05)]' : 'border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.05)]'}`}>
    <div>
      <p className="text-sm font-bold text-white">{p.employeeName}</p>
      <p className={`text-xs ${type === 'top' ? 'text-emerald-300' : 'text-rose-300'}`}>{p.divisionName} • {p.positionTitle}</p>
    </div>
    <div className="text-right">
      <p className={`text-sm font-mono font-bold ${type === 'top' ? 'text-emerald-400' : 'text-rose-400'}`}>{p.finalTotalScore ?? p.supervisorTotalScore ?? p.totalScore}</p>
      <p className="text-xs text-slate-400">{p.finalGrade ?? p.supervisorGrade ?? p.grade}</p>
    </div>
  </div>
);
