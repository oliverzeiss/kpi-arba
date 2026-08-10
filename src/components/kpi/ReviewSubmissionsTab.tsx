import React, { useState } from 'react';
import { Layers, Eye, RefreshCw } from 'lucide-react';
import { KPISubmission, Division, Position, Indicator } from '@/types/kpi';
import { GlassCard } from '@/components/ui/GlassCard';
import { FilterBar, FilterOptions } from '@/components/ui/FilterBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ReviewModal } from '@/components/kpi/ReviewModal';

interface ReviewSubmissionsTabProps {
  submissions: KPISubmission[];
  divisions: Division[];
  positions: Position[];
  indicators: Indicator[];
  onUpdateSubmissionReview: (
    submissionId: string,
    supervisorScores: Record<string, number>,
    reviewerNotes: string,
    status: 'reviewed' | 'approved',
    reviewerName?: string
  ) => void;
  onRefreshData?: () => void;
}

export const ReviewSubmissionsTab: React.FC<ReviewSubmissionsTabProps> = ({
  submissions,
  divisions,
  positions,
  indicators,
  onUpdateSubmissionReview,
  onRefreshData,
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    month: 0,
    divisionName: '',
    positionId: '',
    status: '',
    searchQuery: '',
  });

  const [selectedSubmission, setSelectedSubmission] = useState<KPISubmission | null>(null);
  const [submissionIndicators, setSubmissionIndicators] = useState<Indicator[]>([]);
  const [isLoadingIndicators, setIsLoadingIndicators] = useState(false);

  const handleReviewClick = async (sub: KPISubmission) => {
    setSelectedSubmission(sub);
    setIsLoadingIndicators(true);
    try {
      const res = await fetch(`/api/kpi/master?positionId=${sub.positionId}`);
      if (res.ok) {
        const data = await res.json();
        setSubmissionIndicators(data?.indicators || []);
      } else {
        setSubmissionIndicators([]);
      }
    } catch (e) {
      console.error('Failed to fetch indicators', e);
      setSubmissionIndicators([]);
    } finally {
      setIsLoadingIndicators(false);
    }
  };

  // Apply filters
  const filteredSubmissions = submissions.filter((sub) => {
    if (filters.month && filters.month > 0 && sub.month !== filters.month) return false;
    if (filters.divisionName && sub.divisionName !== filters.divisionName) return false;
    if (filters.positionId && sub.positionId !== filters.positionId) return false;
    
    // Status fallback mapping
    const currentStatus = sub.status || 'submitted';
    if (filters.status && currentStatus !== filters.status) return false;
    if (
      filters.searchQuery &&
      !sub.employeeName.toLowerCase().includes(filters.searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <GlassCard className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cyan-500/20 pb-4 relative z-10">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-sans text-m5-gradient drop-shadow-[0_0_20px_rgba(0,229,255,0.15)] flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Review & Approval Submissions Karyawan</span>
          </h2>
          <p className="text-xs text-slate-300 font-medium mt-1">
            Kelola dan berikan penilaian atasan per indikator secara langsung.
          </p>
        </div>

        {onRefreshData && (
          <button
            onClick={onRefreshData}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Data</span>
          </button>
        )}
      </div>

      {/* Advanced FilterBar */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        divisions={divisions}
        positions={positions}
        showStatusFilter={true}
        showSearch={true}
      />

      {/* Table Submissions */}
      <div className="w-full overflow-x-auto relative z-10">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-cyan-500/20 text-cyan-300 font-bold uppercase text-[11px] tracking-wider">
              <th className="py-3 px-4">Nama Karyawan</th>
              <th className="py-3 px-4">Divisi / Jabatan</th>
              <th className="py-3 px-4 text-center">Periode</th>
              <th className="py-3 px-4 text-center">Self Score</th>
              <th className="py-3 px-4 text-center">Catatan Pencapaian</th>
              <th className="py-3 px-4 text-center">Atasan/Reviewer Score</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Aksi Review</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyan-500/15 font-medium">
            {filteredSubmissions.map((sub) => {
              const finalScoreDisplay = sub.finalTotalScore ?? sub.supervisorTotalScore ?? '-';
              const safeTotalScore = sub.totalScore ?? 0;
              const safeGrade = sub.grade ?? '-';

              return (
                <tr key={sub.id} className="hover:bg-[#071c2b] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                    {sub.employeeName.toUpperCase()}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                    {sub.divisionName} • <span className="text-slate-400">{sub.positionTitle}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-cyan-300 whitespace-nowrap">
                    {sub.period}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-300 whitespace-nowrap">
                    {safeTotalScore} ({safeGrade})
                  </td>
                  <td className="py-3.5 px-4 text-sm text-slate-300 max-w-[200px] truncate" title={sub.achievementNotes || '-'}>
                    {sub.achievementNotes || '-'}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-cyan-300 whitespace-nowrap">
                    {finalScoreDisplay}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <StatusBadge statusOrGrade={sub.status || 'submitted'} type="status" />
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => handleReviewClick(sub)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:text-white text-xs font-bold flex items-center gap-1.5 mx-auto transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Review</span>
                    </button>
                  </td>
                </tr>
              );
            })}

            {filteredSubmissions.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                  Belum ada data submission yang sesuai dengan filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={Boolean(selectedSubmission)}
        submission={selectedSubmission}
        indicators={submissionIndicators}
        onClose={() => {
          setSelectedSubmission(null);
          setSubmissionIndicators([]);
        }}
        onSubmitReview={(id, supScores, notes, status, reviewerName) => {
          onUpdateSubmissionReview(id, supScores, notes, status, reviewerName);
          setSelectedSubmission(null);
          setSubmissionIndicators([]);
        }}
      />
    </GlassCard>
  );
};
