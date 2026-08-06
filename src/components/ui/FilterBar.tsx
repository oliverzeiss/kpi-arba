import React from 'react';
import { Filter } from 'lucide-react';

export interface FilterOptions {
  month?: number;
  year?: number;
  divisionName?: string;
  positionId?: string;
  status?: string;
  searchQuery?: string;
}

interface FilterBarProps {
  filters: FilterOptions;
  onChange: (updatedFilters: FilterOptions) => void;
  divisions?: { id: string; name: string }[];
  positions?: { id: string; title: string }[];
  showStatusFilter?: boolean;
  showSearch?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  divisions = [],
  positions = [],
  showStatusFilter = false,
  showSearch = true,
}) => {
  const months = [
    { value: 0, label: 'Semua Bulan' },
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
  ];

  return (
    <div className="p-4 rounded-2xl bg-[#051520]/90 border border-cyan-400/30 flex flex-wrap items-center gap-3 backdrop-blur-md shadow-inner relative z-10">
      <div className="flex items-center gap-2 text-cyan-300 text-xs font-extrabold mr-1">
        <Filter className="w-4 h-4 text-cyan-400" />
        <span>FILTER DATA:</span>
      </div>

      {/* Month Selector */}
      <select
        value={filters.month || 0}
        onChange={(e) => onChange({ ...filters, month: Number(e.target.value) })}
        className="bg-[#061e2b] border border-cyan-400/40 rounded-xl px-3 h-11 text-base sm:text-xs text-cyan-300 font-semibold focus:outline-none focus:border-cyan-300 cursor-pointer"
      >
        {months.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>

      {/* Division Selector */}
      {divisions.length > 0 && (
        <select
          value={filters.divisionName || ''}
          onChange={(e) => onChange({ ...filters, divisionName: e.target.value })}
          className="bg-[#061e2b] border border-cyan-400/40 rounded-xl px-3 h-11 text-base sm:text-xs text-cyan-300 font-semibold focus:outline-none focus:border-cyan-300 cursor-pointer"
        >
          <option value="">Semua Divisi</option>
          {divisions.map((d) => (
            <option key={d.id} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
      )}

      {/* Position Selector */}
      {positions.length > 0 && (
        <select
          value={filters.positionId || ''}
          onChange={(e) => onChange({ ...filters, positionId: e.target.value })}
          className="bg-[#061e2b] border border-cyan-400/40 rounded-xl px-3 h-11 text-base sm:text-xs text-cyan-300 font-semibold focus:outline-none focus:border-cyan-300 cursor-pointer"
        >
          <option value="">Semua Jabatan</option>
          {positions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      )}

      {/* Status Selector */}
      {showStatusFilter && (
        <select
          value={filters.status || ''}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          className="bg-[#061e2b] border border-cyan-400/40 rounded-xl px-3 h-11 text-base sm:text-xs text-cyan-300 font-semibold focus:outline-none focus:border-cyan-300 cursor-pointer"
        >
          <option value="">Semua Status</option>
          <option value="submitted">Submitted 🟡</option>
          <option value="reviewed">Reviewed 🔵</option>
          <option value="approved">Approved 🟢</option>
        </select>
      )}

      {/* Search Input */}
      {showSearch && (
        <input
          type="text"
          placeholder="Cari nama karyawan..."
          value={filters.searchQuery || ''}
          onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
          className="bg-[#061e2b] border border-cyan-400/40 rounded-xl px-3 h-11 text-base sm:text-xs text-white placeholder:text-slate-400/70 focus:outline-none focus:border-cyan-300 font-medium ml-auto min-w-[160px] w-full sm:w-auto"
        />
      )}
    </div>
  );
};
