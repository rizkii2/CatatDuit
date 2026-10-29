# PRD: Aplikasi Pencatatan Keuangan

Oct 29, 2026 · @febrian

Aplikasi web ini membantu individu di Indonesia mencatat pemasukan dan pengeluaran dalam waktu kurang dari 10 detik per transaksi, lalu melihat ke mana uangnya pergi setiap bulan. Dibangun dengan Next.js, Supabase, dan Vercel.

## 1. Ringkasan & Latar Belakang

**Masalah.** Kebanyakan orang tidak tahu ke mana uangnya habis di akhir bulan. Aplikasi keuangan yang ada sering terlalu rumit (banyak fitur investasi dan anggaran yang tidak dipakai), berbayar, atau tidak mendukung kebiasaan lokal seperti dompet tunai, e-wallet, dan nominal rupiah tanpa desimal.

**Solusi.** Web app ringan dan mobile-first untuk mencatat transaksi, mengelompokkannya per kategori dan dompet, memantau anggaran bulanan, dan melihat ringkasan lewat grafik sederhana.

**Asumsi dokumen ini** (mohon dikoreksi jika berbeda):

- Target awal adalah keuangan pribadi, bukan akuntansi UMKM.
- Mata uang tunggal: Rupiah (IDR), tanpa desimal.
- Bahasa antarmuka: Bahasa Indonesia.
- Pencatatan manual; belum ada integrasi otomatis ke bank atau e-wallet.
- Dikerjakan oleh tim kecil (1 sampai 2 developer).

## 2. Tujuan, Metrik, dan Non-Goals

**Tujuan produk**

1. Pencatatan transaksi cepat: maksimal 3 ketukan dan 10 detik dari layar utama.
2. Gambaran keuangan bulanan yang jelas: pemasukan, pengeluaran, sisa saldo, dan kategori terbesar.
3. Data aman dan privat: setiap pengguna hanya bisa mengakses datanya sendiri.

**Metrik keberhasilan** (target 3 bulan setelah rilis publik; angka awal untuk disepakati)

| Metrik | Definisi | Target |
| --- | --- | --- |
| Aktivasi | Pengguna baru yang mencatat 3 transaksi dalam 24 jam pertama | 50% |
| Retensi minggu 4 | Pengguna yang mencatat minimal 1 transaksi di minggu ke-4 | 30% |
| Kecepatan input | Median waktu dari buka form sampai transaksi tersimpan | < 10 detik |
| Frekuensi | Rata-rata transaksi tercatat per pengguna aktif per minggu | 8 |
| Performa | LCP halaman dashboard di jaringan 4G | < 2,5 detik |

**Non-goals (tidak dikerjakan di versi awal)**

- Integrasi otomatis dengan bank, e-wallet, atau pembacaan SMS/notifikasi.
- Multi-mata uang dan konversi kurs.
- Fitur investasi, utang-piutang antar pengguna, atau pelaporan pajak.
- Akuntansi UMKM (faktur, stok, laporan laba rugi).
- Aplikasi native iOS/Android (cukup web responsif dan PWA).

## 3. Pengguna Target & User Stories

**Persona**

| Persona | Profil | Kebutuhan utama |
| --- | --- | --- |
| Rina, 24, karyawan baru | Gaji bulanan, pakai e-wallet dan transfer bank | Tahu kenapa gaji habis sebelum akhir bulan |
| Budi, 30, freelancer | Pemasukan tidak tetap, beberapa rekening | Memisahkan uang pribadi dan uang kerja, melihat arus kas bulanan |
| Sari, 35, ibu rumah tangga | Banyak transaksi kecil tunai | Mencatat belanja harian dengan cepat dan menjaga anggaran dapur |

**User stories utama**

- Sebagai pengguna, saya ingin mendaftar dan masuk dengan email atau Google agar data saya tersimpan aman dan bisa dibuka dari HP maupun laptop.
- Sebagai pengguna, saya ingin menambah transaksi dengan nominal, kategori, dompet, tanggal, dan catatan agar pengeluaran saya terdokumentasi.
- Sebagai pengguna, saya ingin memiliki beberapa dompet (tunai, bank, e-wallet) agar saldo tiap sumber dana terlihat terpisah.
- Sebagai pengguna, saya ingin memindahkan uang antar dompet tanpa dihitung sebagai pemasukan atau pengeluaran.
- Sebagai pengguna, saya ingin menetapkan anggaran per kategori dan diperingatkan saat hampir habis agar tidak boros.
- Sebagai pengguna, saya ingin melihat ringkasan dan grafik per bulan agar tahu kategori mana yang paling besar.
- Sebagai pengguna, saya ingin mencari, memfilter, mengedit, dan menghapus transaksi lama agar data tetap akurat.
- Sebagai pengguna, saya ingin mengekspor data ke CSV agar bisa saya simpan atau olah sendiri.

