import React from 'react';
import { getCurrentUser } from '@/actions/auth';
import { getAccountsAction } from '@/actions/accounts';
import { AppShell } from '@/components/layout/AppShell';
import { WalletManagementClient } from '@/components/wallets/WalletManagementClient';

export default async function DompetPage() {
  const { profile } = await getCurrentUser();
  const accRes = await getAccountsAction(true); // include archived

  const accounts = accRes.success && accRes.data ? accRes.data : [];

  return (
    <AppShell
      profile={profile}
      headerTitle="Kelola Dompet & Rekening"
      headerSubtitle="Pantau saldo dan kelola sumber dana tunai, rekening bank, maupun e-wallet."
    >
      <WalletManagementClient initialAccounts={accounts} />
    </AppShell>
  );
}
