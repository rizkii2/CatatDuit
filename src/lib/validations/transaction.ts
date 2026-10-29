import { z } from 'zod';

export const transactionTypeSchema = z.enum(['income', 'expense'], {
  errorMap: () => ({ message: 'Jenis transaksi harus income atau expense' }),
});

export const createTransactionSchema = z.object({
  account_id: z.string().uuid('ID dompet tidak valid'),
  category_id: z.string().uuid('ID kategori tidak valid'),
  tipe: transactionTypeSchema,
  amount: z
    .number({ invalid_type_error: 'Nominal harus berupa angka' })
    .int('Nominal harus bilangan bulat rupiah tanpa desimal')
    .positive('Nominal wajib lebih dari 0'),
  tanggal: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')
    .default(() => new Date().toISOString().split('T')[0]),
  catatan: z.string().max(255, 'Catatan maksimal 255 karakter').nullable().optional(),
});

export const updateTransactionSchema = z.object({
  account_id: z.string().uuid('ID dompet tidak valid').optional(),
  category_id: z.string().uuid('ID kategori tidak valid').optional(),
  tipe: transactionTypeSchema.optional(),
  amount: z
    .number({ invalid_type_error: 'Nominal harus berupa angka' })
    .int('Nominal harus bilangan bulat rupiah tanpa desimal')
    .positive('Nominal wajib lebih dari 0')
    .optional(),
  tanggal: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')
    .optional(),
  catatan: z.string().max(255, 'Catatan maksimal 255 karakter').nullable().optional(),
});

export const transactionFilterSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  tipe: z.enum(['income', 'expense', 'all']).optional().default('all'),
  accountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionFilterInput = z.infer<typeof transactionFilterSchema>;

