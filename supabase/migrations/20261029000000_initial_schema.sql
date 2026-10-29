-- ==============================================================================
-- Schema: Aplikasi Pencatatan Keuangan (CatatDuit)
-- Target: Supabase Postgres with Row Level Security (RLS)
-- ==============================================================================

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama text NOT NULL,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. ACCOUNTS (Dompet / Rekening / E-Wallet)
CREATE TABLE IF NOT EXISTS public.accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nama text NOT NULL,
  tipe text NOT NULL CHECK (tipe IN ('cash', 'bank', 'ewallet')),
  saldo_awal bigint NOT NULL DEFAULT 0,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. CATEGORIES (Kategori Pemasukan & Pengeluaran)
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nama text NOT NULL,
  tipe text NOT NULL CHECK (tipe IN ('income', 'expense')),
  ikon text NOT NULL DEFAULT 'Tag',
  warna text NOT NULL DEFAULT '#6B7280',
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. TRANSACTIONS (Pemasukan & Pengeluaran)
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  tipe text NOT NULL CHECK (tipe IN ('income', 'expense')),
  amount bigint NOT NULL CHECK (amount > 0),
  tanggal date NOT NULL DEFAULT CURRENT_DATE,
  catatan text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. TRANSFERS (Transfer Antar Dompet - P1)
CREATE TABLE IF NOT EXISTS public.transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dari_account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  ke_account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  amount bigint NOT NULL CHECK (amount > 0),
  biaya_admin bigint NOT NULL DEFAULT 0 CHECK (biaya_admin >= 0),
  tanggal date NOT NULL DEFAULT CURRENT_DATE,
  catatan text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_different_accounts CHECK (dari_account_id <> ke_account_id)
);

-- 6. BUDGETS (Anggaran Bulanan per Kategori - P1)
CREATE TABLE IF NOT EXISTS public.budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  bulan date NOT NULL, -- Format YYYY-MM-01 (tanggal 1 awal bulan)
  batas bigint NOT NULL CHECK (batas > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_category_bulan UNIQUE (user_id, category_id, bulan)
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions (user_id, tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_cat_date ON public.transactions (user_id, category_id, tanggal);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON public.transactions (account_id);
CREATE INDEX IF NOT EXISTS idx_transfers_user_date ON public.transfers (user_id, tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_transfers_dari_acc ON public.transfers (dari_account_id);
CREATE INDEX IF NOT EXISTS idx_transfers_ke_acc ON public.transfers (ke_account_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_bulan ON public.budgets (user_id, bulan);
CREATE INDEX IF NOT EXISTS idx_accounts_user ON public.accounts (user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user ON public.categories (user_id);

-- ==============================================================================
-- VIEWS: Dynamic Account Balance
-- Saldo = saldo_awal + total income - total expense - (transfer keluar + biaya admin) + transfer masuk
-- ==============================================================================
CREATE OR REPLACE VIEW public.accounts_with_balance
WITH (security_invoker = true) AS
SELECT 
  a.id,
  a.user_id,
  a.nama,
  a.tipe,
  a.saldo_awal,
  a.is_archived,
  a.created_at,
  a.updated_at,
  (
    a.saldo_awal
    + COALESCE((SELECT SUM(t.amount) FROM public.transactions t WHERE t.account_id = a.id AND t.tipe = 'income'), 0)
    - COALESCE((SELECT SUM(t.amount) FROM public.transactions t WHERE t.account_id = a.id AND t.tipe = 'expense'), 0)
    - COALESCE((SELECT SUM(tr.amount + tr.biaya_admin) FROM public.transfers tr WHERE tr.dari_account_id = a.id), 0)
    + COALESCE((SELECT SUM(tr.amount) FROM public.transfers tr WHERE tr.ke_account_id = a.id), 0)
  ) AS saldo_saat_ini
FROM public.accounts a;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Profiles: Own rows only
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- Accounts: Own rows only
CREATE POLICY "Users can view own accounts" ON public.accounts
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own accounts" ON public.accounts
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own accounts" ON public.accounts
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own accounts" ON public.accounts
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Categories: Own rows only
CREATE POLICY "Users can view own categories" ON public.categories
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own categories" ON public.categories
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own categories" ON public.categories
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Transactions: Own rows only
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Transfers: Own rows only
CREATE POLICY "Users can view own transfers" ON public.transfers
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transfers" ON public.transfers
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own transfers" ON public.transfers
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own transfers" ON public.transfers
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Budgets: Own rows only
CREATE POLICY "Users can view own budgets" ON public.budgets
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own budgets" ON public.budgets
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own budgets" ON public.budgets
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own budgets" ON public.budgets
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ==============================================================================
-- AUTOMATION TRIGGER: New User Sign Up (FR-1)
-- Creates profile, default wallet "Tunai", and default categories
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_nama text;
BEGIN
  -- Determine display name from metadata or email
  v_nama := COALESCE(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'nama',
    split_part(new.email, '@', 1),
    'Pengguna'
  );

  -- 1. Create Profile
  INSERT INTO public.profiles (id, nama, avatar_url)
  VALUES (
    new.id,
    v_nama,
    new.raw_user_meta_data->>'avatar_url'
  );

  -- 2. Create Default Account "Tunai"
  INSERT INTO public.accounts (user_id, nama, tipe, saldo_awal)
  VALUES (new.id, 'Tunai', 'cash', 0);

  -- 3. Create Default Expense Categories
  INSERT INTO public.categories (user_id, nama, tipe, ikon, warna) VALUES
    (new.id, 'Makan & Minum', 'expense', 'Utensils', '#EF4444'),
    (new.id, 'Transportasi', 'expense', 'Car', '#F59E0B'),
    (new.id, 'Belanja', 'expense', 'ShoppingBag', '#3B82F6'),
    (new.id, 'Tagihan & Utilitas', 'expense', 'Receipt', '#8B5CF6'),
    (new.id, 'Hiburan', 'expense', 'Film', '#EC4899'),
    (new.id, 'Kesehatan', 'expense', 'HeartPulse', '#10B981'),
    (new.id, 'Lainnya (Pengeluaran)', 'expense', 'MoreHorizontal', '#6B7280');

  -- 4. Create Default Income Categories
  INSERT INTO public.categories (user_id, nama, tipe, ikon, warna) VALUES
    (new.id, 'Gaji', 'income', 'Wallet', '#10B981'),
    (new.id, 'Bonus & Tunjangan', 'income', 'Gift', '#3B82F6'),
    (new.id, 'Pemasukan Lainnya', 'income', 'PlusCircle', '#14B8A6');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger binding to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- FUNCTION: Delete User Account and all data (FR-8)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void AS $$
BEGIN
  -- Deleting from auth.users cascades to profiles and all user data
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- FUNCTION: Auto-update updated_at timestamp
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_modtime
  BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_accounts_modtime
  BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_categories_modtime
  BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_transactions_modtime
  BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_transfers_modtime
  BEFORE UPDATE ON public.transfers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_budgets_modtime
  BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

