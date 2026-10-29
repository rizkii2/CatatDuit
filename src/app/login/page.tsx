'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Flame, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { signInAction } from '@/actions/auth';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await signInAction({ email, password });
      if (res.success && res.data) {
        router.push(res.data.redirectTo || '/dashboard');
      } else {
        setErrorMsg(res.error || 'Gagal masuk akun. Periksa kembali email dan password Anda.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengarahkan ke Google Login');
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
            Masuk ke akun Anda untuk mengelola catatan keuangan harian
          </p>
        </div>

        {/* Login Card */}
        <div className="card-subly p-6 sm:p-8 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1A1F2C] hover:bg-[#23293B] border border-[#273045] text-white font-semibold text-xs flex items-center justify-center gap-2.5 transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Lanjutkan dengan Google</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="flex-1 h-px bg-[#1F2433]" />
            <span className="text-[11px] text-[#64748B] uppercase font-bold tracking-wider">
              atau email
            </span>
            <span className="flex-1 h-px bg-[#1F2433]" />
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#94A3B8]">
                  Password
                </label>
              </div>
              <div className="flex items-center bg-[#0E1118] border border-[#222736] rounded-xl px-3 py-2.5 focus-within:border-[#FF4D36] transition">
                <Lock className="w-4 h-4 text-[#64748B] mr-2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
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
              <span>{loading ? 'Memproses...' : 'Masuk ke Aplikasi'}</span>
              {!loading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#64748B] mt-6">
          Belum punya akun?{' '}
          <Link href="/register" className="font-bold text-white hover:text-[#FF4D36] transition">
            Daftar Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}

