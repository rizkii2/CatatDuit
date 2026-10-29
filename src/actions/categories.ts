'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  createCategorySchema,
  updateCategorySchema,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/lib/validations/category';
import { ActionResponse, Category, CategoryType } from '@/types';

/**
 * Get categories for current user
 */
export async function getCategoriesAction(
  type?: CategoryType,
  includeArchived = false
): Promise<ActionResponse<Category[]>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Pengguna belum masuk' };
    }

    let query = supabase
      .from('categories')
      .select('*')
      .order('nama', { ascending: true });

    if (type) {
      query = query.eq('tipe', type);
    }

    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Category[] };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal mengambil data kategori' };
  }
}

/**
 * Get single category by ID
 */
export async function getCategoryByIdAction(
  id: string
): Promise<ActionResponse<Category>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { success: false, error: 'Kategori tidak ditemukan' };
    }

    return { success: true, data: data as Category };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal mengambil detail kategori' };
  }
}

/**
 * Create a new category
 */
export async function createCategoryAction(
  input: CreateCategoryInput
): Promise<ActionResponse<Category>> {
  const validated = createCategorySchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: 'Data kategori tidak valid',
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
    .from('categories')
    .insert({
      user_id: user.id,
      nama: validated.data.nama,
      tipe: validated.data.tipe,
      ikon: validated.data.ikon,
      warna: validated.data.warna,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message || 'Gagal menambahkan kategori' };
  }

  revalidatePath('/kategori');
  return { success: true, data: data as Category };
}

/**
 * Update category details
 */
export async function updateCategoryAction(
  id: string,
  input: UpdateCategoryInput
): Promise<ActionResponse<Category>> {
  const validated = updateCategorySchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: 'Data pembaruan kategori tidak valid',
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('categories')
    .update(validated.data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message || 'Gagal memperbarui kategori' };
  }

  revalidatePath('/kategori');
  return { success: true, data: data as Category };
}

/**
 * Archive or unarchive category
 */
export async function archiveCategoryAction(
  id: string,
  is_archived: boolean
): Promise<ActionResponse<Category>> {
  return updateCategoryAction(id, { is_archived });
}

/**
 * Delete category permanently
 */
export async function deleteCategoryAction(
  id: string
): Promise<ActionResponse<void>> {
  const supabase = await createClient();

  // Check if any transactions use this category
  const { count } = await supabase
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id);

  if (count && count > 0) {
    return {
      success: false,
      error: 'Kategori ini sudah digunakan dalam transaksi dan tidak bisa dihapus. Silakan arsipkan kategori ini.',
    };
  }

  const { error } = await supabase.from('categories').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message || 'Gagal menghapus kategori' };
  }

  revalidatePath('/kategori');
  return { success: true };
}

