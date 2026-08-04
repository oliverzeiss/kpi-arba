import React from 'react';
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
}) => {
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
                    onChange={(e) =>
                      onUpdateTemplate({ ...template, evaluationCycle: e.target.value as any })
                    }
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
                  <input
                    type="text"
                    value={template.activePeriod}
                    onChange={(e) => onUpdateTemplate({ ...template, activePeriod: e.target.value })}
                    className="bg-[#051520] border border-cyan-400/50 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-bold w-24 text-center focus:outline-none focus:border-cyan-300 font-mono"
                  />
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
                <div
                  key={ind.id}
                  className="p-4 sm:p-5 rounded-2xl bg-[#051520]/80 hover:bg-[#071c2b] border border-cyan-400/30 hover:border-cyan-300 transition duration-300 relative space-y-3 shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-md group"
                >
                  <div className="flex justify-between items-center gap-4">
                    <input
                      type="text"
                      value={ind.title}
                      onChange={(e) => handleUpdateIndicator(ind.id, 'title', e.target.value)}
                      className="w-full bg-[#051520] border border-cyan-400/40 rounded-xl px-3.5 py-2 text-sm font-extrabold text-white placeholder:text-slate-400/80 focus:outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30 transition-all shadow-inner"
                      placeholder="Nama Indikator..."
                    />
                    <button
                      onClick={() => handleDeleteIndicator(ind.id)}
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
                        value={ind.description}
                        onChange={(e) =>
                          handleUpdateIndicator(ind.id, 'description', e.target.value)
                        }
                        className="w-full bg-[#051520] border border-cyan-400/30 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-400/70 focus:outline-none focus:border-cyan-300 transition-all"
                        placeholder="Deskripsi / Penjelasan..."
                      />
                      <input
                        type="text"
                        value={ind.measurementMethod}
                        onChange={(e) =>
                          handleUpdateIndicator(ind.id, 'measurementMethod', e.target.value)
                        }
                        className="w-full bg-[#051520] border border-cyan-400/30 rounded-xl px-3.5 py-2 text-xs text-cyan-300 font-mono placeholder:text-cyan-400/50 focus:outline-none focus:border-cyan-300 transition-all"
                        placeholder="Cara Ukur & Bukti (e.g. Kehadiran %)..."
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
                        value={ind.weight}
                        onChange={(e) =>
                          handleUpdateIndicator(ind.id, 'weight', Number(e.target.value))
                        }
                        className="w-full md:w-32 bg-[#051520] border border-cyan-400/50 rounded-xl px-3 py-2 text-lg font-black text-cyan-300 text-center font-mono focus:outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30 shadow-inner"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-cyan-500/20">
              <button
                onClick={handleAddIndicator}
                className="text-xs font-extrabold text-cyan-300 hover:text-cyan-200 flex items-center gap-1.5 hover:underline cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Tambah Indikator Baru</span>
              </button>

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
