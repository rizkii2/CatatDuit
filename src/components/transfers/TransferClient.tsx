'use client';

import React, { useState } from 'react';
import {
  ArrowLeftRight,
  ArrowRight,
  Wallet,
  Calendar,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import { AccountWithBalance, TransferWithDetails } from '@/types';
import { formatRupiah, parseRupiahInput, getTodayWIB, formatDateID } from '@/lib/utils/format';
import { createTransferAction, deleteTransferAction } from '@/actions/transfers';

interface TransferClientProps {
  accounts: AccountWithBalance[];
  initialTransfers: TransferWithDetails[];
}

export function TransferClient({
  accounts,
  initialTransfers,
}: TransferClientProps) {
  const [transfers, setTransfers] = useState<TransferWithDetails[]>(initialTransfers);

  // Form State
  const [dariAccountId, setDariAccountId] = useState(accounts.length > 0 ? accounts[0].id : '');
  const [keAccountId, setKeAccountId] = useState(accounts.length > 1 ? accounts[1].id : '');
  const [displayAmount, setDisplayAmount] = useState('');
  const [numericAmount, setNumericAmount] = useState(0);
  const [displayAdminFee, setDisplayAdminFee] = useState('');
  const [numericAdminFee, setNumericAdminFee] = useState(0);
  const [tanggal, setTanggal] = useState(getTodayWIB());
  const [catatan, setCatatan] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseRupiahInput(e.target.value);
    setNumericAmount(val);
    setDisplayAmount(val > 0 ? val.toLocaleString('id-ID') : '');
  };

  const handleAdminFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseRupiahInput(e.target.value);
    setNumericAdminFee(val);
    setDisplayAdminFee(val > 0 ? val.toLocaleString('id-ID') : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (dariAccountId === keAccountId) {
      setErrorMsg('Dompet asal dan tujuan tidak boleh sama');
      return;
    }
    if (numericAmount <= 0) {
      setErrorMsg('Nominal transfer harus lebih dari 0');
      return;
    }

    setLoading(true);

    const res = await createTransferAction({
      dari_account_id: dariAccountId,
      ke_account_id: keAccountId,
      amount: numericAmount,
      biaya_admin: numericAdminFee,
      tanggal,
      catatan: catatan.trim() || undefined,
    });

    if (res.success && res.data) {
      setSuccessMsg('Transfer antar dompet berhasil!');
      setDisplayAmount('');
      setNumericAmount(0);
      setDisplayAdminFee('');
      setNumericAdminFee(0);
      setCatatan('');

      // Reload or refresh state
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } else {
      setErrorMsg(res.error || 'Gagal menyimpan transaksi transfer');
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus catatan transfer ini?')) return;

    const res = await deleteTransferAction(id);
    if (res.success) {
      setTransfers((prev) => prev.filter((t) => t.id !== id));
    } else {
      alert(res.error || 'Gagal menghapus transfer');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Transfer Form (Left Column) */}
      <div className="lg:col-span-5">
        <div className="card-subly p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1F2433]">
            <div className="w-8 h-8 rounded-lg bg-[#FF4D36]/15 text-[#FF4D36] flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Transfer Dana</h2>
              <p className="text-[11px] text-[#64748B]">Pindah saldo antar dompet pribadi</p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Source & Destination Wallets */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#94A3B8] block mb-1">
                  Dari Dompet (Asal)
                </label>
                <select
                  value={dariAccountId}
                  onChange={(e) => setDariAccountId(e.target.value)}
                  className="w-full bg-[#0E1118] border border-[#222736] rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D36] outline-none"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.nama} ({formatRupiah(acc.saldo_saat_ini)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#94A3B8] block mb-1">
                  Ke Dompet (Tujuan)
                </label>
                <select
                  value={keAccountId}
                  onChange={(e) => setKeAccountId(e.target.value)}
                  className="w-full bg-[#0E1118] border border-[#222736] rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D36] outline-none"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.nama} ({formatRupiah(acc.saldo_saat_ini)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nominal Amount */}
            <div>
              <label className="text-xs font-semibold text-[#94A3B8] block mb-1">
                Nominal Transfer (Rupiah)
              </label>
              <div className="flex items-center bg-[#0E1118] border border-[#222736] rounded-xl px-3 py-2.5 focus-within:border-[#FF4D36]">
                <span className="text-xs font-bold text-[#64748B] mr-2">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={displayAmount}
                  onChange={handleAmountChange}
                  className="w-full bg-transparent text-sm font-bold text-white outline-none"
                />
              </div>
            </div>

            {/* Biaya Admin & Tanggal */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#94A3B8] block mb-1">
                  Biaya Admin (Opsional)
                </label>
                <div className="flex items-center bg-[#0E1118] border border-[#222736] rounded-xl px-3 py-2 focus-within:border-[#FF4D36]">
                  <span className="text-xs text-[#64748B] mr-1.5">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={displayAdminFee}
                    onChange={handleAdminFeeChange}
                    className="w-full bg-transparent text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#94A3B8] block mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full bg-[#0E1118] border border-[#222736] rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D36] outline-none"
                />
              </div>
            </div>

            {/* Catatan */}
            <div>
              <label className="text-xs font-semibold text-[#94A3B8] block mb-1">
                Catatan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Top up GoPay dari BCA"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="w-full bg-[#0E1118] border border-[#222736] rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D36] outline-none placeholder:text-[#64748B]"
              />
            </div>

            <button
              type="submit"
              disabled={loading || numericAmount <= 0}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FF4D36] to-[#FF634F] hover:from-[#FF5D47] hover:to-[#FF735F] text-white font-bold text-xs shadow-md shadow-[#FF4D36]/20 transition disabled:opacity-50"
            >
              {loading ? 'Memproses Transfer...' : 'Kirim Transfer Dana'}
            </button>
          </form>
        </div>
      </div>

      {/* Transfer History Table (Right Column) */}
      <div className="lg:col-span-7">
        <div className="card-subly p-5">
          <h2 className="text-sm font-bold text-white mb-3">Riwayat Transfer</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1F2433] text-[#64748B] font-semibold">
                  <th className="pb-3 pl-2">Rute Transfer</th>
                  <th className="pb-3">Tanggal & Catatan</th>
                  <th className="pb-3 text-right">Nominal</th>
                  <th className="pb-3 text-right">Admin</th>
                  <th className="pb-3 pr-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1F2C]">
                {transfers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#64748B]">
                      Belum ada riwayat transfer dana antar dompet.
                    </td>
                  </tr>
                ) : (
                  transfers.map((tr) => (
                    <tr key={tr.id} className="hover:bg-[#161B26] transition group">
                      <td className="py-3 pl-2">
                        <div className="flex items-center gap-1.5 font-bold text-white">
                          <span>{tr.dari_account?.nama || 'Asal'}</span>
                          <ArrowRight className="w-3 h-3 text-[#FF4D36]" />
                          <span>{tr.ke_account?.nama || 'Tujuan'}</span>
                        </div>
                      </td>

                      <td className="py-3 text-[#94A3B8]">
                        <div>{formatDateID(tr.tanggal)}</div>
                        {tr.catatan && (
                          <div className="text-[10px] text-[#64748B] truncate max-w-[150px]">
                            {tr.catatan}
                          </div>
                        )}
                      </td>

                      <td className="py-3 text-right font-black text-white">
                        {formatRupiah(tr.amount)}
                      </td>

                      <td className="py-3 text-right text-[#EF4444] text-[11px]">
                        {tr.biaya_admin > 0 ? formatRupiah(tr.biaya_admin) : '-'}
                      </td>

                      <td className="py-3 pr-2 text-right">
                        <button
                          onClick={() => handleDelete(tr.id)}
                          className="w-7 h-7 rounded-lg text-[#64748B] hover:text-[#EF4444] hover:bg-[#EF4444]/10 inline-flex items-center justify-center transition"
                          title="Hapus Transfer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

