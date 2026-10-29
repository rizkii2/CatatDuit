'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { MobileDrawer } from './MobileDrawer';
import { TransactionModal } from '../modals/TransactionModal';
import { Profile } from '@/types';

interface AppShellProps {
  children: React.ReactNode;
  profile?: Profile | null;
  headerTitle?: string;
  headerSubtitle?: string;
}

export function AppShell({
  children,
  profile,
  headerTitle,
  headerSubtitle,
}: AppShellProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0B0D13] text-[#F1F5F9]">
      {/* Desktop Left Sidebar */}
      <Sidebar onOpenTransactionModal={() => setIsModalOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          profile={profile}
          onOpenTransactionModal={() => setIsModalOpen(true)}
          onToggleDrawer={() => setIsDrawerOpen((prev) => !prev)}
          title={headerTitle}
          subtitle={headerSubtitle}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav
          onOpenTransactionModal={() => setIsModalOpen(true)}
          onToggleDrawer={() => setIsDrawerOpen(true)}
        />

        {/* Mobile Slide-Over Navigation Drawer */}
        <MobileDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          profile={profile}
        />

        {/* Quick Transaction Modal (Available everywhere) */}
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      </div>
    </div>
  );
}
