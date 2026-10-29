'use server';

import { createClient } from '@/lib/supabase/server';
import { ActionResponse, DashboardSummary, TransactionWithDetails, AccountWithBalance } from '@/types';
import { formatMonthYearID, getFirstDayOfMonthWIB } from '@/lib/utils/format';

/**
 * Get monthly dashboard analytics and summary data (FR-5)
 * @param targetMonth YYYY-MM or YYYY-MM-01 (default: current month in WIB)
 */
export async function getDashboardSummaryAction(
  targetMonth?: string
): Promise<ActionResponse<DashboardSummary>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Pengguna belum masuk' };
    }

    // Determine target month string
    let monthStartStr = targetMonth
      ? targetMonth.length === 7
        ? `${targetMonth}-01`
        : targetMonth
      : getFirstDayOfMonthWIB();

    const dateObj = new Date(monthStartStr);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();

    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;

    // 1. Fetch transactions for the target month
    const { data: monthTx, error: txError } = await supabase
      .from('transactions')
      .select(`
        id,
        user_id,
        account_id,
        category_id,
        tipe,
        amount,
        tanggal,
        catatan,
        created_at,
        category:categories(id, nama, ikon, warna, tipe)
      `)
      .eq('user_id', user.id)
      .gte('tanggal', startDate)
      .lte('tanggal', endDate);

    if (txError) {
      return { success: false, error: txError.message };
    }

    // 2. Fetch admin fees from transfers in this month (FR-6: biaya admin dihitung sebagai pengeluaran)
    const { data: monthTransfers } = await supabase
      .from('transfers')
      .select('biaya_admin, tanggal')
      .eq('user_id', user.id)
      .gte('tanggal', startDate)
      .lte('tanggal', endDate)
      .gt('biaya_admin', 0);

    const totalAdminFees = (monthTransfers || []).reduce(
      (acc, t) => acc + Number(t.biaya_admin || 0),
      0
    );

    // 3. Calculate Totals
    let totalIncome = 0;
    let totalExpense = totalAdminFees;

    const categoryExpenseMap = new Map<
      string,
      { nama: string; warna: string; ikon: string; total: number }
    >();

    const dailyBreakdownMap = new Map<string, { pemasukan: number; pengeluaran: number }>();

    // Pre-populate all days in the month for smooth charts
    for (let d = 1; d <= lastDayOfMonth; d++) {
      const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      dailyBreakdownMap.set(dayStr, { pemasukan: 0, pengeluaran: 0 });
    }

    // Include admin fees into daily breakdown
    for (const tr of monthTransfers || []) {
      const cur = dailyBreakdownMap.get(tr.tanggal) || { pemasukan: 0, pengeluaran: 0 };
      cur.pengeluaran += Number(tr.biaya_admin);
      dailyBreakdownMap.set(tr.tanggal, cur);
    }

    for (const item of monthTx || []) {
      const amount = Number(item.amount);
      const day = item.tanggal;
      const dayStats = dailyBreakdownMap.get(day) || { pemasukan: 0, pengeluaran: 0 };

      if (item.tipe === 'income') {
        totalIncome += amount;
        dayStats.pemasukan += amount;
      } else {
        totalExpense += amount;
        dayStats.pengeluaran += amount;

        // Group by category
        const cat = item.category as any;
        const catId = item.category_id;
        const catName = cat?.nama || 'Lainnya';
        const catColor = cat?.warna || '#6B7280';
        const catIcon = cat?.ikon || 'Tag';

        const existing = categoryExpenseMap.get(catId) || {
          nama: catName,
          warna: catColor,
          ikon: catIcon,
          total: 0,
        };
        existing.total += amount;
        categoryExpenseMap.set(catId, existing);
      }
      dailyBreakdownMap.set(day, dayStats);
    }

    // Add admin fees as separate category item if any
    if (totalAdminFees > 0) {
      categoryExpenseMap.set('admin-fee', {
        nama: 'Biaya Admin Transfer',
        warna: '#94A3B8',
        ikon: 'Receipt',
        total: totalAdminFees,
      });
    }

    // Expense by category formatted with percentages
    const pengeluaranPerKategori = Array.from(categoryExpenseMap.entries())
      .map(([kategoriId, val]) => ({
        kategoriId,
        nama: val.nama,
        warna: val.warna,
        ikon: val.ikon,
        total: val.total,
        persentase: totalExpense > 0 ? Math.round((val.total / totalExpense) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    const kategoriPengeluaranTerbesar =
      pengeluaranPerKategori.length > 0
        ? {
            nama: pengeluaranPerKategori[0].nama,
            total: pengeluaranPerKategori[0].total,
            persentase: pengeluaranPerKategori[0].persentase,
          }
        : null;

    const grafikHarian = Array.from(dailyBreakdownMap.entries()).map(([tanggal, val]) => ({
      tanggal,
      pemasukan: val.pemasukan,
      pengeluaran: val.pengeluaran,
    }));

    // 4. Fetch 5 Recent Transactions
    const { data: recentTx } = await supabase
      .from('transactions')
      .select(`
        id,
        user_id,
        account_id,
        category_id,
        tipe,
        amount,
        tanggal,
        catatan,
        created_at,
        updated_at,
        account:accounts(id, nama, tipe),
        category:categories(id, nama, tipe, ikon, warna)
      `)
      .eq('user_id', user.id)
      .order('tanggal', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5);

    // 5. Fetch Accounts with current balances
    const { data: accounts } = await supabase
      .from('accounts_with_balance')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: true });

    const daftarDompet = (accounts || []) as AccountWithBalance[];
    const saldoTotalSemuaDompet = daftarDompet.reduce(
      (acc, curr) => acc + Number(curr.saldo_saat_ini || 0),
      0
    );

    return {
      success: true,
      data: {
        bulan: `${year}-${String(month + 1).padStart(2, '0')}`,
        bulanLabel: formatMonthYearID(new Date(year, month, 1)),
        totalPemasukan: totalIncome,
        totalPengeluaran: totalExpense,
        sisaSaldoBulanIni: totalIncome - totalExpense,
        saldoTotalSemuaDompet,
        kategoriPengeluaranTerbesar,
        pengeluaranPerKategori,
        grafikHarian,
        limaTransaksiTerakhir: (recentTx || []) as unknown as TransactionWithDetails[],
        daftarDompet,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal memuat ringkasan dashboard' };
  }
}

