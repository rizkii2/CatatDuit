'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  Edit2,
  Calendar,
  Wallet as WalletIcon,
  Download,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { GroupedTransactions, AccountWithBalance, Category } from '@/types';
import { formatRupiah } from '@/lib/utils/format';
import { deleteTransactionAction } from '@/actions/transactions';
import Link from 'next/link';

interface TransactionListClientProps {
  initialGrouped: GroupedTransactions[];
  accounts: AccountWithBalance[];
  categories: Category[];
  totalIncome: number;
  totalExpense: number;
  totalCount: number;
}

export function TransactionListClient({
  initialGrouped,
  accounts,
  categories,
  totalIncome,
  totalExpense,
  totalCount,
}: TransactionListClientProps) {
  const [groupedList, setGroupedList] = useState<GroupedTransactions[]>(initialGrouped);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Client-side filtering for immediate snappy responsiveness
  const filteredGroups = groupedList
    .map((group) => {
      const filteredTx = group.transactions.filter((tx) => {
        if (typeFilter !== 'all' && tx.tipe !== typeFilter) return false;
        if (accountFilter !== 'all' && tx.account_id !== accountFilter) return false;
        if (categoryFilter !== 'all' && tx.category_id !== categoryFilter) return false;
        if (search.trim()) {
          const s = search.toLowerCase();
          const matchNote = tx.catatan?.toLowerCase().includes(s);
          const matchCat = tx.category?.nama?.toLowerCase().includes(s);
          const matchAcc = tx.account?.nama?.toLowerCase().includes(s);
          if (!matchNote && !matchCat && !matchAcc) return false;
        }
        return true;
      });

      const dayIncome = filteredTx
        .filter((t) => t.tipe === 'income')
        .reduce((sum, curr) => sum + Number(curr.amount), 0);
      const dayExpense = filteredTx
        .filter((t) => t.tipe === 'expense')
        .reduce((sum, curr) => sum + Number(curr.amount), 0);

      return {
        ...group,
        transactions: filteredTx,
        totalIncome: dayIncome,
        totalExpense: dayExpense,
      };
    })
    .filter((group) => group.transactions.length > 0);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) return;

    setDeletingId(id);
    const res = await deleteTransactionAction(id);
    setDeletingId(null);

    if (res.success) {
      setGroupedList((prev) =>
        prev
          .map((g) => ({
            ...g,
            transactions: g.transactions.filter((t) => t.id !== id),
          }))
          .filter((g) => g.transactions.length > 0)
      );
    } else {
      alert(res.error || 'Gagal menghapus transaksi');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#141721] border border-[#1F2433] rounded-xl p-4">
          <span className="text-xs text-[#94A3B8]">Total Transaksi</span>
          <div className="text-xl font-bold text-white mt-1">{totalCount} Item</div>
        </div>
        <div className="bg-[#141721] border border-[#1F2433] rounded-xl p-4">
          <span className="text-xs text-[#94A3B8]">Total Pemasukan</span>
          <div className="text-xl font-bold text-[#10B981] mt-1">
            +{formatRupiah(totalIncome)}
          </div>
        </div>
        <div className="bg-[#141721] border border-[#1F2433] rounded-xl p-4">
          <span className="text-xs text-[#94A3B8]">Total Pengeluaran</span>
          <div className="text-xl font-bold text-[#EF4444] mt-1">
            -{formatRupiah(totalExpense)}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-subly p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari transaksi berdasarkan catatan atau kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0E1118] border border-[#222736] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-[#64748B] focus:border-[#FF4D36] outline-none"
            />
          </div>

          {/* Quick Export to CSV */}
          <Link
            href="/api/export/csv"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1A1F2C] border border-[#273045] hover:bg-[#23293B] text-xs font-semibold text-white transition shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-[#FF4D36]" />
            <span>Ekspor CSV</span>
          </Link>
        </div>

        {/* Dropdowns row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#1F2433]">
          {/* Type Filter */}
          <div className="flex items-center p-0.5 bg-[#0E1118] border border-[#222736] rounded-lg text-xs">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                typeFilter === 'all' ? 'bg-[#FF4D36] text-white' : 'text-[#64748B] hover:text-white'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                typeFilter === 'expense' ? 'bg-[#FF4D36] text-white' : 'text-[#64748B] hover:text-white'
              }`}
            >
              Pengeluaran
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                typeFilter === 'income' ? 'bg-[#FF4D36] text-white' : 'text-[#64748B] hover:text-white'
              }`}
            >
              Pemasukan
            </button>
          </div>

          {/* Account Filter */}
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="bg-[#0E1118] border border-[#222736] rounded-lg px-2.5 py-1 text-xs text-[#94A3B8] focus:border-[#FF4D36] outline-none"
          >
            <option value="all">Semua Dompet</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.nama}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#0E1118] border border-[#222736] rounded-lg px-2.5 py-1 text-xs text-[#94A3B8] focus:border-[#FF4D36] outline-none"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nama} ({cat.tipe === 'income' ? 'Masuk' : 'Keluar'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grouped Transaction List (PRD FR-2) */}
      <div className="space-y-4">
        {filteredGroups.length === 0 ? (
          <div className="card-subly p-12 text-center text-[#64748B] space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-[#64748B]/60" />
            <p className="text-sm font-semibold text-white">Tidak ada transaksi ditemukan</p>
            <p className="text-xs">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div key={group.date} className="card-subly overflow-hidden">
              {/* Group Date Header */}
              <div className="bg-[#11141E] px-4 py-2.5 border-b border-[#1F2433] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#FF4D36]" />
                  <span className="font-bold text-white">{group.formattedDate}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-semibold">
                  {group.totalIncome > 0 && (
                    <span className="text-[#10B981]">+{formatRupiah(group.totalIncome)}</span>
                  )}
                  {group.totalExpense > 0 && (
                    <span className="text-[#EF4444]">-{formatRupiah(group.totalExpense)}</span>
                  )}
                </div>
              </div>

              {/* Transactions in Group */}
              <div className="divide-y divide-[#1A1F2C]">
                {group.transactions.map((tx) => {
                  const isIncome = tx.tipe === 'income';
                  return (
                    <div
                      key={tx.id}
                      className="px-4 py-3.5 flex items-center justify-between hover:bg-[#161B26] transition group"
                    >
                      {/* Left: Icon + Category + Note */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
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

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-white">
                              {tx.category?.nama || 'Tanpa Kategori'}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#1B212E] text-[#94A3B8] border border-[#252E40]">
                              {tx.account?.nama || 'Tunai'}
                            </span>
                          </div>
                          {tx.catatan && (
                            <p className="text-xs text-[#94A3B8] mt-0.5 line-clamp-1">
                              {tx.catatan}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Amount + Actions */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span
                            className={`text-xs sm:text-sm font-black block ${
                              isIncome ? 'text-[#10B981]' : 'text-white'
                            }`}
                          >
                            {isIncome ? '+' : '-'}
                            {formatRupiah(tx.amount)}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDelete(tx.id)}
                          disabled={deletingId === tx.id}
                          className="w-8 h-8 rounded-lg text-[#64748B] hover:text-[#EF4444] hover:bg-[#EF4444]/10 flex items-center justify-center transition opacity-70 group-hover:opacity-100"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

