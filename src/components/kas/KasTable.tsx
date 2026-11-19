"use client";

import React, { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { formatRupiah, formatDateIndo } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AddKasModal } from "./AddKasModal";
import {
  Search,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  FileSpreadsheet,
  Wallet,
  Receipt,
  Download,
} from "lucide-react";

export function KasTable() {
  const { transaksiList, deleteTransaksi, totalKas } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTipe, setFilterTipe] = useState<string>("ALL");
  const [filterKategori, setFilterKategori] = useState<string>("ALL");

  const categories = useMemo(() => {
    const set = new Set<string>();
    transaksiList.forEach((t) => set.add(t.kategori));
    return Array.from(set);
  }, [transaksiList]);

  const filteredTransactions = useMemo(() => {
    return transaksiList
      .filter((t) => {
        if (filterTipe !== "ALL" && t.tipe !== filterTipe) return false;
        if (filterKategori !== "ALL" && t.kategori !== filterKategori) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchUraian = t.uraian.toLowerCase().includes(q);
          const matchPj = t.penanggung_jawab.toLowerCase().includes(q);
          const matchKategori = t.kategori.toLowerCase().includes(q);
          if (!matchUraian && !matchPj && !matchKategori) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }, [transaksiList, filterTipe, filterKategori, searchQuery]);

  const handleExportCSV = () => {
    const headers = ["No", "Tanggal", "Tipe", "Kategori", "Nominal Masuk", "Nominal Keluar", "Uraian", "Penanggung Jawab"];
    const rows = filteredTransactions.map((t, idx) => [
      idx + 1,
      t.tanggal,
      t.tipe,
      `"${t.kategori}"`,
      t.tipe === "pemasukan" ? t.nominal : 0,
      t.tipe === "pengeluaran" ? t.nominal : 0,
      `"${t.uraian.replace(/"/g, '""')}"`,
      `"${t.penanggung_jawab}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Buku_Kas_Sosial_Desa_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase">
                  Saldo Buku Kas Umum Saat Ini
                </span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {formatRupiah(totalKas)}
                </div>
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
                Catat Transaksi
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari uraian atau nama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterTipe}
                onChange={(e) => setFilterTipe(e.target.value)}
                className="h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="ALL">Semua Jenis Transaksi</option>
                <option value="pemasukan">Hanya Pemasukan</option>
                <option value="pengeluaran">Hanya Pengeluaran</option>
              </select>

              <select
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
                className="h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="ALL">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ledger Table */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[750px]">
            <thead className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-3 text-center w-12">No</th>
                <th className="py-3 px-3 w-28">Tanggal</th>
                <th className="py-3 px-3 w-28">Jenis & Kategori</th>
                <th className="py-3 px-4">Uraian Transaksi</th>
                <th className="py-3 px-3 text-right text-emerald-600 dark:text-emerald-400 min-w-[120px]">
                  Masuk (+)
                </th>
                <th className="py-3 px-3 text-right text-rose-600 dark:text-rose-400 min-w-[120px]">
                  Keluar (-)
                </th>
                <th className="py-3 px-3 text-center w-28">Penanggung Jawab</th>
                <th className="py-3 px-3 text-center w-16">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.map((tx, idx) => {
                const isIncome = tx.tipe === "pemasukan";
                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                      {formatDateIndo(tx.tanggal)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-1 items-start">
                        <Badge
                          variant={isIncome ? "success" : "destructive"}
                          className="text-[10px] uppercase font-bold"
                        >
                          {tx.tipe}
                        </Badge>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {tx.kategori}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {tx.uraian}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {isIncome ? formatRupiah(tx.nominal) : "-"}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-rose-600 dark:text-rose-400">
                      {!isIncome ? formatRupiah(tx.nominal) : "-"}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-400">
                      {tx.penanggung_jawab}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`Hapus transaksi "${tx.uraian}"?`)) {
                            deleteTransaksi(tx.id);
                          }
                        }}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        title="Hapus Transaksi"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Belum ada transaksi kas yang sesuai dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <AddKasModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
