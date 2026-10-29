import React from 'react';
import { getCurrentUser } from '@/actions/auth';
import { getAccountsAction } from '@/actions/accounts';
import { getTransfersAction } from '@/actions/transfers';
import { AppShell } from '@/components/layout/AppShell';
import { TransferClient } from '@/components/transfers/TransferClient';

export default async function TransferPage() {
  const { profile } = await getCurrentUser();

  const [accRes, trRes] = await Promise.all([
    getAccountsAction(false),
    getTransfersAction({ limit: 50 }),
  ]);

  const accounts = accRes.success && accRes.data ? accRes.data : [];
  const transfers = trRes.success && trRes.data ? trRes.data.transfers : [];

  return (
    <AppShell
      profile={profile}
      headerTitle="Transfer Antar Dompet"
      headerSubtitle="Pindahkan dana antar rekening tanpa memengaruhi arus pemasukan atau pengeluaran."
    >
      <TransferClient accounts={accounts} initialTransfers={transfers} />
    </AppShell>
  );
}
