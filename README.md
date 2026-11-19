# 🏛️ DesaSosial - Sistem Informasi Kas Sosial & Absensi Desa

Aplikasi web modern berbasis **Next.js (App Router)**, **Tailwind CSS**, **shadcn/ui**, dan **backend Supabase** untuk pengelolaan kas sosial warga, matriks rekap iuran bulanan interaktif, dan presensi kegiatan desa terpadu.

---

## 🌟 Fitur Utama

### 1. 📊 Dashboard Ringkasan Eksekutif
- **Kartu Metrik KPI**: Total Saldo Kas Aktif, Total Pemasukan Bulan Ini, Total Pengeluaran Bulan Ini, Tingkat Kepatuhan Iuran, dan Rata-rata Partisipasi Absensi Kegiatan.
- **Grafik Interaktif Recharts**: Visualisasi Arus Kas Bulanan (Pemasukan vs Pengeluaran) dan Distribusi Alokasi Kas Sosial (Santunan Kematian, Bantuan Warga Sakit, Fasum/Gotong Royong, Konsumsi).
- **Aktivitas Terkini**: Daftar transaksi mutasi kas terbaru dan agenda desa mendatang.

### 2. 💰 Tabel Rekap Iuran Bulanan yang Interaktif *(Fitur Unggulan)*
- **Matriks Warga x Bulan (Jan - Des)**: Menampilkan status pembayaran setiap Kepala Keluarga secara visual.
- **Klik Sel Interaktif**: Klik pada kotak bulan untuk:
  - Menandai **Lunas** (dengan pilihan metode bayar: Tunai, Transfer Bank, atau QRIS Desa).
  - Menandai **Belum Bayar** atau **Bebas Iuran** (untuk lansia/dhuafa).
  - Meninjau nomor kwitansi pembayaran digital dan mencetak struk tanda terima.
- **Baris Rekapitulasi Otomatis**: Menghitung total dana kas yang terkumpul per bulan secara otomatis di bagian bawah tabel.
- **Filter Fleksibel**: Filter berdasarkan Tahun (2025, 2026, 2027), Wilayah RT (RT 01 s/d RT 05), Status Kepatuhan (Semua, Aktif, Menunggak, Bebas), serta pencarian nama/NIK.

### 3. 📖 Manajemen Kas Sosial (Buku Kas Umum)
- Pencatatan Pemasukan (Iuran rutin warga, Donasi/Sumbangan, Bantuan Desa).
- Pencatatan Pengeluaran (Santunan duka cita keluarga wafat, bantuan pengobatan warga sakit, perbaikan pos ronda, konsumsi rapat warga).
- Perhitungan saldo kas berjalan (*running balance*) otomatis.
- Filter jenis transaksi, kategori, dan pencarian cepat.

### 4. 📋 Sistem Presensi / Absensi Kegiatan Desa
- Manajemen agenda kegiatan desa: Musyawarah Dusun/Desa, Kerja Bakti Bersih Lingkungan, Ronda Malam Poskamling, dan Posyandu.
- **Lembar Presensi Interaktif**: Absensi kehadiran per warga (Hadir, Izin, Sakit, Alpa) dengan waktu absen dan catatan.
- Tombol cepat **"Tandai Semua Hadir"** dan kalkulator persentase kehadiran real-time.

### 5. 👥 Master Data Warga & Kepala Keluarga
- Pendataan lengkap NIK (16 digit), Nama, RT, RW, No. HP/WhatsApp, Alamat, dan Pekerjaan.
- Kategori status iuran: Wajib Iuran (Aktif), Lansia/Dhuafa (Bebas Iuran), dan Keringanan Khusus.

### 6. 📄 Fitur Ekspor Laporan & Cetak Resmi (LPJ)
- **Ekspor CSV / Excel**:
  - Ekspor Rekap Iuran Bulanan (Jan - Des).
  - Ekspor Buku Kas Umum Lengkap.
  - Ekspor Daftar Hadir Kegiatan.
- **Format Cetak Resmi (Print / PDF)**:
  - Dilengkapi **Kop Surat Resmi Pemerintah Desa & RW**.
  - Nomor surat Berita Acara / LPJ resmi.
  - Tanda tangan resmi berjenjang: **Bendahara**, **Sekretaris RW**, dan **Kepala Desa**.

### 7. 🌓 Toggle Dark / Light Mode
- Pilihan mode tampilan: **Terang (Light)**, **Gelap (Dark)**, atau **Ikuti Sistem (System)** dengan transisi mulus berbasis `next-themes`.

### 8. ⚡ Backend Supabase & Standalone Mode
- **Dual-Mode Capability**:
  - Aplikasi siap digunakan langsung secara instan (*out-of-the-box*) dengan data demo realistik dan penyimpanan persisten di browser (*LocalStorage*).
  - Terintegrasi penuh dengan Supabase SDK (`@supabase/supabase-js`).
  - Dilengkapi skrip database lengkap di file `supabase-schema.sql`.

---

## 🚀 Panduan Menjalankan Aplikasi

### 1. Masuk ke Direktori Proyek
```bash
cd kas-desa-app
```

### 2. Jalankan Server Pengembangan (Dev)
```bash
npm run dev
```
Buka browser di: [http://localhost:3000](http://localhost:3000)

### 3. Atau Jalankan Mode Produksi (Build & Start)
```bash
npm run build
npm run start
```

---

## 🗄️ Menghubungkan ke Backend Supabase

1. Buat proyek baru di [Supabase.com](https://supabase.com).
2. Buka menu **SQL Editor** di dashboard Supabase Anda.
3. Salin seluruh isi file `supabase-schema.sql` yang ada di root direktori proyek ini, lalu klik **Run**.
4. Buat file `.env.local` di dalam folder `kas-desa-app`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://proyek-anda.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
   ```
5. Restart aplikasi (`npm run dev`). Status badge di header aplikasi akan otomatis berubah menjadi **Supabase Cloud (Online)** dan Anda dapat menyinkronkan data dengan tombol **Sinkron**.

---

## 📁 Struktur Direktori

```text
kas-desa-app/
├── public/                     # Aset statis
├── src/
│   ├── app/
│   │   ├── globals.css         # Styling Tailwind & Dark Mode tokens
│   │   ├── layout.tsx          # Root Layout & Theme/Store Providers
│   │   └── page.tsx            # Dashboard utama dan navigasi modul
│   ├── components/
│   │   ├── ui/                 # Komponen antarmuka (Button, Badge, Card, Modal, Input)
│   │   ├── layout/             # Navbar, ThemeToggle
│   │   ├── dashboard/          # StatCards, KasChart (Recharts), RecentActivity
│   │   ├── iuran/              # IuranRekapTable (Matriks Interaktif), PaymentModal
│   │   ├── kas/                # KasTable, AddKasModal
│   │   ├── absensi/            # KegiatanList, PresensiModal, AddKegiatanModal
│   │   ├── warga/              # WargaTable, AddWargaModal
│   │   ├── laporan/            # LaporanView, Kop Surat Resmi Cetak PDF
│   │   └── settings/           # SupabaseConfigModal
│   └── lib/
│       ├── types.ts            # Definisi TypeScript
│       ├── utils.ts            # Formatter Rupiah, Tanggal Indo, Helper
│       ├── initialData.ts      # Data awal demo desa
│       ├── store.tsx           # Context Store, LocalStorage & Supabase sync
│       └── supabase/
│           └── client.ts       # Supabase client singleton
├── supabase-schema.sql         # Skema database & RLS policy Supabase
└── README.md
```
