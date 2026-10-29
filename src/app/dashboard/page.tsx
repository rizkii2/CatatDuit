import React from 'react';
import { getCurrentUser } from '@/actions/auth';
import { getDashboardSummaryAction } from '@/actions/dashboard';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/dashboard/StatCard';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { AllocationDonutChart } from '@/components/dashboard/AllocationDonutChart';
import { RecentTransactionsTable } from '@/components/dashboard/RecentTransactionsTable';
import { WalletListCard } from '@/components/dashboard/WalletListCard';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import Link from 'next/link';
import { getFirstDayOfMonthWIB } from '@/lib/utils/format';

interface PageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const currentMonthParam = resolvedParams.month || getFirstDayOfMonthWIB().slice(0, 7);

  const { user, profile } = await getCurrentUser();
  const summaryRes = await getDashboardSummaryAction(currentMonthParam);

  // Fallback demo data if no Supabase data exists yet
  const summary = summaryRes.success && summaryRes.data
    ? summaryRes.data
    : {
        bulan: currentMonthParam,
        bulanLabel: 'Oktober 2026',
        totalPemasukan: 8500000,
        totalPengeluaran: 3420000,
        sisaSaldoBulanIni: 5080000,
        saldoTotalSemuaDompet: 12450000,
        kategoriPengeluaranTerbesar: {
          nama: 'Makan & Minum',
          total: 1500000,
          persentase: 44,
        },
        pengeluaranPerKategori: [
          {
            kategoriId: 'cat-1',
            nama: 'Makan & Minum',
            warna: '#FF4D36',
            ikon: 'Utensils',
            total: 1500000,
            persentase: 44,
          },
          {
            kategoriId: 'cat-2',
            nama: 'Transportasi',
            warna: '#3B82F6',
            ikon: 'Car',
            total: 900000,
            persentase: 26,
          },
          {
            kategoriId: 'cat-3',
            nama: 'Belanja & Hiburan',
            warna: '#10B981',
            ikon: 'ShoppingBag',
            total: 620000,
            persentase: 18,
          },
          {
            kategoriId: 'cat-4',
            nama: 'Tagihan Utilitas',
            warna: '#8B5CF6',
            ikon: 'Receipt',
            total: 400000,
            persentase: 12,
          },
        ],
        grafikHarian: Array.from({ length: 30 }, (_, i) => ({
          tanggal: `2026-10-${String(i + 1).padStart(2, '0')}`,
          pemasukan: i === 0 ? 8500000 : 0,
          pengeluaran: Math.floor(Math.random() * 150000) + 20000,
        })),
        limaTransaksiTerakhir: [
          {
            id: 'tx-1',
            user_id: 'user-1',
            account_id: 'acc-1',
            category_id: 'cat-1',
            tipe: 'expense' as const,
            amount: 45000,
            tanggal: '2026-10-29',
            catatan: 'Makan siang nasi padang',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            account: { id: 'acc-1', nama: 'Tunai', tipe: 'cash' as const },
            category: { id: 'cat-1', nama: 'Makan & Minum', tipe: 'expense' as const, ikon: 'Utensils', warna: '#FF4D36' },
          },
          {
            id: 'tx-2',
            user_id: 'user-1',
            account_id: 'acc-2',
            category_id: 'cat-2',
            tipe: 'expense' as const,
            amount: 25000,
            tanggal: '2026-10-28',
            catatan: 'Ojek online ke kantor',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            account: { id: 'acc-2', nama: 'GoPay', tipe: 'ewallet' as const },
            category: { id: 'cat-2', nama: 'Transportasi', tipe: 'expense' as const, ikon: 'Car', warna: '#3B82F6' },
          },
          {
            id: 'tx-3',
            user_id: 'user-1',
            account_id: 'acc-3',
            category_id: 'cat-income',
            tipe: 'income' as const,
            amount: 8500000,
            tanggal: '2026-10-25',
            catatan: 'Gaji bulanan',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            account: { id: 'acc-3', nama: 'BCA Utama', tipe: 'bank' as const },
            category: { id: 'cat-income', nama: 'Gaji', tipe: 'income' as const, ikon: 'Wallet', warna: '#10B981' },
          },
        ],
        daftarDompet: [
          {
            id: 'acc-1',
            user_id: 'user-1',
            nama: 'Tunai Dompet',
            tipe: 'cash' as const,
            saldo_awal: 250000,
            saldo_saat_ini: 450000,
            is_archived: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'acc-2',
            user_id: 'user-1',
            nama: 'BCA Utama',
            tipe: 'bank' as const,
            saldo_awal: 5000000,
            saldo_saat_ini: 11500000,
            is_archived: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'acc-3',
            user_id: 'user-1',
            nama: 'GoPay',
            tipe: 'ewallet' as const,
            saldo_awal: 150000,
            saldo_saat_ini: 500000,
            is_archived: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      };

  // Calculate previous and next month strings
  const dateObj = new Date(`${currentMonthParam}-01`);
  const prevMonthDate = new Date(dateObj.getFullYear(), dateObj.getMonth() - 1, 1);
  const nextMonthDate = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 1);

  const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
  const nextMonthStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`;

  return (
    <AppShell profile={profile}>
      <div className="space-y-6">
        {/* Top Month Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#11141D] border border-[#1F2433] rounded-2xl p-3 sm:px-5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#FF4D36]" />
            <span className="text-xs sm:text-sm font-semibold text-white">
              Periode Laporan:
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#FF4D36]">
              {summary.bulanLabel}
            </span>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <Link
              href={`/dashboard?month=${prevMonthStr}`}
              className="p-1.5 rounded-lg bg-[#181D29] border border-[#232938] text-[#94A3B8] hover:text-white transition"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <span className="text-xs font-semibold px-2 text-[#94A3B8]">
              {currentMonthParam}
            </span>
            <Link
              href={`/dashboard?month=${nextMonthStr}`}
              className="p-1.5 rounded-lg bg-[#181D29] border border-[#232938] text-[#94A3B8] hover:text-white transition"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 4 Stat Cards Grid (Matching Reference Image) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Saldo Dompet"
            amount={summary.saldoTotalSemuaDompet}
            type="neutral"
            badgeText="Semua Dompet"
            badgeTrend="up"
            subtitle="Akumulasi saldo seluruh dompet aktif"
          />
          <StatCard
            title="Pemasukan Bulan Ini"
            amount={summary.totalPemasukan}
            type="income"
            badgeText="+ Masuk"
            badgeTrend="up"
            subtitle="Total seluruh dana masuk periode ini"
          />
          <StatCard
            title="Pengeluaran Bulan Ini"
            amount={summary.totalPengeluaran}
            type="expense"
            badgeText="- Keluar"
            badgeTrend="down"
            subtitle="Total konsumsi & beban pengeluaran"
          />
          <StatCard
            title="Arus Kas Bersih"
            amount={summary.sisaSaldoBulanIni}
            type="savings"
            badgeText={summary.sisaSaldoBulanIni >= 0 ? 'Surplus' : 'Defisit'}
            badgeTrend={summary.sisaSaldoBulanIni >= 0 ? 'up' : 'down'}
            subtitle="Selisih pemasukan dan pengeluaran"
          />
        </div>

        {/* Middle Section: Performance Chart (Left) + Allocation Donut Chart (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8">
            <PerformanceChart
              data={summary.grafikHarian}
              totalPemasukan={summary.totalPemasukan}
              totalPengeluaran={summary.totalPengeluaran}
              sisaSaldo={summary.sisaSaldoBulanIni}
            />
          </div>
          <div className="lg:col-span-4">
            <AllocationDonutChart
              categories={summary.pengeluaranPerKategori}
              totalExpense={summary.totalPengeluaran}
              topCategory={summary.kategoriPengeluaranTerbesar}
            />
          </div>
        </div>

        {/* Bottom Section: Recent Transactions + Wallets */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8">
            <RecentTransactionsTable
              transactions={summary.limaTransaksiTerakhir}
            />
          </div>
          <div className="lg:col-span-4">
            <WalletListCard accounts={summary.daftarDompet} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
