'use client';

import React from 'react';
import Link from 'next/link';
import { Wallet as WalletIcon, CreditCard, Smartphone, ArrowRight, Plus } from 'lucide-react';
import { AccountWithBalance } from '@/types';
import { formatRupiah } from '@/lib/utils/format';

interface WalletListCardProps {
  accounts: AccountWithBalance[];
  onAddWallet?: () => void;
}

export function WalletListCard({ accounts, onAddWallet }: WalletListCardProps) {
  const getWalletIcon = (tipe: string) => {
    switch (tipe) {
      case 'bank':
        return <CreditCard className="w-4 h-4 text-[#3B82F6]" />;
      case 'ewallet':
        return <Smartphone className="w-4 h-4 text-[#10B981]" />;
      default:
        return <WalletIcon className="w-4 h-4 text-[#FF4D36]" />;
    }
  };

  return (
    <div className="card-subly p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white">Dompet & Saldo</h2>
          <p className="text-xs text-[#64748B]">Sumber dana aktif</p>
        </div>
        <Link
          href="/dompet"
          className="text-xs font-semibold text-[#94A3B8] hover:text-white flex items-center gap-1 transition"
        >
          <span>Kelola</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className="p-3.5 rounded-xl bg-[#0E1118] border border-[#1F2433] hover:border-[#2E364A] transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#191E2B] flex items-center justify-center">
                  {getWalletIcon(acc.tipe)}
                </div>
                <span className="text-xs font-bold text-white truncate max-w-[120px]">
                  {acc.nama}
                </span>
              </div>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-[#1C2130] text-[#94A3B8]">
                {acc.tipe}
              </span>
            </div>
            <div className="text-sm font-extrabold text-white">
              {formatRupiah(acc.saldo_saat_ini)}
            </div>
            <div className="text-[10px] text-[#64748B] mt-1">
              Saldo awal: {formatRupiah(acc.saldo_awal)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

