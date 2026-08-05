import React from 'react';
import { Indicator } from '@/types/kpi';
import { Trash2 } from 'lucide-react';

interface IndicatorCardProps {
  indicator: Indicator;
  onUpdate: (id: string, field: keyof Indicator, value: any) => void;
  onDelete: (id: string) => void;
}

export const IndicatorCard: React.FC<IndicatorCardProps> = ({ indicator, onUpdate, onDelete }) => {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#051520]/80 hover:bg-[#071c2b] border border-cyan-400/30 hover:border-cyan-300 transition duration-300 relative space-y-3 shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-md group">
      <div className="flex justify-between items-center gap-4">
        <input
          type="text"
          value={indicator.title}
          onChange={(e) => onUpdate(indicator.id, 'title', e.target.value)}
          className="w-full bg-[#051520] border border-cyan-400/40 rounded-xl px-3.5 py-2 text-sm font-extrabold text-white placeholder:text-slate-400/80 focus:outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30 transition-all shadow-inner"
          placeholder="Nama Indikator..."
        />
        <button
          onClick={() => onDelete(indicator.id)}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer shrink-0"
          title="Hapus Indikator"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div className="md:col-span-3 space-y-2">
          <input
            type="text"
            value={indicator.description}
            onChange={(e) => onUpdate(indicator.id, 'description', e.target.value)}
            className="w-full bg-[#051520] border border-cyan-400/30 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-400/70 focus:outline-none focus:border-cyan-300 transition-all"
            placeholder="Deskripsi / Penjelasan..."
          />
          <input
            type="text"
            value={indicator.measurementMethod}
            onChange={(e) => onUpdate(indicator.id, 'measurementMethod', e.target.value)}
            className="w-full bg-[#051520] border border-cyan-400/30 rounded-xl px-3.5 py-2 text-xs text-cyan-300 font-mono placeholder:text-cyan-400/50 focus:outline-none focus:border-cyan-300 transition-all"
            placeholder="Capaian Target %..."
          />
          <input
            type="text"
            value={indicator.caraUkur || ''}
            onChange={(e) => onUpdate(indicator.id, 'caraUkur', e.target.value)}
            className="w-full bg-[#051520] border border-cyan-400/30 rounded-xl px-3.5 py-2 text-xs text-cyan-300 font-mono placeholder:text-cyan-400/50 focus:outline-none focus:border-cyan-300 transition-all"
            placeholder="Cara Ukur & Bukti..."
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-extrabold text-cyan-300 uppercase tracking-wider block">
            BOBOT (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={indicator.weight !== undefined ? indicator.weight.toString() : '0'}
            onChange={(e) => {
              const raw = e.target.value;
              onUpdate(indicator.id, 'weight', raw === '' ? 0 : Number(raw));
            }}
            className="w-full md:w-32 bg-[#051520] border border-cyan-400/50 rounded-xl px-3 py-2 text-lg font-black text-cyan-300 text-center font-mono focus:outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30 shadow-inner"
          />
        </div>
      </div>
    </div>
  );
};
