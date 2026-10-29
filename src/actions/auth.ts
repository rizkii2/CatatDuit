'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  signUpSchema,
  signInSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  updateProfileSchema,
  SignUpInput,
  SignInInput,
  ResetPasswordInput,
  UpdatePasswordInput,
  UpdateProfileInput,
} from '@/lib/validations/auth';
import { ActionResponse, Profile } from '@/types';

/**
 * Get current authenticated user profile
 */
export async function getCurrentUser(): Promise<{ user: any | null; profile: Profile | null }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { user: null, profile: null };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return { user, profile: profile as Profile | null };
  } catch {
    return { user: null, profile: null };
  }
}

/**
 * Register with email and password
 */
export async function signUpAction(input: SignUpInput): Promise<ActionResponse<{ email: string; requiresEmailConfirmation: boolean }>> {
  const validated = signUpSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: 'Data pendaftaran tidak valid',
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  const { email, password, nama } = validated.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: nama || email.split('@')[0],
      },
    },
  });

  if (error) {
    return {
      success: false,
      error: error.message || 'Gagal mendaftar akun baru',
    };
  }

  const requiresEmailConfirmation = !data.session;
  return {
    success: true,
    data: {
      email,
      requiresEmailConfirmation,
    },
  };
}

/**
 * Log in with email and password
 */
export async function signInAction(input: SignInInput): Promise<ActionResponse<{ redirectTo: string }>> {
  const validated = signInSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: 'Data masuk tidak valid',
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validated.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      error: error.message === 'Invalid login credentials' ? 'Email atau password salah' : error.message,
    };
  }

  revalidatePath('/', 'layout');
  return {
    success: true,
    data: {
      redirectTo: '/dashboard',
    },
  };
}

/**
 * Sign out current session
 */
export async function signOutAction(): Promise<ActionResponse<void>> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      success: false,
      error: error.message || 'Gagal keluar dari sesi',
    };
  }

  revalidatePath('/', 'layout');
  redirect('/login');
}

/**
 * Request password reset email
 */
export async function resetPasswordAction(input: ResetPasswordInput): Promise<ActionResponse<void>> {
  const validated = resetPasswordSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: 'Format email tidak valid',
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(validated.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/update-password`,
  });

  if (error) {
    return {
      success: false,
      error: error.message || 'Gagal mengirim email reset password',
    };
  }

  return { success: true };
}

/**
 * Update user password
 */
export async function updatePasswordAction(input: UpdatePasswordInput): Promise<ActionResponse<void>> {
  const validated = updatePasswordSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: 'Password tidak valid',
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: validated.data.password,
  });

  if (error) {
    return {
      success: false,
      error: error.message || 'Gagal memperbarui password',
    };
  }

  return { success: true };
}

/**
 * Update profile information
 */
export async function updateProfileAction(input: UpdateProfileInput): Promise<ActionResponse<Profile>> {
  const validated = updateProfileSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: 'Data profil tidak valid',
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Pengguna belum terautentikasi' };
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      nama: validated.data.nama,
      avatar_url: validated.data.avatar_url ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message || 'Gagal memperbarui profil' };
  }

  revalidatePath('/pengaturan');
  return { success: true, data: data as Profile };
}

/**
 * Delete user account and all personal data (FR-8)
 */
export async function deleteAccountAction(): Promise<ActionResponse<void>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Pengguna belum terautentikasi' };
  }

  // Call the secure RPC function to delete current user
  const { error } = await supabase.rpc('delete_user_account');

  if (error) {
    return {
      success: false,
      error: error.message || 'Gagal menghapus akun. Silakan coba kembali.',
    };
  }

  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

