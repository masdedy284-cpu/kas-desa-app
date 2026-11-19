"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AddWargaModal } from "./AddWargaModal";
import {
  Users,
  Plus,
  Search,
  Trash2,
  Phone,
  Home,
  FileSpreadsheet,
} from "lucide-react";

export function WargaTable() {
  const { wargaList, deleteWarga, settings } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterBlok, setFilterBlok] = useState("ALL");

  const filtered = wargaList.filter((w) => {
    const wBlok = w.blok || w.rt;
    if (filterBlok !== "ALL" && wBlok !== filterBlok) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        w.nama.toLowerCase().includes(q) ||
        w.nik.includes(q) ||
        w.alamat.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ["No", "NIK", "Nama Lengkap", "Blok", "No HP", "Alamat", "Status KK", "Status Iuran", "Pekerjaan"];
    const rows = filtered.map((w, idx) => [
      idx + 1,
      `'${w.nik}`,
      `"${w.nama}"`,
      w.blok || w.rt,
      `'${w.no_hp || "-"}`,
      `"${w.alamat}"`,
      w.status_kk,
      w.status_iuran,
      `"${w.pekerjaan || "-"}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Data_Warga_${settings.nama_desa.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Master Data Warga & Kepala Keluarga
                </h3>
                <p className="text-xs text-slate-500">
                  Total terdaftar: {wargaList.length} KK di lingkungan {settings.nama_desa}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="text-xs h-9"
              >
                <FileSpreadsheet className="h-4 w-4 mr-1 text-emerald-600" />
                Ekspor CSV
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setModalOpen(true)}
                className="text-xs h-9"
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah Warga
              </Button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari nama warga, NIK, alamat..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            <select
              value={filterBlok}
              onChange={(e) => setFilterBlok(e.target.value)}
              className="h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="ALL">Semua Blok</option>
              {(settings.blok_list || settings.rt_list || []).map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[700px]">
            <thead className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-3 text-center w-12">No</th>
                <th className="py-3 px-4">Nama Lengkap & NIK</th>
                <th className="py-3 px-3 text-center w-20">Blok</th>
                <th className="py-3 px-4">Alamat Rumah</th>
                <th className="py-3 px-3">No. HP / WA</th>
                <th className="py-3 px-3 text-center">Status Iuran</th>
                <th className="py-3 px-3 text-center w-16">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((w, idx) => (
                <tr
                  key={w.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-3 text-center text-slate-400 font-mono">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {w.nama}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      NIK: {w.nik} {w.pekerjaan ? `• ${w.pekerjaan}` : ""}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center font-semibold text-slate-700 dark:text-slate-300">
                    {w.blok || w.rt}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {w.alamat}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-mono">
                    {w.no_hp || "-"}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Badge
                      variant={
                        w.status_iuran === "aktif"
                          ? "success"
                          : w.status_iuran === "lansia"
                          ? "info"
                          : "secondary"
                      }
                      className="capitalize text-[10px]"
                    >
                      {w.status_iuran}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => {
                        if (confirm(`Hapus data warga "${w.nama}"?`)) {
                          deleteWarga(w.id);
                        }
                      }}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Hapus Data"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AddWargaModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
