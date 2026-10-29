import React from 'react';
import { getCurrentUser } from '@/actions/auth';
import { getCategoriesAction } from '@/actions/categories';
import { AppShell } from '@/components/layout/AppShell';
import { CategoryManagementClient } from '@/components/categories/CategoryManagementClient';

export default async function KategoriPage() {
  const { profile } = await getCurrentUser();
  const catRes = await getCategoriesAction(undefined, true); // include archived

  const categories = catRes.success && catRes.data ? catRes.data : [];

  return (
    <AppShell
      profile={profile}
      headerTitle="Kelola Kategori"
      headerSubtitle="Sesuaikan kategori pemasukan dan pengeluaran dengan warna dan ikon pilihanmu."
    >
      <CategoryManagementClient initialCategories={categories} />
    </AppShell>
  );
}
