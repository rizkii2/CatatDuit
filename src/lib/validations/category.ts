import { z } from 'zod';

export const categoryTypeSchema = z.enum(['income', 'expense'], {
  errorMap: () => ({ message: 'Tipe kategori harus income atau expense' }),
});

export const createCategorySchema = z.object({
  nama: z.string().trim().min(1, 'Nama kategori wajib diisi').max(50, 'Nama kategori maksimal 50 karakter'),
  tipe: categoryTypeSchema,
  ikon: z.string().trim().min(1, 'Ikon wajib dipilih').default('Tag'),
  warna: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Format warna harus hex (contoh: #EF4444)').default('#6B7280'),
});

export const updateCategorySchema = z.object({
  nama: z.string().trim().min(1, 'Nama kategori wajib diisi').max(50, 'Nama kategori maksimal 50 karakter').optional(),
  tipe: categoryTypeSchema.optional(),
  ikon: z.string().trim().min(1).optional(),
  warna: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Format warna harus hex (contoh: #EF4444)').optional(),
  is_archived: z.boolean().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

