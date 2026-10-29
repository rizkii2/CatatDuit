'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  createTransferSchema,
  transferFilterSchema,
  CreateTransferInput,
  TransferFilterInput,
} from '@/lib/validations/transfer';
import { ActionResponse, Transfer, TransferWithDetails } from '@/types';

/**
 * Get transfer history for current user
 */
export async function getTransfersAction(
  filters: Partial<TransferFilterInput> = {}
): Promise<ActionResponse<{ transfers: TransferWithDetails[]; totalCount: number }>> {
  try {
    const validated = transferFilterSchema.safeParse(filters);
    if (!validated.success) {
      return {
        success: false,
        error: 'Parameter filter transfer tidak valid',
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    const { startDate, endDate, accountId, page, limit } = validated.data;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Pengguna belum masuk' };
    }

    let query = supabase
      .from('transfers')
      .select(
        `
        id,
        user_id,
        dari_account_id,
        ke_account_id,
        amount,
        biaya_admin,
        tanggal,
        catatan,
        created_at,
        updated_at,
        dari_account:accounts!transfers_dari_account_id_fkey(id, nama, tipe),
        ke_account:accounts!transfers_ke_account_id_fkey(id, nama, tipe)
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
    if (accountId) {
      query = query.or(`dari_account_id.eq.${accountId},ke_account_id.eq.${accountId}`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.order('tanggal', { ascending: false }).order('created_at', { ascending: false }).range(from, to);

    const { data, count, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        transfers: (data || []) as unknown as TransferWithDetails[],
        totalCount: count || 0,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal memuat riwayat transfer' };
  }
}

/**
 * Create a new transfer between accounts
 */
export async function createTransferAction(
  input: CreateTransferInput
): Promise<ActionResponse<Transfer>> {
  const validated = createTransferSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: 'Data transfer tidak valid',
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

  const { dari_account_id, ke_account_id, amount, biaya_admin, tanggal, catatan } = validated.data;

  // Validate both accounts
  const { data: accounts, error: accError } = await supabase
    .from('accounts')
    .select('id, nama, is_archived')
    .in('id', [dari_account_id, ke_account_id]);

  if (accError || !accounts || accounts.length < 2) {
    return { success: false, error: 'Salah satu dompet tidak ditemukan' };
  }

  const sourceAcc = accounts.find((a) => a.id === dari_account_id);
  const destAcc = accounts.find((a) => a.id === ke_account_id);

  if (sourceAcc?.is_archived || destAcc?.is_archived) {
    return { success: false, error: 'Tidak dapat melakukan transfer dari atau ke dompet yang diarsipkan' };
  }

  const { data, error } = await supabase
    .from('transfers')
    .insert({
      user_id: user.id,
      dari_account_id,
      ke_account_id,
      amount,
      biaya_admin: biaya_admin || 0,
      tanggal,
      catatan: catatan || null,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message || 'Gagal menyimpan transaksi transfer' };
  }

  revalidatePath('/transfer');
  revalidatePath('/dompet');
  revalidatePath('/dashboard');

  return { success: true, data: data as Transfer };
}

/**
 * Delete a transfer record
 */
export async function deleteTransferAction(
  id: string
): Promise<ActionResponse<void>> {
  const supabase = await createClient();

  const { error } = await supabase.from('transfers').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message || 'Gagal menghapus transfer' };
  }

  revalidatePath('/transfer');
  revalidatePath('/dompet');
  revalidatePath('/dashboard');

  return { success: true };
}

