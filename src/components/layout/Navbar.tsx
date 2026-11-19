"use client";

import React, { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { useStore } from "@/lib/store";
import {
  Building2,
  Database,
  CloudCheck,
  RefreshCw,
  SlidersHorizontal,
  Coins,
  CalendarCheck2,
  FileSpreadsheet,
  Users,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSettings: () => void;
}

export function Navbar({ activeTab, setActiveTab, onOpenSettings }: NavbarProps) {
  const { settings, isSupabaseOnline, isSyncing, syncWithSupabase } = useStore();
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleSync = async () => {
    const res = await syncWithSupabase();
    setSyncFeedback(res.message);
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "iuran", label: "Rekap Iuran Bulanan", icon: Coins, highlight: true },
    { id: "kas", label: "Kas & Keuangan", icon: Building2 },
    { id: "absensi", label: "Absensi Kegiatan", icon: CalendarCheck2 },
    { id: "warga", label: "Data Warga", icon: Users },
    { id: "laporan", label: "Laporan & Ekspor", icon: FileSpreadsheet },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 shadow-xs">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-500/20">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-base">
                  {settings.nama_desa}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Sistem Administrasi Keuangan dan Absensi terpadu
              </p>
            </div>
          </div>

          {/* Center Navigation for Desktop */}
          <nav className="hidden xl:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50"
                  } ${item.highlight && !isActive ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons: Supabase Status, Theme Toggle, Config */}
          <div className="flex items-center gap-2.5">
            {/* Supabase Status Pill */}
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Klik untuk konfigurasi database Supabase"
            >
              <div
                className={`h-2 w-2 rounded-full ${
                  isSupabaseOnline ? "bg-emerald-500 animate-pulse" : "bg-blue-500"
                }`}
              />
              <span className="hidden sm:inline text-slate-600 dark:text-slate-300 text-[11px]">
                {isSupabaseOnline ? "Supabase Cloud" : "Mode Standalone (Lokal)"}
              </span>
            </button>

            {/* Quick sync button if Supabase is connected */}
            {isSupabaseOnline && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={isSyncing}
                className="hidden md:flex items-center gap-1.5 h-8 text-xs"
              >
                <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Menyinkron..." : "Sinkron"}
              </Button>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Settings button */}
            <Button
              variant="outline"
              size="icon"
              onClick={onOpenSettings}
              className="h-9 w-9 rounded-lg"
              title="Pengaturan Desa & Database"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Scroll Navigation */}
        <div className="flex xl:hidden overflow-x-auto py-2.5 gap-1.5 border-t border-slate-100 dark:border-slate-800/60 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                    : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Sync feedback notification banner if any */}
        {syncFeedback && (
          <div className="py-1 px-3 text-xs bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 border-t border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <span>{syncFeedback}</span>
            <button
              onClick={() => setSyncFeedback(null)}
              className="font-bold ml-2 text-emerald-900 dark:text-emerald-100"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
