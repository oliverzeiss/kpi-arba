import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Division, Position } from '@/types/kpi';
import { Modal } from '@/components/ui/Modal';

interface PositionModalProps {
  mode: 'add' | 'edit' | 'delete' | null;
  position: Position | null;
  divisions: Division[];
  titleInput: string;
  onTitleInputChange: (val: string) => void;
  divisionIdInput: string;
  onDivisionIdInputChange: (val: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export const PositionModal: React.FC<PositionModalProps> = ({
  mode,
  position,
  divisions,
  titleInput,
  onTitleInputChange,
  divisionIdInput,
  onDivisionIdInputChange,
  onClose,
  onSubmit,
}) => {
  if (!mode) return null;

  if (mode === 'delete' && position) {
    return (
      <Modal isOpen={true} onClose={onClose} title="Konfirmasi Hapus Jabatan" maxWidth="sm" variant="rose">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-rose-400">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <span className="text-xs text-slate-300 leading-relaxed font-medium">
              Apakah Anda yakin ingin menghapus jabatan{' '}
              <span className="font-bold text-cyan-300">{position.title}</span>? Template KPI terkait akan ikut terhapus.
            </span>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-xl bg-slate-800/80 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={onSubmit}
              className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-extrabold text-white shadow-[0_0_15px_rgba(244,63,94,0.3)] cursor-pointer"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  const modalTitle = mode === 'add' ? 'Tambah Jabatan Baru' : 'Edit Jabatan';

  return (
    <Modal isOpen={true} onClose={onClose} title={modalTitle} maxWidth="sm">
      <div className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider block mb-1">
              Pilih Divisi
            </label>
            <select
              value={divisionIdInput}
              onChange={(e) => onDivisionIdInputChange(e.target.value)}
              className="w-full bg-[#051520] border border-cyan-400/50 rounded-xl px-3.5 py-2.5 text-sm text-cyan-300 focus:outline-none focus:border-cyan-300 font-medium cursor-pointer"
            >
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider block mb-1">
              Nama Jabatan
            </label>
            <input
              type="text"
              placeholder="Nama Jabatan..."
              value={titleInput}
              onChange={(e) => onTitleInputChange(e.target.value)}
              className="w-full bg-[#051520] border border-cyan-400/50 rounded-xl px-3.5 py-2.5 text-sm text-cyan-300 focus:outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30 transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="w-1/2 py-2.5 rounded-xl bg-slate-800/80 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={onSubmit}
            className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-extrabold text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
          >
            Simpan
          </button>
        </div>
      </div>
    </Modal>
  );
};
