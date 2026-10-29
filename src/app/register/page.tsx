'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Flame, Mail, Lock, User, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { signUpAction } from '@/actions/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password.length < 6) {
      setErrorMsg('Password minimal 6 karakter');
      return;
    }

    setLoading(true);

    try {
      const res = await signUpAction({
        nama: nama.trim() || undefined,
        email,
        password,
      });

      if (res.success && res.data) {
        if (res.data.requiresEmailConfirmation) {
          setSuccessMsg(
            'Pendaftaran berhasil! Silakan periksa inbox email Anda untuk konfirmasi aktivasi akun.'
          );
        } else {
          setSuccessMsg('Akun berhasil dibuat! Mengalihkan ke dasbor...');
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
        }
      } else {
        setErrorMsg(res.error || 'Gagal mendaftar akun baru.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D13] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF4D36] to-[#FF7A59] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#FF4D36]/30">
            <Flame className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Catat<span className="text-[#FF4D36]">Duit</span>
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Daftar akun gratis dan mulai pantau keuangan harianmu dalam 10 detik
          </p>
        </div>

        {/* Register Card */}
        <div className="card-subly p-6 sm:p-8 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#94A3B8] block mb-1.5">
                Nama Lengkap
              </label>
              <div className="flex items-center bg-[#0E1118] border border-[#222736] rounded-xl px-3 py-2.5 focus-within:border-[#FF4D36] transition">
                <User className="w-4 h-4 text-[#64748B] mr-2" />
                <input
                  type="text"
                  required
                  placeholder="Budi Santoso"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#64748B]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#94A3B8] block mb-1.5">
                Alamat Email
              </label>
              <div className="flex items-center bg-[#0E1118] border border-[#222736] rounded-xl px-3 py-2.5 focus-within:border-[#FF4D36] transition">
                <Mail className="w-4 h-4 text-[#64748B] mr-2" />
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#64748B]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#94A3B8] block mb-1.5">
                Password
              </label>
              <div className="flex items-center bg-[#0E1118] border border-[#222736] rounded-xl px-3 py-2.5 focus-within:border-[#FF4D36] transition">
                <Lock className="w-4 h-4 text-[#64748B] mr-2" />
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#64748B]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FF4D36] to-[#FF634F] hover:from-[#FF5D47] hover:to-[#FF735F] text-white font-bold text-xs shadow-md shadow-[#FF4D36]/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Mendaftarkan...' : 'Daftar Akun Baru'}</span>
              {!loading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#64748B] mt-6">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-bold text-white hover:text-[#FF4D36] transition">
            Masuk di Sini
          </Link>
        </p>
      </div>
    </div>
  );
}

