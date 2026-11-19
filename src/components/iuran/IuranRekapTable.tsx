"use client";

import React, { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { Warga, IuranBulanan } from "@/lib/types";
import {
  formatRupiah,
  getShortMonthName,
  formatMonthName,
} from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PaymentModal } from "./PaymentModal";
import {
  Search,
  Filter,
  Check,
  X,
  FileSpreadsheet,
  Calendar,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export function IuranRekapTable() {
  const { wargaList, iuranList, settings } = useStore();

  const [selectedYear, setSelectedYear] = useState<number>(settings.tahun_aktif);
  const [selectedBlok, setSelectedBlok] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWarga, setSelectedWarga] = useState<Warga | null>(null);
  const [selectedBulan, setSelectedBulan] = useState<number>(1);

  // Filtered residents
  const filteredWarga = useMemo(() => {
    return wargaList.filter((w) => {
      // Blok filter
      const wBlok = w.blok || w.rt;
      if (selectedBlok !== "ALL" && wBlok !== selectedBlok) return false;

      // Status filter
      if (filterStatus === "aktif" && w.status_iuran !== "aktif") return false;
      if (filterStatus === "keringanan" && w.status_iuran !== "keringanan" && w.status_iuran !== "lansia") return false;

      // Dues compliance filter: "menunggak"
      if (filterStatus === "menunggak") {
        const hasUnpaid = iuranList.some(
          (i) => i.warga_id === w.id && i.tahun === selectedYear && i.status === "belum" && i.bulan <= 11
        );
        if (!hasUnpaid) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = w.nama.toLowerCase().includes(q);
        const matchNik = w.nik.includes(q);
        const matchAlamat = w.alamat.toLowerCase().includes(q);
        if (!matchName && !matchNik && !matchAlamat) return false;
      }

      return true;
    });
  }, [wargaList, selectedBlok, filterStatus, searchQuery, iuranList, selectedYear]);

  // Handle cell click
  const handleCellClick = (warga: Warga, bulan: number) => {
    setSelectedWarga(warga);
    setSelectedBulan(bulan);
    setModalOpen(true);
  };

  // Helper to get dues record for cell
  const getDuesRecord = (wargaId: string, bulan: number): IuranBulanan | undefined => {
    return iuranList.find(
      (i) => i.warga_id === wargaId && i.tahun === selectedYear && i.bulan === bulan
    );
  };

  // Calculate annual total for resident
  const calculateAnnualTotal = (wargaId: string): number => {
    return iuranList
      .filter((i) => i.warga_id === wargaId && i.tahun === selectedYear && i.status === "lunas")
      .reduce((sum, i) => sum + i.nominal, 0);
  };

  // Monthly totals across filtered residents
  const monthlyTotals = useMemo(() => {
    const totals: { [key: number]: number } = {};
    for (let b = 1; b <= 12; b++) {
      totals[b] = filteredWarga.reduce((sum, w) => {
        const rec = getDuesRecord(w.id, b);
        return rec?.status === "lunas" ? sum + rec.nominal : sum;
      }, 0);
    }
    return totals;
  }, [filteredWarga, iuranList, selectedYear]);

  const grandAnnualTotal = Object.values(monthlyTotals).reduce((a, b) => a + b, 0);

  // Export to CSV Function
  const handleExportCSV = () => {
    const headers = [
      "No",
      "Nama Kepala Keluarga",
      "NIK",
      "Blok",
      "Status Iuran",
      ...Array.from({ length: 12 }, (_, i) => formatMonthName(i)),
      "Total Bayar (Rp)",
    ];

    const rows = filteredWarga.map((w, idx) => {
      const monthValues = Array.from({ length: 12 }, (_, i) => {
        const rec = getDuesRecord(w.id, i + 1);
        if (!rec) return "Belum";
        if (rec.status === "lunas") return `Lunas (${rec.nominal})`;
        if (rec.status === "bebas") return "Bebas Iuran";
        return "Belum Bayar";
      });

      return [
        idx + 1,
        `"${w.nama}"`,
        `'${w.nik}`,
        w.blok || w.rt,
        w.status_iuran,
        ...monthValues,
        calculateAnnualTotal(w.id),
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
      `Rekap_Iuran_Villa_Danupayan_Permai_${selectedYear}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner / Filter Controls */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari nama warga, NIK, alamat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            {/* Filter Pills / Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Year Selector */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value={2025}>Tahun 2025</option>
                  <option value={2026}>Tahun 2026</option>
                  <option value={2027}>Tahun 2027</option>
                </select>
              </div>

              {/* Blok Selector */}
              <select
                value={selectedBlok}
                onChange={(e) => setSelectedBlok(e.target.value)}
                className="h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="ALL">Semua Blok</option>
                {(settings.blok_list || settings.rt_list || []).map((blok) => (
                  <option key={blok} value={blok}>
                    {blok}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="ALL">Semua Status Warga</option>
                <option value="aktif">Wajib Iuran (Aktif)</option>
                <option value="menunggak">Ada Tunggakan</option>
                <option value="keringanan">Bebas / Keringanan</option>
              </select>

              {/* Export to CSV Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="h-9 text-xs flex items-center gap-1.5 border-emerald-600/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                Ekspor Excel / CSV
              </Button>
            </div>
          </div>

          {/* Quick Legend & Hint */}
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Petunjuk:</span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Lunas (Klik untuk kwitansi/ubah)
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Belum Bayar (Klik untuk bayar)
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Bebas Iuran
              </span>
            </div>

            <div className="font-semibold text-slate-700 dark:text-slate-200">
              Menampilkan {filteredWarga.length} Kepala Keluarga
            </div>
          </div>
        </CardContent>
      </Card>

      {/* The Interactive Table */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[950px]">
            {/* Table Header */}
            <thead className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700 select-none">
              <tr>
                <th className="py-3 px-3 text-center w-12 sticky left-0 bg-slate-100 dark:bg-slate-800 z-10">
                  No
                </th>
                <th className="py-3 px-4 min-w-[180px] sticky left-12 bg-slate-100 dark:bg-slate-800 z-10">
                  Nama Warga / KK
                </th>
                <th className="py-3 px-3 text-center w-20">Blok</th>
                {Array.from({ length: 12 }, (_, i) => (
                  <th
                    key={i}
                    className="py-3 px-2 text-center min-w-[65px] font-semibold text-slate-600 dark:text-slate-300"
                  >
                    {getShortMonthName(i)}
                  </th>
                ))}
                <th className="py-3 px-3 text-right font-extrabold text-emerald-700 dark:text-emerald-400 min-w-[100px]">
                  Total {selectedYear}
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredWarga.map((warga, index) => {
                const annualSum = calculateAnnualTotal(warga.id);

                return (
                  <tr
                    key={warga.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Index */}
                    <td className="py-3 px-3 text-center text-slate-400 font-mono sticky left-0 bg-white dark:bg-slate-900 z-10">
                      {index + 1}
                    </td>

                    {/* Resident Info */}
                    <td className="py-3 px-4 sticky left-12 bg-white dark:bg-slate-900 z-10 border-r border-slate-100 dark:border-slate-800">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span className="truncate max-w-[150px]">{warga.nama}</span>
                        {warga.status_iuran === "lansia" && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                            Lansia
                          </span>
                        )}
                        {warga.status_iuran === "keringanan" && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                            Khusus
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                        {warga.alamat}
                      </div>
                    </td>

                    {/* Blok */}
                    <td className="py-3 px-3 text-center font-medium text-slate-600 dark:text-slate-300">
                      {warga.blok || warga.rt}
                    </td>

                    {/* 12 Months Interactive Cells */}
                    {Array.from({ length: 12 }, (_, i) => {
                      const bulan = i + 1;
                      const record = getDuesRecord(warga.id, bulan);
                      const isLunas = record?.status === "lunas";
                      const isBebas = record?.status === "bebas";

                      return (
                        <td key={bulan} className="py-2 px-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleCellClick(warga, bulan)}
                            title={
                              isLunas
                                ? `Lunas: ${formatRupiah(record.nominal)} (${record.metode_bayar || "Tunai"}) pada ${record.tanggal_bayar || "-"}`
                                : isBebas
                                ? "Bebas iuran sosial"
                                : "Belum bayar - Klik untuk mencatat pembayaran"
                            }
                            className={`w-full py-1 px-1 rounded-md text-[11px] font-bold transition-all duration-150 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                              isLunas
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 hover:bg-emerald-200 shadow-2xs"
                                : isBebas
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 hover:bg-blue-200"
                                : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 hover:bg-amber-100 border border-dashed border-amber-300/50"
                            }`}
                          >
                            {isLunas ? (
                              <span className="flex items-center justify-center gap-0.5">
                                <Check className="h-3 w-3 stroke-[3]" />
                                {record?.nominal ? `${Math.round(record.nominal / 1000)}k` : `${Math.round(settings.nominal_iuran_bulanan / 1000)}k`}
                              </span>
                            ) : isBebas ? (
                              <span>Bebas</span>
                            ) : (
                              <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80">
                                Belum
                              </span>
                            )}
                          </button>
                        </td>
                      );
                    })}

                    {/* Annual Total for Resident */}
                    <td className="py-3 px-3 text-right font-bold text-emerald-700 dark:text-emerald-400">
                      {formatRupiah(annualSum)}
                    </td>
                  </tr>
                );
              })}

              {filteredWarga.length === 0 && (
                <tr>
                  <td colSpan={16} className="py-12 text-center text-slate-400">
                    Tidak ada data warga yang cocok dengan filter yang dipilih.
                  </td>
                </tr>
              )}
            </tbody>

            {/* Table Footer / Summary Row */}
            <tfoot className="bg-slate-100/90 dark:bg-slate-800 font-extrabold text-slate-800 dark:text-slate-100 border-t-2 border-slate-300 dark:border-slate-600">
              <tr>
                <td
                  colSpan={3}
                  className="py-3 px-4 text-left font-black tracking-wider text-xs sticky left-0 bg-slate-100/95 dark:bg-slate-800 z-10"
                >
                  TOTAL REKAPITULASI KAS ({selectedYear})
                </td>
                {Array.from({ length: 12 }, (_, i) => {
                  const mTotal = monthlyTotals[i + 1] || 0;
                  return (
                    <td
                      key={i}
                      className="py-3 px-1 text-center font-bold text-[10px] text-emerald-700 dark:text-emerald-400"
                    >
                      {mTotal > 0 ? `${(mTotal / 1000).toFixed(0)}k` : "-"}
                    </td>
                  );
                })}
                <td className="py-3 px-3 text-right font-black text-sm text-emerald-600 dark:text-emerald-400">
                  {formatRupiah(grandAnnualTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Interactive Modal */}
      <PaymentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        warga={selectedWarga}
        bulan={selectedBulan}
        tahun={selectedYear}
      />
    </div>
  );
}
