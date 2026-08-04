import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2, Save } from 'lucide-react';
import { KPISubmission, Indicator } from '@/types/kpi';
import { calculateTotalScore, calculateGrade } from '@/lib/kpi-calculator';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface ReviewModalProps {
  submission: KPISubmission | null;
  indicators: Indicator[];
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (
    submissionId: string,
    supervisorScores: Record<string, number>,
    reviewerNotes: string,
    status: 'reviewed' | 'approved'
  ) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  submission,
  indicators,
  isOpen,
  onClose,
  onSubmitReview,
}) => {
  const [supervisorScores, setSupervisorScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (submission) {
      // Pre-fill supervisor scores if already filled, or copy selfScores as default
      const initial: Record<string, number> = {};
      indicators.forEach((ind) => {
        if (submission.supervisorScores && submission.supervisorScores[ind.id] !== undefined) {
          initial[ind.id] = submission.supervisorScores[ind.id];
        } else if (submission.scores && submission.scores[ind.id] !== undefined) {
          initial[ind.id] = submission.scores[ind.id];
        } else {
          initial[ind.id] = 85;
        }
      });
      setSupervisorScores(initial);
      setNotes(submission.reviewerNotes || '');
    }
  }, [submission, indicators]);

  if (!submission || !isOpen) return null;

  const currentSupervisorTotal = calculateTotalScore(supervisorScores, indicators);
  const currentSupervisorGrade = calculateGrade(currentSupervisorTotal);
  const selfTotal = submission.totalScore;

  const handleScoreChange = (indicatorId: string, val: number) => {
    const clamped = Math.max(0, Math.min(100, val));
    setSupervisorScores((prev) => ({ ...prev, [indicatorId]: clamped }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Penilaian KPI Karyawan" maxWidth="2xl">
      <div className="space-y-5">
        {/* Header Summary info */}
        <div className="p-4 rounded-2xl bg-[#051520] border border-cyan-400/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h4 className="text-base font-extrabold text-white">{submission.employeeName}</h4>
            <p className="text-xs text-cyan-300 font-medium">
              {submission.divisionName} • {submission.positionTitle} | Periode: {submission.period}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 font-medium">Status:</span>
            <StatusBadge statusOrGrade={submission.status || 'submitted'} type="status" />
          </div>
        </div>

        {/* Indicator Dual-Scoring Table */}
        <div className="space-y-3">
          <label className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider block">
            PENILAIAN PER INDIKATOR (SELF VS ATASAN)
          </label>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {indicators.map((ind, idx) => {
              const selfScore = submission.scores ? submission.scores[ind.id] ?? 80 : 80;
              const supScore = supervisorScores[ind.id] !== undefined ? supervisorScores[ind.id] : selfScore;
              const gap = supScore - selfScore;

              return (
                <div
                  key={ind.id}
                  className="p-3.5 rounded-xl bg-[#051520]/90 border border-cyan-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-white block truncate">
                      {idx + 1}. {ind.title} ({ind.weight}%)
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {ind.measurementMethod}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Self score (Readonly) */}
                    <div className="text-center">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Self</span>
                      <span className="text-xs font-mono font-bold text-slate-200 bg-[#061e2b] px-2.5 py-1 rounded-lg border border-slate-700 block">
                        {selfScore}
                      </span>
                    </div>

                    {/* Supervisor input score */}
                    <div className="text-center">
                      <span className="text-[10px] text-cyan-300 block font-semibold uppercase">Atasan</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={supScore}
                        onChange={(e) => handleScoreChange(ind.id, Number(e.target.value))}
                        className="w-16 bg-[#061e2b] border border-cyan-400/50 rounded-lg py-1 text-center text-xs font-mono font-extrabold text-cyan-300 focus:outline-none focus:border-cyan-300"
                      />
                    </div>

                    {/* Gap badge */}
                    <div className="text-center min-w-[50px]">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Gap</span>
                      <span
                        className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded-md block ${
                          gap > 0
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : gap < 0
                            ? 'text-rose-400 bg-rose-500/10'
                            : 'text-slate-400 bg-slate-800'
                        }`}
                      >
                        {gap > 0 ? `+${gap}` : gap}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Score Comparison Banner */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#051520] border border-cyan-400/40 text-center font-mono">
          <div>
            <span className="text-[11px] text-slate-400 font-bold block uppercase">Skor Self-Assessment</span>
            <span className="text-xl font-black text-slate-200">{selfTotal}</span>
          </div>
          <div>
            <span className="text-[11px] text-cyan-300 font-bold block uppercase">Skor Final Atasan</span>
            <span className="text-xl font-black text-cyan-300">{currentSupervisorTotal}</span>
            <span className="text-xs font-bold text-cyan-400 block mt-0.5 font-sans">
              ({currentSupervisorGrade.grade} - {currentSupervisorGrade.description})
            </span>
          </div>
        </div>

        {/* Catatan Reviewer */}
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider block">
            CATATAN / FEEDBACK REVIEWER
          </label>
          <textarea
            rows={2}
            placeholder="Masukkan umpan balik atau instruksi perbaikan..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-[#051520] border border-cyan-400/40 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-300 font-medium"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onSubmitReview(submission.id, supervisorScores, notes, 'reviewed')}
            className="w-1/2 py-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Review (Reviewed 🔵)</span>
          </button>
          <button
            onClick={() => onSubmitReview(submission.id, supervisorScores, notes, 'approved')}
            className="w-1/2 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve & Finalize (Approved 🟢)</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
