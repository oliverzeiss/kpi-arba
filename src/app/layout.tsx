import './globals.css';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: 'Sistem Penilaian KPI - Arba Group',
  description: 'Sistem Master Template KPI dan Evaluasi Mandiri Karyawan',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={jakartaSans.variable}>
      <body className={`${jakartaSans.className} bg-black text-white antialiased selection:bg-cyan-500/30 selection:text-cyan-200 min-h-screen font-sans`}>
        {children}
      </body>
    </html>
  );
}

