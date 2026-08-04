import React from 'react';
import { User, Briefcase, Calendar, Lock, ChevronDown } from 'lucide-react';
import { Position } from '@/types/kpi';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface IdentityFormProps {
  employeeName: string;
  onEmployeeNameChange: (val: string) => void;
  selectedPositionId: string;
  onPositionChange: (posId: string) => void;
  positions: Position[];
  activePeriod?: string;
}

export const IdentityForm: React.FC<IdentityFormProps> = ({
  employeeName,
  onEmployeeNameChange,
  selectedPositionId,
  onPositionChange,
  positions,
  activePeriod = 'Juli 2026',
}) => {
  return (
    <GlassCard>
      <SectionHeader
        title="Identitas Penilaian KPI"
        badge="Data Karyawan"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-start relative z-10">
        {/* Input Nama Karyawan */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center justify-between h-7 text-xs sm:text-sm font-bold text-slate-100">
            <span className="flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                Nama Karyawan <span className="text-cyan-400">*</span>
              </span>
            </span>
            <span className="inline-flex items-center justify-center text-[11px] leading-none font-bold px-3 py-1 rounded-full bg-[#051520]/90 border border-cyan-400/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)] backdrop-blur-md shrink-0">
              Wajib Diisi
            </span>
          </label>
          <input
            type="text"
            placeholder="Masukkan Nama Lengkap Anda..."
            value={employeeName}
            onChange={(e) => onEmployeeNameChange(e.target.value)}
            className="w-full h-12 bg-[#051520]/90 hover:bg-[#071c2b] border border-cyan-400/50 hover:border-cyan-300 focus:border-cyan-200 focus:ring-2 focus:ring-cyan-400/30 rounded-full px-5 text-sm text-white placeholder:text-slate-400 focus:outline-none transition-all font-semibold shadow-[0_0_20px_rgba(6,182,212,0.2)] backdrop-blur-md"
          />
        </div>

        {/* Select Jabatan */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center justify-between h-7 text-xs sm:text-sm font-bold text-slate-100">
            <span className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Pilih Jabatan Anda</span>
            </span>
            <span className="inline-flex items-center justify-center text-[11px] leading-none font-bold px-3 py-1 rounded-full bg-[#051520]/90 border border-cyan-400/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)] backdrop-blur-md shrink-0">
              Pilihan
            </span>
          </label>
          <div className="relative group w-full">
            <select
              value={selectedPositionId}
              onChange={(e) => onPositionChange(e.target.value)}
              className="w-full h-12 appearance-none bg-[#051520]/90 hover:bg-[#071c2b] border border-cyan-400/50 hover:border-cyan-300 focus:border-cyan-200 focus:ring-2 focus:ring-cyan-400/30 rounded-full pl-5 pr-12 text-sm text-cyan-300 focus:outline-none transition-all cursor-pointer font-semibold shadow-[0_0_20px_rgba(6,182,212,0.2)] backdrop-blur-md"
            >
              {positions.map((pos) => (
                <option key={pos.id} value={pos.id} className="bg-[#061e2b] text-cyan-300 font-semibold py-2">
                  {pos.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 group-hover:scale-110" />
          </div>
        </div>

        {/* Readonly Periode Penilaian */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center justify-between h-7 text-xs sm:text-sm font-bold text-slate-100">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Periode Penilaian</span>
            </span>
            <span className="inline-flex items-center justify-center text-[11px] leading-none font-bold px-3 py-1 rounded-full bg-[#051520]/90 border border-cyan-400/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)] backdrop-blur-md shrink-0">
              (Terkunci)
            </span>
          </label>
          <div className="w-full h-12 bg-[#051520]/90 border border-cyan-400/50 rounded-full px-5 text-sm font-semibold text-cyan-300 flex items-center justify-between shadow-[0_0_20px_rgba(6,182,212,0.2)] backdrop-blur-md">
            <span>{activePeriod}</span>
            <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
