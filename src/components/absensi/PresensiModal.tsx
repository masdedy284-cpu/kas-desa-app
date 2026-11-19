"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { KegiatanDesa, StatusKehadiran } from "@/lib/types";
import { useStore } from "@/lib/store";
import { formatDateIndo } from "@/lib/utils";
import {
  CheckCircle2,
  CalendarCheck,
  Users,
  Clock,
  Printer,
  FileSpreadsheet,
  Check,
  AlertCircle,
} from "lucide-react";

interface PresensiModalProps {
  isOpen: boolean;
  onClose: () => void;
  kegiatan: KegiatanDesa | null;
}

export function PresensiModal({
  isOpen,
  onClose,
  kegiatan,
}: PresensiModalProps) {
  const { wargaList, absensiList, updateAbsensi, batchSetAbsensi } = useStore();
  const [selectedBlok, setSelectedBlok] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");

  if (!kegiatan) return null;

  const filteredWarga = wargaList.filter((w) => {
    const wBlok = w.blok || w.rt;
    if (selectedBlok !== "ALL" && wBlok !== selectedBlok) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return w.nama.toLowerCase().includes(q) || w.nik.includes(q);
    }
    return true;
  });

  const getRecord = (wargaId: string) => {
    return absensiList.find(
      (a) => a.kegiatan_id === kegiatan.id && a.warga_id === wargaId
    );
  };

  // Stats
  const currentAbsensi = absensiList.filter((a) => a.kegiatan_id === kegiatan.id);
  const hadirCount = currentAbsensi.filter((a) => a.status === "hadir").length;
  const izinCount = currentAbsensi.filter((a) => a.status === "izin").length;
  const sakitCount = currentAbsensi.filter((a) => a.status === "sakit").length;
  const alpaCount = currentAbsensi.filter((a) => a.status === "alpa").length;
  const totalWarga = wargaList.length;
  const hadirPercent = totalWarga > 0 ? Math.round((hadirCount / totalWarga) * 100) : 0;

  const handleStatusChange = (wargaId: string, status: StatusKehadiran) => {
    updateAbsensi(kegiatan.id, wargaId, status);
  };

  const handleExportCSV = () => {
    const headers = ["No", "Nama Warga", "NIK", "Blok", "Status Kehadiran", "Waktu Absen", "Keterangan"];
    const rows = wargaList.map((w, idx) => {
      const rec = getRecord(w.id);
      return [
        idx + 1,
        `"${w.nama}"`,
        `'${w.nik}`,
        w.blok || w.rt,
        rec?.status || "Belum Absen",
        rec?.waktu_absen || "-",
        `"${rec?.keterangan || ""}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Daftar_Presensi_${kegiatan.nama_kegiatan.replace(/\s+/g, "_")}_${kegiatan.tanggal}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-emerald-600" />
          <span>Daftar Presensi Kehadiran Warga</span>
        </div>
      }
      description={`${kegiatan.nama_kegiatan} • ${formatDateIndo(kegiatan.tanggal)} (${kegiatan.waktu})`}
      maxWidth="3xl"
    >
      <div className="space-y-4">
        {/* Realtime Attendance KPI Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
              Hadir ({hadirPercent}%)
            </span>
            <div className="text-xl font-black text-emerald-800 dark:text-emerald-200">
              {hadirCount} Warga
            </div>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-center">
            <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300">
              Izin
            </span>
            <div className="text-xl font-black text-blue-800 dark:text-blue-200">
              {izinCount} Warga
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
              Sakit
            </span>
            <div className="text-xl font-black text-amber-800 dark:text-amber-200">
              {sakitCount} Warga
            </div>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center">
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300">
              Alpa / Belum
            </span>
            <div className="text-xl font-black text-rose-800 dark:text-rose-200">
              {alpaCount} Warga
            </div>
          </div>
        </div>

        {/* Action & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <Input
              type="text"
              placeholder="Cari nama warga..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => batchSetAbsensi(kegiatan.id, "hadir")}
              className="h-8 text-xs border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50"
            >
              <Check className="h-3 w-3 mr-1" />
              Tandai Semua Hadir
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="h-8 text-xs"
            >
              <FileSpreadsheet className="h-3 w-3 mr-1 text-emerald-600" />
              Ekspor CSV
            </Button>
          </div>
        </div>

        {/* Resident Attendance List */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-[380px] overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3 text-center w-12">No</th>
                <th className="py-2.5 px-3">Nama Warga / KK</th>
                <th className="py-2.5 px-2 text-center w-20">Blok</th>
                <th className="py-2.5 px-3 text-center min-w-[200px]">Status Presensi</th>
                <th className="py-2.5 px-2 text-center w-20">Jam Hadir</th>
                <th className="py-2.5 px-3">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredWarga.map((w, idx) => {
                const rec = getRecord(w.id);
                const currentStatus: StatusKehadiran = rec?.status || "alpa";

                return (
                  <tr
                    key={w.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="py-2 px-3 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                      <div>{w.nama}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        NIK: {w.nik}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center text-slate-600 dark:text-slate-300 font-medium">
                      {w.blok || w.rt}
                    </td>
                    <td className="py-2 px-3">
                      <div className="grid grid-cols-4 gap-1">
                        {(["hadir", "izin", "sakit", "alpa"] as StatusKehadiran[]).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleStatusChange(w.id, st)}
                            className={`py-1 px-1.5 rounded text-[10px] font-bold capitalize transition-all ${
                              currentStatus === st
                                ? st === "hadir"
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : st === "izin"
                                  ? "bg-blue-600 text-white shadow-xs"
                                  : st === "sakit"
                                  ? "bg-amber-600 text-white shadow-xs"
                                  : "bg-rose-600 text-white shadow-xs"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center text-slate-500 font-mono text-[11px]">
                      {rec?.waktu_absen || "-"}
                    </td>
                    <td className="py-2 px-3 text-slate-500 text-[11px]">
                      <input
                        type="text"
                        placeholder="Catatan..."
                        defaultValue={rec?.keterangan || ""}
                        onBlur={(e) => updateAbsensi(kegiatan.id, w.id, currentStatus, e.target.value)}
                        className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-none text-xs"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="primary" size="sm" onClick={onClose}>
            Selesai
          </Button>
        </div>
      </div>
    </Modal>
  );
}
