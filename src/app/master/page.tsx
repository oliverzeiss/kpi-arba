'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Lock,
  ChevronLeft,
  Layers,
  BarChart3,
  PieChart as PieIcon,
  CheckCircle2,
  Database,
} from 'lucide-react';
import {
  Division,
  Position,
  KPITemplate,
  QuarterlySummary,
  KPISubmission,
} from '@/types/kpi';
import { getSupabaseConfig, SUPABASE_SQL_SCHEMA } from '@/lib/supabase';

import { PinAuthScreen } from '@/components/kpi/PinAuthScreen';
import { MasterBuilderTab } from '@/components/kpi/MasterBuilderTab';
import { RecapTab } from '@/components/kpi/RecapTab';
import { ExecutiveAnalyticsTab } from '@/components/kpi/ExecutiveAnalyticsTab';
import { ReviewSubmissionsTab } from '@/components/kpi/ReviewSubmissionsTab';
import { DivisionModal } from '@/components/kpi/DivisionModal';
import { PositionModal } from '@/components/kpi/PositionModal';
import { Modal } from '@/components/ui/Modal';

export default function MasterTemplatePage() {
  // Passcode Auth State
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Master Data State
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [submissions, setSubmissions] = useState<KPISubmission[]>([]);
  const [selectedPositionId, setSelectedPositionId] = useState<string>('pos-3'); // Default Admin IT

  // Current Template Editing State
  const [template, setTemplate] = useState<KPITemplate | null>(null);

  // Modals for CRUD Div/Pos & Supabase Schema
  const [divModalMode, setDivModalMode] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);
  const [divNameInput, setDivNameInput] = useState('');

  const [posModalMode, setPosModalMode] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [posTitleInput, setPosTitleInput] = useState('');
  const [posDivIdInput, setPosDivIdInput] = useState('');

  const [showSupabaseModal, setShowSupabaseModal] = useState(false);

  // Active Tab: 'builder' | 'review' | 'recap' | 'analytics'
  const [activeTab, setActiveTab] = useState<'builder' | 'review' | 'recap' | 'analytics'>('builder');
  const [recapSummaries, setRecapSummaries] = useState<QuarterlySummary[]>([]);

  // Status Messages
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto verify passcode from sessionStorage if saved
  useEffect(() => {
    const savedPin = sessionStorage.getItem('kpi_admin_pin');
    if (savedPin) {
      verifyPasscode(savedPin);
    }
  }, []);

  const verifyPasscode = async (pinToTest: string) => {
    try {
      const res = await fetch('/api/kpi/master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'VERIFY_PASSCODE',
          passcode: pinToTest,
        }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        setPasscode(pinToTest);
        sessionStorage.setItem('kpi_admin_pin', pinToTest);
        fetchMasterData();
      } else {
        setAuthError('Passcode 6-Digit Admin Salah!');
      }
    } catch (err) {
      setAuthError('Gagal memverifikasi passcode.');
    }
  };

  const fetchMasterData = () => {
    fetch('/api/kpi/master')
      .then((res) => res.json())
      .then((data) => {
        if (data.divisions) setDivisions(data.divisions);
        if (data.positions) setPositions(data.positions);
      })
      .catch(console.error);

    fetchSubmissionsData();
  };

  const fetchSubmissionsData = () => {
    fetch(`/api/submissions?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSubmissions(data);
        } else if (data.submissions) {
          setSubmissions(data.submissions);
        }
      })
      .catch(console.error);
  };

  // Fetch current template whenever selected position changes
  useEffect(() => {
    if (!isAuthenticated || !selectedPositionId) return;

    fetch(`/api/kpi/master?positionId=${selectedPositionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          setTemplate(data);
        } else {
          // If no template exists for this position, create a blank one
          const pos = positions.find((p) => p.id === selectedPositionId);
          const div = divisions.find((d) => d.id === pos?.divisionId);
          setTemplate({
            id: `tpl-${selectedPositionId}-${Date.now()}`,
            positionId: selectedPositionId,
            positionTitle: pos?.title || 'Jabatan Baru',
            divisionName: div?.name || 'Divisi',
            evaluationCycle: 'Bulanan',
            activePeriod: 'Juli 2026',
            activeYear: 2026,
            activeMonth: 7,
            activeQuarter: 'Q3',
            indicators: [],
            updatedAt: new Date().toISOString(),
          });
        }
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, selectedPositionId]);

  // Fetch Quarterly Recap
  const fetchQuarterlyRecap = () => {
    fetch(`/api/kpi/recap?type=quarterly_recap&t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.summaries) setRecapSummaries(data.summaries);
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (activeTab === 'recap' || activeTab === 'analytics' || activeTab === 'review') {
      fetchQuarterlyRecap();
      fetchSubmissionsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // (ExecutiveAnalyticsTab fetches its own data now)

  // Save Template Mutation
  const handleSaveTemplate = async () => {
    setSaveStatus(null);
    setErrorMessage(null);
    if (!template) return;

    try {
      const res = await fetch('/api/kpi/master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_TEMPLATE',
          passcode,
          data: template,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan template');
      }

      setSaveStatus('Master Template KPI Berhasil Disimpan!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan template');
    }
  };

  // Copy Template Indicators
  const handleCopyFromPosition = async (sourceId: string) => {
    try {
      const res = await fetch(`/api/kpi/master?positionId=${sourceId}`);
      const data = await res.json();
      if (data && data.indicators && data.indicators.length > 0) {
        const newIndicators = data.indicators.map((ind: any) => ({
          ...ind,
          id: `ind-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }));
        setTemplate((prev) =>
          prev
            ? {
                ...prev,
                indicators: [...prev.indicators, ...newIndicators],
              }
            : null
        );
      }
    } catch (err) {
      console.error('Failed to copy indicators:', err);
    }
  };

  // Division CRUD Handlers
  const handleAddDivision = async () => {
    if (!divNameInput.trim()) return;
    try {
      const res = await fetch('/api/kpi/master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_DIVISION',
          passcode,
          data: { name: divNameInput.trim() },
        }),
      });
      const data = await res.json();
      if (res.ok && data.divisions) {
        setDivisions(data.divisions);
        setDivNameInput('');
        setDivModalMode(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditDivision = async () => {
    if (!selectedDivision || !divNameInput.trim()) return;
    try {
      const res = await fetch('/api/kpi/master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'EDIT_DIVISION',
          passcode,
          data: { id: selectedDivision.id, name: divNameInput.trim() },
        }),
      });
      const data = await res.json();
      if (res.ok && data.divisions) {
        setDivisions(data.divisions);
        setDivModalMode(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDivision = async () => {
    if (!selectedDivision) return;
    try {
      const res = await fetch('/api/kpi/master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE_DIVISION',
          passcode,
          data: { id: selectedDivision.id },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.divisions) setDivisions(data.divisions);
        if (data.positions) setPositions(data.positions);
        setDivModalMode(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Position CRUD Handlers
  const handleAddPosition = async () => {
    if (!posTitleInput.trim() || !posDivIdInput) return;
    try {
      const res = await fetch('/api/kpi/master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_POSITION',
          passcode,
          data: { title: posTitleInput.trim(), divisionId: posDivIdInput },
        }),
      });
      const data = await res.json();
      if (res.ok && data.positions) {
        setPositions(data.positions);
        setSelectedPositionId(data.position.id);
        setPosTitleInput('');
        setPosModalMode(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditPosition = async () => {
    if (!selectedPosition || !posTitleInput.trim()) return;
    try {
      const res = await fetch('/api/kpi/master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'EDIT_POSITION',
          passcode,
          data: {
            id: selectedPosition.id,
            title: posTitleInput.trim(),
            divisionId: posDivIdInput,
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.positions) {
        setPositions(data.positions);
        if (template && template.positionId === selectedPosition.id) {
          setTemplate({ ...template, positionTitle: posTitleInput.trim() });
        }
        setPosModalMode(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePosition = async () => {
    if (!selectedPosition) return;
    try {
      const res = await fetch('/api/kpi/master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE_POSITION',
          passcode,
          data: { id: selectedPosition.id },
        }),
      });
      const data = await res.json();
      if (res.ok && data.positions) {
        setPositions(data.positions);
        if (selectedPositionId === selectedPosition.id) {
          setSelectedPositionId(data.positions[0]?.id || '');
        }
        setPosModalMode(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSubmissionReview = async (
    submissionId: string,
    supervisorScores: Record<string, number>,
    reviewerNotes: string,
    status: 'reviewed' | 'approved',
    reviewerName?: string
  ) => {
    // Optimistic UI update
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === submissionId) {
          return {
            ...sub,
            supervisorScores,
            reviewerNotes,
            status,
            ...(reviewerName && { reviewedBy: reviewerName }),
          };
        }
        return sub;
      })
    );

    try {
      // Actually save to backend API
      const templateForSub = submissions.find(s => s.id === submissionId);
      const res = await fetch(`/api/submissions/${submissionId}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supervisorScores,
          reviewerNotes,
          status,
          reviewerName,
        }),
      });
      
      if (!res.ok) {
        console.error('Failed to update submission review');
        fetchSubmissionsData(); // Revert on failure
      }
    } catch (err) {
      console.error(err);
      fetchSubmissionsData(); // Revert on failure
    }
  };

  // Render PIN Auth Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <PinAuthScreen
        passcode={passcode}
        onPasscodeChange={setPasscode}
        onVerify={() => verifyPasscode(passcode)}
        authError={authError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-200 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 pb-24 relative">
      {/* Background Radial Ambient Glows */}
      <div className="absolute top-[-5%] left-[15%] w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none animate-blob-1" />
      <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none animate-blob-2" />

      {/* Navigation Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cyan-500/20 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:text-white transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)] active:scale-95 shrink-0"
            title="Kembali ke Form Karyawan"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-sans text-m5-gradient drop-shadow-[0_0_20px_rgba(0,229,255,0.15)]">
              Master Admin & HR Analytics
            </h1>
            <p className="text-xs text-slate-300 font-medium mt-1">
              Kelola Template KPI, review penilaian atasan, rekap triwulan, dan analisis eksekutif.
            </p>
          </div>
        </div>

        {/* Tab Selector: Builder vs Review vs Rekap vs Executive Analytics */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#051520]/90 border border-cyan-400/40 overflow-x-auto max-w-full backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.15)] shrink-0">
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === 'builder'
                ? 'bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)] backdrop-blur-md'
                : 'text-slate-400 hover:text-cyan-200 hover:bg-cyan-500/10'
            }`}
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Master Builder</span>
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === 'review'
                ? 'bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)] backdrop-blur-md'
                : 'text-slate-400 hover:text-cyan-200 hover:bg-cyan-500/10'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Review Submissions ⭐</span>
          </button>

          <button
            onClick={() => setActiveTab('recap')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === 'recap'
                ? 'bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)] backdrop-blur-md'
                : 'text-slate-400 hover:text-cyan-200 hover:bg-cyan-500/10'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>Rekap Triwulan</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)] backdrop-blur-md'
                : 'text-slate-400 hover:text-cyan-200 hover:bg-cyan-500/10'
            }`}
          >
            <PieIcon className="w-4 h-4 text-cyan-400" />
            <span>Executive Analytics</span>
          </button>
        </div>
      </header>

      {/* TAB CONTENTS */}
      {activeTab === 'builder' && (
        <MasterBuilderTab
          divisions={divisions}
          positions={positions}
          selectedPositionId={selectedPositionId}
          onSelectPosition={setSelectedPositionId}
          template={template}
          onUpdateTemplate={setTemplate}
          onSaveTemplate={handleSaveTemplate}
          saveStatus={saveStatus}
          errorMessage={errorMessage}
          onCopyFromPosition={handleCopyFromPosition}
          onOpenAddDivModal={() => {
            setDivNameInput('');
            setSelectedDivision(null);
            setDivModalMode('add');
          }}
          onOpenEditDivModal={(div) => {
            setSelectedDivision(div);
            setDivNameInput(div.name);
            setDivModalMode('edit');
          }}
          onOpenDeleteDivModal={(div) => {
            setSelectedDivision(div);
            setDivModalMode('delete');
          }}
          onOpenAddPosModal={() => {
            setPosTitleInput('');
            setPosDivIdInput(divisions[0]?.id || '');
            setSelectedPosition(null);
            setPosModalMode('add');
          }}
          onOpenEditPosModal={(pos) => {
            setSelectedPosition(pos);
            setPosTitleInput(pos.title);
            setPosDivIdInput(pos.divisionId);
            setPosModalMode('edit');
          }}
          onOpenDeletePosModal={(pos) => {
            setSelectedPosition(pos);
            setPosModalMode('delete');
          }}
          onOpenSupabaseModal={() => setShowSupabaseModal(true)}
        />
      )}

      {activeTab === 'review' && (
        <ReviewSubmissionsTab
          submissions={submissions}
          divisions={divisions}
          positions={positions}
          indicators={template?.indicators || []}
          onUpdateSubmissionReview={handleUpdateSubmissionReview}
          onRefreshData={fetchSubmissionsData}
        />
      )}

      {activeTab === 'recap' && (
        <RecapTab submissions={submissions} />
      )}

      {activeTab === 'analytics' && (
        <ExecutiveAnalyticsTab />
      )}

      {/* Division CRUD Modal */}
      <DivisionModal
        mode={divModalMode}
        division={selectedDivision}
        nameInput={divNameInput}
        onNameInputChange={setDivNameInput}
        onClose={() => setDivModalMode(null)}
        onSubmit={
          divModalMode === 'add'
            ? handleAddDivision
            : divModalMode === 'edit'
            ? handleEditDivision
            : handleDeleteDivision
        }
      />

      {/* Position CRUD Modal */}
      <PositionModal
        mode={posModalMode}
        position={selectedPosition}
        divisions={divisions}
        titleInput={posTitleInput}
        onTitleInputChange={setPosTitleInput}
        divisionIdInput={posDivIdInput}
        onDivisionIdInputChange={setPosDivIdInput}
        onClose={() => setPosModalMode(null)}
        onSubmit={
          posModalMode === 'add'
            ? handleAddPosition
            : posModalMode === 'edit'
            ? handleEditPosition
            : handleDeletePosition
        }
      />

      {/* Supabase Schema Modal */}
      <Modal isOpen={showSupabaseModal} onClose={() => setShowSupabaseModal(false)} title="Supabase SQL DDL Schema" maxWidth="2xl">
        <div className="space-y-4">
          <p className="text-xs text-slate-300 font-medium">
            Copy DDL SQL berikut dan jalankan di <strong className="text-cyan-300">Supabase SQL Editor</strong> Anda untuk membuat tabel otomatis:
          </p>

          <textarea
            readOnly
            rows={12}
            value={SUPABASE_SQL_SCHEMA}
            className="w-full bg-[#051520] border border-cyan-400/40 rounded-2xl p-4 text-xs font-mono text-cyan-300 focus:outline-none select-all shadow-inner"
          />

          <button
            onClick={() => {
              navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
              alert('Skema SQL berhasil di-copy!');
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white text-xs font-extrabold shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
          >
            Copy SQL Schema
          </button>
        </div>
      </Modal>
    </div>
  );
}
