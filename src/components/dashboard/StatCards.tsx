"use client";

import React from "react";
import { useStore } from "@/lib/store";
import { formatRupiah } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Users,
  CalendarCheck,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export function StatCards() {
  const {
    totalKas,
    pemasukanBulanIni,
    pengeluaranBulanIni,
    iuranBulanIniPersen,
    tingkatKehadiranRataRata,
    wargaList,
  } = useStore();

  const totalKK = wargaList.filter((w) => w.status_kk === "Kepala Keluarga").length;

  const stats = [
    {
      title: "Total Saldo Kas & Keuangan",
      value: formatRupiah(totalKas),
      subtitle: "Saldo kas Villa Danupayan Permai",
      icon: Wallet,
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20",
      borderAccent: "border-emerald-500/30",
      indicator: {
        text: "Aktif & Terverifikasi",
        positive: true,
      },
    },
    {
      title: "Pemasukan Bulan Ini",
      value: formatRupiah(pemasukanBulanIni),
      subtitle: "Iuran warga & donasi masuk",
      icon: TrendingUp,
      iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 dark:bg-blue-500/20",
      borderAccent: "border-blue-500/30",
      indicator: {
        text: "November 2026",
        positive: true,
      },
    },
    {
      title: "Pengeluaran Bulan Ini",
      value: formatRupiah(pengeluaranBulanIni),
      subtitle: "Bantuan duka, sakit & operasional",
      icon: TrendingDown,
      iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-500/20",
      borderAccent: "border-rose-500/30",
      indicator: {
        text: "Terkendali",
        positive: false,
      },
    },
    {
      title: "Kepatuhan Iuran Bulan Ini",
      value: `${iuranBulanIniPersen}%`,
      subtitle: `${wargaList.filter((w) => w.status_iuran === "aktif").length} KK wajib iuran rutin`,
      icon: CheckCircle2,
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-500/20",
      borderAccent: "border-amber-500/30",
      indicator: {
        text: `${totalKK} KK terdata`,
        positive: true,
      },
    },
    {
      title: "Partisipasi Absensi Warga",
      value: `${tingkatKehadiranRataRata}%`,
      subtitle: "Tingkat kehadiran musyawarah & kerja bakti",
      icon: CalendarCheck,
      iconBg: "bg-violet-500/10 text-violet-600 dark:text-violet-400 dark:bg-violet-500/20",
      borderAccent: "border-violet-500/30",
      indicator: {
        text: "Kategori Sangat Baik",
        positive: true,
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Card
            key={idx}
            className={`relative overflow-hidden border transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 ${stat.borderAccent}`}
          >
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {stat.title}
                </span>
                <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-3">
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {stat.value}
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  {stat.subtitle}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Status</span>
                <span
                  className={`inline-flex items-center gap-0.5 font-medium ${
                    stat.indicator.positive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {stat.indicator.text}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
