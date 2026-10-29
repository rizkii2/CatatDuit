import { Database, AccountType, TransactionType, CategoryType } from './database';

export type { AccountType, TransactionType, CategoryType, Database };

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Account = Database['public']['Tables']['accounts']['Row'];
export type AccountWithBalance = Database['public']['Views']['accounts_with_balance']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type Transfer = Database['public']['Tables']['transfers']['Row'];
export type Budget = Database['public']['Tables']['budgets']['Row'];

// Enriched transaction with related account and category details
export interface TransactionWithDetails extends Transaction {
  account?: Pick<Account, 'id' | 'nama' | 'tipe'> | null;
  category?: Pick<Category, 'id' | 'nama' | 'tipe' | 'ikon' | 'warna'> | null;
}

// Enriched transfer with source and destination account details
export interface TransferWithDetails extends Transfer {
  dari_account?: Pick<Account, 'id' | 'nama' | 'tipe'> | null;
  ke_account?: Pick<Account, 'id' | 'nama' | 'tipe'> | null;
}

// Grouped transactions by date (FR-2: Daftar transaksi dikelompokkan per tanggal)
export interface GroupedTransactions {
  date: string; // YYYY-MM-DD
  formattedDate: string; // e.g. "Rabu, 29 Oktober 2026"
  totalIncome: number;
  totalExpense: number;
  transactions: TransactionWithDetails[];
}

// Budget status with progress (FR-7)
export interface BudgetStatus {
  id: string;
  category_id: string;
  category_name: string;
  category_color: string;
  category_icon: string;
  bulan: string; // YYYY-MM-01
  batas: number; // Limit in IDR
  terpakai: number; // Spent in IDR
  sisa: number; // Remaining
  persentase: number; // 0 - 100+
  status: 'aman' | 'peringatan' | 'melebihi'; // aman (<80%), peringatan (80-100%), melebihi (>100%)
}

// Dashboard monthly summary (FR-5)
export interface DashboardSummary {
  bulan: string; // YYYY-MM
  bulanLabel: string; // e.g. "Oktober 2026"
  totalPemasukan: number;
  totalPengeluaran: number;
  sisaSaldoBulanIni: number;
  saldoTotalSemuaDompet: number;
  kategoriPengeluaranTerbesar: {
    nama: string;
    total: number;
    persentase: number;
  } | null;
  pengeluaranPerKategori: {
    kategoriId: string;
    nama: string;
    warna: string;
    ikon: string;
    total: number;
    persentase: number;
  }[];
  grafikHarian: {
    tanggal: string; // YYYY-MM-DD or DD
    pemasukan: number;
    pengeluaran: number;
  }[];
  limaTransaksiTerakhir: TransactionWithDetails[];
  daftarDompet: AccountWithBalance[];
}

// Action response standard
export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

