import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';

interface AchievementNotesProps {
  value: string;
  onChange: (val: string) => void;
}

export const AchievementNotes: React.FC<AchievementNotesProps> = ({
  value,
  onChange,
}) => {
  return (
    <GlassCard>
      <div className="space-y-3.5 relative z-10">
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-none text-m5-gradient drop-shadow-[0_0_20px_rgba(0,229,255,0.15)]">
            Catatan Pencapaian
          </h2>
          <span className="inline-flex items-center justify-center leading-none px-3.5 py-1.5 rounded-full text-xs font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.2)] backdrop-blur-md shrink-0 select-none">
            (Opsional)
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 font-medium">
          Berikan penjelasan singkat terkait skor yang Anda berikan di atas (jika ada)
        </p>

        <textarea
          rows={3}
          placeholder="Contoh: Berhasil menyelesaikan integrasi modul utama 100% tepat waktu, menjaga kualitas kode tanpa bug kritis, dan mencapai target performa..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[100px] bg-[#051520]/90 hover:bg-[#071c2b] border border-cyan-400/50 hover:border-cyan-300 focus:border-cyan-200 focus:ring-2 focus:ring-cyan-400/30 rounded-2xl p-4 text-sm text-white placeholder:text-slate-400 focus:outline-none transition-all font-medium shadow-[0_0_20px_rgba(6,182,212,0.2)] backdrop-blur-md resize-y"
        />
      </div>
    </GlassCard>
  );
};
