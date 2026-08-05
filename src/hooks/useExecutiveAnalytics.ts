import { useState, useEffect } from 'react';
import { ExecutiveReportData, KPISubmission, Division, Position } from '@/types/kpi';

export function useExecutiveAnalytics() {
  const currentYear = new Date().getFullYear();

  // Filter States
  const [selectedMonth, setSelectedMonth] = useState<number | ''>('');
  const [selectedYear, setSelectedYear] = useState<number | ''>(currentYear);
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [searchEmployee, setSearchEmployee] = useState<string>('');

  // Data States
  const [report, setReport] = useState<ExecutiveReportData | null>(null);
  const [submissions, setSubmissions] = useState<KPISubmission[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [autocompleteNames, setAutocompleteNames] = useState<string[]>([]);
  
  // Loading & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [targetKpi, setTargetKpi] = useState<number>(75);
  const [isUpdatingTarget, setIsUpdatingTarget] = useState(false);

  // Fetch initial master data
  useEffect(() => {
    async function fetchMasterData() {
      try {
        const [divRes, posRes, autoRes] = await Promise.all([
          fetch('/api/divisions'),
          fetch('/api/positions'),
          fetch('/api/employees/autocomplete')
        ]);
        if (divRes.ok) setDivisions(await divRes.json());
        if (posRes.ok) setPositions(await posRes.json());
        if (autoRes.ok) setAutocompleteNames(await autoRes.json());
      } catch (err: any) {
        console.error('Error fetching master data:', err);
      }
    }
    fetchMasterData();
  }, []);

  // Fetch Analytics
  useEffect(() => {
    async function fetchAnalytics() {
      setIsLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams();
        if (selectedMonth) queryParams.set('month', selectedMonth.toString());
        if (selectedYear) queryParams.set('year', selectedYear.toString());
        if (selectedDivision) queryParams.set('divisionName', selectedDivision);
        if (selectedPosition) queryParams.set('positionId', selectedPosition);
        if (searchEmployee) queryParams.set('employeeName', searchEmployee);

        const [reportRes, subsRes] = await Promise.all([
          fetch(`/api/analytics?${queryParams.toString()}&t=${Date.now()}`, { cache: 'no-store' }),
          fetch(`/api/submissions?${queryParams.toString()}&t=${Date.now()}`, { cache: 'no-store' })
        ]);

        if (reportRes.ok) {
          const r = await reportRes.json();
          setReport(r);
          if (r.companyKpiTarget) setTargetKpi(r.companyKpiTarget);
        } else {
          setError('Gagal memuat data analitik.');
        }

        if (subsRes.ok) {
          setSubmissions(await subsRes.json());
        } else {
          setError('Gagal memuat data submissions.');
        }
      } catch (err: any) {
        console.error('Error fetching analytics:', err);
        setError('Terjadi kesalahan jaringan saat memuat data.');
      } finally {
        setIsLoading(false);
      }
    }
    
    const timeoutId = setTimeout(() => {
      fetchAnalytics();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [selectedMonth, selectedYear, selectedDivision, selectedPosition, searchEmployee]);

  const handleUpdateTarget = async (newTarget: number) => {
    setIsUpdatingTarget(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyKpiTarget: newTarget })
      });
      if (res.ok) {
        setTargetKpi(newTarget);
        alert('Target KPI Perusahaan berhasil diperbarui.');
      } else {
        alert('Gagal memperbarui target KPI.');
      }
    } catch (error) {
      console.error('Failed to update target:', error);
      alert('Gagal memperbarui target KPI (Error Jaringan).');
    } finally {
      setIsUpdatingTarget(false);
    }
  };

  const filteredPositions = selectedDivision 
    ? positions.filter(p => divisions.find(d => d.name === selectedDivision)?.id === p.divisionId)
    : positions;

  return {
    states: {
      selectedMonth,
      selectedYear,
      selectedDivision,
      selectedPosition,
      searchEmployee,
      report,
      submissions,
      divisions,
      positions,
      autocompleteNames,
      isLoading,
      error,
      targetKpi,
      isUpdatingTarget,
      filteredPositions,
      currentYear
    },
    actions: {
      setSelectedMonth,
      setSelectedYear,
      setSelectedDivision,
      setSelectedPosition,
      setSearchEmployee,
      setTargetKpi,
      handleUpdateTarget
    }
  };
}
