import { z } from 'zod';

export const createTransferSchema = z
  .object({
    dari_account_id: z.string().uuid('Dompet asal tidak valid'),
    ke_account_id: z.string().uuid('Dompet tujuan tidak valid'),
    amount: z
      .number({ invalid_type_error: 'Nominal harus berupa angka' })
      .int('Nominal harus bilangan bulat rupiah tanpa desimal')
      .positive('Nominal transfer wajib lebih dari 0'),
    biaya_admin: z
      .number({ invalid_type_error: 'Biaya admin harus berupa angka' })
      .int('Biaya admin harus bilangan bulat')
      .min(0, 'Biaya admin minimal 0')
      .default(0),
    tanggal: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')
      .default(() => new Date().toISOString().split('T')[0]),
    catatan: z.string().max(255, 'Catatan maksimal 255 karakter').nullable().optional(),
  })
  .refine((data) => data.dari_account_id !== data.ke_account_id, {
    message: 'Dompet asal dan dompet tujuan tidak boleh sama',
    path: ['ke_account_id'],
  });

export const transferFilterSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  accountId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateTransferInput = z.infer<typeof createTransferSchema>;
export type TransferFilterInput = z.infer<typeof transferFilterSchema>;

