"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { TipeTransaksi } from "@/lib/types";
import { PlusCircle, ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface AddKasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddKasModal({ isOpen, onClose }: AddKasModalProps) {
  const { addTransaksi, settings } = useStore();

  const [tipe, setTipe] = useState<TipeTransaksi>("pemasukan");
  const [kategori, setKategori] = useState<string>("Iuran Bulanan");
  const [nominal, setNominal] = useState<string>("");
  const [tanggal, setTanggal] = useState<string>("");
  const [uraian, setUraian] = useState<string>("");
  const [penanggungJawab, setPenanggungJawab] = useState<string>(settings.bendahara);

  React.useEffect(() => {
    setTanggal(new Date().toISOString().split("T")[0]);
  }, []);

  const categoriesIncome = [
    "Iuran Bulanan",
    "Donasi / Sumbangan",
    "Dana Bantuan Sosial",
    "Kas RT/RW",
    "Pendapatan Lainnya",
  ];

  const categoriesExpense = [
    "Santunan Kematian",
    "Bantuan Warga Sakit",
    "Kerja Bakti & Fasum",
    "Kegiatan Warga",
    "Konsumsi & Musyawarah",
    "Operasional & ATK",
  ];

  const handleTypeChange = (newType: TipeTransaksi) => {
    setTipe(newType);
    setKategori(newType === "pemasukan" ? categoriesIncome[0] : categoriesExpense[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nominal || Number(nominal) <= 0 || !uraian.trim()) return;

    addTransaksi({
      tanggal,
      tipe,
      kategori,
      nominal: Number(nominal),
      uraian,
      penanggung_jawab: penanggungJawab,
    });

    // Reset & close
    setNominal("");
    setUraian("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Catat Transaksi Kas Sosial"
      description="Pencatatan buku kas umum kas sosial warga desa"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Transaction Type Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">
            Jenis Transaksi
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange("pemasukan")}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                tipe === "pemasukan"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              }`}
            >
              <ArrowDownLeft className="h-4 w-4" />
              Pemasukan (Kas Masuk)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("pengeluaran")}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                tipe === "pengeluaran"
                  ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              }`}
            >
              <ArrowUpRight className="h-4 w-4" />
              Pengeluaran (Kas Keluar)
            </button>
          </div>
        </div>

        {/* Amount & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
              Nominal (Rp) *
            </label>
            <Input
              type="number"
              required
              min="1000"
              step="1000"
              placeholder="Contoh: 150000"
              value={nominal}
              onChange={(e) => setNominal(e.target.value)}
              className="font-semibold text-base"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
              Tanggal Transaksi *
            </label>
            <Input
              type="date"
              required
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
            Kategori Kas *
          </label>
          <select
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {(tipe === "pemasukan" ? categoriesIncome : categoriesExpense).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
            Uraian / Keterangan Transaksi *
          </label>
          <Input
            type="text"
            required
            placeholder="Contoh: Santunan warga musibah sakit duka RT 02"
            value={uraian}
            onChange={(e) => setUraian(e.target.value)}
          />
        </div>

        {/* PIC / Penanggung Jawab */}
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
            Penanggung Jawab / Pencatat
          </label>
          <Input
            type="text"
            value={penanggungJawab}
            onChange={(e) => setPenanggungJawab(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Simpan Transaksi
          </Button>
        </div>
      </form>
    </Modal>
  );
}
