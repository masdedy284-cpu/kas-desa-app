"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import {
  SlidersHorizontal,
  Database,
  Check,
  Copy,
  RefreshCw,
  RotateCcw,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupabaseConfigModal({ isOpen, onClose }: SupabaseConfigModalProps) {
  const {
    settings,
    updateSettings,
    isSupabaseOnline,
    isSyncing,
    syncWithSupabase,
    resetToDefaultData,
  } = useStore();

  const [activeTab, setActiveTab] = useState<"desa" | "supabase">("desa");
  const [copied, setCopied] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Form states for village settings
  const [namaDesa, setNamaDesa] = useState(settings.nama_desa);
  const [kepalaDesa, setKepalaDesa] = useState(settings.kepala_desa);
  const [bendahara, setBendahara] = useState(settings.bendahara);
  const [sekretaris, setSekretaris] = useState(settings.sekretaris);
  const [nominalIuran, setNominalIuran] = useState(settings.nominal_iuran_bulanan);
  const [rw, setRw] = useState(settings.rw || "RW 01");

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      nama_desa: namaDesa,
      kepala_desa: kepalaDesa,
      bendahara: bendahara,
      sekretaris: sekretaris,
      nominal_iuran_bulanan: Number(nominalIuran),
      rw,
    });
    alert("Profil desa berhasil diperbarui!");
  };

  const handleCopySQL = () => {
    const sqlCode = `-- Skema Database Supabase untuk Sistem Informasi Kas Sosial & Absensi Desa
-- Jalankan di SQL Editor dashboard Supabase Anda:
CREATE TABLE IF NOT EXISTS warga (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nik VARCHAR(20) UNIQUE NOT NULL,
    nama VARCHAR(150) NOT NULL,
    rt VARCHAR(10) NOT NULL,
    rw VARCHAR(10) NOT NULL DEFAULT 'RW 02',
    no_hp VARCHAR(25),
    alamat TEXT,
    status_kk VARCHAR(30) DEFAULT 'Kepala Keluarga',
    status_iuran VARCHAR(20) DEFAULT 'aktif',
    pekerjaan VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS iuran_bulanan (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    warga_id TEXT REFERENCES warga(id) ON DELETE CASCADE,
    tahun INTEGER NOT NULL,
    bulan INTEGER NOT NULL,
    nominal NUMERIC(12, 2) NOT NULL DEFAULT 25000,
    status VARCHAR(20) NOT NULL DEFAULT 'belum',
    tanggal_bayar DATE,
    metode_bayar VARCHAR(20),
    catatan TEXT,
    dicatat_oleh VARCHAR(100),
    kwitansi_no VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_warga_bulan_tahun UNIQUE (warga_id, tahun, bulan)
);

CREATE TABLE IF NOT EXISTS transaksi_kas (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    tipe VARCHAR(20) NOT NULL,
    kategori VARCHAR(100) NOT NULL,
    nominal NUMERIC(15, 2) NOT NULL,
    uraian TEXT NOT NULL,
    penanggung_jawab VARCHAR(150) NOT NULL,
    saldo_setelah NUMERIC(15, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS kegiatan_desa (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nama_kegiatan VARCHAR(255) NOT NULL,
    tanggal DATE NOT NULL,
    waktu VARCHAR(50),
    lokasi VARCHAR(255) NOT NULL,
    kategori VARCHAR(50) NOT NULL DEFAULT 'musyawarah',
    deskripsi TEXT,
    penanggung_jawab VARCHAR(150),
    status_kegiatan VARCHAR(20) DEFAULT 'selesai',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS absensi_kegiatan (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    kegiatan_id TEXT REFERENCES kegiatan_desa(id) ON DELETE CASCADE,
    warga_id TEXT REFERENCES warga(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'hadir',
    waktu_absen VARCHAR(20),
    keterangan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);`;

    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSync = async () => {
    setSyncStatus("Sedang menyinkronkan data...");
    const res = await syncWithSupabase();
    setSyncStatus(res.message);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-emerald-600" />
          <span>Pengaturan Sistem & Database Supabase</span>
        </div>
      }
      description="Konfigurasi identitas desa, tarif iuran, dan koneksi cloud Supabase"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab("desa")}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === "desa"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Profil & Pengurus Desa
          </button>
          <button
            onClick={() => setActiveTab("supabase")}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "supabase"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            Koneksi Supabase
          </button>
        </div>

        {/* Tab 1: Village Profile */}
        {activeTab === "desa" && (
          <form onSubmit={handleSaveSettings} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                  Nama Desa / Kelurahan
                </label>
                <Input
                  type="text"
                  value={namaDesa}
                  onChange={(e) => setNamaDesa(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                  Wilayah RW
                </label>
                <Input
                  type="text"
                  value={rw}
                  onChange={(e) => setRw(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                  Nama Ketua Paguyuban
                </label>
                <Input
                  type="text"
                  value={kepalaDesa}
                  onChange={(e) => setKepalaDesa(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                  Bendahara Kas Sosial
                </label>
                <Input
                  type="text"
                  value={bendahara}
                  onChange={(e) => setBendahara(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                  Sekretaris Desa / Lingkungan
                </label>
                <Input
                  type="text"
                  value={sekretaris}
                  onChange={(e) => setSekretaris(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                  Tarif Iuran Bulanan Standar (Rp)
                </label>
                <Input
                  type="number"
                  step="1000"
                  value={nominalIuran}
                  onChange={(e) => setNominalIuran(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" size="sm">
                Simpan Profil Desa
              </Button>
            </div>
          </form>
        )}

        {/* Tab 2: Supabase Setup */}
        {activeTab === "supabase" && (
          <div className="space-y-4 text-xs">
            {/* Status Card */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="h-4 w-4 text-emerald-600" />
                  Status Backend Supabase
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isSupabaseOnline
                    ? "Terhubung ke database cloud Supabase Anda."
                    : "Berjalan dalam mode lokal / simulator browser yang tersimpan secara persisten di LocalStorage."}
                </p>
              </div>
              <Badge variant={isSupabaseOnline ? "success" : "secondary"}>
                {isSupabaseOnline ? "Online" : "Standalone Local"}
              </Badge>
            </div>

            {/* Supabase .env.local setup guide */}
            <div className="space-y-2">
              <div className="font-bold text-slate-800 dark:text-slate-200">
                Cara Menghubungkan ke Supabase Cloud:
              </div>
              <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 dark:text-slate-300 leading-relaxed">
                <li>
                  Buka akun di{" "}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-600 underline inline-flex items-center gap-0.5"
                  >
                    Supabase.com <ExternalLink className="h-3 w-3" />
                  </a>{" "}
                  dan buat proyek baru.
                </li>
                <li>
                  Buka menu <strong>SQL Editor</strong> di dashboard Supabase Anda.
                </li>
                <li>
                  Salin skema SQL di bawah ini dan jalankan (Run) di SQL Editor Supabase:
                </li>
              </ol>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopySQL}
                  className="text-xs h-8"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                      Skema SQL Berhasil Disalin!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      Salin SQL Schema (supabase-schema.sql)
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-3 p-3 rounded-lg bg-slate-950 text-slate-100 font-mono text-[11px] overflow-x-auto">
                <p className="text-slate-400"># Tambahkan ke file .env.local di direktori kas-desa-app:</p>
                <p className="text-emerald-400">NEXT_PUBLIC_SUPABASE_URL=https://proyek-anda.supabase.co</p>
                <p className="text-emerald-400">NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...</p>
              </div>
            </div>

            {/* Sync Action */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                {syncStatus && (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {syncStatus}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="text-xs h-8"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${isSyncing ? "animate-spin" : ""}`} />
                  Sinkronkan Sekarang
                </Button>
              </div>
            </div>

            {/* Factory Reset Demo Data */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Reset seluruh data ke demo awal (15 KK, rekap 2026, agenda presensi)
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm("Reset ulang semua data kas, iuran dan absensi ke kondisi awal?")) {
                    resetToDefaultData();
                    onClose();
                  }
                }}
                className="text-xs h-8"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset Data Demo
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
