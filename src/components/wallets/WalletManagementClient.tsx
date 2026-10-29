'use client';

import React, { useState } from 'react';
import {
  Wallet as WalletIcon,
  CreditCard,
  Smartphone,
  Plus,
  Archive,
  RotateCcw,
  Trash2,
  Edit2,
  X,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { AccountWithBalance } from '@/types';
import { formatRupiah, parseRupiahInput } from '@/lib/utils/format';
import {
  createAccountAction,
  updateAccountAction,
  archiveAccountAction,
  deleteAccountAction,
} from '@/actions/accounts';

interface WalletManagementClientProps {
  initialAccounts: AccountWithBalance[];
}

export function WalletManagementClient({
  initialAccounts,
}: WalletManagementClientProps) {
  const [accounts, setAccounts] = useState<AccountWithBalance[]>(initialAccounts);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountWithBalance | null>(null);

  // Form State
  const [nama, setNama] = useState('');
  const [tipe, setTipe] = useState<'cash' | 'bank' | 'ewallet'>('cash');
  const [saldoAwalDisplay, setSaldoAwalDisplay] = useState('');
  const [saldoAwalNum, setSaldoAwalNum] = useState(0);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const activeAccounts = accounts.filter((a) => !a.is_archived);
  const archivedAccounts = accounts.filter((a) => a.is_archived);

  const totalActiveBalance = activeAccounts.reduce(
    (acc, curr) => acc + Number(curr.saldo_saat_ini || 0),
    0
  );

  const getWalletIcon = (wType: string) => {
    switch (wType) {
      case 'bank':
        return <CreditCard className="w-5 h-5 text-[#3B82F6]" />;
      case 'ewallet':
        return <Smartphone className="w-5 h-5 text-[#10B981]" />;
      default:
        return <WalletIcon className="w-5 h-5 text-[#FF4D36]" />;
    }
  };

  const openCreateModal = () => {
    setEditingAccount(null);
    setNama('');
    setTipe('cash');
    setSaldoAwalDisplay('');
    setSaldoAwalNum(0);
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowModal(true);
  };

  const openEditModal = (acc: AccountWithBalance) => {
    setEditingAccount(acc);
    setNama(acc.nama);
    setTipe(acc.tipe);
    setSaldoAwalDisplay(acc.saldo_awal.toLocaleString('id-ID'));
    setSaldoAwalNum(acc.saldo_awal);
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowModal(true);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseRupiahInput(e.target.value);
    setSaldoAwalNum(val);
    setSaldoAwalDisplay(val > 0 ? val.toLocaleString('id-ID') : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setErrorMsg('Nama dompet wajib diisi');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    if (editingAccount) {
      // Update
      const res = await updateAccountAction(editingAccount.id, {
        nama: nama.trim(),
        tipe,
      });
      if (res.success && res.data) {
        setAccounts((prev) =>
          prev.map((a) => (a.id === editingAccount.id ? { ...a, nama: nama.trim(), tipe } : a))
        );
        setShowModal(false);
      } else {
        setErrorMsg(res.error || 'Gagal memperbarui dompet');
      }
    } else {
      // Create
      const res = await createAccountAction({
        nama: nama.trim(),
        tipe,
        saldo_awal: saldoAwalNum,
      });
      if (res.success && res.data) {
        const newAcc: AccountWithBalance = {
          ...res.data,
          saldo_saat_ini: res.data.saldo_awal,
        };
        setAccounts((prev) => [...prev, newAcc]);
        setShowModal(false);
      } else {
        setErrorMsg(res.error || 'Gagal membuat dompet baru');
      }
    }
    setLoading(false);
  };

  const handleArchiveToggle = async (acc: AccountWithBalance) => {
    const nextState = !acc.is_archived;
    const confirmText = nextState
      ? `Arsipkan dompet "${acc.nama}"? Dompet ini tidak akan muncul di daftar transaksi baru.`
      : `Aktifkan kembali dompet "${acc.nama}"?`;

    if (!confirm(confirmText)) return;

    const res = await archiveAccountAction(acc.id, nextState);
    if (res.success) {
      setAccounts((prev) =>
        prev.map((a) => (a.id === acc.id ? { ...a, is_archived: nextState } : a))
      );
    } else {
      alert(res.error || 'Gagal mengubah status arsip');
    }
  };

  const handleDelete = async (acc: AccountWithBalance) => {
    if (!confirm(`Hapus permanen dompet "${acc.nama}"? Tindakan ini tidak dapat dibatalkan.`)) return;

    const res = await deleteAccountAction(acc.id);
    if (res.success) {
      setAccounts((prev) => prev.filter((a) => a.id !== acc.id));
    } else {
      alert(res.error || 'Gagal menghapus dompet');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Total Balance */}
      <div className="card-subly p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-[#94A3B8] font-medium">Akumulasi Seluruh Dompet</span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            {formatRupiah(totalActiveBalance)}
          </div>
          <span className="text-xs text-[#10B981] font-semibold mt-1 block">
            {activeAccounts.length} Dompet Aktif
          </span>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF4D36] to-[#FF634F] hover:from-[#FF5D47] hover:to-[#FF735F] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#FF4D36]/20 transition shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tambah Dompet Baru</span>
        </button>
      </div>

      {/* Active Wallets Grid */}
      <div>
        <h2 className="text-sm font-bold text-white mb-3">Dompet Aktif</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeAccounts.map((acc) => (
            <div
              key={acc.id}
              className="card-subly p-5 flex flex-col justify-between hover:border-[#2E364A] transition group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#191E2B] border border-[#262D3D] flex items-center justify-center">
                      {getWalletIcon(acc.tipe)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{acc.nama}</h3>
                      <span className="text-[10px] uppercase font-semibold text-[#64748B]">
                        {acc.tipe}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition">
                    <button
                      onClick={() => openEditModal(acc)}
                      className="w-7 h-7 rounded-lg bg-[#191E2B] hover:bg-[#252C3D] text-[#94A3B8] hover:text-white flex items-center justify-center transition"
                      title="Ubah Nama"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleArchiveToggle(acc)}
                      className="w-7 h-7 rounded-lg bg-[#191E2B] hover:bg-amber-500/10 text-[#94A3B8] hover:text-amber-400 flex items-center justify-center transition"
                      title="Arsipkan Dompet"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(acc)}
                      className="w-7 h-7 rounded-lg bg-[#191E2B] hover:bg-red-500/10 text-[#64748B] hover:text-red-400 flex items-center justify-center transition"
                      title="Hapus Dompet"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-[10px] text-[#64748B] uppercase font-semibold block">
                    Saldo Saat Ini
                  </span>
                  <div className="text-xl font-black text-white mt-0.5">
                    {formatRupiah(acc.saldo_saat_ini)}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1F2433] flex items-center justify-between text-[11px] text-[#64748B]">
                <span>Saldo Awal:</span>
                <span className="font-medium text-[#94A3B8]">{formatRupiah(acc.saldo_awal)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Archived Wallets */}
      {archivedAccounts.length > 0 && (
        <div className="pt-4 border-t border-[#1F2433]">
          <h2 className="text-sm font-bold text-[#64748B] mb-3">Dompet Diarsipkan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
            {archivedAccounts.map((acc) => (
              <div
                key={acc.id}
                className="bg-[#11141E] border border-[#1A1F2C] rounded-2xl p-4 flex items-center justify-between"
              >
                <div>
                  <h3 className="text-xs font-bold text-white line-through">{acc.nama}</h3>
                  <span className="text-xs text-[#94A3B8]">{formatRupiah(acc.saldo_saat_ini)}</span>
                </div>
                <button
                  onClick={() => handleArchiveToggle(acc)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B212E] hover:bg-[#252E40] text-xs font-semibold text-[#10B981] transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Aktifkan</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Add / Edit Wallet */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#141721] border border-[#23293B] rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1F2433]">
              <h3 className="text-sm font-bold text-white">
                {editingAccount ? 'Ubah Dompet' : 'Tambah Dompet Baru'}
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
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#94A3B8] block mb-1">
                  Nama Dompet
                </label>
                <input
                  type="text"
                  placeholder="Contoh: BCA Utama, GoPay, Tunai Dompet"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full bg-[#0E1118] border border-[#222736] rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D36] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#94A3B8] block mb-1">
                  Tipe Dompet
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cash', label: 'Tunai', icon: WalletIcon },
                    { id: 'bank', label: 'Bank', icon: CreditCard },
                    { id: 'ewallet', label: 'E-Wallet', icon: Smartphone },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = tipe === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTipe(t.id as any)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-[#1D2333] border-[#FF4D36] text-white shadow-sm'
                            : 'bg-[#0E1118] border-[#222736] text-[#94A3B8] hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {!editingAccount && (
                <div>
                  <label className="text-xs font-semibold text-[#94A3B8] block mb-1">
                    Saldo Awal (Rupiah)
                  </label>
                  <div className="flex items-center bg-[#0E1118] border border-[#222736] rounded-xl px-3 py-2 focus-within:border-[#FF4D36]">
                    <span className="text-xs font-bold text-[#64748B] mr-2">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={saldoAwalDisplay}
                      onChange={handleAmountChange}
                      className="w-full bg-transparent text-xs font-bold text-white outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !nama.trim()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FF4D36] to-[#FF634F] hover:from-[#FF5D47] hover:to-[#FF735F] text-white font-bold text-xs shadow-md shadow-[#FF4D36]/20 transition disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : editingAccount ? 'Simpan Perubahan' : 'Buat Dompet'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

