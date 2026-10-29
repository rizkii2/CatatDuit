import React from 'react';
import { getCurrentUser } from '@/actions/auth';
import { getTransactionsAction } from '@/actions/transactions';
import { getAccountsAction } from '@/actions/accounts';
import { getCategoriesAction } from '@/actions/categories';
import { AppShell } from '@/components/layout/AppShell';
import { TransactionListClient } from '@/components/transactions/TransactionListClient';

export default async function TransaksiPage() {
  const { profile } = await getCurrentUser();

  const [txRes, accRes, catRes] = await Promise.all([
    getTransactionsAction({ limit: 100 }),
    getAccountsAction(false),
    getCategoriesAction(undefined, false),
  ]);

  const grouped = txRes.success && txRes.data ? txRes.data.grouped : [];
  const totalIncome = txRes.success && txRes.data ? txRes.data.totalIncome : 0;
  const totalExpense = txRes.success && txRes.data ? txRes.data.totalExpense : 0;
  const totalCount = txRes.success && txRes.data ? txRes.data.totalCount : 0;

  const accounts = accRes.success && accRes.data ? accRes.data : [];
  const categories = catRes.success && catRes.data ? catRes.data : [];

  return (
    <AppShell
      profile={profile}
      headerTitle="Riwayat Transaksi"
      headerSubtitle="Daftar seluruh catatan pemasukan dan pengeluaran dikelompokkan per tanggal."
    >
      <TransactionListClient
        initialGrouped={grouped}
        accounts={accounts}
        categories={categories}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        totalCount={totalCount}
      />
    </AppShell>
  );
}
