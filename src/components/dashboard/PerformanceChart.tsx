'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { ArrowUpRight } from 'lucide-react';
import { formatRupiah } from '@/lib/utils/format';

interface DailyData {
  tanggal: string;
  pemasukan: number;
  pengeluaran: number;
}

interface PerformanceChartProps {
  data: DailyData[];
  totalPemasukan: number;
  totalPengeluaran: number;
  sisaSaldo: number;
}

export function PerformanceChart({
  data,
  totalPemasukan,
  totalPengeluaran,
  sisaSaldo,
}: PerformanceChartProps) {
  const [filterMode, setFilterMode] = useState<'daily' | 'weekly'>('daily');

  // Format data for chart display
  const chartData = React.useMemo(() => {
    if (filterMode === 'weekly') {
      // Group into 4 weeks
      const weeks = [
        { label: 'Mgg 1 (1-7)', pemasukan: 0, pengeluaran: 0 },
        { label: 'Mgg 2 (8-14)', pemasukan: 0, pengeluaran: 0 },
        { label: 'Mgg 3 (15-21)', pemasukan: 0, pengeluaran: 0 },
        { label: 'Mgg 4 (22+)', pemasukan: 0, pengeluaran: 0 },
      ];

      for (const item of data) {
        const day = parseInt(item.tanggal.split('-')[2], 10);
        if (day <= 7) {
          weeks[0].pemasukan += item.pemasukan;
          weeks[0].pengeluaran += item.pengeluaran;
        } else if (day <= 14) {
          weeks[1].pemasukan += item.pemasukan;
          weeks[1].pengeluaran += item.pengeluaran;
        } else if (day <= 21) {
          weeks[2].pemasukan += item.pemasukan;
          weeks[2].pengeluaran += item.pengeluaran;
        } else {
          weeks[3].pemasukan += item.pemasukan;
          weeks[3].pengeluaran += item.pengeluaran;
        }
      }
      return weeks;
    }

    // Default daily
    return data.map((d) => ({
      label: d.tanggal.split('-')[2], // Just date number "01", "02"
      pemasukan: d.pemasukan,
      pengeluaran: d.pengeluaran,
      fullDate: d.tanggal,
    }));
  }, [data, filterMode]);

  return (
    <div className="card-subly p-5 flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">Arus Kas Bulanan</h2>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#1C2130] text-[#94A3B8] border border-[#273045]">
              Real-time
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Perbandingan pemasukan vs pengeluaran bulan berjalan
          </p>
        </div>

        {/* Right side stats + filters */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          {/* Filter Pills */}
          <div className="flex items-center p-0.5 bg-[#0E1118] border border-[#222736] rounded-xl">
            <button
              onClick={() => setFilterMode('daily')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                filterMode === 'daily'
                  ? 'bg-[#1D2333] text-white shadow-sm'
                  : 'text-[#64748B] hover:text-white'
              }`}
            >
              Harian
            </button>
            <button
              onClick={() => setFilterMode('weekly')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                filterMode === 'weekly'
                  ? 'bg-[#1D2333] text-white shadow-sm'
                  : 'text-[#64748B] hover:text-white'
              }`}
            >
              Mingguan
            </button>
          </div>

          <div className="text-right">
            <div className="text-sm sm:text-base font-extrabold text-white">
              {formatRupiah(sisaSaldo)}
            </div>
            <div className="text-[10px] text-[#10B981] font-semibold flex items-center justify-end gap-0.5">
              <ArrowUpRight className="w-2.5 h-2.5" />
              <span>Arus Bersih</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2433" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#1F2433' }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#1F2433' }}
              tickFormatter={(v) => {
                if (v >= 1000000) return `${(v / 1000000).toFixed(0)}jt`;
                if (v >= 1000) return `${(v / 1000).toFixed(0)}rb`;
                return v;
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#12151E] border border-[#23293B] rounded-xl p-3 shadow-xl text-xs space-y-1">
                      <p className="font-bold text-white mb-1">
                        {payload[0].payload.fullDate || payload[0].payload.label}
                      </p>
                      <div className="flex items-center gap-2 text-[#10B981]">
                        <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                        <span>Pemasukan: {formatRupiah(Number(payload[0].value || 0))}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#EF4444]">
                        <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                        <span>Pengeluaran: {formatRupiah(Number(payload[1].value || 0))}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="pemasukan" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={16} />
            <Bar dataKey="pengeluaran" fill="#FF4D36" radius={[4, 4, 0, 0]} maxBarSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Summary Metrics */}
      <div className="grid grid-cols-3 gap-2 pt-4 mt-2 border-t border-[#1F2433]">
        <div className="bg-[#0E1118] border border-[#1F2433] rounded-xl p-2.5 sm:p-3">
          <span className="text-[10px] text-[#64748B] font-medium block">Total Pemasukan</span>
          <span className="text-xs sm:text-sm font-bold text-[#10B981] truncate block mt-0.5">
            +{formatRupiah(totalPemasukan)}
          </span>
        </div>
        <div className="bg-[#0E1118] border border-[#1F2433] rounded-xl p-2.5 sm:p-3">
          <span className="text-[10px] text-[#64748B] font-medium block">Total Pengeluaran</span>
          <span className="text-xs sm:text-sm font-bold text-[#EF4444] truncate block mt-0.5">
            -{formatRupiah(totalPengeluaran)}
          </span>
        </div>
        <div className="bg-[#0E1118] border border-[#1F2433] rounded-xl p-2.5 sm:p-3">
          <span className="text-[10px] text-[#64748B] font-medium block">Arus Bersih</span>
          <span
            className={`text-xs sm:text-sm font-bold truncate block mt-0.5 ${
              sisaSaldo >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
            }`}
          >
            {sisaSaldo >= 0 ? '+' : ''}
            {formatRupiah(sisaSaldo)}
          </span>
        </div>
      </div>
    </div>
  );
}

