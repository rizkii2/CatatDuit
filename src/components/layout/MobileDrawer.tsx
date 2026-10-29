'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ReceiptText,
  Wallet,
  PiggyBank,
  ArrowLeftRight,
  Tags,
  Settings,
  LogOut,
  Flame,
  X,
  User,
} from 'lucide-react';
import { signOutAction } from '@/actions/auth';
import { Profile } from '@/types';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: Profile | null;
}

export function MobileDrawer({ isOpen, onClose, profile }: MobileDrawerProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  const navItems = [
    { label: 'Overview / Dasbor', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Daftar Transaksi', href: '/transaksi', icon: ReceiptText },
    { label: 'Dompet & Rekening', href: '/dompet', icon: Wallet },
    { label: 'Anggaran Bulanan', href: '/anggaran', icon: PiggyBank },
    { label: 'Transfer Antar Dompet', href: '/transfer', icon: ArrowLeftRight },
    { label: 'Kelola Kategori', href: '/kategori', icon: Tags, highlight: true },
    { label: 'Pengaturan & Ekspor', href: '/pengaturan', icon: Settings },
  ];

  const handleSignOut = async () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      await signOutAction();
    }
  };

  const displayName = profile?.nama || 'Pengguna CatatDuit';

  return (
    <div className="lg:hidden fixed inset-0 z-50 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] bg-[#0E1118] border-r border-[#1F2433] z-50 flex flex-col justify-between p-5 shadow-2xl animate-in slide-in-from-left duration-200">
        <div className="space-y-6">
          {/* Header Brand & Close Button */}
          <div className="flex items-center justify-between pb-3 border-b border-[#1F2433]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF4D36] to-[#FF7A59] flex items-center justify-center shadow-md shadow-[#FF4D36]/25">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Catat<span className="text-[#FF4D36]">Duit</span>
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#181D29] text-[#94A3B8] hover:text-white flex items-center justify-center transition"
              aria-label="Tutup Menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Profile Mini Card */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#141722] border border-[#1F2536]">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#242A38] to-[#363F54] border border-[#3A435A] flex items-center justify-center text-sm font-bold text-white shrink-0 overflow-hidden">
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
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{displayName}</p>
              <p className="text-[10px] text-[#10B981] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                Akun Aktif
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#64748B] px-3 mb-2">
              Menu Utama
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#181D29] text-white border border-[#273045] shadow-sm'
                      : 'text-[#94A3B8] hover:text-white hover:bg-[#141722]'
                  } ${item.highlight && !isActive ? 'text-white' : ''}`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? 'text-[#FF4D36]'
                        : item.highlight
                        ? 'text-[#FF4D36]'
                        : 'text-[#64748B]'
                    }`}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF4D36]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sign Out */}
        <div className="pt-4 border-t border-[#1F2433]">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/10 transition-all text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </div>
    </div>
  );
}

