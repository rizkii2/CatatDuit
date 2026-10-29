import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().trim().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  nama: z.string().trim().min(2, 'Nama minimal 2 karakter').max(50, 'Nama maksimal 50 karakter').optional(),
});

export const signInSchema = z.object({
  email: z.string().trim().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email('Format email tidak valid'),
});

export const updatePasswordSchema = z.object({
  password: z.string().min(6, 'Password baru minimal 6 karakter'),
});

export const updateProfileSchema = z.object({
  nama: z.string().trim().min(2, 'Nama minimal 2 karakter').max(50, 'Nama maksimal 50 karakter'),
  avatar_url: z.string().url('URL avatar tidak valid').optional().nullable(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

