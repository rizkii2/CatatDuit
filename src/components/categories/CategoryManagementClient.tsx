'use client';

import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Edit2,
  Archive,
  Trash2,
  RotateCcw,
  X,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import { Category } from '@/types';
import { CategoryIcon, AVAILABLE_ICONS } from '@/components/ui/CategoryIcon';
import {
  createCategoryAction,
  updateCategoryAction,
  archiveCategoryAction,
  deleteCategoryAction,
} from '@/actions/categories';

interface CategoryManagementClientProps {
  initialCategories: Category[];
}

const PRESET_COLORS = [
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#6366F1', // Indigo
  '#F97316', // Orange
  '#6B7280', // Gray
];

export function CategoryManagementClient({
  initialCategories,
}: CategoryManagementClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [nama, setNama] = useState('');
  const [tipe, setTipe] = useState<'expense' | 'income'>('expense');
  const [ikon, setIkon] = useState('Tag');
  const [warna, setWarna] = useState('#EF4444');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredCategories = categories.filter((c) => c.tipe === activeTab);
  const activeCategories = filteredCategories.filter((c) => !c.is_archived);
  const archivedCategories = filteredCategories.filter((c) => c.is_archived);

  const openCreateModal = () => {
    setEditingCategory(null);
    setNama('');
    setTipe(activeTab);
    setIkon('Tag');
    setWarna(activeTab === 'expense' ? '#EF4444' : '#10B981');
    setErrorMsg(null);
    setShowModal(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setNama(cat.nama);
    setTipe(cat.tipe);
    setIkon(cat.ikon);
    setWarna(cat.warna);
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setErrorMsg('Nama kategori wajib diisi');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    if (editingCategory) {
      const res = await updateCategoryAction(editingCategory.id, {
        nama: nama.trim(),
        tipe,
        ikon,
        warna,
      });

      if (res.success && res.data) {
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCategory.id ? res.data! : c))
        );
        setShowModal(false);
      } else {
        setErrorMsg(res.error || 'Gagal memperbarui kategori');
      }
    } else {
      const res = await createCategoryAction({
        nama: nama.trim(),
        tipe,
        ikon,
        warna,
      });

      if (res.success && res.data) {
        setCategories((prev) => [...prev, res.data!]);
        setShowModal(false);
      } else {
        setErrorMsg(res.error || 'Gagal menambahkan kategori');
      }
    }

    setLoading(false);
  };

  const handleArchiveToggle = async (cat: Category) => {
    const nextState = !cat.is_archived;
    const res = await archiveCategoryAction(cat.id, nextState);
    if (res.success) {
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, is_archived: nextState } : c))
      );
    } else {
      alert(res.error || 'Gagal mengubah status arsip');
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Hapus kategori "${cat.nama}"?`)) return;

    const res = await deleteCategoryAction(cat.id);
    if (res.success) {
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    } else {
      alert(res.error || 'Gagal menghapus kategori');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Type Tabs and Create Button */}
      <div className="card-subly p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center p-1 bg-[#0E1118] border border-[#222736] rounded-xl">
          <button
            onClick={() => setActiveTab('expense')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'expense'
                ? 'bg-[#EF4444] text-white shadow-md shadow-[#EF4444]/20'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Kategori Pengeluaran</span>
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'income'
                ? 'bg-[#10B981] text-white shadow-md shadow-[#10B981]/20'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Kategori Pemasukan</span>
          </button>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF4D36] to-[#FF634F] hover:from-[#FF5D47] hover:to-[#FF735F] text-white font-bold text-xs shadow-md shadow-[#FF4D36]/20 transition shrink-0 self-end sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div>
        <h2 className="text-sm font-bold text-white mb-3">
          Kategori {activeTab === 'expense' ? 'Pengeluaran' : 'Pemasukan'} Aktif (
          {activeCategories.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {activeCategories.map((cat) => (
            <div
              key={cat.id}
              className="card-subly p-4 flex items-center justify-between hover:border-[#2E364A] transition group"
            >
              <div className="flex items-center gap-3 truncate">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: cat.warna }}
                >
                  <CategoryIcon name={cat.ikon} className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h3 className="text-xs font-bold text-white truncate">{cat.nama}</h3>
                  <span className="text-[10px] text-[#64748B] uppercase">
                    {cat.tipe === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition shrink-0 ml-2">
                <button
                  onClick={() => openEditModal(cat)}
                  className="w-7 h-7 rounded-lg bg-[#191E2B] hover:bg-[#252C3D] text-[#94A3B8] hover:text-white flex items-center justify-center transition"
                  title="Ubah Kategori"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleArchiveToggle(cat)}
                  className="w-7 h-7 rounded-lg bg-[#191E2B] hover:bg-amber-500/10 text-[#94A3B8] hover:text-amber-400 flex items-center justify-center transition"
                  title="Arsipkan Kategori"
                >
                  <Archive className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="w-7 h-7 rounded-lg bg-[#191E2B] hover:bg-red-500/10 text-[#64748B] hover:text-red-400 flex items-center justify-center transition"
                  title="Hapus Kategori"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Archived Categories */}
      {archivedCategories.length > 0 && (
        <div className="pt-4 border-t border-[#1F2433]">
          <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3">
            Kategori Diarsipkan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 opacity-60">
            {archivedCategories.map((cat) => (
              <div
                key={cat.id}
                className="bg-[#11141E] border border-[#1A1F2C] rounded-xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.warna }}
                  />
                  <span className="text-xs font-bold text-white line-through">
                    {cat.nama}
                  </span>
                </div>
                <button
                  onClick={() => handleArchiveToggle(cat)}
                  className="px-2.5 py-1 rounded bg-[#1C2130] hover:bg-[#252C3D] text-[11px] font-semibold text-[#10B981] flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Aktifkan</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Add / Edit Category */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#141721] border border-[#23293B] rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1F2433]">
              <h3 className="text-sm font-bold text-white">
                {editingCategory ? 'Ubah Kategori' : 'Tambah Kategori Baru'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-lg bg-[#1A1F2C] text-[#94A3B8] hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#94A3B8] block mb-1">
                  Jenis Kategori
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTipe('expense');
                      setWarna('#EF4444');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      tipe === 'expense'
                        ? 'bg-[#EF4444] border-[#EF4444] text-white'
                        : 'bg-[#0E1118] border-[#222736] text-[#94A3B8]'
                    }`}
                  >
                    Pengeluaran
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTipe('income');
                      setWarna('#10B981');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      tipe === 'income'
                        ? 'bg-[#10B981] border-[#10B981] text-white'
                        : 'bg-[#0E1118] border-[#222736] text-[#94A3B8]'
                    }`}
                  >
                    Pemasukan
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#94A3B8] block mb-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kopi, Langganan, Hobi"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full bg-[#0E1118] border border-[#222736] rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D36] outline-none"
                />
              </div>

              {/* Color Presets */}
              <div>
                <label className="text-xs font-semibold text-[#94A3B8] block mb-1.5">
                  Warna Kategori
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setWarna(c)}
                      className={`w-7 h-7 rounded-lg transition border-2 ${
                        warna === c ? 'border-white scale-110 shadow-md' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Icon Presets */}
              <div>
                <label className="text-xs font-semibold text-[#94A3B8] block mb-1.5">
                  Pilih Ikon
                </label>
                <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto p-1 bg-[#0E1118] border border-[#222736] rounded-xl">
                  {AVAILABLE_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIkon(ic)}
                      className={`h-9 rounded-lg flex items-center justify-center transition border ${
                        ikon === ic
                          ? 'bg-[#1E2433] border-[#FF4D36] text-white'
                          : 'border-transparent text-[#94A3B8] hover:bg-[#151922] hover:text-white'
                      }`}
                    >
                      <CategoryIcon name={ic} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !nama.trim()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FF4D36] to-[#FF634F] hover:from-[#FF5D47] hover:to-[#FF735F] text-white font-bold text-xs shadow-md shadow-[#FF4D36]/20 transition disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : editingCategory ? 'Simpan Perubahan' : 'Buat Kategori'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

