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
  Plus,
} from 'lucide-react';
import { signOutAction } from '@/actions/auth';

interface SidebarProps {
  onOpenTransactionModal?: () => void;
}

export function Sidebar({ onOpenTransactionModal }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Transaksi', href: '/transaksi', icon: ReceiptText },
    { label: 'Dompet', href: '/dompet', icon: Wallet },
    { label: 'Anggaran', href: '/anggaran', icon: PiggyBank },
    { label: 'Transfer', href: '/transfer', icon: ArrowLeftRight },
    { label: 'Kategori', href: '/kategori', icon: Tags },
  ];

  const handleSignOut = async () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      await signOutAction();
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-[#1F2433] bg-[#0E1118] shrink-0 min-h-screen justify-between py-6 px-4">
      <div className="space-y-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF4D36] to-[#FF7A59] flex items-center justify-center shadow-lg shadow-[#FF4D36]/25">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              Catat<span className="text-[#FF4D36]">Duit</span>
            </span>
            <span className="text-[11px] block text-[#64748B] font-medium tracking-wide">
              PERSONAL FINANCE
            </span>
          </div>
        </div>

        {/* Quick Add Button */}
        <div className="px-2 pt-2">
          <button
            onClick={onOpenTransactionModal}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FF4D36] to-[#FF634F] hover:from-[#FF5D47] hover:to-[#FF735F] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FF4D36]/20 transition active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Transaksi</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 px-1">
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#64748B] px-3 mb-2">
            Menu Utama
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#181D29] text-white border border-[#273045] shadow-sm'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#141722]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#FF4D36]' : 'text-[#64748B]'
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

      {/* Bottom Menu */}
      <div className="space-y-1 px-1 pt-6 border-t border-[#1F2433]">
        <Link
          href="/pengaturan"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            pathname.startsWith('/pengaturan')
              ? 'bg-[#181D29] text-white border border-[#273045]'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#141722]'
          }`}
        >
          <Settings className="w-4 h-4 text-[#64748B]" />
          <span>Pengaturan</span>
        </Link>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#EF4444] hover:bg-[#EF4444]/10 transition-all text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}

