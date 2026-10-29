import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CatatDuit — Aplikasi Pencatatan Keuangan Pribadi',
  description:
    'Web app pencatatan keuangan cepat dan intuitif. Kelola dompet, kategori, anggaran, dan analisis pengeluaran dalam satu dasbor modern.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0B0D13] text-[#F1F5F9]">
        {children}
      </body>
    </html>
  );
}
