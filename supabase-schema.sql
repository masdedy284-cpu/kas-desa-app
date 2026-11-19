-- ====================================================================
-- SKEMA DATABASE SUPABASE: SISTEM INFORMASI KAS SOSIAL & ABSENSI DESA
-- Salin dan jalankan script ini di SQL Editor pada Dashboard Supabase Anda.
-- ====================================================================

-- 1. Tabel Master Warga / Kepala Keluarga
CREATE TABLE IF NOT EXISTS warga (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nik VARCHAR(25) UNIQUE NOT NULL,
    nama VARCHAR(150) NOT NULL,
    blok VARCHAR(50) DEFAULT 'Blok A1',
    rt VARCHAR(50) NOT NULL DEFAULT 'Blok A1',
    rw VARCHAR(50) NOT NULL DEFAULT 'RW 01',
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
    nominal NUMERIC(12, 2) NOT NULL DEFAULT 35000,
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
    nama_desa VARCHAR(150) NOT NULL DEFAULT 'Villa Danupayan Permai',
    dusun VARCHAR(100) DEFAULT 'Villa Danupayan Permai',
    rw VARCHAR(20) DEFAULT 'RW 01',
    kecamatan VARCHAR(100) DEFAULT 'Kecamatan Bulu',
    kabupaten VARCHAR(100) DEFAULT 'Kabupaten Temanggung',
    provinsi VARCHAR(100) DEFAULT 'Jawa Tengah',
    kepala_desa VARCHAR(150) DEFAULT 'Drs. H. Mulyono', -- Nama Ketua Paguyuban
    bendahara VARCHAR(150) DEFAULT 'Ahmad Fauzi, S.E.',
    sekretaris VARCHAR(150) DEFAULT 'Dian Wahyuni, S.Kom',
    nominal_iuran_bulanan NUMERIC(10, 2) DEFAULT 35000,
    tahun_aktif INTEGER DEFAULT 2026,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert row default pengaturan desa jika belum ada
INSERT INTO pengaturan_desa (id, nama_desa, dusun, rw, kecamatan, kabupaten, provinsi, kepala_desa, bendahara, sekretaris, nominal_iuran_bulanan, tahun_aktif)
VALUES (1, 'Villa Danupayan Permai', 'Villa Danupayan Permai', 'RW 01', 'Kecamatan Bulu', 'Kabupaten Temanggung', 'Jawa Tengah', 'Drs. H. Mulyono', 'Ahmad Fauzi, S.E.', 'Dian Wahyuni, S.Kom', 35000, 2026)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE warga ENABLE ROW LEVEL SECURITY;
ALTER TABLE iuran_bulanan ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaksi_kas ENABLE ROW LEVEL SECURITY;
ALTER TABLE kegiatan_desa ENABLE ROW LEVEL SECURITY;
ALTER TABLE absensi_kegiatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengaturan_desa ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses (Public Read & Write agar web app Next.js dapat membaca & mengupdate data secara real-time)
DROP POLICY IF EXISTS "Public Read warga" ON warga;
DROP POLICY IF EXISTS "Public Insert/Update warga" ON warga;
DROP POLICY IF EXISTS "Public All warga" ON warga;
CREATE POLICY "Public All warga" ON warga FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read iuran_bulanan" ON iuran_bulanan;
DROP POLICY IF EXISTS "Public Insert/Update iuran_bulanan" ON iuran_bulanan;
DROP POLICY IF EXISTS "Public All iuran_bulanan" ON iuran_bulanan;
CREATE POLICY "Public All iuran_bulanan" ON iuran_bulanan FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read transaksi_kas" ON transaksi_kas;
DROP POLICY IF EXISTS "Public Insert/Update transaksi_kas" ON transaksi_kas;
DROP POLICY IF EXISTS "Public All transaksi_kas" ON transaksi_kas;
CREATE POLICY "Public All transaksi_kas" ON transaksi_kas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read kegiatan_desa" ON kegiatan_desa;
DROP POLICY IF EXISTS "Public Insert/Update kegiatan_desa" ON kegiatan_desa;
DROP POLICY IF EXISTS "Public All kegiatan_desa" ON kegiatan_desa;
CREATE POLICY "Public All kegiatan_desa" ON kegiatan_desa FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read absensi_kegiatan" ON absensi_kegiatan;
DROP POLICY IF EXISTS "Public Insert/Update absensi_kegiatan" ON absensi_kegiatan;
DROP POLICY IF EXISTS "Public All absensi_kegiatan" ON absensi_kegiatan;
CREATE POLICY "Public All absensi_kegiatan" ON absensi_kegiatan FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read pengaturan_desa" ON pengaturan_desa;
DROP POLICY IF EXISTS "Public Insert/Update pengaturan_desa" ON pengaturan_desa;
DROP POLICY IF EXISTS "Public All pengaturan_desa" ON pengaturan_desa;
CREATE POLICY "Public All pengaturan_desa" ON pengaturan_desa FOR ALL USING (true) WITH CHECK (true);

-- Indexes untuk akselerasi query matriks iuran dan rekap absensi
CREATE INDEX IF NOT EXISTS idx_iuran_tahun_bulan ON iuran_bulanan(tahun, bulan);
CREATE INDEX IF NOT EXISTS idx_iuran_warga_id ON iuran_bulanan(warga_id);
CREATE INDEX IF NOT EXISTS idx_transaksi_tanggal ON transaksi_kas(tanggal);
CREATE INDEX IF NOT EXISTS idx_absensi_kegiatan_id ON absensi_kegiatan(kegiatan_id);

-- Berikan hak akses tabel ke role anon dan authenticated (PostgREST API Supabase)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated;

-- Aktifkan Supabase Realtime Replication agar perubahan data otomatis sinkron ke perangkat lain secara live
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE warga;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE iuran_bulanan;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE transaksi_kas;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE kegiatan_desa;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE absensi_kegiatan;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE pengaturan_desa;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
