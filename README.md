# CatatDuit — Backend & Database Engine

Backend aplikasi pencatatan keuangan pribadi sesuai spesifikasi pada [PRD Aplikasi Pencatatan Keuangan.md](./PRD%20Aplikasi%20Pencatatan%20Keuangan.md). Dibangun dengan arsitektur **Next.js App Router (Server Actions & Route Handlers) + Supabase (PostgreSQL, Auth, RLS, Views, Triggers)**.

---

## 🏗️ Arsitektur Backend

```
Browser / Client (Next.js)
  │
  ├─► Server Actions (Mutations & Queries) ──► @supabase/ssr (Server Client)
  ├─► Next.js Middleware (Auth Session Refresh & Route Guarding)
  ├─► Route Handlers (/api/auth/callback, /api/export/csv, /api/health)
  │
  ▼
Supabase PostgreSQL (Database Engine)
  ├─ Row Level Security (RLS) di semua tabel (`user_id = auth.uid()`)
  ├─ Trigger `on_auth_user_created` (Otomatis buat profil, dompet 'Tunai', & kategori default)
  ├─ View `accounts_with_balance` (Kalkulasi saldo real-time anti desinkronisasi)
  └─ Constraints & Indexes (`amount > 0`, Rupiah tanpa desimal, indeks tanggal & user)
```

---

## 🗄️ Model Data & Skema Database

Lokasi migrasi SQL: [`supabase/migrations/20261029000000_initial_schema.sql`](file:///c:/Users/rizki/Desktop/project/catatduit/supabase/migrations/20261029000000_initial_schema.sql)

| Tabel / View | Deskripsi | Aturan & Constraint |
| --- | --- | --- |
| `profiles` | Profil pengguna (`id = auth.users.id`, `nama`, `avatar_url`) | RLS: owner only |
| `accounts` | Dompet pengguna (tunai, bank, ewallet) | `saldo_awal` (bigint), `is_archived`. Tidak bisa dihapus jika ada transaksi (ON DELETE RESTRICT) |
| `categories` | Kategori pemasukan & pengeluaran | `tipe` ('income'/'expense'), `ikon`, `warna` hex, `is_archived` |
| `transactions` | Catatan transaksi | `amount > 0` (bigint Rupiah), `account_id` & `category_id` (RESTRICT), `tanggal` (date) |
| `transfers` (P1) | Transfer dana antar dompet | `dari_account_id <> ke_account_id`, `amount > 0`, `biaya_admin >= 0` |
| `budgets` (P1) | Batas anggaran bulanan per kategori | `bulan` (YYYY-MM-01), unik per user, kategori, dan bulan |
| `accounts_with_balance` (VIEW) | View kalkulasi saldo dinamis | Saldo = `saldo_awal + income - expense - (transfer_out + admin_fee) + transfer_in` |

---

## ⚙️ Environment Variables

Salin `.env.example` ke `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🚀 Menjalankan Migrasi ke Supabase

### Opsi A: Lewat Dashboard Supabase (Paling Mudah)
1. Buka dashboard Supabase project Anda di browser.
2. Masuk ke menu **SQL Editor**.
3. Salin isi file [`supabase/migrations/20261029000000_initial_schema.sql`](./supabase/migrations/20261029000000_initial_schema.sql).
4. Klik **Run** untuk mengeksekusi skema, view, trigger, RLS policies, dan indeks.
5. (Opsional) Jalankan [`supabase/seed.sql`](./supabase/seed.sql) untuk data pengujian lokal.

### Opsi B: Lewat Supabase CLI
```bash
npx supabase db push
```

---

## 📂 Struktur Modul Backend

- [`src/types/database.ts`](file:///c:/Users/rizki/Desktop/project/catatduit/src/types/database.ts) — Definisi tipe TypeScript lengkap untuk tabel, view, dan fungsi Supabase.
- [`src/types/index.ts`](file:///c:/Users/rizki/Desktop/project/catatduit/src/types/index.ts) — Domain model, DTOs, dan interface untuk response Server Actions.
- [`src/lib/validations/`](file:///c:/Users/rizki/Desktop/project/catatduit/src/lib/validations/) — Skema validasi runtime menggunakan Zod:
  - `auth.ts`: pendaftaran, login, reset password, update profile
  - `account.ts`: pembuatan & modifikasi dompet
  - `category.ts`: pembuatan & modifikasi kategori
  - `transaction.ts`: validasi input transaksi & filter pencarian paginasi
  - `transfer.ts`: validasi transfer antar dompet & biaya admin
  - `budget.ts`: validasi batas anggaran bulanan
- [`src/lib/supabase/`](file:///c:/Users/rizki/Desktop/project/catatduit/src/lib/supabase/) — Inisialisasi klien Supabase:
  - `client.ts`: Browser Client (Client Components)
  - `server.ts`: Server Client dengan penanganan cookie Next.js
  - `admin.ts`: Admin Client (Service Role)
  - `middleware.ts`: Token refresh & route guard
- [`src/actions/`](file:///c:/Users/rizki/Desktop/project/catatduit/src/actions/) — Server Actions:
  - `auth.ts`: Otentikasi, profil, hapus akun
  - `accounts.ts`: CRUD dompet & perhitungan saldo
  - `categories.ts`: CRUD kategori bawaan & kustom
  - `transactions.ts`: CRUD transaksi, paginasi 20 item, grouping tanggal, & peringatan anggaran
  - `transfers.ts`: Transfer dana antar dompet
  - `budgets.ts`: Monitoring anggaran bulanan (status aman <80%, peringatan 80-99%, melebihi >=100%)
  - `dashboard.ts`: Agregasi dashboard bulanan, grafik harian, dan breakdown kategori
  - `export.ts`: Generator CSV transaksi
- [`src/app/api/`](file:///c:/Users/rizki/Desktop/project/catatduit/src/app/api/) — Route Handlers:
  - `/api/auth/callback`: OAuth callback handler (Google Auth & Magic Link)
  - `/api/export/csv`: Endpoint streaming download CSV
  - `/api/health`: Health check endpoint

---

## 🧪 Pengujian & Verifikasi Backend

Jalankan test suite backend untuk memvalidasi seluruh logika bisnis, rumus kalkulasi saldo, batas anggaran, dan skema validasi Zod:

```bash
npx tsx scripts/verify-backend.ts
```

Menjalankan kompilasi TypeScript:
```bash
npx tsc --noEmit
```

Menjalankan build produksi Next.js:
```bash
npm run build
```
