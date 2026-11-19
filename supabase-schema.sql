-- ====================================================================
-- SKEMA DATABASE SUPABASE: SISTEM INFORMASI KAS SOSIAL & ABSENSI DESA
-- Salin dan jalankan script ini di SQL Editor pada Dashboard Supabase Anda.
-- ====================================================================

-- 1. Tabel Master Warga / Kepala Keluarga
CREATE TABLE IF NOT EXISTS warga (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nik VARCHAR(20) UNIQUE NOT NULL,
    nama VARCHAR(150) NOT NULL,
    rt VARCHAR(10) NOT NULL,
    rw VARCHAR(10) NOT NULL DEFAULT 'RW 02',
    no_hp VARCHAR(25),
    alamat TEXT,
    status_kk VARCHAR(30) DEFAULT 'Kepala Keluarga',
    status_iuran VARCHAR(20) DEFAULT 'aktif' CHECK (status_iuran IN ('aktif', 'keringanan', 'pindah', 'lansia')),
    pekerjaan VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabel Rekap Iuran Bulanan Warga
CREATE TABLE IF NOT EXISTS iuran_bulanan (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    warga_id TEXT REFERENCES warga(id) ON DELETE CASCADE,
    tahun INTEGER NOT NULL,
    bulan INTEGER NOT NULL CHECK (bulan BETWEEN 1 AND 12),
    nominal NUMERIC(12, 2) NOT NULL DEFAULT 25000,
    status VARCHAR(20) NOT NULL DEFAULT 'belum' CHECK (status IN ('lunas', 'belum', 'bebas')),
    tanggal_bayar DATE,
    metode_bayar VARCHAR(20) CHECK (metode_bayar IN ('tunai', 'transfer', 'qris')),
    catatan TEXT,
    dicatat_oleh VARCHAR(100),
    kwitansi_no VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_warga_bulan_tahun UNIQUE (warga_id, tahun, bulan)
);

-- 3. Tabel Transaksi Kas Sosial (Buku Kas Umum)
CREATE TABLE IF NOT EXISTS transaksi_kas (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    tipe VARCHAR(20) NOT NULL CHECK (tipe IN ('pemasukan', 'pengeluaran')),
    kategori VARCHAR(100) NOT NULL,
    nominal NUMERIC(15, 2) NOT NULL CHECK (nominal > 0),
    uraian TEXT NOT NULL,
    penanggung_jawab VARCHAR(150) NOT NULL,
    bukti_nota TEXT,
    saldo_setelah NUMERIC(15, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabel Kegiatan & Musyawarah Desa
CREATE TABLE IF NOT EXISTS kegiatan_desa (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nama_kegiatan VARCHAR(255) NOT NULL,
    tanggal DATE NOT NULL,
    waktu VARCHAR(50),
    lokasi VARCHAR(255) NOT NULL,
    kategori VARCHAR(50) NOT NULL DEFAULT 'musyawarah' CHECK (kategori IN ('musyawarah', 'gotong_royong', 'ronda', 'posyandu', 'keagamaan', 'lainnya')),
    deskripsi TEXT,
    penanggung_jawab VARCHAR(150),
    status_kegiatan VARCHAR(20) DEFAULT 'selesai' CHECK (status_kegiatan IN ('selesai', 'berlangsung', 'mendatang')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabel Rekap Absensi Presensi Kegiatan
CREATE TABLE IF NOT EXISTS absensi_kegiatan (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    kegiatan_id TEXT REFERENCES kegiatan_desa(id) ON DELETE CASCADE,
    warga_id TEXT REFERENCES warga(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'hadir' CHECK (status IN ('hadir', 'izin', 'sakit', 'alpa')),
    waktu_absen VARCHAR(20),
    keterangan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_absensi_kegiatan_warga UNIQUE (kegiatan_id, warga_id)
);

-- 6. Tabel Profil & Konfigurasi Desa
CREATE TABLE IF NOT EXISTS pengaturan_desa (
    id INTEGER PRIMARY KEY DEFAULT 1,
    nama_desa VARCHAR(100) NOT NULL DEFAULT 'Desa Sukamaju',
    dusun VARCHAR(100) DEFAULT 'Dusun Krajan',
    rw VARCHAR(20) DEFAULT 'RW 02',
    kecamatan VARCHAR(100) DEFAULT 'Kecamatan Harapan Makmur',
    kabupaten VARCHAR(100) DEFAULT 'Kabupaten Nusantara',
    provinsi VARCHAR(100) DEFAULT 'Jawa Tengah',
    kepala_desa VARCHAR(150) DEFAULT 'H. Bambang Sugiarto, S.IP',
    bendahara VARCHAR(150) DEFAULT 'Ahmad Fauzi, S.E.',
    sekretaris VARCHAR(150) DEFAULT 'Dian Wahyuni, S.Kom',
    nominal_iuran_bulanan NUMERIC(10, 2) DEFAULT 25000,
    tahun_aktif INTEGER DEFAULT 2026,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE warga ENABLE ROW LEVEL SECURITY;
ALTER TABLE iuran_bulanan ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaksi_kas ENABLE ROW LEVEL SECURITY;
ALTER TABLE kegiatan_desa ENABLE ROW LEVEL SECURITY;
ALTER TABLE absensi_kegiatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengaturan_desa ENABLE ROW LEVEL SECURITY;

-- Buat Kebijakan Akses (Public Read/Write untuk aplikasi sistem desa internal)
CREATE POLICY "Public Read warga" ON warga FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update warga" ON warga FOR ALL USING (true);

CREATE POLICY "Public Read iuran_bulanan" ON iuran_bulanan FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update iuran_bulanan" ON iuran_bulanan FOR ALL USING (true);

CREATE POLICY "Public Read transaksi_kas" ON transaksi_kas FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update transaksi_kas" ON transaksi_kas FOR ALL USING (true);

CREATE POLICY "Public Read kegiatan_desa" ON kegiatan_desa FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update kegiatan_desa" ON kegiatan_desa FOR ALL USING (true);

CREATE POLICY "Public Read absensi_kegiatan" ON absensi_kegiatan FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update absensi_kegiatan" ON absensi_kegiatan FOR ALL USING (true);

CREATE POLICY "Public Read pengaturan_desa" ON pengaturan_desa FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update pengaturan_desa" ON pengaturan_desa FOR ALL USING (true);

-- Indexes untuk akselerasi query matriks iuran dan rekap absensi
CREATE INDEX IF NOT EXISTS idx_iuran_tahun_bulan ON iuran_bulanan(tahun, bulan);
CREATE INDEX IF NOT EXISTS idx_iuran_warga_id ON iuran_bulanan(warga_id);
CREATE INDEX IF NOT EXISTS idx_transaksi_tanggal ON transaksi_kas(tanggal);
CREATE INDEX IF NOT EXISTS idx_absensi_kegiatan_id ON absensi_kegiatan(kegiatan_id);
