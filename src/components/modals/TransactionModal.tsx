'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, AlertTriangle, CheckCircle, Calendar, Wallet as WalletIcon, Tag } from 'lucide-react';
import { createTransactionAction } from '@/actions/transactions';
import { getAccountsAction } from '@/actions/accounts';
import { getCategoriesAction } from '@/actions/categories';
import { AccountWithBalance, Category } from '@/types';
import { formatRupiah, parseRupiahInput, getTodayWIB } from '@/lib/utils/format';
import { CategoryIcon } from '@/components/ui/CategoryIcon';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
}: TransactionModalProps) {
  const [tipe, setTipe] = useState<'expense' | 'income'>('expense');
  const [displayAmount, setDisplayAmount] = useState<string>('');
  const [numericAmount, setNumericAmount] = useState<number>(0);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [tanggal, setTanggal] = useState<string>(getTodayWIB());
  const [catatan, setCatatan] = useState<string>('');

  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load accounts and categories
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setErrorMsg(null);
      setWarningMsg(null);
      setSuccessMsg(null);

      const [accRes, catRes] = await Promise.all([
        getAccountsAction(false),
        getCategoriesAction(tipe, false),
      ]);

      if (isMounted) {
        if (accRes.success && accRes.data) {
          setAccounts(accRes.data);
          if (accRes.data.length > 0 && !selectedAccountId) {
            setSelectedAccountId(accRes.data[0].id);
          }
        }
        if (catRes.success && catRes.data) {
          setCategories(catRes.data);
          if (catRes.data.length > 0) {
            setSelectedCategoryId(catRes.data[0].id);
          }
        }
        setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, tipe]);

  // When tipe changes, reload categories for that type
  const handleTypeChange = async (newType: 'expense' | 'income') => {
    setTipe(newType);
    const catRes = await getCategoriesAction(newType, false);
    if (catRes.success && catRes.data) {
      setCategories(catRes.data);
      if (catRes.data.length > 0) {
        setSelectedCategoryId(catRes.data[0].id);
      }
    }
  };

  // Format currency as user types (e.g. 1.250.000)
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const num = parseRupiahInput(rawValue);
    setNumericAmount(num);
    setDisplayAmount(num > 0 ? num.toLocaleString('id-ID') : '');
  };

  // Preset chips (e.g. +10.000, +50.000)
  const handleAddPreset = (addon: number) => {
    const newTotal = numericAmount + addon;
    setNumericAmount(newTotal);
    setDisplayAmount(newTotal.toLocaleString('id-ID'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setWarningMsg(null);

    if (numericAmount <= 0) {
      setErrorMsg('Nominal transaksi harus lebih dari 0');
      return;
    }
    if (!selectedAccountId) {
      setErrorMsg('Pilih dompet yang digunakan');
      return;
    }
    if (!selectedCategoryId) {
      setErrorMsg('Pilih kategori transaksi');
      return;
    }

    setSubmitting(true);

    try {
      const res = await createTransactionAction({
        account_id: selectedAccountId,
        category_id: selectedCategoryId,
        tipe,
        amount: numericAmount,
        tanggal,
        catatan: catatan.trim() || undefined,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Gagal menyimpan transaksi');
        setSubmitting(false);
        return;
      }

      setSuccessMsg('Transaksi berhasil disimpan!');

      if (res.data?.budgetWarning) {
        setWarningMsg(res.data.budgetWarning.message);
      }

      setTimeout(() => {
        // Reset form
        setDisplayAmount('');
        setNumericAmount(0);
        setCatatan('');
        setSuccessMsg(null);
        setWarningMsg(null);
        setSubmitting(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem');
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#141721] border border-[#23293B] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1F2433]">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                tipe === 'expense'
                  ? 'bg-[#EF4444]/20 text-[#EF4444]'
                  : 'bg-[#10B981]/20 text-[#10B981]'
              }`}
            >
              {tipe === 'expense' ? (
                <ArrowDownRight className="w-4 h-4" />
              ) : (
                <ArrowUpRight className="w-4 h-4" />
              )}
            </div>
            <h2 className="text-base font-bold text-white">Catat Transaksi</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1C202C] text-[#94A3B8] hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5">
          {/* Status Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {warningMsg && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{warningMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Type Switcher Pills */}
          <div className="grid grid-cols-2 p-1 bg-[#0E1118] border border-[#222736] rounded-xl gap-1">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
                tipe === 'expense'
                  ? 'bg-[#EF4444] text-white shadow-md shadow-[#EF4444]/20'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Pengeluaran</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
                tipe === 'income'
                  ? 'bg-[#10B981] text-white shadow-md shadow-[#10B981]/20'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Pemasukan</span>
            </button>
          </div>

          {/* Big Amount Input */}
          <div className="bg-[#0E1118] border border-[#222736] rounded-xl p-4 text-center focus-within:border-[#FF4D36] transition">
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
              Nominal (Rupiah)
            </span>
            <div className="flex items-center justify-center text-white">
              <span className="text-xl sm:text-2xl font-bold text-[#64748B] mr-1.5">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                placeholder="0"
                value={displayAmount}
                onChange={handleAmountChange}
                className="w-full bg-transparent text-2xl sm:text-4xl font-extrabold text-white text-center outline-none tracking-tight placeholder:text-[#2A3142]"
              />
            </div>

            {/* Quick Add Presets */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 pt-3 border-t border-[#1F2433]">
              {[10000, 20000, 50000, 100000, 500000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAddPreset(preset)}
                  className="px-2.5 py-1 rounded-lg bg-[#181C26] hover:bg-[#232938] border border-[#252C3D] text-[11px] font-medium text-[#94A3B8] hover:text-white transition active:scale-95"
                >
                  +{preset >= 1000 ? `${preset / 1000}rb` : preset}
                </button>
              ))}
            </div>
          </div>

          {/* Category Picker */}
          <div>
            <label className="text-xs font-semibold text-[#94A3B8] flex items-center gap-1.5 mb-2">
              <Tag className="w-3.5 h-3.5 text-[#FF4D36]" />
              <span>Kategori</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 bg-[#0E1118] border border-[#222736] rounded-xl">
              {categories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg text-center transition border ${
                      isSelected
                        ? 'bg-[#1E2433] border-[#FF4D36] text-white shadow-sm'
                        : 'border-transparent text-[#94A3B8] hover:bg-[#161A24] hover:text-white'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center mb-1 text-white text-xs"
                      style={{ backgroundColor: cat.warna }}
                    >
                      <CategoryIcon name={cat.ikon} className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-medium truncate w-full">
                      {cat.nama}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account / Wallet Selector */}
          <div>
            <label className="text-xs font-semibold text-[#94A3B8] flex items-center gap-1.5 mb-2">
              <WalletIcon className="w-3.5 h-3.5 text-[#FF4D36]" />
              <span>Dompet / Sumber Dana</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {accounts.map((acc) => {
                const isSelected = selectedAccountId === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setSelectedAccountId(acc.id)}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-[#1A202E] border-[#FF4D36] text-white'
                        : 'bg-[#0E1118] border-[#222736] text-[#94A3B8] hover:border-[#323B4E]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white truncate">
                        {acc.nama}
                      </span>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#23293A] text-[#94A3B8]">
                        {acc.tipe}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#10B981] font-semibold block truncate">
                      {formatRupiah(acc.saldo_saat_ini)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Note in Two Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#94A3B8] flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Tanggal</span>
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full bg-[#0E1118] border border-[#222736] rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D36] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#94A3B8] block mb-1.5">
                Catatan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Makan siang nasi padang"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                maxLength={255}
                className="w-full bg-[#0E1118] border border-[#222736] rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D36] outline-none placeholder:text-[#64748B]"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || loading || numericAmount <= 0}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF4D36] to-[#FF634F] hover:from-[#FF5D47] hover:to-[#FF735F] text-white font-bold text-sm shadow-lg shadow-[#FF4D36]/25 transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Simpan Transaksi ({formatRupiah(numericAmount)})</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

