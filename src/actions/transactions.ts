'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionFilterSchema,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilterInput,
} from '@/lib/validations/transaction';
import {
  ActionResponse,
  Transaction,
  TransactionWithDetails,
  GroupedTransactions,
} from '@/types';
import { formatFullDateID, getFirstDayOfMonthWIB } from '@/lib/utils/format';

export interface GetTransactionsResult {
  grouped: GroupedTransactions[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  totalIncome: number;
  totalExpense: number;
}

/**
 * Get paginated transactions with flexible filtering, grouped by date
 */
export async function getTransactionsAction(
  filters: Partial<TransactionFilterInput> = {}
): Promise<ActionResponse<GetTransactionsResult>> {
  try {
    const validated = transactionFilterSchema.safeParse(filters);
    if (!validated.success) {
      return {
        success: false,
        error: 'Parameter filter tidak valid',
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    const { startDate, endDate, tipe, accountId, categoryId, search, page, limit } = validated.data;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Pengguna belum masuk' };
    }

    let query = supabase
      .from('transactions')
      .select(
        `
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
      `,
        { count: 'exact' }
      )
      .eq('user_id', user.id);

    if (startDate) {
      query = query.gte('tanggal', startDate);
    }
    if (endDate) {
      query = query.lte('tanggal', endDate);
    }
    if (tipe && tipe !== 'all') {
      query = query.eq('tipe', tipe);
    }
    if (accountId) {
      query = query.eq('account_id', accountId);
    }
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    if (search && search.trim()) {
      query = query.ilike('catatan', `%${search.trim()}%`);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.order('tanggal', { ascending: false }).order('created_at', { ascending: false }).range(from, to);

    const { data, count, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    const rawList = (data || []) as unknown as TransactionWithDetails[];

    // Calculate totals for current page / query
    let totalIncome = 0;
    let totalExpense = 0;

    // Group transactions by date
    const groupsMap = new Map<string, TransactionWithDetails[]>();
    for (const item of rawList) {
      if (item.tipe === 'income') totalIncome += Number(item.amount);
      if (item.tipe === 'expense') totalExpense += Number(item.amount);

      const dateKey = item.tanggal;
      const existing = groupsMap.get(dateKey) || [];
      existing.push(item);
      groupsMap.set(dateKey, existing);
    }

    const grouped: GroupedTransactions[] = Array.from(groupsMap.entries()).map(
      ([date, items]) => {
        const dayIncome = items
          .filter((t) => t.tipe === 'income')
          .reduce((acc, curr) => acc + Number(curr.amount), 0);
        const dayExpense = items
          .filter((t) => t.tipe === 'expense')
          .reduce((acc, curr) => acc + Number(curr.amount), 0);

        return {
          date,
          formattedDate: formatFullDateID(date),
          totalIncome: dayIncome,
          totalExpense: dayExpense,
          transactions: items,
        };
      }
    );

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit) || 1;

    return {
      success: true,
      data: {
        grouped,
        totalCount,
        page,
        limit,
        totalPages,
        totalIncome,
        totalExpense,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal memuat transaksi' };
  }
}

/**
 * Get transaction by ID
 */
export async function getTransactionByIdAction(
  id: string
): Promise<ActionResponse<TransactionWithDetails>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('transactions')
      .select(
        `
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
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      return { success: false, error: 'Transaksi tidak ditemukan' };
    }

    return { success: true, data: data as unknown as TransactionWithDetails };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal mengambil detail transaksi' };
  }
}

export interface CreateTransactionResult {
  transaction: Transaction;
  budgetWarning?: {
    categoryName: string;
    limit: number;
    spent: number;
    percent: number;
    message: string;
  };
}

/**
 * Create a new transaction (Pemasukan / Pengeluaran)
 */
export async function createTransactionAction(
  input: CreateTransactionInput
): Promise<ActionResponse<CreateTransactionResult>> {
  const validated = createTransactionSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: 'Data transaksi tidak valid',
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Pengguna belum masuk' };
  }

  const { account_id, category_id, tipe, amount, tanggal, catatan } = validated.data;

  // Verify account belongs to user and is not archived
  const { data: account, error: accError } = await supabase
    .from('accounts')
    .select('id, nama, is_archived')
    .eq('id', account_id)
    .single();

  if (accError || !account) {
    return { success: false, error: 'Dompet yang dipilih tidak valid' };
  }
  if (account.is_archived) {
    return { success: false, error: 'Dompet ini sudah diarsipkan dan tidak dapat digunakan' };
  }

  // Verify category belongs to user and matches transaction type
  const { data: category, error: catError } = await supabase
    .from('categories')
    .select('id, nama, tipe, is_archived')
    .eq('id', category_id)
    .single();

  if (catError || !category) {
    return { success: false, error: 'Kategori yang dipilih tidak valid' };
  }
  if (category.is_archived) {
    return { success: false, error: 'Kategori ini sudah diarsipkan' };
  }
  if (category.tipe !== tipe) {
    return {
      success: false,
      error: `Kategori "${category.nama}" adalah kategori ${category.tipe === 'income' ? 'pemasukan' : 'pengeluaran'}, tidak cocok dengan transaksi`,
    };
  }

  // Insert transaction
  const { data: tx, error: txError } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      account_id,
      category_id,
      tipe,
      amount,
      tanggal,
      catatan: catatan || null,
    })
    .select()
    .single();

  if (txError) {
    return { success: false, error: txError.message || 'Gagal menyimpan transaksi' };
  }

  // FR-7: Check if expense transaction triggers budget warning
  let budgetWarning: CreateTransactionResult['budgetWarning'] | undefined;
  if (tipe === 'expense') {
    const txDate = new Date(tanggal);
    const monthFirstDay = getFirstDayOfMonthWIB(txDate);

    const { data: budget } = await supabase
      .from('budgets')
      .select('batas')
      .eq('user_id', user.id)
      .eq('category_id', category_id)
      .eq('bulan', monthFirstDay)
      .maybeSingle();

    if (budget && budget.batas > 0) {
      // Calculate total expense for category in this month
      // Start of month to end of month
      const startOfMonth = monthFirstDay;
      const endOfMonthDate = new Date(txDate.getFullYear(), txDate.getMonth() + 1, 0);
      const endOfMonth = endOfMonthDate.toISOString().split('T')[0];

      const { data: catExpenses } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('category_id', category_id)
        .eq('tipe', 'expense')
        .gte('tanggal', startOfMonth)
        .lte('tanggal', endOfMonth);

      const totalSpent = (catExpenses || []).reduce((acc, c) => acc + Number(c.amount), 0);
      const percent = Math.round((totalSpent / budget.batas) * 100);

      if (totalSpent > budget.batas) {
        budgetWarning = {
          categoryName: category.nama,
          limit: budget.batas,
          spent: totalSpent,
          percent,
          message: `Perhatian: Pengeluaran kategori "${category.nama}" telah melebihi batas anggaran (${percent}%)!`,
        };
      } else if (percent >= 80) {
        budgetWarning = {
          categoryName: category.nama,
          limit: budget.batas,
          spent: totalSpent,
          percent,
          message: `Peringatan: Pengeluaran kategori "${category.nama}" hampir habis (${percent}% dari anggaran).`,
        };
      }
    }
  }

  revalidatePath('/transaksi');
  revalidatePath('/dashboard');
  revalidatePath('/dompet');
  revalidatePath('/anggaran');

  return {
    success: true,
    data: {
      transaction: tx as Transaction,
      budgetWarning,
    },
  };
}

/**
 * Update transaction details
 */
export async function updateTransactionAction(
  id: string,
  input: UpdateTransactionInput
): Promise<ActionResponse<Transaction>> {
  const validated = updateTransactionSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: 'Data transaksi tidak valid',
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('transactions')
    .update(validated.data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message || 'Gagal mengubah transaksi' };
  }

  revalidatePath('/transaksi');
  revalidatePath('/dashboard');
  revalidatePath('/dompet');
  revalidatePath('/anggaran');

  return { success: true, data: data as Transaction };
}

/**
 * Delete a transaction
 */
export async function deleteTransactionAction(
  id: string
): Promise<ActionResponse<void>> {
  const supabase = await createClient();

  const { error } = await supabase.from('transactions').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message || 'Gagal menghapus transaksi' };
  }

  revalidatePath('/transaksi');
  revalidatePath('/dashboard');
  revalidatePath('/dompet');
  revalidatePath('/anggaran');

  return { success: true };
}

