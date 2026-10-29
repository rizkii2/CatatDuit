'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Bell, Plus, Flame, Menu } from 'lucide-react';
import { Profile } from '@/types';

interface HeaderProps {
  profile?: Profile | null;
  onOpenTransactionModal?: () => void;
  onToggleDrawer?: () => void;
  title?: string;
  subtitle?: string;
}

export function Header({
  profile,
  onOpenTransactionModal,
  onToggleDrawer,
  title,
  subtitle,
}: HeaderProps) {
  // Determine greeting based on current local time
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 11) return 'Selamat pagi';
    if (hours < 15) return 'Selamat siang';
    if (hours < 18) return 'Selamat sore';
    return 'Selamat malam';
  };

  const displayName = profile?.nama || 'Kawan';
  const displayGreeting = title || `${getGreeting()}, ${displayName} 👋`;
  const displaySub = subtitle || 'Pantau arus kas dan kelola keuangan pribadimu hari ini.';

  return (
    <header className="w-full bg-[#0B0D13]/80 backdrop-blur-md border-b border-[#1F2433] px-4 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Menu Button & Brand Greeting */}
      <div className="flex items-center gap-2.5">
        {/* Mobile Hamburger Menu Button */}
        <button
          type="button"
          onClick={onToggleDrawer}
          className="lg:hidden w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF4D36] to-[#FF7A59] flex items-center justify-center shrink-0 shadow-md shadow-[#FF4D36]/20 active:scale-95 transition"
          aria-label="Buka Menu Navigasi"
          title="Buka Menu"
        >
          <Menu className="w-5 h-5 text-white stroke-[2.5]" />
        </button>

        <div>
          <h1 className="text-base sm:text-xl font-bold text-white tracking-tight leading-tight">
            {displayGreeting}
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] hidden sm:block">
            {displaySub}
          </p>
        </div>
      </div>

      {/* Right: Actions, Search & User Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search input (Hidden on small mobile) */}
        <div className="hidden md:flex items-center gap-2 bg-[#141721] border border-[#222736] rounded-xl px-3 py-1.5 text-xs text-[#94A3B8] focus-within:border-[#FF4D36] transition-colors w-48 lg:w-64">
          <Search className="w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Cari transaksi..."
            className="bg-transparent border-none outline-none text-white w-full text-xs placeholder:text-[#64748B]"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const query = (e.target as HTMLInputElement).value;
                if (query.trim()) {
                  window.location.href = `/transaksi?search=${encodeURIComponent(query)}`;
                }
              }
            }}
          />
        </div>

        {/* Quick Add Button */}
        <button
          onClick={onOpenTransactionModal}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FF4D36] hover:bg-[#FF634F] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#FF4D36]/20 transition active:scale-95"
          title="Tambah Transaksi Cepat"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Transaksi Baru</span>
        </button>

        {/* Notification Bell */}
        <button
          type="button"
          aria-label="Pemberitahuan"
          className="w-9 h-9 rounded-xl bg-[#141721] border border-[#222736] flex items-center justify-center text-[#94A3B8] hover:text-white transition"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* User Avatar */}
        <Link
          href="/pengaturan"
          className="flex items-center gap-2 pl-1 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#242A38] to-[#363F54] border border-[#3A435A] flex items-center justify-center text-sm font-bold text-white shadow-sm overflow-hidden group-hover:border-[#FF4D36] transition">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              displayName.charAt(0).toUpperCase()
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
