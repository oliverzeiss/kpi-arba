import React from 'react';
import Link from 'next/link';
import { Lock, AlertCircle, ChevronLeft } from 'lucide-react';

interface PinAuthScreenProps {
  passcode: string;
  onPasscodeChange: (val: string) => void;
  onVerify: () => void;
  authError: string | null;
}

export const PinAuthScreen: React.FC<PinAuthScreenProps> = ({
  passcode,
  onPasscodeChange,
  onVerify,
  authError,
}) => {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-200 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Radial Ambient Glows */}
      <div className="absolute top-[-10%] left-[20%] w-[350px] h-[350px] rounded-full bg-cyan-500/15 blur-[120px] pointer-events-none animate-blob-1" />
      <div className="absolute bottom-[-10%] right-[20%] w-[300px] h-[300px] rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none animate-blob-2" />

      <div className="w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-6 border border-cyan-400/50 shadow-[0_0_50px_rgba(6,182,212,0.25)] bg-gradient-to-b from-[#061f2c]/95 to-[#04131d]/95 backdrop-blur-2xl text-center relative z-10">
        <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-400/40 text-cyan-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          <Lock className="w-8 h-8 text-cyan-400" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-extrabold text-m5-gradient drop-shadow-[0_0_20px_rgba(0,229,255,0.15)]">
            Akses Khusus Admin / HRD
          </h2>
          <p className="text-xs text-slate-300 font-medium">
            Masukkan Passcode 6-Digit untuk membuka Master Template & Analytics KPI
          </p>
        </div>

        {authError && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <div className="space-y-4">
          <input
            type="password"
            maxLength={6}
            placeholder="• • • • • •"
            value={passcode}
            onChange={(e) => onPasscodeChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onVerify();
            }}
            className="w-full bg-[#051520] border border-cyan-400/50 rounded-2xl py-3.5 text-center text-2xl font-mono font-bold tracking-widest text-cyan-300 focus:outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30 transition-all shadow-inner"
          />

          <button
            onClick={onVerify}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 transition-all cursor-pointer"
          >
            Buka Master Admin
          </button>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-200 font-bold transition-colors pt-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Halaman Penilaian Karyawan</span>
        </Link>
      </div>
    </div>
  );
};
