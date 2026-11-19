"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { StatCards } from "@/components/dashboard/StatCards";
import { KasChart } from "@/components/dashboard/KasChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { IuranRekapTable } from "@/components/iuran/IuranRekapTable";
import { KasTable } from "@/components/kas/KasTable";
import { KegiatanList } from "@/components/absensi/KegiatanList";
import { WargaTable } from "@/components/warga/WargaTable";
import { LaporanView } from "@/components/laporan/LaporanView";
import { SupabaseConfigModal } from "@/components/settings/SupabaseConfigModal";
import { AddKasModal } from "@/components/kas/AddKasModal";
import { AddKegiatanModal } from "@/components/absensi/AddKegiatanModal";
import { useStore } from "@/lib/store";
import { formatDateIndo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Coins,
  Building2,
  CalendarCheck2,
  FileSpreadsheet,
  Plus,
  ShieldCheck,
  Calendar,
  Sparkles,
} from "lucide-react";

export default function Home() {
  const { settings } = useStore();
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Modals
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [addKasModalOpen, setAddKasModalOpen] = useState(false);
  const [addKegiatanModalOpen, setAddKegiatanModalOpen] = useState(false);
  const [todayStr, setTodayStr] = useState<string>("");

  React.useEffect(() => {
    setTodayStr(formatDateIndo(new Date().toISOString().split("T")[0]));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header & Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setSettingsModalOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 container mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Top Hero Banner (Welcome & Quick Actions) */}
        {activeTab === "dashboard" && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-6 sm:p-8 shadow-lg border border-emerald-700/30">
            {/* Background Decorative Circles */}
            <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
            <div className="absolute right-40 -bottom-20 h-48 w-48 rounded-full bg-teal-400/10 blur-xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-semibold border border-white/10">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Sistem Administrasi Keuangan dan Absensi terpadu</span>
                  <span className="text-white/40">•</span>
                  <span className="text-white/80">{todayStr}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                  {settings.nama_desa}
                </h1>

                <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
                  Platform transparansi administrasi keuangan warga, iuran pemeliharaan lingkungan perumahan,
                  pembukuan kas darurat, serta presensi musyawarah dan gotong royong secara terpadu.
                </p>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  onClick={() => setActiveTab("iuran")}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs h-9 shadow-md shadow-emerald-950/40"
                >
                  <Coins className="h-4 w-4 mr-1.5" />
                  Tabel Rekap Iuran
                </Button>

                <Button
                  onClick={() => setAddKasModalOpen(true)}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs h-9"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Catat Kas
                </Button>

                <Button
                  onClick={() => setAddKegiatanModalOpen(true)}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs h-9"
                >
                  <CalendarCheck2 className="h-3.5 w-3.5 mr-1.5" />
                  Jadwal Kegiatan
                </Button>

                <Button
                  onClick={() => setActiveTab("laporan")}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs h-9"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
                  Cetak LPJ
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Dashboard Overview */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <StatCards />
            <KasChart />

            {/* Interactive Iuran Matrix Quick View directly on dashboard */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Coins className="h-5 w-5 text-emerald-600" />
                    Tabel Rekap Iuran Bulanan Warga (Interaktif)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Klik pada kotak bulan untuk menandai lunas, melihat kwitansi, atau mengubah pembayaran
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("iuran")}
                  className="text-xs h-8"
                >
                  Buka Tampilan Penuh
                </Button>
              </div>
              <IuranRekapTable />
            </div>

            <RecentActivity
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenKasModal={() => setAddKasModalOpen(true)}
              onOpenKegiatanModal={() => setAddKegiatanModalOpen(true)}
            />
          </div>
        )}

        {/* Tab 2: Full Rekap Iuran Bulanan */}
        {activeTab === "iuran" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Coins className="h-5 w-5 text-emerald-600" />
                  Matriks Rekapitulasi Iuran Warga Bulanan
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tabel interaktif iuran kas sosial desa Januari - Desember {settings.tahun_aktif}
                </p>
              </div>
            </div>
            <IuranRekapTable />
          </div>
        )}

        {/* Tab 3: Kas Sosial (Buku Kas Umum) */}
        {activeTab === "kas" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-emerald-600" />
                  Buku Kas & Administrasi Keuangan
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pencatatan real-time pemasukan iuran lingkungan/donasi & pengeluaran operasional perumahan
                </p>
              </div>
            </div>
            <KasTable />
          </div>
        )}

        {/* Tab 4: Absensi & Presensi Kegiatan */}
        {activeTab === "absensi" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarCheck2 className="h-5 w-5 text-emerald-600" />
                  Presensi Musyawarah & Gotong Royong
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Daftar kehadiran warga pada agenda musyawarah, ronda pos keamanan, dan kerja bakti
                </p>
              </div>
            </div>
            <KegiatanList />
          </div>
        )}

        {/* Tab 5: Master Data Warga */}
        {activeTab === "warga" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Data Warga & Kepala Keluarga
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pengelolaan master data warga {settings.nama_desa}
                </p>
              </div>
            </div>
            <WargaTable />
          </div>
        )}

        {/* Tab 6: Laporan & Ekspor Dokumen Resmi */}
        {activeTab === "laporan" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 no-print">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                  Laporan Pertanggungjawaban (LPJ) & Ekspor
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Format cetak resmi pemerintah desa & pengelola siap tanda tangan
                </p>
              </div>
            </div>
            <LaporanView />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="container mx-auto px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {settings.nama_desa}
            </span>
            <span>-</span>
            <span>Sistem Administrasi Keuangan dan Absensi terpadu</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Next.js 16 • Tailwind CSS • shadcn/ui • Supabase</span>
            <button
              onClick={() => setSettingsModalOpen(true)}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
            >
              Pengaturan Database
            </button>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <SupabaseConfigModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />

      <AddKasModal
        isOpen={addKasModalOpen}
        onClose={() => setAddKasModalOpen(false)}
      />

      <AddKegiatanModal
        isOpen={addKegiatanModalOpen}
        onClose={() => setAddKegiatanModalOpen(false)}
      />
    </div>
  );
}
