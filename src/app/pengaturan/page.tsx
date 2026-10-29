import React from 'react';
import { getCurrentUser } from '@/actions/auth';
import { AppShell } from '@/components/layout/AppShell';
import { SettingsClient } from '@/components/settings/SettingsClient';

export default async function PengaturanPage() {
  const { user, profile } = await getCurrentUser();

  return (
    <AppShell
      profile={profile}
      headerTitle="Pengaturan & Akun"
      headerSubtitle="Kelola preferensi akun, ekspor data transaksi ke CSV, dan opsi akun."
    >
      <SettingsClient profile={profile} userEmail={user?.email} />
    </AppShell>
  );
}
