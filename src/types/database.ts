export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AccountType = 'cash' | 'bank' | 'ewallet';
export type TransactionType = 'income' | 'expense';
export type CategoryType = 'income' | 'expense';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nama: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          nama: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nama?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      accounts: {
        Row: {
          id: string;
          user_id: string;
          nama: string;
          tipe: AccountType;
          saldo_awal: number;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          nama: string;
          tipe: AccountType;
          saldo_awal?: number;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          nama?: string;
          tipe?: AccountType;
          saldo_awal?: number;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          nama: string;
          tipe: CategoryType;
          ikon: string;
          warna: string;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          nama: string;
          tipe: CategoryType;
          ikon?: string;
          warna?: string;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          nama?: string;
          tipe?: CategoryType;
          ikon?: string;
          warna?: string;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          account_id: string;
          category_id: string;
          tipe: TransactionType;
          amount: number;
          tanggal: string;
          catatan: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_id: string;
          category_id: string;
          tipe: TransactionType;
          amount: number;
          tanggal?: string;
          catatan?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          account_id?: string;
          category_id?: string;
          tipe?: TransactionType;
          amount?: number;
          tanggal?: string;
          catatan?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      transfers: {
        Row: {
          id: string;
          user_id: string;
          dari_account_id: string;
          ke_account_id: string;
          amount: number;
          biaya_admin: number;
          tanggal: string;
          catatan: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          dari_account_id: string;
          ke_account_id: string;
          amount: number;
          biaya_admin?: number;
          tanggal?: string;
          catatan?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          dari_account_id?: string;
          ke_account_id?: string;
          amount?: number;
          biaya_admin?: number;
          tanggal?: string;
          catatan?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          bulan: string;
          batas: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          bulan: string;
          batas: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          bulan?: string;
          batas?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      accounts_with_balance: {
        Row: {
          id: string;
          user_id: string;
          nama: string;
          tipe: AccountType;
          saldo_awal: number;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
          saldo_saat_ini: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      delete_user_account: {
        Args: Record<PropertyKey, never>;
        Returns: void;
      };
    };
    Enums: {
      account_type: AccountType;
      transaction_type: TransactionType;
      category_type: CategoryType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
