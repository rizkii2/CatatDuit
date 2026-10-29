'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownLeft, ArrowRight, ArrowLeftRight } from 'lucide-react';
import { TransactionWithDetails } from '@/types';
import { formatRupiah, formatDateID } from '@/lib/utils/format';
import { CategoryIcon } from '@/components/ui/CategoryIcon';

interface RecentTransactionsTableProps {
  transactions: TransactionWithDetails[];
}

export function RecentTransactionsTable({
  transactions,
}: RecentTransactionsTableProps) {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const filtered = transactions.filter((t) => {
    if (filterType === 'all') return true;
    return t.tipe === filterType;
  });

  return (
    <div className="card-subly p-5">
      {/* Table Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-white">Transaksi Terakhir</h2>
          {/* Filter Pills matching Reference Image */}
          <div className="flex items-center p-0.5 bg-[#0E1118] border border-[#222736] rounded-xl text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                filterType === 'all'
                  ? 'bg-[#FF4D36] text-white shadow-sm'
                  : 'text-[#64748B] hover:text-white'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                filterType === 'expense'
                  ? 'bg-[#FF4D36] text-white shadow-sm'
                  : 'text-[#64748B] hover:text-white'
              }`}
            >
              Pengeluaran
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                filterType === 'income'
                  ? 'bg-[#FF4D36] text-white shadow-sm'
                  : 'text-[#64748B] hover:text-white'
              }`}
            >
              Pemasukan
            </button>
          </div>
        </div>

        <Link
          href="/transaksi"
          className="text-xs font-semibold text-[#94A3B8] hover:text-white flex items-center gap-1 transition"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1F2433] text-[#64748B] font-semibold">
              <th className="pb-3 pl-2">Jenis</th>
              <th className="pb-3">Kategori & Catatan</th>
              <th className="pb-3">Dompet</th>
              <th className="pb-3">Tanggal</th>
              <th className="pb-3 text-right">Nominal</th>
              <th className="pb-3 pr-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A1F2C]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#64748B]">
                  Belum ada transaksi pada periode ini.
                </td>
              </tr>
            ) : (
              filtered.map((tx) => {
                const isIncome = tx.tipe === 'income';
                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-[#161B26] transition group"
                  >
                    {/* Icon / Type */}
                    <td className="py-3.5 pl-2">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isIncome
                            ? 'bg-[#10B981]/15 text-[#34D399]'
                            : 'bg-[#EF4444]/15 text-[#F87171]'
                        }`}
                      >
                        {isIncome ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4" />
                        )}
                      </div>
                    </td>

                    {/* Category & Note */}
                    <td className="py-3.5">
                      <div className="flex flex-col">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          {tx.category?.nama || 'Tanpa Kategori'}
                        </span>
                        {tx.catatan && (
                          <span className="text-[11px] text-[#64748B] truncate max-w-[200px]">
                            {tx.catatan}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Account / Wallet */}
                    <td className="py-3.5 text-[#94A3B8]">
                      <span className="px-2 py-0.5 rounded-md bg-[#1B212E] text-[11px] font-medium text-white border border-[#252E40]">
                        {tx.account?.nama || 'Tunai'}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 text-[#94A3B8]">
                      {formatDateID(tx.tanggal)}
                    </td>

                    {/* Amount */}
                    <td
                      className={`py-3.5 text-right font-extrabold ${
                        isIncome ? 'text-[#10B981]' : 'text-white'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatRupiah(tx.amount)}
                    </td>

                    {/* Status Pill */}
                    <td className="py-3.5 pr-2 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30">
                        Selesai
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