## 4. Lingkup Fitur

MVP (P0) cukup untuk mencatat, mengelompokkan, dan melihat ringkasan keuangan; anggaran dan ekspor masuk P1.

| Fitur | Prioritas | Rilis |
| --- | --- | --- |
| Autentikasi (email + password, Google) | P0 | MVP |
| CRUD transaksi (pemasukan, pengeluaran) | P0 | MVP |
| Dompet/akun dan saldo otomatis | P0 | MVP |
| Kategori bawaan dan kustom | P0 | MVP |
| Dashboard bulanan (total, saldo, grafik kategori) | P0 | MVP |
| Daftar transaksi dengan filter dan pencarian | P0 | MVP |
| Transfer antar dompet | P1 | v1.1 |
| Anggaran bulanan per kategori + peringatan | P1 | v1.1 |
| Ekspor CSV | P1 | v1.1 |
| PWA (bisa dipasang di layar utama HP) | P1 | v1.1 |
| Transaksi berulang (langganan, cicilan) | P2 | v1.2 |
| Tujuan tabungan | P2 | v1.2 |
| Lampiran foto struk (Supabase Storage) | P2 | v1.2 |
| Impor CSV dari bank | P2 | Nanti |
| Dark mode | P2 | Nanti |

## 5. Kebutuhan Fungsional

**FR-1 Autentikasi**

- Pengguna dapat mendaftar dan masuk dengan email + password atau Google (Supabase Auth).
- Email konfirmasi dan reset password tersedia.
- Halaman aplikasi tanpa sesi valid mengarahkan ke halaman masuk.
- Saat akun baru dibuat, sistem otomatis membuat profil, dompet "Tunai", dan kategori bawaan.

**FR-2 Transaksi**

- Form berisi: jenis (pemasukan/pengeluaran), nominal, kategori, dompet, tanggal (default hari ini), catatan opsional.
- Nominal wajib bilangan bulat lebih dari 0 dan diformat otomatis ke rupiah saat mengetik (contoh: 1.250.000).
- Pengguna dapat mengedit dan menghapus transaksi; penghapusan meminta konfirmasi.
- Daftar transaksi dikelompokkan per tanggal, memuat 20 item per halaman (infinite scroll atau tombol "Muat lagi").
- Filter: rentang tanggal, jenis, kategori, dompet; pencarian pada catatan.
- Setelah menyimpan, saldo dompet dan dashboard langsung diperbarui.

**FR-3 Dompet**

- Pengguna dapat membuat, mengubah nama, dan mengarsipkan dompet (tunai, bank, e-wallet) dengan saldo awal.
- Saldo dompet = saldo awal + total pemasukan − total pengeluaran ± transfer.
- Dompet yang sudah memiliki transaksi tidak bisa dihapus permanen, hanya diarsipkan.

**FR-4 Kategori**

- Tersedia kategori bawaan (contoh: Makan, Transportasi, Belanja, Tagihan, Gaji, Lainnya) dengan ikon dan warna.
- Pengguna dapat menambah, mengubah, dan mengarsipkan kategori sendiri.

**FR-5 Dashboard**

- Menampilkan total pemasukan, total pengeluaran, dan selisih untuk bulan terpilih (default bulan berjalan, zona waktu Asia/Jakarta).
- Grafik donat pengeluaran per kategori dan grafik batang harian atau mingguan.
- Daftar 5 transaksi terakhir dan saldo per dompet.
- Navigasi bulan sebelumnya dan berikutnya.

**FR-6 Transfer antar dompet (P1)**

- Transfer mencatat dompet asal, tujuan, nominal, dan biaya admin opsional.
- Transfer tidak dihitung sebagai pemasukan atau pengeluaran di dashboard; biaya admin dihitung sebagai pengeluaran.

