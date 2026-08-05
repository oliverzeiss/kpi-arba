'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, AlertCircle, CheckCircle2, Check } from 'lucide-react';
import { KPITemplate, Indicator, GradeResult, Position, Division } from '@/types/kpi';
import { calculateTotalScore, calculateGrade } from '@/lib/kpi-calculator';
import { KpiPreviewCard } from '@/components/kpi/KpiPreviewCard';
import { KpiTutorialCard } from '@/components/kpi/KpiTutorialCard';
import { getContrastPalette } from '@/lib/kpi-palette';

import { IdentityForm } from '@/components/kpi/IdentityForm';
import { WeightDonutChart } from '@/components/kpi/WeightDonutChart';
import { IndicatorList } from '@/components/kpi/IndicatorList';
import { AchievementNotes } from '@/components/kpi/AchievementNotes';
import { ScoreModal } from '@/components/kpi/ScoreModal';

export default function EmployeeKPIPage() {
  // Form State
  const [employeeName, setEmployeeName] = useState('');
  const [achievementNotes, setAchievementNotes] = useState('');
  const [selectedPositionId, setSelectedPositionId] = useState('');

  const [positions, setPositions] = useState<Position[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [template, setTemplate] = useState<KPITemplate | null>(null);

  // Indicator Scores (indicatorId -> score 0..100)
  const [scores, setScores] = useState<Record<string, number>>({
    'ind-1': 88,
    'ind-2': 84,
    'ind-3': 84,
    'ind-4': 90,
  });

  // Active Hovered Indicator for Donut Chart interactivity
  const [hoveredIndicatorId, setHoveredIndicatorId] = useState<string | null>(null);
  const [isDonutMounted, setIsDonutMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDonutMounted(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Previous month trend score
  const [previousMonthScore, setPreviousMonthScore] = useState<number>(75);

  // Modals UI
  const [activeModalIndicator, setActiveModalIndicator] = useState<Indicator | null>(null);
  const [modalNewScore, setModalNewScore] = useState<string>('80');

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch positions & initial template
  useEffect(() => {
    fetch('/api/kpi/master')
      .then((res) => res.json())
      .then((data) => {
        if (data.positions && data.positions.length > 0) {
          setPositions(data.positions);
          setSelectedPositionId(data.positions[0].id);
        }
        if (data.divisions) setDivisions(data.divisions);
      })
      .catch(console.error);
  }, []);

  // Fetch template whenever selected position changes
  useEffect(() => {
    if (!selectedPositionId) return;
    fetch(`/api/kpi/master?positionId=${selectedPositionId}`)
      .then((res) => res.json())
      .then((tpl: KPITemplate | null) => {
        setTemplate(tpl);
        setScores((prevScores) => {
          const initialScores: Record<string, number> = {};
          if (tpl && tpl.indicators) {
            tpl.indicators.forEach((ind, idx) => {
              initialScores[ind.id] =
                prevScores[ind.id] !== undefined ? prevScores[ind.id] : idx === 0 ? 88 : idx === 3 ? 90 : 84;
            });
          }
          return initialScores;
        });
      })
      .catch(console.error);

    fetch(`/api/kpi/recap?type=previous_month&positionId=${selectedPositionId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.previousScore) setPreviousMonthScore(res.previousScore);
      })
      .catch(console.error);
  }, [selectedPositionId]);

  // Live calculation of current total score & grade
  const rawTotalScore = template ? calculateTotalScore(scores, template.indicators) : 85.8;
  const currentTotalScore =
    typeof rawTotalScore === 'number' && !isNaN(rawTotalScore) && rawTotalScore > 0 ? rawTotalScore : 85.8;
  const gradeResult: GradeResult = calculateGrade(currentTotalScore);
  const safePrevScore =
    typeof previousMonthScore === 'number' && !isNaN(previousMonthScore) ? previousMonthScore : 82;
  const scoreDelta = (currentTotalScore - safePrevScore).toFixed(1);

  // Handle Score Input Slider or Modal Save
  const handleScoreChange = (indicatorId: string, val: number) => {
    const clamped = Math.max(0, Math.min(100, val));
    setScores((prev) => ({ ...prev, [indicatorId]: clamped }));
  };

  const handleOpenIndicatorModal = (ind: Indicator) => {
    setActiveModalIndicator(ind);
    const scoreVal = scores[ind.id] !== undefined ? scores[ind.id] : 85;
    setModalNewScore(String(scoreVal));
  };

  const handleSaveModalScore = () => {
    if (activeModalIndicator) {
      const finalScore =
        modalNewScore === '' ? 0 : Math.min(100, Math.max(0, Number(modalNewScore)));
      handleScoreChange(activeModalIndicator.id, finalScore);
      setActiveModalIndicator(null);
    }
  };

  // Submit Handler
  const handleSubmitAssessment = async () => {
    setValidationError(null);
    setSubmitSuccessMsg(null);

    if (!employeeName.trim()) {
      setValidationError('Nama Karyawan wajib diisi sebelum mengirim penilaian!');
      return;
    }

    if (!template) {
      setValidationError('Template KPI belum siap!');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/kpi/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeName: employeeName.trim(),
          template,
          scores,
          achievementNotes: achievementNotes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirim penilaian');
      }

      setSubmitSuccessMsg(`Penilaian KPI berhasil dikirim! Data tersimpan di Supabase.`);
    } catch (err: any) {
      setValidationError(err.message || 'Terjadi kesalahan saat pengiriman');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Apple Framer Motion Variants
  const appleEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

  const sectionVariant = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: appleEase } },
  };

  const indicatorCount = template?.indicators.length || 4;
  const dynamicPalette = getContrastPalette(indicatorCount);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070a10]/85 backdrop-blur-2xl border-b border-white/10 px-6 md:px-12 py-3.5 sm:py-4 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.9)]" />
            </span>
            <span className="text-white font-extrabold tracking-tight text-lg sm:text-xl">
              Sistem KPI
            </span>
          </div>

          <span className="text-white/20 font-light select-none">|</span>

          <span className="text-xs font-bold tracking-wider uppercase text-cyan-300 bg-cyan-500/10 border border-cyan-500/40 px-3.5 py-1.5 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.15)] select-none shrink-0">
            ARBA GROUP
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <Link
            href="/master"
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 hover:border-cyan-400 text-xs sm:text-sm font-bold text-cyan-300 hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] active:scale-95 whitespace-nowrap shrink-0"
          >
            <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Admin Master</span>
          </Link>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="pt-24 md:pt-28 pb-24 max-w-6xl mx-auto px-4 sm:px-6 md:px-12 space-y-5 sm:space-y-6">
        {/* HERO SECTION - Preview Card */}
        <div className="flex justify-center w-full">
          <KpiPreviewCard
            data={{
              period: `Periode: ${template?.activePeriod || 'Juli 2026'}`,
              status: 'Status: Simulasi',
              score: currentTotalScore,
              maxScore: 100,
              category: `Kategori: ${gradeResult.grade} (${gradeResult.description})`,
              previousScore: previousMonthScore,
              targetScore: 75,
              improvement: Number(scoreDelta),
            }}
          />
        </div>

        {/* TUTORIAL CARD */}
        <KpiTutorialCard />

        {/* FORM IDENTITAS KARYAWAN */}
        <motion.section initial="hidden" animate="visible" variants={sectionVariant}>
          <IdentityForm
            employeeName={employeeName}
            onEmployeeNameChange={setEmployeeName}
            selectedPositionId={selectedPositionId}
            onPositionChange={setSelectedPositionId}
            positions={positions}
            activePeriod={template?.activePeriod}
          />
        </motion.section>

        {/* KOMPOSISI BOBOT DONUT CHART */}
        <motion.section initial="hidden" animate="visible" variants={sectionVariant}>
          <WeightDonutChart
            indicators={template?.indicators || []}
            dynamicPalette={dynamicPalette}
            hoveredIndicatorId={hoveredIndicatorId}
            onHoverIndicator={setHoveredIndicatorId}
            onIndicatorClick={handleOpenIndicatorModal}
            isDonutMounted={isDonutMounted}
          />
        </motion.section>

        {/* DETAIL INDIKATOR LIST */}
        <motion.section initial="hidden" animate="visible" variants={sectionVariant}>
          <IndicatorList
            indicators={template?.indicators || []}
            scores={scores}
            dynamicPalette={dynamicPalette}
            onIndicatorClick={handleOpenIndicatorModal}
          />
        </motion.section>

        {/* CATATAN PENCAPAIAN */}
        <motion.section initial="hidden" animate="visible" variants={sectionVariant}>
          <AchievementNotes
            value={achievementNotes}
            onChange={setAchievementNotes}
          />
        </motion.section>

        {/* BUTTON CTA */}
        <motion.section initial="hidden" animate="visible" variants={sectionVariant} className="pt-4">
          {validationError && (
            <div className="mb-4 p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {submitSuccessMsg && (
            <div className="mb-4 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{submitSuccessMsg}</span>
            </div>
          )}

          <button
            onClick={handleSubmitAssessment}
            disabled={isSubmitting}
            className="w-full py-4 px-8 rounded-full bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white font-bold text-base shadow-[0_0_30px_rgba(0,229,255,0.25)] hover:shadow-[0_0_40px_rgba(0,229,255,0.45)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 border border-cyan-300/30"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Mengirim Penilaian ke Supabase...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5 text-white" />
                <span>Kirim Penilaian KPI</span>
              </>
            )}
          </button>
          <p className="text-center text-xs text-slate-300/70 mt-3 font-normal">
            * Mengirim hasil evaluasi mandiri langsung ke Supabase Cloud Database per Jabatan.
          </p>
        </motion.section>
      </div>

      {/* POP-UP SCORE MODAL */}
      <ScoreModal
        indicator={activeModalIndicator}
        currentScore={activeModalIndicator ? scores[activeModalIndicator.id] ?? 85 : 85}
        newScoreInput={modalNewScore}
        onScoreInputChange={setModalNewScore}
        onSave={handleSaveModalScore}
        onClose={() => setActiveModalIndicator(null)}
      />
    </div>
  );
}
