"use client";

import React from "react";
import { useStore } from "@/lib/store";
import { formatRupiah, formatDateIndo } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarCheck,
  MapPin,
  Clock,
  ChevronRight,
} from "lucide-react";

interface RecentActivityProps {
  onNavigateTab: (tab: string) => void;
  onOpenKasModal: () => void;
  onOpenKegiatanModal: () => void;
}

export function RecentActivity({
  onNavigateTab,
  onOpenKasModal,
  onOpenKegiatanModal,
}: RecentActivityProps) {
  const { transaksiList, kegiatanList, absensiList, wargaList } = useStore();

  const recentTx = [...transaksiList]
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
    .slice(0, 5);

  const recentKegiatan = [...kegiatanList].slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Cash Transactions */}
      <Card className="shadow-sm border-slate-200/80 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold">Transaksi Kas Terkini</CardTitle>
            <CardDescription>Pemasukan dan pengeluaran kas terbaru</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateTab("kas")}
            className="text-xs h-8"
          >
            Lihat Semua
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTx.map((tx) => {
              const isIncome = tx.tipe === "pemasukan";
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isIncome
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400"
                          : "bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400"
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="h-5 w-5" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
                        {tx.uraian}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {formatDateIndo(tx.tanggal)}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                          {tx.kategori}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-bold text-xs sm:text-sm ${
                        isIncome
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatRupiah(tx.nominal)}
                    </span>
                    <div className="text-[10px] text-slate-400">
                      PJ: {tx.penanggung_jawab.split(" ")[0]}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenKasModal}
              className="text-xs h-8"
            >
              + Catat Transaksi Baru
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent & Upcoming Village Activities */}
      <Card className="shadow-sm border-slate-200/80 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold">Agenda & Presensi Warga</CardTitle>
            <CardDescription>Kegiatan musyawarah, ronda & gotong royong</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateTab("absensi")}
            className="text-xs h-8"
          >
            Buka Presensi
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentKegiatan.map((kg) => {
              const attendees = absensiList.filter((a) => a.kegiatan_id === kg.id);
              const presentCount = attendees.filter((a) => a.status === "hadir").length;
              const totalActive = wargaList.length;
              const attendPercent = totalActive > 0 ? Math.round((presentCount / totalActive) * 100) : 0;

              return (
                <div
                  key={kg.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
                        {kg.nama_kegiatan}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <CalendarCheck className="h-3.5 w-3.5 text-emerald-500" />
                          {formatDateIndo(kg.tanggal)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {kg.waktu}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span className="line-clamp-1">{kg.lokasi}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <Badge
                        variant={
                          kg.status_kegiatan === "selesai"
                            ? "success"
                            : kg.status_kegiatan === "berlangsung"
                            ? "warning"
                            : "secondary"
                        }
                        className="text-[10px] capitalize"
                      >
                        {kg.status_kegiatan}
                      </Badge>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1.5">
                        {presentCount}/{totalActive} Warga
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        {attendPercent}% Kehadiran
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenKegiatanModal}
              className="text-xs h-8"
            >
              + Buat Kegiatan Baru
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
