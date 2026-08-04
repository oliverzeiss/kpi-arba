import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-4xl font-extrabold text-cyan-400 mb-2">404</h2>
      <p className="text-lg text-slate-300 mb-6">Halaman tidak ditemukan.</p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold hover:bg-cyan-500/30 transition-all"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
