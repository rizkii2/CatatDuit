import { z } from 'zod';

export const accountTypeSchema = z.enum(['cash', 'bank', 'ewallet'], {
  errorMap: () => ({ message: 'Tipe dompet harus cash, bank, atau ewallet' }),
});

export const createAccountSchema = z.object({
  nama: z.string().trim().min(1, 'Nama dompet wajib diisi').max(50, 'Nama dompet maksimal 50 karakter'),
  tipe: accountTypeSchema,
  saldo_awal: z
    .number({ invalid_type_error: 'Saldo awal harus berupa angka' })
    .int('Saldo awal harus berupa bilangan bulat')
    .min(0, 'Saldo awal tidak boleh negatif')
    .default(0),
});

export const updateAccountSchema = z.object({
  nama: z.string().trim().min(1, 'Nama dompet wajib diisi').max(50, 'Nama dompet maksimal 50 karakter').optional(),
  tipe: accountTypeSchema.optional(),
  is_archived: z.boolean().optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

