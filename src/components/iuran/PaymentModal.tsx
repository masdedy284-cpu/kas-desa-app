"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Warga, IuranBulanan, StatusPembayaran, MetodePembayaran } from "@/lib/types";
import { useStore } from "@/lib/store";
import { formatRupiah, formatMonthName, formatDateIndo } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  Printer,
  CreditCard,
  QrCode,
  Banknote,
  Receipt,
  User,
  Calendar,
} from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  warga: Warga | null;
  bulan: number;
  tahun: number;
}

export function PaymentModal({
  isOpen,
  onClose,
  warga,
  bulan,
  tahun,
}: PaymentModalProps) {
  const { iuranList, updateIuranStatus, settings } = useStore();

  const record: IuranBulanan | undefined = warga
    ? iuranList.find(
        (i) => i.warga_id === warga.id && i.tahun === tahun && i.bulan === bulan
      )
    : undefined;

  const [status, setStatus] = useState<StatusPembayaran>("lunas");
  const [nominal, setNominal] = useState<number>(settings.nominal_iuran_bulanan);
  const [metodeBayar, setMetodeBayar] = useState<MetodePembayaran>("tunai");
  const [tanggalBayar, setTanggalBayar] = useState<string>("");
  const [catatan, setCatatan] = useState<string>("");
  const [showReceiptPreview, setShowReceiptPreview] = useState<boolean>(false);

  useEffect(() => {
    if (record) {
      setStatus(record.status);
      setNominal(record.nominal || settings.nominal_iuran_bulanan);
      setMetodeBayar(record.metode_bayar || "tunai");
      setTanggalBayar(record.tanggal_bayar || new Date().toISOString().split("T")[0]);
      setCatatan(record.catatan || "");
    } else {
      setStatus("lunas");
      setNominal(settings.nominal_iuran_bulanan);
      setMetodeBayar("tunai");
      setTanggalBayar(new Date().toISOString().split("T")[0]);
      setCatatan("");
    }
    setShowReceiptPreview(false);
  }, [record, isOpen, settings.nominal_iuran_bulanan]);

  if (!warga) return null;

  const handleSave = () => {
    updateIuranStatus({
      wargaId: warga.id,
      tahun,
      bulan,
      status,
      nominal: Number(nominal),
      metodeBayar: status === "lunas" ? metodeBayar : null,
      tanggalBayar: status === "lunas" ? tanggalBayar : null,
      catatan,
    });
    onClose();
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const isLunas = status === "lunas";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-emerald-600" />
          <span>Konfirmasi Iuran Warga</span>
        </div>
      }
      description={`Periode ${formatMonthName(bulan - 1)} ${tahun}`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Resident Summary Banner */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
              {warga.nama.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                {warga.nama}
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700">
                  {warga.blok || warga.rt}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                NIK: {warga.nik} • {warga.alamat}
              </div>
            </div>
          </div>
          <Badge
            variant={
              status === "lunas"
                ? "success"
                : status === "bebas"
                ? "info"
                : "warning"
            }
            className="uppercase text-[11px]"
          >
            {status}
          </Badge>
        </div>

        {/* Status Toggle Buttons */}
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">
            Status Pembayaran
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setStatus("lunas")}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                status === "lunas"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              Lunas
            </button>
            <button
              type="button"
              onClick={() => setStatus("belum")}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                status === "belum"
                  ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              }`}
            >
              <XCircle className="h-4 w-4" />
              Belum Bayar
            </button>
            <button
              type="button"
              onClick={() => setStatus("bebas")}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                status === "bebas"
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              }`}
            >
              Bebas Iuran
            </button>
          </div>
        </div>

        {/* If Lunas: Payment Details Form */}
        {isLunas && (
          <div className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                  Nominal Iuran (Rp)
                </label>
                <Input
                  type="number"
                  value={nominal}
                  onChange={(e) => setNominal(Number(e.target.value))}
                  placeholder={String(settings.nominal_iuran_bulanan)}
                  className="font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                  Tanggal Pembayaran
                </label>
                <Input
                  type="date"
                  value={tanggalBayar}
                  onChange={(e) => setTanggalBayar(e.target.value)}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMetodeBayar("tunai")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all ${
                    metodeBayar === "tunai"
                      ? "bg-slate-900 text-white dark:bg-emerald-600 border-transparent shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <Banknote className="h-3.5 w-3.5" />
                  Tunai
                </button>
                <button
                  type="button"
                  onClick={() => setMetodeBayar("transfer")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all ${
                    metodeBayar === "transfer"
                      ? "bg-slate-900 text-white dark:bg-emerald-600 border-transparent shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  Transfer
                </button>
                <button
                  type="button"
                  onClick={() => setMetodeBayar("qris")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all ${
                    metodeBayar === "qris"
                      ? "bg-slate-900 text-white dark:bg-emerald-600 border-transparent shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <QrCode className="h-3.5 w-3.5" />
                  QRIS Desa
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                Catatan Tambahan (Opsional)
              </label>
              <Input
                type="text"
                placeholder="Contoh: Dititipkan melalui Pak RT 01"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Digital Receipt Mini Preview Box */}
        {isLunas && (
          <div className="mt-3 p-3.5 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Receipt className="h-3.5 w-3.5" />
                Bukti Kwitansi Digital #{record?.kwitansi_no || `KW-${tahun}-${String(bulan).padStart(2, "0")}-${warga.id.toUpperCase()}`}
              </span>
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="text-[11px] underline flex items-center gap-1 hover:text-emerald-600"
              >
                <Printer className="h-3 w-3" />
                Cetak Struk
              </button>
            </div>
            <div className="grid grid-cols-2 gap-y-1 text-[11px]">
              <div>Jumlah Bayar: <span className="font-bold text-slate-900 dark:text-white">{formatRupiah(nominal)}</span></div>
              <div>Metode: <span className="capitalize font-semibold">{metodeBayar}</span></div>
              <div>Penerima: <span>{settings.bendahara}</span></div>
              <div>Tanggal: <span>{formatDateIndo(tanggalBayar)}</span></div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            Simpan Perubahan
          </Button>
        </div>
      </div>
    </Modal>
  );
}
