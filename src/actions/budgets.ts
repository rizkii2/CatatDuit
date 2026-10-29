'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  upsertBudgetSchema,
  budgetMonthSchema,
  UpsertBudgetInput,
  BudgetMonthInput,
} from '@/lib/validations/budget';
import { ActionResponse, Budget, BudgetStatus } from '@/types';
import { getFirstDayOfMonthWIB } from '@/lib/utils/format';

/**
 * Get budgets with spending status for a specific month
 */
export async function getBudgetsAction(
  input?: BudgetMonthInput
): Promise<ActionResponse<BudgetStatus[]>> {
  try {
    const month = input?.bulan ? (input.bulan.length === 7 ? `${input.bulan}-01` : input.bulan) : getFirstDayOfMonthWIB();
    const validated = budgetMonthSchema.safeParse({ bulan: month });
    if (!validated.success) {
      return { success: false, error: 'Format bulan tidak valid' };
    }

    const targetMonth = month;
    const targetDate = new Date(targetMonth);
    const startOfMonth = targetMonth;
    const endOfMonthDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
    const endOfMonth = endOfMonthDate.toISOString().split('T')[0];

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Pengguna belum masuk' };
    }

    // 1. Get budgets for this month
    const { data: budgets, error: bError } = await supabase
      .from('budgets')
      .select(`
        id,
        category_id,
        bulan,
        batas,
        category:categories(id, nama, ikon, warna, tipe)
      `)
      .eq('user_id', user.id)
      .eq('bulan', targetMonth);

    if (bError) {
      return { success: false, error: bError.message };
    }

    if (!budgets || budgets.length === 0) {
      return { success: true, data: [] };
    }

    // 2. Fetch expenses for these categories in this month
    const categoryIds = budgets.map((b) => b.category_id);
    const { data: expenses, error: expError } = await supabase
      .from('transactions')
      .select('category_id, amount')
      .eq('user_id', user.id)
      .eq('tipe', 'expense')
      .in('category_id', categoryIds)
      .gte('tanggal', startOfMonth)
      .lte('tanggal', endOfMonth);

    if (expError) {
      return { success: false, error: expError.message };
    }

    // Sum expense per category
    const expenseMap = new Map<string, number>();
    for (const exp of expenses || []) {
      const current = expenseMap.get(exp.category_id) || 0;
      expenseMap.set(exp.category_id, current + Number(exp.amount));
    }

    // 3. Build status list
    const result: BudgetStatus[] = budgets.map((b: any) => {
      const spent = expenseMap.get(b.category_id) || 0;
      const limit = Number(b.batas);
      const remaining = limit - spent;
      const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;

      let status: BudgetStatus['status'] = 'aman';
      if (percentage >= 100) {
        status = 'melebihi';
      } else if (percentage >= 80) {
        status = 'peringatan';
      }

      return {
        id: b.id,
        category_id: b.category_id,
        category_name: b.category?.nama || 'Kategori',
        category_color: b.category?.warna || '#6B7280',
        category_icon: b.category?.ikon || 'Tag',
        bulan: b.bulan,
        batas: limit,
        terpakai: spent,
        sisa: remaining,
        persentase: percentage,
        status,
      };
    });

    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal memuat anggaran' };
  }
}

/**
 * Upsert a budget for category and month
 */
export async function upsertBudgetAction(
  input: UpsertBudgetInput
): Promise<ActionResponse<Budget>> {
  const validated = upsertBudgetSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: 'Data anggaran tidak valid',
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

  const { category_id, bulan, batas } = validated.data;

  // Verify category is an expense category
  const { data: category } = await supabase
    .from('categories')
    .select('tipe')
    .eq('id', category_id)
    .single();

  if (!category || category.tipe !== 'expense') {
    return { success: false, error: 'Anggaran hanya dapat dibuat untuk kategori pengeluaran' };
  }

  // Upsert budget on (user_id, category_id, bulan)
  const { data, error } = await supabase
    .from('budgets')
    .upsert(
      {
        user_id: user.id,
        category_id,
        bulan,
        batas,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,category_id,bulan',
      }
    )
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message || 'Gagal menyimpan anggaran' };
  }

  revalidatePath('/anggaran');
  return { success: true, data: data as Budget };
}

/**
 * Delete a budget
 */
export async function deleteBudgetAction(
  id: string
): Promise<ActionResponse<void>> {
  const supabase = await createClient();

  const { error } = await supabase.from('budgets').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message || 'Gagal menghapus anggaran' };
  }

  revalidatePath('/anggaran');
  return { success: true };
}

