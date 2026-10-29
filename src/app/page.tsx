import React from 'react';
import Link from 'next/link';
import {
  Flame,
  ArrowRight,
  Zap,
  ShieldCheck,
  PieChart,
  Wallet,
  PiggyBank,
  CheckCircle2,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0B0D13] text-[#F1F5F9] flex flex-col selection:bg-[#FF4D36] selection:text-white">
      {/* Navigation Header */}
      <header className="border-b border-[#1F2433] bg-[#0E1118]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF4D36] to-[#FF7A59] flex items-center justify-center shadow-md shadow-[#FF4D36]/25">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Catat<span className="text-[#FF4D36]">Duit</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-[#94A3B8] hover:text-white px-3 py-1.5 transition"
            >
              Masuk
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF4D36] to-[#FF634F] hover:from-[#FF5D47] hover:to-[#FF735F] text-white font-bold text-xs shadow-md shadow-[#FF4D36]/20 transition flex items-center gap-1.5"
            >
              <span>Buka Dasbor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#181D29] border border-[#273045] text-xs font-semibold text-[#94A3B8]">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span>Sesuai PRD Aplikasi Pencatatan Keuangan (IDR WIB)</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
          Catat Pengeluaranmu Dalam{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4D36] to-[#FF8A65]">
            10 Detik
          </span>{' '}
          per Transaksi.
        </h1>

        <p className="text-sm sm:text-base text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
          Web app pencatatan keuangan pribadi dengan antarmuka gelap modern, dukungan dompet tunai,
          bank, & e-wallet, nominal rupiah tanpa desimal, serta kalkulasi saldo otomatis anti-desinkronisasi.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF4D36] to-[#FF634F] hover:from-[#FF5D47] hover:to-[#FF735F] text-white font-bold text-sm shadow-xl shadow-[#FF4D36]/25 transition flex items-center justify-center gap-2 group"
          >
            <span>Mulai Sekarang (Buka Dasbor)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#141721] hover:bg-[#1A1F2C] border border-[#232938] text-white font-semibold text-sm transition"
          >
            Masuk Akun Anda
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 text-left">
          <div className="card-subly p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#FF4D36]/15 text-[#FF4D36] flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-white">Input Super Cepat</h2>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Form pencatatan minimalis dengan preset nominal instan dan pemformatan rupiah otomatis saat mengetik.
            </p>
          </div>

          <div className="card-subly p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#3B82F6]/15 text-[#3B82F6] flex items-center justify-center">
              <PieChart className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-white">Grafik & Alokasi Donut</h2>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Ketahui ke mana uangmu pergi lewat grafik donat per kategori dan tren arus kas bulanan yang presisi.
            </p>
          </div>

          <div className="card-subly p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-white">Data Aman & Privat</h2>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Dilindungi oleh Supabase Row Level Security (RLS). Hanya Anda yang dapat mengakses data transaksi Anda.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1F2433] py-6 text-center text-xs text-[#64748B]">
        <p>© 2026 CatatDuit. Dibangun dengan Next.js App Router & Supabase Postgres.</p>
      </footer>
    </div>
  );
}
