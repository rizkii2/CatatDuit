'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ArrowUpRight, Flame } from 'lucide-react';
import Link from 'next/link';
import { formatRupiah } from '@/lib/utils/format';

interface CategoryAllocation {
  kategoriId: string;
  nama: string;
  warna: string;
  ikon: string;
  total: number;
  persentase: number;
}

interface AllocationDonutChartProps {
  categories: CategoryAllocation[];
  totalExpense: number;
  topCategory: { nama: string; total: number; persentase: number } | null;
}

export function AllocationDonutChart({
  categories,
  totalExpense,
  topCategory,
}: AllocationDonutChartProps) {
  // If no data, show a placeholder
  const displayData =
    categories.length > 0
      ? categories
      : [
          {
            kategoriId: 'empty',
            nama: 'Belum ada transaksi',
            warna: '#252D3F',
            ikon: 'Tag',
            total: 1,
            persentase: 100,
          },
        ];

  return (
    <div className="card-subly p-5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-base font-bold text-white">Alokasi Pengeluaran</h2>
          <p className="text-xs text-[#64748B]">Berdasarkan kategori bulan ini</p>
        </div>
        <Link
          href="/kategori"
          className="text-xs font-semibold text-[#FF4D36] hover:underline flex items-center gap-0.5"
        >
          <span>Detail</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Donut Chart with Center Label */}
      <div className="relative w-full h-52 flex items-center justify-center my-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length && categories.length > 0) {
                  const data = payload[0].payload as CategoryAllocation;
                  return (
                    <div className="bg-[#12151E] border border-[#23293B] rounded-xl p-2.5 shadow-xl text-xs space-y-0.5">
                      <p className="font-bold text-white">{data.nama}</p>
                      <p className="text-[#94A3B8]">
                        {formatRupiah(data.total)} ({data.persentase}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={displayData}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={3}
              dataKey="total"
              stroke="none"
            >
              {displayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.warna} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text inside Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B]">
            Total Pengeluaran
          </span>
          <span className="text-sm sm:text-base font-black text-white mt-0.5">
            {formatRupiah(totalExpense)}
          </span>
        </div>
      </div>

      {/* Categories Legend List */}
      <div className="space-y-2 my-2 max-h-36 overflow-y-auto pr-1">
        {categories.slice(0, 4).map((item) => (
          <div
            key={item.kategoriId}
            className="flex items-center justify-between text-xs py-1 border-b border-[#1A1F2C] last:border-none"
          >
            <div className="flex items-center gap-2 truncate">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.warna }}
              />
              <span className="text-[#F1F5F9] font-medium truncate">
                {item.nama}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[#94A3B8]">{formatRupiah(item.total)}</span>
              <span className="font-bold text-white w-10 text-right">
                {item.persentase}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Insight Banner (Matching Reference Image bottom right banner) */}
      <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-[#1E171E] to-[#25181C] border border-[#3D2028] flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <p className="text-[11px] font-medium text-white leading-tight">
            {topCategory
              ? `Pengeluaran terbesar: ${topCategory.nama} (${topCategory.persentase}%)`
              : 'Belum ada pengeluaran yang dicatat bulan ini.'}
          </p>
          <p className="text-[10px] text-[#94A3B8]">
            Jaga rasio pengeluaran sesuai anggaranmu.
          </p>
        </div>
        <Link
          href="/anggaran"
          className="px-3 py-1.5 rounded-lg bg-[#FF4D36] hover:bg-[#FF634F] text-white text-[11px] font-bold shrink-0 shadow-md shadow-[#FF4D36]/20 transition"
        >
          Cek Anggaran
        </Link>
      </div>
    </div>
  );
}

