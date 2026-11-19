"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { KegiatanDesa } from "@/lib/types";
import { formatDateIndo } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PresensiModal } from "./PresensiModal";
import { AddKegiatanModal } from "./AddKegiatanModal";
import {
  CalendarCheck,
  Plus,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Trash2,
  UserCheck,
  Shield,
  HeartHandshake,
  MessageSquare,
} from "lucide-react";

export function KegiatanList() {
  const { kegiatanList, absensiList, wargaList, deleteKegiatan } = useStore();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedKegiatan, setSelectedKegiatan] = useState<KegiatanDesa | null>(null);
  const [presensiModalOpen, setPresensiModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  const totalWarga = wargaList.length;

  const filteredKegiatan = kegiatanList.filter((k) => {
    if (filterCategory !== "ALL" && k.kategori !== filterCategory) return false;
    return true;
  });

  const handleOpenPresensi = (kg: KegiatanDesa) => {
    setSelectedKegiatan(kg);
    setPresensiModalOpen(true);
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "musyawarah":
        return { label: "Musyawarah Warga", icon: MessageSquare, color: "info" as const };
      case "gotong_royong":
        return { label: "Kerja Bakti", icon: HeartHandshake, color: "success" as const };
      case "ronda":
        return { label: "Ronda Malam", icon: Shield, color: "warning" as const };
      default:
        return { label: "Kegiatan Lingkungan", icon: Users, color: "secondary" as const };
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-emerald-600" />
              Sistem Presensi Kegiatan & Musyawarah Warga
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Pencatatan daftar hadir warga untuk musyawarah, gotong royong, dan pos keamanan
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="musyawarah">Musyawarah</option>
              <option value="gotong_royong">Gotong Royong</option>
              <option value="ronda">Ronda Poskamling</option>
            </select>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setAddModalOpen(true)}
              className="text-xs h-9"
            >
              <Plus className="h-4 w-4 mr-1" />
              Buat Agenda Baru
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredKegiatan.map((kg) => {
          const catInfo = getCategoryBadge(kg.kategori);
          const CatIcon = catInfo.icon;
          const records = absensiList.filter((a) => a.kegiatan_id === kg.id);
          const hadirCount = records.filter((a) => a.status === "hadir").length;
          const percentage = totalWarga > 0 ? Math.round((hadirCount / totalWarga) * 100) : 0;

          return (
            <Card
              key={kg.id}
              className="border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={catInfo.color} className="text-[11px] flex items-center gap-1">
                      <CatIcon className="h-3 w-3" />
                      {catInfo.label}
                    </Badge>
                    <Badge
                      variant={
                        kg.status_kegiatan === "selesai"
                          ? "success"
                          : kg.status_kegiatan === "berlangsung"
                          ? "warning"
                          : "outline"
                      }
                      className="text-[10px] capitalize"
                    >
                      {kg.status_kegiatan}
                    </Badge>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Hapus kegiatan "${kg.nama_kegiatan}"?`)) {
                        deleteKegiatan(kg.id);
                      }
                    }}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Hapus Kegiatan"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <h4 className="font-bold text-base text-slate-900 dark:text-white mt-3 leading-snug">
                  {kg.nama_kegiatan}
                </h4>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {kg.deskripsi || "Tidak ada deskripsi tambahan."}
                </p>

                <div className="mt-3.5 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{formatDateIndo(kg.tanggal)}</span>
                    <span className="text-slate-400">•</span>
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{kg.waktu}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate">{kg.lokasi}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-600 dark:text-slate-400">
                      Tingkat Kehadiran:
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {hadirCount} dari {totalWarga} Warga ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    PJ: {kg.penanggung_jawab}
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenPresensi(kg)}
                    className="text-xs h-8"
                  >
                    <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                    Buka Lembar Presensi
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredKegiatan.length === 0 && (
          <div className="col-span-2 py-12 text-center text-slate-400">
            Belum ada kegiatan desa yang dijadwalkan pada kategori ini.
          </div>
        )}
      </div>

      <PresensiModal
        isOpen={presensiModalOpen}
        onClose={() => setPresensiModalOpen(false)}
        kegiatan={selectedKegiatan}
      />

      <AddKegiatanModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </div>
  );
}
