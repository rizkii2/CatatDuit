'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  createAccountSchema,
  updateAccountSchema,
  CreateAccountInput,
  UpdateAccountInput,
} from '@/lib/validations/account';
import { ActionResponse, AccountWithBalance, Account } from '@/types';

/**
 * Get all accounts for current user with dynamic current balances
 */
export async function getAccountsAction(
  includeArchived = false
): Promise<ActionResponse<AccountWithBalance[]>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Pengguna belum masuk' };
    }

    let query = supabase
      .from('accounts_with_balance')
      .select('*')
      .order('created_at', { ascending: true });

    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as AccountWithBalance[] };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal mengambil data dompet' };
  }
}

/**
 * Get single account by ID with current balance
 */
export async function getAccountByIdAction(
  id: string
): Promise<ActionResponse<AccountWithBalance>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('accounts_with_balance')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { success: false, error: 'Dompet tidak ditemukan' };
    }

    return { success: true, data: data as AccountWithBalance };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal mengambil detail dompet' };
  }
}

/**
 * Create a new account / wallet
 */
export async function createAccountAction(
  input: CreateAccountInput
): Promise<ActionResponse<Account>> {
  const validated = createAccountSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: 'Data dompet tidak valid',
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

  const { data, error } = await supabase
    .from('accounts')
    .insert({
      user_id: user.id,
      nama: validated.data.nama,
      tipe: validated.data.tipe,
      saldo_awal: validated.data.saldo_awal,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message || 'Gagal menambahkan dompet' };
  }

  revalidatePath('/dompet');
  revalidatePath('/dashboard');
  return { success: true, data: data as Account };
}

/**
 * Update account name, type, or archive status
 */
export async function updateAccountAction(
  id: string,
  input: UpdateAccountInput
): Promise<ActionResponse<Account>> {
  const validated = updateAccountSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: 'Data pembaruan dompet tidak valid',
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('accounts')
    .update(validated.data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message || 'Gagal memperbarui dompet' };
  }

  revalidatePath('/dompet');
  revalidatePath('/dashboard');
  return { success: true, data: data as Account };
}

/**
 * Archive or unarchive account
 */
export async function archiveAccountAction(
  id: string,
  is_archived: boolean
): Promise<ActionResponse<Account>> {
  return updateAccountAction(id, { is_archived });
}

/**
 * Delete account permanently.
 * FR-3: Dompet yang sudah memiliki transaksi tidak bisa dihapus permanen, hanya diarsipkan.
 */
export async function deleteAccountAction(
  id: string
): Promise<ActionResponse<void>> {
  const supabase = await createClient();

  // Check if transactions exist
  const { count: txCount } = await supabase
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .eq('account_id', id);

  if (txCount && txCount > 0) {
    return {
      success: false,
      error: 'Dompet yang sudah memiliki transaksi tidak bisa dihapus permanen. Silakan gunakan fitur arsip dompet.',
    };
  }

  // Check if transfers exist
  const { count: trCount1 } = await supabase
    .from('transfers')
    .select('id', { count: 'exact', head: true })
    .eq('dari_account_id', id);

  const { count: trCount2 } = await supabase
    .from('transfers')
    .select('id', { count: 'exact', head: true })
    .eq('ke_account_id', id);

  if ((trCount1 && trCount1 > 0) || (trCount2 && trCount2 > 0)) {
    return {
      success: false,
      error: 'Dompet yang sudah memiliki riwayat transfer tidak bisa dihapus permanen. Silakan arsipkan dompet ini.',
    };
  }

  const { error } = await supabase.from('accounts').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message || 'Gagal menghapus dompet' };
  }

  revalidatePath('/dompet');
  revalidatePath('/dashboard');
  return { success: true };
}

