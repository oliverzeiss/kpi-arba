import React from 'react';
import { Target } from 'lucide-react';
import { Indicator } from '@/types/kpi';
import { calculateGrade } from '@/lib/kpi-calculator';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface ScoreModalProps {
  indicator: Indicator | null;
  currentScore: number;
  newScoreInput: string;
  onScoreInputChange: (val: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export const ScoreModal: React.FC<ScoreModalProps> = ({
  indicator,
  currentScore,
  newScoreInput,
  onScoreInputChange,
  onSave,
  onClose,
}) => {
  if (!indicator) return null;

  const numericScore = newScoreInput === '' ? 0 : Number(newScoreInput);
  const currentPreviewGrade = calculateGrade(numericScore);

  return (
    <Modal isOpen={Boolean(indicator)} onClose={onClose} title="Evaluasi Mandiri KPI">
      <div className="space-y-6">
        <div>
          <h4 className="text-base font-bold text-cyan-300 flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <span>{indicator.title}</span>
          </h4>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-[#051520]/80 border border-cyan-500/20 space-y-4">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1.5">
              PENJELASAN INDIKATOR
            </span>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {indicator.description || 'Deskripsi indikator penilaian kerja.'}
            </p>
          </div>

          <div className="pt-3.5 mt-3 border-t border-cyan-500/20">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1.5">
              CARA UKUR & BUKTI
            </span>
            <p className="text-sm text-white font-semibold">
              {indicator.measurementMethod || 'Kehadiran % / Capaian Target'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 py-4 px-3 sm:px-5 rounded-2xl bg-[#051520]/90 border border-cyan-400/30 text-center divide-x divide-cyan-500/20 shadow-inner">
          <div>
            <span className="text-xs text-cyan-300/80 font-bold uppercase block mb-1 tracking-wide">
              TARGET MAKS
            </span>
            <span className="text-lg font-extrabold text-white mt-1 block font-mono">
              {indicator.maxTarget || 100}
            </span>
          </div>
          <div>
            <span className="text-xs text-cyan-300/80 font-bold uppercase block mb-1 tracking-wide">
              BOBOT
            </span>
            <span className="text-lg font-extrabold text-cyan-300 mt-1 block font-mono">
              {indicator.weight}%
            </span>
          </div>
          <div>
            <span className="text-xs text-cyan-300/80 font-bold uppercase block mb-1 tracking-wide">
              SKOR SAAT INI
            </span>
            <span className="text-lg font-extrabold text-cyan-400 mt-1 block font-mono">
              {currentScore}
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-white">Masukkan Capaian Baru</label>
            <StatusBadge statusOrGrade={currentPreviewGrade.grade} />
          </div>
          <div className="relative flex items-center">
            <input
              type="number"
              min="0"
              max="100"
              value={newScoreInput}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === '') {
                  onScoreInputChange('');
                  return;
                }
                const cleaned = raw.replace(/^0+(?=\d)/, '');
                const num = Number(cleaned);
                if (!isNaN(num) && num <= 100) {
                  onScoreInputChange(cleaned);
                }
              }}
              className="w-full bg-[#051520] border border-cyan-400/40 rounded-2xl pl-4 pr-14 py-3.5 text-xl font-extrabold text-cyan-300 focus:outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30 transition-all font-mono shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-4 text-base font-bold text-cyan-400/70 font-mono pointer-events-none">
              /100
            </span>
          </div>
        </div>

        <button
          onClick={onSave}
          className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-base tracking-wide transition-all shadow-[0_0_25px_rgba(6,182,212,0.45)] active:scale-95 cursor-pointer"
        >
          Simpan Capaian
        </button>
      </div>
    </Modal>
  );
};
