"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { formatRupiah, formatDateIndo, formatMonthName } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet,
  Printer,
  FileText,
  Calendar,
  Building,
  CheckCircle,
  Download,
} from "lucide-react";

export function LaporanView() {
  const { settings, transaksiList, wargaList, iuranList, totalKas, totalPemasukan, totalPengeluaran } = useStore();
  const [reportType, setReportType] = useState<"kas" | "iuran" | "lengkap">("lengkap");
  const [selectedYear, setSelectedYear] = useState<number>(settings.tahun_aktif);
  const [currentDateStr, setCurrentDateStr] = useState<string>("");

  React.useEffect(() => {
    setCurrentDateStr(formatDateIndo(new Date().toISOString().split("T")[0]));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const exportKasCSV = () => {
    const headers = ["No", "Tanggal", "Tipe", "Kategori", "Masuk (Rp)", "Keluar (Rp)", "Uraian", "Penanggung Jawab"];
    const rows = transaksiList.map((t, idx) => [
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
    link.setAttribute("download", `LPJ_Keuangan_Villa_Danupayan_Permai_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportIuranCSV = () => {
    const headers = [
      "No",
      "Nama Kepala Keluarga",
      "NIK",
      "Blok",
      ...Array.from({ length: 12 }, (_, i) => formatMonthName(i)),
      "Total Bayar (Rp)",
    ];

    const rows = wargaList.map((w, idx) => {
      const monthValues = Array.from({ length: 12 }, (_, i) => {
        const rec = iuranList.find(
          (item) => item.warga_id === w.id && item.tahun === selectedYear && item.bulan === i + 1
        );
        return rec?.status === "lunas" ? rec.nominal : rec?.status === "bebas" ? "Bebas" : 0;
      });

      const totalPaid = iuranList
        .filter((item) => item.warga_id === w.id && item.tahun === selectedYear && item.status === "lunas")
        .reduce((sum, item) => sum + item.nominal, 0);

      return [idx + 1, `"${w.nama}"`, `'${w.nik}`, w.blok || w.rt, ...monthValues, totalPaid];
    });

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Iuran_Villa_Danupayan_Permai_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Control Card (hidden during print) */}
      <Card className="no-print border-slate-200/80 dark:border-slate-800 shadow-sm">
        <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
              Pusat Laporan & Ekspor Dokumen Resmi
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Cetak Laporan Pertanggungjawaban (LPJ) ber-kop surat resmi atau unduh file spreadsheet
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportKasCSV}
              className="text-xs h-9 flex items-center gap-1.5"
            >
              <Download className="h-4 w-4 text-emerald-600" />
              CSV Buku Kas
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportIuranCSV}
              className="text-xs h-9 flex items-center gap-1.5"
            >
              <Download className="h-4 w-4 text-emerald-600" />
              CSV Rekap Iuran
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              className="text-xs h-9 flex items-center gap-1.5"
            >
              <Printer className="h-4 w-4" />
              Cetak / Simpan PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Official Printable Report Document */}
      <div className="bg-white text-slate-950 p-6 sm:p-10 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 dark:bg-white dark:text-slate-950 max-w-4xl mx-auto">
        {/* Kop Surat Resmi Desa */}
        <div className="text-center border-b-4 border-double border-slate-900 pb-4 mb-6">
          <h4 className="text-sm font-semibold tracking-wider uppercase text-slate-700">
            PEMERINTAH KABUPATEN {settings.kabupaten.toUpperCase()}
          </h4>
          <h3 className="text-base font-bold uppercase text-slate-800">
            {settings.kecamatan.toUpperCase()}
          </h3>
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-950">
            {settings.nama_desa.toUpperCase()} - {(settings.rw || "RW 01").toUpperCase()}
          </h2>
          <p className="text-xs text-slate-600 mt-1 font-serif">
            Sekretariat: {settings.dusun}, {settings.nama_desa}, {settings.kecamatan}, {settings.kabupaten}, {settings.provinsi}
          </p>
        </div>

        {/* Document Title */}
        <div className="text-center my-6">
          <h3 className="text-lg font-black uppercase underline decoration-2 underline-offset-4 tracking-wide text-slate-900">
            LAPORAN PERTANGGUNGJAWABAN (LPJ) KAS SOSIAL WARGA
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Nomor: 045 / LPJ-KS / {(settings.rw || "RW01").replace(/\s+/g, "")} / {selectedYear}
          </p>
          <p className="text-xs text-slate-500">
            Tahun Anggaran {selectedYear} (Per {currentDateStr || "2026"})
          </p>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="border border-slate-300 rounded-lg p-3 text-center bg-slate-50">
            <span className="text-[11px] font-bold text-slate-600 uppercase">
              Total Pemasukan Kas
            </span>
            <div className="text-base font-black text-emerald-800 mt-1">
              {formatRupiah(totalPemasukan)}
            </div>
          </div>
          <div className="border border-slate-300 rounded-lg p-3 text-center bg-slate-50">
            <span className="text-[11px] font-bold text-slate-600 uppercase">
              Total Pengeluaran Kas
            </span>
            <div className="text-base font-black text-rose-800 mt-1">
              {formatRupiah(totalPengeluaran)}
            </div>
          </div>
          <div className="border border-slate-900 rounded-lg p-3 text-center bg-emerald-50">
            <span className="text-[11px] font-extrabold text-slate-900 uppercase">
              Sisa Saldo Kas Aktif
            </span>
            <div className="text-base font-black text-emerald-900 mt-1">
              {formatRupiah(totalKas)}
            </div>
          </div>
        </div>

        {/* Table 1: Rincian Transaksi Terakhir */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 border-l-4 border-slate-800 pl-2">
            A. Mutasi Buku Kas Umum
          </h4>
          <table className="w-full text-xs text-left border border-slate-300">
            <thead className="bg-slate-100 font-bold border-b border-slate-300">
              <tr>
                <th className="p-2 text-center w-10">No</th>
                <th className="p-2 w-24">Tanggal</th>
                <th className="p-2">Uraian / Keterangan</th>
                <th className="p-2 w-24">Kategori</th>
                <th className="p-2 text-right w-28">Pemasukan</th>
                <th className="p-2 text-right w-28">Pengeluaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {transaksiList.map((tx, idx) => (
                <tr key={tx.id}>
                  <td className="p-2 text-center font-mono">{idx + 1}</td>
                  <td className="p-2 font-mono">{tx.tanggal}</td>
                  <td className="p-2 font-medium">{tx.uraian}</td>
                  <td className="p-2 text-slate-600">{tx.kategori}</td>
                  <td className="p-2 text-right font-semibold text-emerald-700">
                    {tx.tipe === "pemasukan" ? formatRupiah(tx.nominal) : "-"}
                  </td>
                  <td className="p-2 text-right font-semibold text-rose-700">
                    {tx.tipe === "pengeluaran" ? formatRupiah(tx.nominal) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 font-bold border-t border-slate-300">
              <tr>
                <td colSpan={4} className="p-2 text-center font-bold">
                  TOTAL KESELURUHAN
                </td>
                <td className="p-2 text-right text-emerald-800">
                  {formatRupiah(totalPemasukan)}
                </td>
                <td className="p-2 text-right text-rose-800">
                  {formatRupiah(totalPengeluaran)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Signatures Area */}
        <div className="mt-12 pt-6 border-t border-slate-300 text-xs text-slate-800">
          <div className="flex justify-between text-center">
            {/* Left: Bendahara */}
            <div className="w-52">
              <p>Dibuat Oleh,</p>
              <p className="font-semibold">Bendahara Kas Sosial</p>
              <div className="h-20" />
              <p className="font-bold underline uppercase">{settings.bendahara}</p>
              <p className="text-[10px] text-slate-500">Pengurus {settings.nama_desa}</p>
            </div>

            {/* Center: Sekretaris */}
            <div className="w-52">
              <p>Diperiksa Oleh,</p>
              <p className="font-semibold">Sekretaris {settings.rw || "Lingkungan"}</p>
              <div className="h-20" />
              <p className="font-bold underline uppercase">{settings.sekretaris}</p>
              <p className="text-[10px] text-slate-500">Perangkat Lingkungan</p>
            </div>

            {/* Right: Ketua Paguyuban */}
            <div className="w-52">
              <p>{settings.nama_desa}, {currentDateStr || "November 2026"}</p>
              <p className="font-semibold">Mengetahui, Ketua Paguyuban</p>
              <div className="h-20" />
              <p className="font-bold underline uppercase">{settings.kepala_desa}</p>
              <p className="text-[10px] text-slate-500">Ketua Paguyuban {settings.nama_desa}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
