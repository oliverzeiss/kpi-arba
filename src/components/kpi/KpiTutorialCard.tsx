'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Award,
  ListOrdered,
  User,
  Edit3,
  FileText,
  Send,
} from 'lucide-react';

const gradeScales = [
  {
    score: '95 - 100',
    grade: 'A+',
    description: 'Sangat Memuaskan',
    badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_12px_rgba(52,211,153,0.2)]',
    scoreClass: 'text-emerald-400',
  },
  {
    score: '85 - 94',
    grade: 'A',
    description: 'Memuaskan',
    badgeClass: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]',
    scoreClass: 'text-cyan-400',
  },
  {
    score: '75 - 84',
    grade: 'B',
    description: 'Baik',
    badgeClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30 shadow-[0_0_12px_rgba(251,191,36,0.2)]',
    scoreClass: 'text-amber-400',
  },
  {
    score: '60 - 74',
    grade: 'C',
    description: 'Cukup',
    badgeClass: 'text-orange-400 bg-orange-500/10 border-orange-500/30 shadow-[0_0_12px_rgba(251,146,60,0.2)]',
    scoreClass: 'text-orange-400',
  },
  {
    score: '0 - 59',
    grade: 'D',
    description: 'Kurang',
    badgeClass: 'text-rose-400 bg-rose-500/10 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.2)]',
    scoreClass: 'text-rose-400',
  },
];

const tutorialSteps = [
  {
    number: '01',
    title: 'Isi Identitas Karyawan',
    description: 'Pilih Jabatan yang sesuai dan masukkan Nama Lengkap Anda dengan benar.',
    icon: User,
  },
  {
    number: '02',
    title: 'Input Nilai Indikator',
    description: 'Masukkan skor pencapaian aktual (0 - 100) pada tiap indikator KPI yang tersedia.',
    icon: Edit3,
  },
  {
    number: '03',
    title: 'Catatan Pencapaian',
    description: 'Tuliskan uraian bukti kerja atau catatan pendukung hasil evaluasi Anda.',
    icon: FileText,
  },
  {
    number: '04',
    title: 'Klik Tombol Kirim Penilaian KPI',
    description: 'Klik tombol "Kirim Penilaian KPI" untuk menyimpan hasil penilaian dan menyelesaikan proses pengisian.',
    icon: Send,
  },
];

export const KpiTutorialCard: React.FC = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="apple-glass-hover rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col gap-6 sm:gap-7 shadow-[0_12px_50px_rgba(0,0,0,0.8),0_0_50px_rgba(6,182,212,0.25)] border border-cyan-400/50 hover:border-cyan-300 bg-gradient-to-r from-[#061e2b] via-[#08283a] to-[#061f2c] transition-all duration-300 min-w-0 w-full"
    >
      {/* Ambient Glow Mesh Background */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-400/25 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-[30%] w-96 h-96 bg-sky-500/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Judul Terpusat (Tengah) */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center w-full">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight text-m5-gradient drop-shadow-[0_0_20px_rgba(0,229,255,0.15)] flex items-center justify-center gap-3">
          <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400 shrink-0" />
          <span>Tutorial Pengisian KPI</span>
        </h2>
      </div>

      {/* Grid 2 Kolom: Kiri (Skala Penilaian) & Kanan (Langkah Tutorial) */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Kolom Kiri: Skala Penilaian & Grade */}
        <div className="lg:col-span-4 flex flex-col gap-4 bg-[#051520]/75 border border-cyan-500/30 rounded-2xl p-5 backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2.5 pb-3 border-b border-cyan-500/20">
            <Award className="w-5 h-5 text-cyan-400 shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-slate-100">
              Skala Penilaian & Grade
            </h3>
          </div>

          <div className="divide-y divide-cyan-500/15 text-xs flex flex-col">
            <div className="grid grid-cols-3 pb-2.5 font-bold text-cyan-300/80 uppercase text-[11px] tracking-wider">
              <span className="whitespace-nowrap">[ SKOR ]</span>
              <span className="text-center whitespace-nowrap">[ GRADE ]</span>
              <span className="text-right whitespace-nowrap">[ KETERANGAN ]</span>
            </div>
            {gradeScales.map((item) => (
              <div key={item.grade} className="grid grid-cols-3 py-2.5 items-center font-mono text-xs">
                <span className={`font-bold ${item.scoreClass}`}>{item.score}</span>
                <div className="flex justify-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${item.badgeClass}`}>
                    {item.grade}
                  </span>
                </div>
                <span className="text-slate-200 font-sans font-medium text-right">{item.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Kanan: Langkah-Langkah Tutorial Pengisian KPI */}
        <div className="lg:col-span-8 flex flex-col gap-4 bg-[#051520]/75 border border-cyan-500/30 rounded-2xl p-5 backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2.5 pb-3 border-b border-cyan-500/20">
            <ListOrdered className="w-5 h-5 text-cyan-400 shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-slate-100">
              Langkah-Langkah Pengisian KPI
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tutorialSteps.map((step) => {
              const IconComponent = step.icon;
              return (
                <div
                  key={step.number}
                  className="bg-[#041019]/80 hover:bg-[#071d2c] border border-cyan-500/20 hover:border-cyan-400/50 p-3.5 rounded-xl transition-all duration-200 flex flex-col gap-2 group shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold font-mono text-cyan-300 bg-cyan-500/15 border border-cyan-400/40 group-hover:border-cyan-300 transition-colors">
                      {step.number}
                    </span>
                    <IconComponent className="w-4 h-4 text-cyan-400 opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-cyan-200 transition-colors">
                    {step.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-300/80 leading-relaxed font-sans">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.section>
  );
};
