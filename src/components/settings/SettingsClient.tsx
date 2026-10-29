'use client';

import React, { useState } from 'react';
import {
  User,
  Download,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  ShieldAlert,
} from 'lucide-react';
import { Profile } from '@/types';
import { updateProfileAction, deleteAccountAction } from '@/actions/auth';
import { exportTransactionsCSVAction } from '@/actions/export';
import { getTodayWIB, formatDateID } from '@/lib/utils/format';

interface SettingsClientProps {
  profile: Profile | null;
  userEmail?: string;
}

export function SettingsClient({ profile, userEmail }: SettingsClientProps) {
  // Profile State
  const [nama, setNama] = useState(profile?.nama || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // CSV Export State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(getTodayWIB());
  const [exportLoading, setExportLoading] = useState(false);
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  // Delete Account State
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;

    setProfileLoading(true);
    setProfileMsg(null);

    const res = await updateProfileAction({ nama: nama.trim() });
    if (res.success) {
      setProfileMsg({ type: 'success', text: 'Profil berhasil diperbarui!' });
    } else {
      setProfileMsg({ type: 'error', text: res.error || 'Gagal memperbarui profil' });
    }
    setProfileLoading(false);
  };

  const handleExportCSV = async () => {
    setExportLoading(true);
    setExportMsg(null);

    const res = await exportTransactionsCSVAction(
      startDate || undefined,
      endDate || undefined
    );

    if (res.success && res.data) {
      // Create a blob and trigger browser download
      const blob = new Blob([res.data.csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', res.data.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportMsg(`Berhasil mengekspor ${res.data.count} transaksi ke CSV.`);
    } else {
      setExportMsg(res.error || 'Gagal mengekspor data.');
    }

    setExportLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'HAPUS AKUN') {
      alert('Ketik "HAPUS AKUN" dengan huruf besar untuk mengonfirmasi.');
      return;
    }

    if (
      !confirm(
        'PERINGATAN TERAKHIR: Semua data transaksi, dompet, kategori, dan anggaran Anda akan dihapus secara permanen dan tidak dapat dipulihkan. Lanjutkan?'
      )
    ) {
      return;
    }

    setDeleteLoading(true);
    await deleteAccountAction();
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* 1. Profile Section */}
      <div className="card-subly p-5 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#1F2433]">
          <div className="w-8 h-8 rounded-lg bg-[#FF4D36]/15 text-[#FF4D36] flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Profil Pengguna</h2>
            <p className="text-[11px] text-[#64748B]">Kelola identitas dan akun</p>
          </div>
        </div>

        {profileMsg && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              profileMsg.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}
          >
            {profileMsg.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{profileMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#94A3B8] block mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full bg-[#0E1118] border border-[#222736] rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D36] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#94A3B8] block mb-1">
                Alamat Email
              </label>
              <input
                type="text"
                disabled
                value={userEmail || 'user@example.com'}
                className="w-full bg-[#0E1118]/50 border border-[#222736] rounded-xl px-3 py-2 text-xs text-[#64748B] outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={profileLoading || !nama.trim()}
            className="px-4 py-2 rounded-xl bg-[#1C2130] hover:bg-[#252C3D] border border-[#273045] text-xs font-semibold text-white transition disabled:opacity-50"
          >
            {profileLoading ? 'Menyimpan...' : 'Perbarui Profil'}
          </button>
        </form>
      </div>

      {/* 2. CSV Export Section (FR-8) */}
      <div className="card-subly p-5 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#1F2433]">
          <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/15 text-[#3B82F6] flex items-center justify-center">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Ekspor Data Transaksi (CSV)</h2>
            <p className="text-[11px] text-[#64748B]">
              Unduh riwayat transaksi Anda ke file spreadsheet (Excel / CSV)
            </p>
          </div>
        </div>

        {exportMsg && (
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{exportMsg}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#94A3B8] block mb-1">
                Dari Tanggal (Opsional)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#0E1118] border border-[#222736] rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D36] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#94A3B8] block mb-1">
                Sampai Tanggal (Opsional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#0E1118] border border-[#222736] rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D36] outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={exportLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF4D36] to-[#FF634F] hover:from-[#FF5D47] hover:to-[#FF735F] text-white font-bold text-xs shadow-md shadow-[#FF4D36]/20 transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{exportLoading ? 'Menyiapkan CSV...' : 'Unduh Data CSV'}</span>
          </button>
        </div>
      </div>

      {/* 3. Delete Account Section (FR-8) */}
      <div className="card-subly p-5 space-y-4 border-red-500/20">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#1F2433]">
          <div className="w-8 h-8 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-red-400">Zona Bahaya — Hapus Akun</h2>
            <p className="text-[11px] text-[#64748B]">
              Hapus akun dan seluruh catatan keuangan Anda secara permanen.
            </p>
          </div>
        </div>

        <div className="space-y-3 bg-[#0E1118] border border-red-500/20 rounded-xl p-4">
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Menghapus akun akan langsung menghapus seluruh profil, dompet, kategori, transaksi, dan
            anggaran Anda dari database Supabase. Data yang telah dihapus tidak dapat dipulihkan.
          </p>

          <div>
            <label className="text-[11px] font-semibold text-red-400 block mb-1">
              Ketik <strong>HAPUS AKUN</strong> untuk konfirmasi:
            </label>
            <input
              type="text"
              placeholder="HAPUS AKUN"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full sm:w-64 bg-[#141721] border border-red-500/30 rounded-xl px-3 py-2 text-xs text-white focus:border-red-500 outline-none"
            />
          </div>

          <button
            onClick={handleDeleteAccount}
            disabled={deleteLoading || deleteConfirmText !== 'HAPUS AKUN'}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            <span>{deleteLoading ? 'Menghapus Akun...' : 'Hapus Seluruh Data Saya'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

