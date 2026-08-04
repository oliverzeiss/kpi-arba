import React from 'react';

interface StatusBadgeProps {
  statusOrGrade: string;
  type?: 'status' | 'grade';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  statusOrGrade,
  type = 'grade',
}) => {
  if (type === 'status') {
    switch (statusOrGrade.toLowerCase()) {
      case 'approved':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(52,211,153,0.15)]">
            🟢 Approved
          </span>
        );
      case 'reviewed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
            🔵 Reviewed
          </span>
        );
      case 'submitted':
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(251,191,36,0.15)]">
            🟡 Submitted
          </span>
        );
    }
  }

  // Grade badge styling
  switch (statusOrGrade) {
    case 'A+':
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_12px_rgba(52,211,153,0.15)]">
          A+ (Sangat Memuaskan)
        </span>
      );
    case 'A':
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
          A (Memuaskan)
        </span>
      );
    case 'B':
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 shadow-[0_0_12px_rgba(251,191,36,0.15)]">
          B (Baik)
        </span>
      );
    case 'C':
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/30 shadow-[0_0_12px_rgba(251,146,60,0.15)]">
          C (Cukup)
        </span>
      );
    case 'D':
    default:
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.15)]">
          D (Kurang)
        </span>
      );
  }
};
