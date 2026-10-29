'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ReceiptText,
  Tags,
  Menu,
  Plus,
} from 'lucide-react';

interface MobileNavProps {
  onOpenTransactionModal?: () => void;
  onToggleDrawer?: () => void;
}

export function MobileNav({
  onOpenTransactionModal,
  onToggleDrawer,
}: MobileNavProps) {
  const pathname = usePathname();

  const leftLinks = [
    { label: 'Dasbor', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Transaksi', href: '/transaksi', icon: ReceiptText },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0E1118]/95 backdrop-blur-lg border-t border-[#1F2433] px-2 py-2 safe-area-pb">
      <div className="flex items-center justify-around relative">
        {/* Left two items: Dasbor & Transaksi */}
        {leftLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[60px] min-h-[44px] py-1 transition ${
                isActive ? 'text-[#FF4D36]' : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}

        {/* Center Floating Plus Button */}
        <div className="-mt-7">
          <button
            onClick={onOpenTransactionModal}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#FF4D36] to-[#FF7A59] text-white flex items-center justify-center shadow-lg shadow-[#FF4D36]/40 border-4 border-[#0B0D13] active:scale-95 transition"
            aria-label="Catat Transaksi Cepat"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Right item 1: Kategori (Direct 1-tap access on mobile!) */}
        <Link
          href="/kategori"
          className={`flex flex-col items-center justify-center min-w-[60px] min-h-[44px] py-1 transition ${
            pathname.startsWith('/kategori')
              ? 'text-[#FF4D36]'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <Tags className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium leading-none">Kategori</span>
        </Link>

        {/* Right item 2: Menu / Drawer toggle (Access to Dompet, Anggaran, Transfer, Pengaturan) */}
        <button
          type="button"
          onClick={onToggleDrawer}
          className="flex flex-col items-center justify-center min-w-[60px] min-h-[44px] py-1 text-[#94A3B8] hover:text-white transition"
          aria-label="Buka Menu Lainnya"
        >
          <Menu className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium leading-none">Menu</span>
        </button>
      </div>
    </div>
  );
}
