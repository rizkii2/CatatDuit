import React from 'react';
import { getCurrentUser } from '@/actions/auth';
import { getBudgetsAction } from '@/actions/budgets';
import { getCategoriesAction } from '@/actions/categories';
import { AppShell } from '@/components/layout/AppShell';
import { BudgetManagementClient } from '@/components/budgets/BudgetManagementClient';
import { getFirstDayOfMonthWIB } from '@/lib/utils/format';

interface PageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function AnggaranPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const currentMonthParam = resolvedParams.month || getFirstDayOfMonthWIB().slice(0, 7);

  const { profile } = await getCurrentUser();

  const [budgetsRes, categoriesRes] = await Promise.all([
    getBudgetsAction({ bulan: currentMonthParam }),
    getCategoriesAction('expense', false),
  ]);

  const budgets = budgetsRes.success && budgetsRes.data ? budgetsRes.data : [];
  const expenseCategories = categoriesRes.success && categoriesRes.data ? categoriesRes.data : [];

  return (
    <AppShell
      profile={profile}
      headerTitle="Rencana & Anggaran"
      headerSubtitle="Kendalikan pengeluaran dengan batas anggaran bulanan per kategori."
    >
      <BudgetManagementClient
        initialBudgets={budgets}
        expenseCategories={expenseCategories}
        currentMonth={currentMonthParam}
      />
    </AppShell>
  );
}
