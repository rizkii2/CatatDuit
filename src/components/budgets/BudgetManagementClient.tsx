'use client';

import React, { useState } from 'react';
import {
  PiggyBank,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { BudgetStatus, Category } from '@/types';
import { formatRupiah, parseRupiahInput, getFirstDayOfMonthWIB } from '@/lib/utils/format';
import { upsertBudgetAction, deleteBudgetAction } from '@/actions/budgets';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import Link from 'next/link';

interface BudgetManagementClientProps {
  initialBudgets: BudgetStatus[];
  expenseCategories: Category[];
  currentMonth: string;
}

export function BudgetManagementClient({
  initialBudgets,
  expenseCategories,
  currentMonth,
}: BudgetManagementClientProps) {
  const [budgets, setBudgets] = useState<BudgetStatus[]>(initialBudgets);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetStatus | null>(null);

  // Form State
  const [categoryId, setCategoryId] = useState('');
  const [limitDisplay, setLimitDisplay] = useState('');
  const [limitNum, setLimitNum] = useState(0);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Calculate totals
  const totalBudget = budgets.reduce((acc, curr) => acc + curr.batas, 0);
  const totalSpent = budgets.reduce((acc, curr) => acc + curr.terpakai, 0);
  const overallPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const openCreateModal = () => {
    setEditingBudget(null);
    setCategoryId(expenseCategories.length > 0 ? expenseCategories[0].id : '');
    setLimitDisplay('');
    setLimitNum(0);
    setErrorMsg(null);
    setShowModal(true);
  };

  const openEditModal = (b: BudgetStatus) => {
    setEditingBudget(b);
    setCategoryId(b.category_id);
    setLimitDisplay(b.batas.toLocaleString('id-ID'));
    setLimitNum(b.batas);
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseRupiahInput(e.target.value);
    setLimitNum(val);
    setLimitDisplay(val > 0 ? val.toLocaleString('id-ID') : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      setErrorMsg('Pilih kategori');
      return;
    }
    if (limitNum <= 0) {
      setErrorMsg('Batas anggaran harus lebih dari 0');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const monthFormatted = currentMonth.length === 7 ? `${currentMonth}-01` : currentMonth;
    const res = await upsertBudgetAction({
      category_id: categoryId,
      bulan: monthFormatted,
      batas: limitNum,
    });

    if (res.success && res.data) {
      // Reload or refresh state
      window.location.reload();
    } else {
      setErrorMsg(res.error || 'Gagal menyimpan anggaran');
      setLoading(false);
    }
  };

  const handleDelete = async (b: BudgetStatus) => {
    if (!confirm(`Hapus anggaran untuk kategori "${b.category_name}"?`)) return;

    const res = await deleteBudgetAction(b.id);
    if (res.success) {
      setBudgets((prev) => prev.filter((item) => item.id !== b.id));
    } else {
      alert(res.error || 'Gagal menghapus anggaran');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Overview & Action Banner */}
      <div className="card-subly p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-[#94A3B8] font-medium">Total Anggaran Bulan Ini</span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            {formatRupiah(totalBudget)}
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-xs">
            <span className="text-[#94A3B8]">
              Terpakai: <strong className="text-white">{formatRupiah(totalSpent)}</strong>
            </span>
            <span className="text-[#64748B]">•</span>
            <span
              className={`font-bold ${
                overallPercentage >= 100
                  ? 'text-[#EF4444]'
                  : overallPercentage >= 80
                  ? 'text-amber-400'
                  : 'text-[#10B981]'
              }`}
            >
              {overallPercentage}% Terpakai
            </span>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF4D36] to-[#FF634F] hover:from-[#FF5D47] hover:to-[#FF735F] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#FF4D36]/20 transition shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tetapkan Anggaran</span>
        </button>
      </div>

      {/* Budget Progress Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.length === 0 ? (
          <div className="col-span-full card-subly p-12 text-center text-[#64748B] space-y-3">
            <PiggyBank className="w-10 h-10 mx-auto text-[#64748B]/60" />
            <p className="text-sm font-bold text-white">Belum Ada Anggaran yang Ditetapkan</p>
            <p className="text-xs max-w-md mx-auto">
              Tetapkan batas bulanan untuk kategori pengeluaran Anda agar sistem dapat memberikan
              peringatan saat anggaran mendekati batas.
            </p>
            <button
              onClick={openCreateModal}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1C2130] hover:bg-[#252C3D] border border-[#273045] text-xs font-semibold text-white transition"
            >
              <Plus className="w-3.5 h-3.5 text-[#FF4D36]" />
              <span>Buat Anggaran Pertama</span>
            </button>
          </div>
        ) : (
          budgets.map((b) => {
            const isExceeded = b.status === 'melebihi';
            const isWarning = b.status === 'peringatan';

            return (
              <div
                key={b.id}
                className="card-subly p-5 flex flex-col justify-between hover:border-[#2E364A] transition group"
              >
                <div>
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: b.category_color }}
                      >
                        <CategoryIcon name={b.category_icon} className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{b.category_name}</h3>
                        <span className="text-[10px] text-[#64748B]">Batas Bulanan</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition">
                      <button
                        onClick={() => openEditModal(b)}
                        className="w-7 h-7 rounded-lg bg-[#191E2B] hover:bg-[#252C3D] text-[#94A3B8] hover:text-white flex items-center justify-center transition"
                        title="Ubah Anggaran"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(b)}
                        className="w-7 h-7 rounded-lg bg-[#191E2B] hover:bg-red-500/10 text-[#64748B] hover:text-red-400 flex items-center justify-center transition"
                        title="Hapus Anggaran"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Numbers */}
                  <div className="flex items-baseline justify-between mt-4 mb-2">
                    <div>
                      <span className="text-xs text-[#94A3B8]">Terpakai: </span>
                      <span className="text-sm font-extrabold text-white">
                        {formatRupiah(b.terpakai)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[#94A3B8]">Batas: </span>
                      <span className="text-sm font-extrabold text-white">
                        {formatRupiah(b.batas)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar (PRD FR-7: Hijau <80%, Kuning 80-100%, Merah >100%) */}
                  <div className="w-full h-2.5 bg-[#0E1118] border border-[#1F2433] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isExceeded
                          ? 'bg-[#EF4444]'
                          : isWarning
                          ? 'bg-[#F59E0B]'
                          : 'bg-[#10B981]'
                      }`}
                      style={{ width: `${Math.min(b.persentase, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Footer status text */}
                <div className="mt-4 pt-3 border-t border-[#1F2433] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {isExceeded ? (
                      <span className="flex items-center gap-1 text-[#EF4444] font-semibold text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Melebihi Anggaran ({b.persentase}%)</span>
                      </span>
                    ) : isWarning ? (
                      <span className="flex items-center gap-1 text-amber-400 font-semibold text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Hampir Habis ({b.persentase}%)</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[#10B981] font-semibold text-[11px]">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Aman ({b.persentase}%)</span>
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-[#94A3B8]">
                    {b.sisa >= 0 ? `Sisa: ${formatRupiah(b.sisa)}` : `Lebih: ${formatRupiah(Math.abs(b.sisa))}`}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Upsert Budget */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#141721] border border-[#23293B] rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1F2433]">
              <h3 className="text-sm font-bold text-white">
                {editingBudget ? 'Ubah Batas Anggaran' : 'Tetapkan Anggaran Bulanan'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-lg bg-[#1A1F2C] text-[#94A3B8] hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#94A3B8] block mb-1">
                  Pilih Kategori Pengeluaran
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={!!editingBudget}
                  className="w-full bg-[#0E1118] border border-[#222736] rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D36] outline-none disabled:opacity-50"
                >
                  {expenseCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#94A3B8] block mb-1">
                  Batas Anggaran Bulanan (Rupiah)
                </label>
                <div className="flex items-center bg-[#0E1118] border border-[#222736] rounded-xl px-3 py-2 focus-within:border-[#FF4D36]">
                  <span className="text-xs font-bold text-[#64748B] mr-2">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Contoh: 1.500.000"
                    value={limitDisplay}
                    onChange={handleAmountChange}
                    className="w-full bg-transparent text-xs font-bold text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || limitNum <= 0}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FF4D36] to-[#FF634F] hover:from-[#FF5D47] hover:to-[#FF735F] text-white font-bold text-xs shadow-md shadow-[#FF4D36]/20 transition disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : 'Simpan Anggaran'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

