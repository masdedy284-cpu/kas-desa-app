"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { StatusIuranWarga } from "@/lib/types";
import { BLOK_OPTIONS } from "@/lib/initialData";

interface AddWargaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddWargaModal({ isOpen, onClose }: AddWargaModalProps) {
  const { addWarga, settings } = useStore();

  const [nik, setNik] = useState("");
  const [nama, setNama] = useState("");
  const [blok, setBlok] = useState("Blok A1");
  const [noHp, setNoHp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [statusKk, setStatusKk] = useState<"Kepala Keluarga" | "Anggota Keluarga">("Kepala Keluarga");
  const [statusIuran, setStatusIuran] = useState<StatusIuranWarga>("aktif");
  const [pekerjaan, setPekerjaan] = useState("");

  const blokList = settings.blok_list || BLOK_OPTIONS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nik.trim() || !nama.trim() || !alamat.trim()) return;

    addWarga({
      nik,
      nama,
      blok,
      rt: blok,
      no_hp: noHp,
      alamat,
      status_kk: statusKk,
      status_iuran: statusIuran,
      pekerjaan,
    });

    setNik("");
    setNama("");
    setNoHp("");
    setAlamat("");
    setPekerjaan("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Data Warga / Kepala Keluarga"
      description="Pendaftaran data warga baru Villa Danupayan Permai"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
              NIK (16 Digit) *
            </label>
            <Input
              type="text"
              required
              maxLength={16}
              placeholder="332301xxxxxxxxxx"
              value={nik}
              onChange={(e) => setNik(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
              Nama Lengkap *
            </label>
            <Input
              type="text"
              required
              placeholder="Contoh: Bpk. Ahmad Dahlan"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
              Wilayah Blok *
            </label>
            <select
              value={blok}
              onChange={(e) => setBlok(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {blokList.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
              Nomor WhatsApp / HP
            </label>
            <Input
              type="tel"
              placeholder="0812-xxxx-xxxx"
              value={noHp}
              onChange={(e) => setNoHp(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
            Alamat Rumah *
          </label>
          <Input
            type="text"
            required
            placeholder="Contoh: Villa Danupayan Permai Blok A1 No. 05"
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
              Status Iuran
            </label>
            <select
              value={statusIuran}
              onChange={(e) => setStatusIuran(e.target.value as StatusIuranWarga)}
              className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="aktif">Wajib Iuran (Aktif)</option>
              <option value="lansia">Bebas Iuran (Lansia / Dhuafa)</option>
              <option value="keringanan">Keringanan Khusus</option>
              <option value="pindah">Pindah Domisili</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
              Pekerjaan
            </label>
            <Input
              type="text"
              placeholder="Contoh: Wiraswasta / Karyawan"
              value={pekerjaan}
              onChange={(e) => setPekerjaan(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Simpan Warga
          </Button>
        </div>
      </form>
    </Modal>
  );
}
