"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { KategoriKegiatan } from "@/lib/types";

interface AddKegiatanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddKegiatanModal({ isOpen, onClose }: AddKegiatanModalProps) {
  const { addKegiatan, settings } = useStore();

  const [nama, setNama] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [waktu, setWaktu] = useState("19:30 - 21:30 WIB");
  const [lokasi, setLokasi] = useState("Balai Warga Villa Danupayan Permai");
  const [kategori, setKategori] = useState<KategoriKegiatan>("musyawarah");
  const [deskripsi, setDeskripsi] = useState("");
  const [penanggungJawab, setPenanggungJawab] = useState(settings.kepala_desa);

  React.useEffect(() => {
    setTanggal(new Date().toISOString().split("T")[0]);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !tanggal || !lokasi.trim()) return;

    addKegiatan({
      nama_kegiatan: nama,
      tanggal,
      waktu,
      lokasi,
      kategori,
      deskripsi,
      penanggung_jawab: penanggungJawab,
      status_kegiatan: "mendatang",
    });

    setNama("");
    setDeskripsi("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buat Agenda / Kegiatan Desa Baru"
      description="Jadwalkan kegiatan musyawarah, gotong royong, ronda, atau posyandu desa"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
            Nama Kegiatan *
          </label>
          <Input
            type="text"
            required
            placeholder="Contoh: Kerja Bakti Pembersihan Saluran Air RT 03"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
              Kategori Kegiatan *
            </label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value as KategoriKegiatan)}
              className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="musyawarah">Musyawarah Desa / RT</option>
              <option value="gotong_royong">Gotong Royong / Kerja Bakti</option>
              <option value="ronda">Ronda Poskamling</option>
              <option value="posyandu">Posyandu & Kesehatan</option>
              <option value="keagamaan">Kegiatan Keagamaan</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
              Tanggal Pelaksanaan *
            </label>
            <Input
              type="date"
              required
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
              Waktu / Jam
            </label>
            <Input
              type="text"
              placeholder="Contoh: 07:00 - 10:00 WIB"
              value={waktu}
              onChange={(e) => setWaktu(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
              Lokasi Tempat *
            </label>
            <Input
              type="text"
              required
              placeholder="Contoh: Pos Ronda RT 01"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
            Penanggung Jawab Acara
          </label>
          <Input
            type="text"
            value={penanggungJawab}
            onChange={(e) => setPenanggungJawab(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
            Deskripsi / Agenda Pembahasan
          </label>
          <textarea
            rows={3}
            placeholder="Keterangan singkat agenda kegiatan..."
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Jadwalkan Kegiatan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
