import { z } from 'zod';

export const upsertBudgetSchema = z.object({
  category_id: z.string().uuid('ID kategori tidak valid'),
  bulan: z
    .string()
    .regex(/^\d{4}-\d{2}-01$/, 'Format bulan harus YYYY-MM-01 (tanggal 1 awal bulan)'),
  batas: z
    .number({ invalid_type_error: 'Batas anggaran harus berupa angka' })
    .int('Batas anggaran harus berupa bilangan bulat')
    .positive('Batas anggaran harus lebih dari 0'),
});

export const budgetMonthSchema = z.object({
  bulan: z.string().regex(/^\d{4}-\d{2}(-01)?$/, 'Format bulan harus YYYY-MM atau YYYY-MM-01'),
});

export type UpsertBudgetInput = z.infer<typeof upsertBudgetSchema>;
export type BudgetMonthInput = z.infer<typeof budgetMonthSchema>;

