import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Database,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Division, Position, KPITemplate, Indicator } from '@/types/kpi';
import { validateTotalWeight } from '@/lib/kpi-calculator';
import { GlassCard } from '@/components/ui/GlassCard';
import { IndicatorCard } from '@/components/kpi/IndicatorCard';

interface MasterBuilderTabProps {
  divisions: Division[];
  positions: Position[];
  selectedPositionId: string;
  onSelectPosition: (posId: string) => void;
  template: KPITemplate | null;
  onUpdateTemplate: (tpl: KPITemplate) => void;
  onSaveTemplate: () => void;
  saveStatus: string | null;
  errorMessage: string | null;
  onOpenAddDivModal: () => void;
  onOpenEditDivModal: (div: Division) => void;
  onOpenDeleteDivModal: (div: Division) => void;
  onOpenAddPosModal: () => void;
  onOpenEditPosModal: (pos: Position) => void;
  onOpenDeletePosModal: (pos: Position) => void;
  onOpenSupabaseModal: () => void;
  onCopyFromPosition?: (posId: string) => void;
}

export const MasterBuilderTab: React.FC<MasterBuilderTabProps> = ({
  divisions,
  positions,
  selectedPositionId,
  onSelectPosition,
  template,
  onUpdateTemplate,
  onSaveTemplate,
  saveStatus,
  errorMessage,
  onOpenAddDivModal,
  onOpenEditDivModal,
  onOpenDeleteDivModal,
  onOpenAddPosModal,
  onOpenEditPosModal,
  onOpenDeletePosModal,
  onOpenSupabaseModal,
  onCopyFromPosition,
}) => {
  const [sourcePosId, setSourcePosId] = useState('');

  const weightValidation = template
    ? validateTotalWeight(template.indicators)
    : { isValid: true, totalWeight: 100 };

  const handleAddIndicator = () => {
    if (!template) return;
    const newInd: Indicator = {
      id: `ind-${Date.now()}`,
      title: 'Indikator Baru',
      description: 'Penjelasan indikator kerja',
      measurementMethod: 'Capaian Target %',
      caraUkur: '',
      weight: 10,
      maxTarget: 100,
      category: 'Target Utama',
    };
    onUpdateTemplate({
      ...template,
      indicators: [...template.indicators, newInd],
    });
  };

  const handleUpdateIndicator = (id: string, field: keyof Indicator, value: any) => {
    if (!template) return;
    const updated = template.indicators.map((ind) => {
      if (ind.id === id) {
        return { ...ind, [field]: value };
      }
      return ind;
    });
    onUpdateTemplate({ ...template, indicators: updated });
  };

  const handleDeleteIndicator = (id: string) => {
    if (!template) return;
    const updated = template.indicators.filter((ind) => ind.id !== id);
    onUpdateTemplate({ ...template, indicators: updated });
  };

  const handleCycleChange = (newCycle: 'Bulanan' | 'Triwulanan' | 'Tahunan') => {
    if (!template) return;
    const currentYear = template.activeYear || new Date().getFullYear();
    if (newCycle === 'Tahunan') {
      onUpdateTemplate({ ...template, evaluationCycle: newCycle, activeYear: currentYear, activeMonth: null, activeQuarter: null, activePeriod: `Tahun ${currentYear}` });
    } else if (newCycle === 'Triwulanan') {
      onUpdateTemplate({ ...template, evaluationCycle: newCycle, activeYear: currentYear, activeQuarter: 'Q1', activeMonth: null, activePeriod: `Q1 ${currentYear}` });
    } else if (newCycle === 'Bulanan') {
      onUpdateTemplate({ ...template, evaluationCycle: newCycle, activeYear: currentYear, activeMonth: 1, activeQuarter: null, activePeriod: `Januari ${currentYear}` });
    }
  };

  const handleUpdateYear = (y: number) => {
    if (!template) return;
    const cycle = template.evaluationCycle;
    let period = '';
    if (cycle === 'Tahunan') period = `Tahun ${y}`;
    else if (cycle === 'Triwulanan') period = `${template.activeQuarter || 'Q1'} ${y}`;
    else {
      const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      period = `${monthNames[(template.activeMonth || 1) - 1]} ${y}`;
    }
    onUpdateTemplate({ ...template, activeYear: y, activePeriod: period });
  };

  const handleUpdateMonth = (m: number) => {
    if (!template) return;
    const y = template.activeYear || new Date().getFullYear();
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    onUpdateTemplate({ ...template, activeMonth: m, activePeriod: `${monthNames[m - 1]} ${y}` });
  };

  const handleUpdateMonthAndYear = (m: number, y: number) => {
    if (!template) return;
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    onUpdateTemplate({ ...template, activeMonth: m, activeYear: y, activePeriod: `${monthNames[m - 1]} ${y}` });
  };

  const handleUpdateQuarter = (q: 'Q1'|'Q2'|'Q3'|'Q4') => {
    if (!template) return;
    const y = template.activeYear || new Date().getFullYear();
    onUpdateTemplate({ ...template, activeQuarter: q, activePeriod: `${q} ${y}` });
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
      {/* Left Sidebar: DAFTAR JABATAN & DIVISI */}
      <aside className="lg:col-span-4 rounded-3xl p-5 space-y-5 border border-cyan-400/50 bg-gradient-to-r from-[#061e2b] via-[#08283a] to-[#061f2c] shadow-[0_12px_50px_rgba(0,0,0,0.8),0_0_50px_rgba(6,182,212,0.25)] relative overflow-hidden h-fit">
        <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/15 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 relative z-10">
          <span className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>DAFTAR JABATAN</span>
          </span>
          <button
            onClick={onOpenAddDivModal}
            className="text-[11px] text-cyan-400 hover:text-cyan-200 font-bold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Divisi</span>
          </button>
        </div>

        {/* List of Divisions & Positions */}
        <div className="space-y-4 relative z-10">
          {divisions.map((div) => {
            const posInDiv = positions.filter((p) => p.divisionId === div.id);

            return (
              <div key={div.id} className="space-y-1.5 group/div">
                <div className="text-[11px] font-bold text-cyan-300/80 uppercase tracking-wider px-2 flex items-center justify-between">
                  <span>{div.name}</span>
                  <div className="opacity-100 sm:opacity-0 sm:group-hover/div:opacity-100 flex items-center gap-1.5 transition-opacity">
                    <button
                      onClick={() => onOpenEditDivModal(div)}
                      className="p-1 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                      title="Edit Divisi"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onOpenDeleteDivModal(div)}
                      className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Hapus Divisi"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 pl-2">
                  {posInDiv.map((pos) => {
                    const isSelected = selectedPositionId === pos.id;

                    return (
                      <div
                        key={pos.id}
                        className={`group/pos w-full rounded-xl text-xs font-semibold transition-all flex items-center justify-between px-3 py-2.5 ${
                          isSelected
                            ? 'bg-[#051520] border border-cyan-400/70 text-cyan-300 shadow-[0_4px_20px_rgba(6,182,212,0.3)]'
                            : 'text-slate-300 hover:text-white hover:bg-[#071c2b]/80 border border-transparent'
                        }`}
                      >
                        <button
                          onClick={() => onSelectPosition(pos.id)}
                          className="w-full text-left truncate flex items-center justify-between mr-2 cursor-pointer"
                        >
                          <span className={isSelected ? 'font-bold text-cyan-300' : 'font-medium'}>
                            {pos.title}
                          </span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] shrink-0" />
                          )}
                        </button>

                        <div className="opacity-100 sm:opacity-0 sm:group-hover/pos:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenEditPosModal(pos);
                            }}
                            className="p-1 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                            title="Edit Jabatan"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenDeletePosModal(pos);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Hapus Jabatan"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-2 pt-2 relative z-10">
          <button
            onClick={onOpenAddPosModal}
            className="w-full py-2.5 px-3 rounded-xl border border-dashed border-cyan-400/40 text-cyan-300 hover:text-white hover:border-cyan-300 hover:bg-cyan-500/10 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.1)]"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Tambah Jabatan Baru</span>
          </button>

          <button
            onClick={onOpenSupabaseModal}
            className="w-full py-2.5 px-3 rounded-xl bg-[#051520]/90 border border-cyan-400/40 text-cyan-300 hover:text-white hover:border-cyan-300 hover:bg-[#071c2b] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-inner"
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Supabase SQL Schema</span>
          </button>
        </div>
      </aside>

      {/* Right Main Area: Builder per Jabatan */}
      <main className="lg:col-span-8 rounded-3xl p-6 space-y-6 border border-cyan-400/50 bg-gradient-to-r from-[#061e2b] via-[#08283a] to-[#061f2c] shadow-[0_12px_50px_rgba(0,0,0,0.8),0_0_50px_rgba(6,182,212,0.25)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-400/20 rounded-full blur-[100px] pointer-events-none" />

        {template ? (
          <div className="relative z-10 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cyan-500/20 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-m5-gradient drop-shadow-[0_0_20px_rgba(0,229,255,0.15)] flex items-center gap-2">
                  <span>Builder: {template.positionTitle}</span>
                </h2>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  Atur indikator dan bobot penilaian khusus untuk jabatan ini.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="space-y-1 text-right">
                  <label className="text-[10px] text-slate-300 block font-bold uppercase tracking-wider">
                    Siklus Evaluasi
                  </label>
                  <select
                    value={template.evaluationCycle}
                    onChange={(e) => handleCycleChange(e.target.value as any)}
                    className="bg-[#051520] border border-cyan-400/50 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-bold focus:outline-none focus:border-cyan-300 cursor-pointer"
                  >
                    <option value="Bulanan">Bulanan</option>
                    <option value="Triwulanan">Triwulanan</option>
                    <option value="Tahunan">Tahunan</option>
                  </select>
                </div>

                <div className="space-y-1 text-right">
                  <label className="text-[10px] text-slate-300 block font-bold uppercase tracking-wider">
                    Periode Aktif
                  </label>
                  {template.evaluationCycle === 'Bulanan' && (
                    <input
                      type="month"
                      value={template.activeYear && template.activeMonth ? `${template.activeYear}-${String(template.activeMonth).padStart(2, '0')}` : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) return;
                        const [y, m] = val.split('-');
                        handleUpdateMonthAndYear(parseInt(m), parseInt(y));
                      }}
                      className="bg-[#051520] border border-cyan-400/50 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-bold w-36 focus:outline-none focus:border-cyan-300 font-mono [color-scheme:dark]"
                    />
                  )}
                  {template.evaluationCycle === 'Tahunan' && (
                    <div className="flex items-center gap-2">
                      <select
                        value={template.activeYear || new Date().getFullYear()}
                        onChange={(e) => handleUpdateYear(parseInt(e.target.value) || new Date().getFullYear())}
                        className="bg-[#051520] border border-cyan-400/50 rounded-xl px-2 py-1.5 text-xs text-cyan-300 font-bold focus:outline-none focus:border-cyan-300 cursor-pointer"
                      >
                        {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {template.evaluationCycle === 'Triwulanan' && (
                    <div className="flex items-center gap-1.5">
                      <select
                        value={template.activeQuarter || 'Q1'}
                        onChange={(e) => handleUpdateQuarter(e.target.value as any)}
                        className="bg-[#051520] border border-cyan-400/50 rounded-xl px-2 py-1.5 text-xs text-cyan-300 font-bold focus:outline-none focus:border-cyan-300 cursor-pointer"
                      >
                        <option value="Q1">Q1</option>
                        <option value="Q2">Q2</option>
                        <option value="Q3">Q3</option>
                        <option value="Q4">Q4</option>
                      </select>
                      <select
                        value={template.activeYear || new Date().getFullYear()}
                        onChange={(e) => handleUpdateYear(parseInt(e.target.value) || new Date().getFullYear())}
                        className="bg-[#051520] border border-cyan-400/50 rounded-xl px-2 py-1.5 text-xs text-cyan-300 font-bold focus:outline-none focus:border-cyan-300 cursor-pointer"
                      >
                        {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <button
                  onClick={onSaveTemplate}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white font-extrabold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.25)] hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4 text-white" />
                  <span>Simpan Template</span>
                </button>
              </div>
            </div>

            {saveStatus && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2.5 backdrop-blur-md">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{saveStatus}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2.5 backdrop-blur-md">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-4">
              {template.indicators.map((ind) => (
                <IndicatorCard 
                  key={ind.id} 
                  indicator={ind} 
                  onUpdate={handleUpdateIndicator} 
                  onDelete={handleDeleteIndicator} 
                />
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-cyan-500/20">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={handleAddIndicator}
                  className="text-xs font-extrabold text-cyan-300 hover:text-cyan-200 flex items-center gap-1.5 hover:underline cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4 text-cyan-400" />
                  <span>Tambah Indikator Baru</span>
                </button>

                {onCopyFromPosition && positions.length > 1 && (
                  <div className="flex items-center gap-2 pl-4 border-l border-cyan-500/30">
                    <select
                      value={sourcePosId}
                      onChange={(e) => setSourcePosId(e.target.value)}
                      className="bg-[#051520] border border-cyan-400/50 rounded-xl px-2 py-1.5 text-[11px] text-cyan-300 font-bold focus:outline-none focus:border-cyan-300 cursor-pointer w-40"
                    >
                      <option value="">Salin dari Jabatan...</option>
                      {positions
                        .filter((p) => p.id !== selectedPositionId)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                    </select>
                    <button
                      onClick={() => {
                        if (sourcePosId) {
                          onCopyFromPosition(sourcePosId);
                          setSourcePosId('');
                        }
                      }}
                      disabled={!sourcePosId}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed border border-cyan-400/40 text-cyan-300 font-bold text-[11px] transition-all cursor-pointer"
                    >
                      Salin
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-300 font-medium">Total Bobot:</span>
                <span
                  className={`text-lg font-black font-mono px-3.5 py-1 rounded-xl ${
                    weightValidation.isValid
                      ? 'bg-cyan-500/10 border border-cyan-400/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                      : 'bg-rose-950/80 border border-rose-500/50 text-rose-400 animate-pulse'
                  }`}
                >
                  {weightValidation.totalWeight}%
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-sm font-medium relative z-10">
            Pilih jabatan di sebelah kiri untuk mengedit template.
          </div>
        )}
      </main>
    </div>
  );
};