**FR-7 Anggaran (P1)**

- Pengguna menetapkan batas bulanan per kategori pengeluaran.
- Bar progres menampilkan terpakai vs batas; berubah kuning di 80% dan merah di 100%.
- Peringatan tampil di dalam aplikasi saat transaksi menyebabkan anggaran terlewati.

**FR-8 Ekspor & akun (P1)**

- Ekspor transaksi ke CSV berdasarkan rentang tanggal.
- Pengguna dapat mengubah nama dan menghapus akun beserta seluruh datanya.

## 6. Kebutuhan Non-Fungsional

| Area | Kebutuhan |
| --- | --- |
| Keamanan | Row Level Security aktif di semua tabel dengan policy `user_id = auth.uid()`; `service_role` key hanya di server dan tidak pernah dikirim ke browser; semua trafik lewat HTTPS. |
| Privasi | Data hanya dimiliki pengguna; tidak ada analitik pihak ketiga yang membaca isi transaksi; fitur hapus akun menghapus seluruh data. |
| Integritas data | Nominal disimpan sebagai `bigint` (rupiah utuh), bukan float; constraint `amount > 0`; relasi foreign key dengan aturan hapus yang jelas. |
| Performa | LCP dashboard < 2,5 detik di 4G; query daftar transaksi memakai index `(user_id, date desc)`; paginasi 20 item. |
| Ketersediaan | Mengikuti SLA Supabase dan Vercel; backup harian database dari Supabase. |
| Responsif | Mobile-first mulai lebar 360 px; dapat dipakai dengan satu tangan. |
| Aksesibilitas | Kontras warna memadai, navigasi keyboard, label form, dan target sentuh minimal 44 px. |
| Lokalisasi | Bahasa Indonesia; format `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })`; tanggal dan zona waktu Asia/Jakarta (WIB). |
| Observabilitas | Pelacakan error (misalnya Sentry) dan Vercel Analytics tanpa merekam data nominal. |
| Kualitas kode | TypeScript strict, tipe database di-generate lewat `supabase gen types`, lint dan tes di CI sebelum deploy. |

## 7. Arsitektur, Tech Stack & Model Data

**Alur sistem:** Browser pengguna → Next.js di Vercel (Server Components dan Server Actions) → Supabase (Auth + Postgres dengan RLS). Browser hanya memakai anon key; operasi sensitif berjalan di server.

**Tech stack**

| Lapisan | Pilihan | Alasan |
| --- | --- | --- |
| Framework | Next.js (App Router) + TypeScript | Terintegrasi mulus dengan Vercel, Server Actions menggantikan API terpisah |
| UI | Tailwind CSS + shadcn/ui | Komponen form, tabel, dan dialog siap pakai |
| Form & validasi | React Hook Form + Zod | Validasi sama di client dan server |
| Database & Auth | Supabase (Postgres, Auth, RLS) via `@supabase/ssr` | Auth, database, dan keamanan baris dalam satu layanan |
| Grafik | Recharts | Donat dan batang untuk dashboard |
| Tanggal | date-fns | Filter per bulan, zona waktu WIB |
| Migrasi | Supabase CLI | Migrasi terversi dan generate tipe TypeScript |
| Hosting | Vercel (preview per pull request) | Deploy otomatis dari GitHub |

**Model data**

| Tabel | Kolom utama |
| --- | --- |
| `profiles` | id (= auth.users.id), nama, created\_at |
| `accounts` | id, user\_id, nama, tipe (cash/bank/ewallet), saldo\_awal (bigint), is\_archived |
| `categories` | id, user\_id, nama, tipe (income/expense), ikon, warna, is\_archived |
| `transactions` | id, user\_id, account\_id, category\_id, tipe, amount (bigint), tanggal (date), catatan, created\_at |
| `transfers` (P1) | id, user\_id, dari\_account\_id, ke\_account\_id, amount, biaya\_admin, tanggal |
| `budgets` (P1) | id, user\_id, category\_id, bulan (date, tanggal 1), batas (bigint) |

Index penting: `transactions (user_id, tanggal desc)` dan `transactions (user_id, category_id, tanggal)`. Saldo dompet dihitung lewat view atau fungsi SQL, bukan disimpan ganda, agar tidak bisa tidak sinkron.

**Kebijakan RLS** (diterapkan ke semua tabel di atas)

