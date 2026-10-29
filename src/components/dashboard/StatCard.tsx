'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { formatRupiah } from '@/lib/utils/format';

interface StatCardProps {
  title: string;
  amount: number;
  type?: 'neutral' | 'income' | 'expense' | 'savings';
  subtitle?: string;
  badgeText?: string;
  badgeTrend?: 'up' | 'down' | 'neutral';
}

export function StatCard({
  title,
  amount,
  type = 'neutral',
  subtitle,
  badgeText,
  badgeTrend = 'up',
}: StatCardProps) {
  const getIcon = () => {
    switch (type) {
      case 'income':
        return <TrendingUp className="w-4 h-4 text-[#10B981]" />;
      case 'expense':
        return <TrendingDown className="w-4 h-4 text-[#EF4444]" />;
      case 'savings':
        return <PiggyBank className="w-4 h-4 text-[#3B82F6]" />;
      default:
        return <Wallet className="w-4 h-4 text-[#FF4D36]" />;
    }
  };

  const getAmountColor = () => {
    switch (type) {
      case 'income':
        return 'text-white';
      case 'expense':
        return 'text-white';
      default:
        return 'text-white';
    }
  };

  return (
    <div className="card-subly card-subly-hover p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group">
      {/* Top row: Title and Badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#1B202D] border border-[#252D3F] flex items-center justify-center shrink-0">
            {getIcon()}
          </div>
          <span className="text-xs font-medium text-[#94A3B8]">{title}</span>
        </div>

        {badgeText && (
          <div
            className={`flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              badgeTrend === 'up'
                ? 'bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30'
                : badgeTrend === 'down'
                ? 'bg-[#EF4444]/15 text-[#F87171] border border-[#EF4444]/30'
                : 'bg-[#2A3346]/50 text-[#94A3B8]'
            }`}
          >
            {badgeTrend === 'up' ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : badgeTrend === 'down' ? (
              <ArrowDownRight className="w-3 h-3" />
            ) : null}
            <span>{badgeText}</span>
          </div>
        )}
      </div>

      {/* Main Big Number */}
      <div className="my-1">
        <div className={`text-xl sm:text-2xl font-black tracking-tight ${getAmountColor()}`}>
          {formatRupiah(amount)}
        </div>
      </div>

      {/* Subtitle / Bottom hint */}
      {subtitle && (
        <div className="mt-2 text-[11px] text-[#64748B] flex items-center gap-1">
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
}

