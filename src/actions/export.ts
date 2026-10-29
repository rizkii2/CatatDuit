'use server';

import { createClient } from '@/lib/supabase/server';
import { ActionResponse } from '@/types';

/**
 * Generate CSV text for user transactions in date range (FR-8)
 */
export async function exportTransactionsCSVAction(
  startDate?: string,
  endDate?: string
): Promise<ActionResponse<{ csv: string; filename: string; count: number }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Pengguna belum masuk' };
    }

    let query = supabase
      .from('transactions')
      .select(`
        id,
        tipe,
        amount,
        tanggal,
        catatan,
        created_at,
        account:accounts(nama, tipe),
        category:categories(nama, tipe)
      `)
      .eq('user_id', user.id);

    if (startDate) {
      query = query.gte('tanggal', startDate);
    }
    if (endDate) {
      query = query.lte('tanggal', endDate);
    }

    query = query.order('tanggal', { ascending: false }).order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    const rows = data || [];

    // Build CSV with UTF-8 BOM so Excel opens it with correct Indonesian characters
    const headers = ['ID', 'Tanggal', 'Jenis', 'Dompet', 'Kategori', 'Nominal (IDR)', 'Catatan'];

    const escapeCSV = (str: string | number | null | undefined): string => {
      if (str === null || str === undefined) return '';
      const s = String(str);
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const csvLines = [
      headers.join(','),
      ...rows.map((row: any) =>
        [
          escapeCSV(row.id),
          escapeCSV(row.tanggal),
          escapeCSV(row.tipe === 'income' ? 'Pemasukan' : 'Pengeluaran'),
          escapeCSV(row.account?.nama || '-'),
          escapeCSV(row.category?.nama || '-'),
          escapeCSV(row.amount),
          escapeCSV(row.catatan || ''),
        ].join(',')
      ),
    ];

    const csv = '\uFEFF' + csvLines.join('\r\n');
    const today = new Date().toISOString().split('T')[0];
    const filename = `catatduit-transaksi-${startDate || 'awal'}-sd-${endDate || today}.csv`;

    return {
      success: true,
      data: {
        csv,
        filename,
        count: rows.length,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal mengekspor data ke CSV' };
  }
}