```sql
alter table transactions enable row level security;

create policy "own rows" on transactions
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
```

**Environment variables di Vercel:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Setelah deploy, tambahkan URL Vercel ke Site URL dan Redirect URLs di pengaturan Auth Supabase.

## 8. Alur UX & Daftar Layar

**Prinsip desain:** tombol "Tambah transaksi" selalu terjangkau (tombol melayang di mobile), default pintar (tanggal hari ini, dompet dan kategori terakhir dipakai), dan angka besar yang mudah dibaca.

**Alur utama pengguna baru**

1. Daftar → konfirmasi email atau masuk dengan Google.
2. Onboarding singkat: isi saldo awal dompet "Tunai" dan pilih dompet lain yang dipakai (opsional).
3. Dashboard kosong dengan ajakan "Catat transaksi pertama".
4. Isi form transaksi → simpan → dashboard langsung menampilkan angka dan grafik.

**Daftar layar**

| Layar | Isi utama | Rilis |
| --- | --- | --- |
| Masuk / Daftar | Form email, tombol Google, lupa password | MVP |
| Onboarding | Saldo awal dan pilih dompet | MVP |
| Dashboard | Ringkasan bulan, grafik kategori, saldo dompet, transaksi terakhir | MVP |
| Transaksi | Daftar per tanggal, filter, pencarian | MVP |
| Form transaksi | Dialog atau halaman penuh di mobile | MVP |
| Dompet | Daftar dompet, saldo, tambah/arsipkan | MVP |
| Kategori | Kelola kategori bawaan dan kustom | MVP |
| Anggaran | Bar progres per kategori | v1.1 |
| Transfer | Form pindah dana antar dompet | v1.1 |
| Pengaturan | Profil, ekspor CSV, hapus akun | v1.1 |

**Navigasi:** bottom tab di mobile (Dashboard, Transaksi, Anggaran, Pengaturan) dan sidebar di desktop. Setiap layar perlu status kosong, status memuat (skeleton), dan pesan error yang ramah.

## 9. Rencana Rilis, Risiko & Pertanyaan Terbuka

**Milestone** (estimasi untuk 1 sampai 2 developer; durasi kasar, belum final)

1. **Minggu 1: Fondasi.** Setup repo Next.js, project Supabase, migrasi skema, RLS, autentikasi, dan deploy awal ke Vercel.
2. **Minggu 2 sampai 3: Inti MVP.** CRUD transaksi, dompet, kategori, dan daftar transaksi dengan filter.
3. **Minggu 4: Dashboard.** Ringkasan bulanan, grafik, format rupiah, dan onboarding.
4. **Minggu 5: Polesan dan uji.** Responsif mobile, status kosong/error, tes RLS dan alur utama, beta tertutup dengan 10 sampai 20 pengguna.
5. **Minggu 6 sampai 8: v1.1.** Transfer, anggaran, ekspor CSV, PWA, lalu rilis publik.

**Risiko**

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Policy RLS salah atau terlewat | Data pengguna bocor | Tes otomatis yang memastikan user A tidak bisa membaca data user B; RLS wajib untuk setiap tabel baru |
| Pengguna malas mencatat | Retensi rendah | Form super cepat, default pintar, pengingat harian (P2) |
| Saldo tidak sinkron | Kepercayaan hilang | Hitung saldo dari transaksi lewat view SQL, bukan kolom ganda |
| Batas gratis Supabase/Vercel | Layanan terhenti atau biaya naik | Pantau penggunaan, siapkan rencana upgrade; proyek free Supabase bisa di-pause jika tidak aktif |
| Bug zona waktu pada transaksi dekat tengah malam | Transaksi masuk bulan yang salah | Simpan `date` lokal WIB dari input pengguna dan uji kasus batas bulan |

**Pertanyaan terbuka**

- [ ] Apakah target awal murni personal, atau juga UMKM kecil (yang butuh laporan laba rugi)?
- [ ] Apakah perlu mode berbagi dompet untuk pasangan atau keluarga?
- [ ] Apakah aplikasi gratis sepenuhnya, atau ada rencana paket berbayar?
- [ ] Apakah perlu impor data dari aplikasi pencatat lain atau mutasi bank (CSV)?
- [ ] Nama produk dan identitas visual belum ditentukan.
