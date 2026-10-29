-- ==============================================================================
-- Seed Data for Local Development and Testing (CatatDuit)
-- ==============================================================================

-- Note: In production Supabase, users are created through Supabase Auth (auth.users).
-- The trigger `handle_new_user()` will automatically create the profile, default
-- wallet "Tunai", and default categories upon signup.

-- This seed script provides sample dummy data if testing directly on Postgres.
DO $$
DECLARE
  mock_user_id uuid := '00000000-0000-0000-0000-000000000001'::uuid;
  acc_cash_id uuid := gen_random_uuid();
  acc_bank_id uuid := gen_random_uuid();
  acc_ewallet_id uuid := gen_random_uuid();
  cat_makan_id uuid := gen_random_uuid();
  cat_transport_id uuid := gen_random_uuid();
  cat_gaji_id uuid := gen_random_uuid();
BEGIN
  -- Insert mock profile if not exists
  INSERT INTO public.profiles (id, nama)
  VALUES (mock_user_id, 'Demo Pengguna')
  ON CONFLICT (id) DO NOTHING;

  -- Insert Accounts
  INSERT INTO public.accounts (id, user_id, nama, tipe, saldo_awal)
  VALUES 
    (acc_cash_id, mock_user_id, 'Tunai Dompet', 'cash', 250000),
    (acc_bank_id, mock_user_id, 'BCA Utama', 'bank', 5000000),
    (acc_ewallet_id, mock_user_id, 'GoPay', 'ewallet', 150000)
  ON CONFLICT DO NOTHING;

  -- Insert Categories
  INSERT INTO public.categories (id, user_id, nama, tipe, ikon, warna)
  VALUES
    (cat_makan_id, mock_user_id, 'Makan & Minum', 'expense', 'Utensils', '#EF4444'),
    (cat_transport_id, mock_user_id, 'Transportasi', 'expense', 'Car', '#F59E0B'),
    (cat_gaji_id, mock_user_id, 'Gaji Bulanan', 'income', 'Wallet', '#10B981')
  ON CONFLICT DO NOTHING;

  -- Insert Sample Transactions
  INSERT INTO public.transactions (user_id, account_id, category_id, tipe, amount, tanggal, catatan)
  VALUES
    (mock_user_id, acc_bank_id, cat_gaji_id, 'income', 8500000, CURRENT_DATE - INTERVAL '5 days', 'Gaji bulan ini'),
    (mock_user_id, acc_cash_id, cat_makan_id, 'expense', 45000, CURRENT_DATE - INTERVAL '1 day', 'Makan siang nasi padang'),
    (mock_user_id, acc_ewallet_id, cat_transport_id, 'expense', 22000, CURRENT_DATE, 'Ojek online ke kantor')
  ON CONFLICT DO NOTHING;

  -- Insert Sample Transfer
  INSERT INTO public.transfers (user_id, dari_account_id, ke_account_id, amount, biaya_admin, tanggal, catatan)
  VALUES
    (mock_user_id, acc_bank_id, acc_ewallet_id, 200000, 1000, CURRENT_DATE - INTERVAL '2 days', 'Top up e-wallet')
  ON CONFLICT DO NOTHING;

  -- Insert Sample Budget
  INSERT INTO public.budgets (user_id, category_id, bulan, batas)
  VALUES
    (mock_user_id, cat_makan_id, date_trunc('month', CURRENT_DATE)::date, 1500000)
  ON CONFLICT DO NOTHING;
END $$;

