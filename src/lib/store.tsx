"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  Warga,
  IuranBulanan,
  TransaksiKas,
  KegiatanDesa,
  AbsensiRecord,
  DesaSettings,
  StatusPembayaran,
  MetodePembayaran,
  StatusKehadiran,
} from "./types";
import {
  BLOK_OPTIONS,
  initialSettings,
  initialWarga,
  initialIuran,
  initialTransaksi,
  initialKegiatan,
  initialAbsensi,
} from "./initialData";
import { supabase, isSupabaseConfigured } from "./supabase/client";

interface StoreContextType {
  settings: DesaSettings;
  updateSettings: (newSettings: Partial<DesaSettings>) => void;
  wargaList: Warga[];
  addWarga: (warga: Omit<Warga, "id">) => void;
  updateWarga: (id: string, warga: Partial<Warga>) => void;
  deleteWarga: (id: string) => void;
  iuranList: IuranBulanan[];
  updateIuranStatus: (params: {
    wargaId: string;
    tahun: number;
    bulan: number;
    status: StatusPembayaran;
    nominal?: number;
    metodeBayar?: MetodePembayaran | null;
    tanggalBayar?: string | null;
    catatan?: string;
  }) => void;
  transaksiList: TransaksiKas[];
  addTransaksi: (tx: Omit<TransaksiKas, "id" | "saldo_setelah">) => void;
  deleteTransaksi: (id: string) => void;
  kegiatanList: KegiatanDesa[];
  addKegiatan: (kg: Omit<KegiatanDesa, "id">) => void;
  updateKegiatan: (id: string, kg: Partial<KegiatanDesa>) => void;
  deleteKegiatan: (id: string) => void;
  absensiList: AbsensiRecord[];
  updateAbsensi: (kegiatanId: string, wargaId: string, status: StatusKehadiran, keterangan?: string) => void;
  batchSetAbsensi: (kegiatanId: string, status: StatusKehadiran) => void;
  isSupabaseOnline: boolean;
  isSyncing: boolean;
  syncWithSupabase: () => Promise<{ success: boolean; message: string }>;
  resetToDefaultData: () => void;
  // Computed values
  totalKas: number;
  totalPemasukan: number;
  totalPengeluaran: number;
  pemasukanBulanIni: number;
  pengeluaranBulanIni: number;
  iuranBulanIniPersen: number;
  tingkatKehadiranRataRata: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SETTINGS: "vdp_desa_settings_v2",
  WARGA: "vdp_desa_warga_v2",
  IURAN: "vdp_desa_iuran_v2",
  TRANSAKSI: "vdp_desa_transaksi_v2",
  KEGIATAN: "vdp_desa_kegiatan_v2",
  ABSENSI: "vdp_desa_absensi_v2",
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isClient, setIsClient] = useState(false);
  const [settings, setSettings] = useState<DesaSettings>(initialSettings);
  const [wargaList, setWargaList] = useState<Warga[]>(initialWarga);
  const [iuranList, setIuranList] = useState<IuranBulanan[]>(initialIuran);
  const [transaksiList, setTransaksiList] = useState<TransaksiKas[]>(initialTransaksi);
  const [kegiatanList, setKegiatanList] = useState<KegiatanDesa[]>(initialKegiatan);
  const [absensiList, setAbsensiList] = useState<AbsensiRecord[]>(initialAbsensi);
  const [isSupabaseOnline, setIsSupabaseOnline] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const isSeedingRef = useRef(false);

  // 1. Fetch data from Supabase
  const loadFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return false;

    try {
      const [
        { data: dbWarga, error: wargaErr },
        { data: dbIuran, error: iuranErr },
        { data: dbTransaksi, error: txErr },
        { data: dbKegiatan, error: kgErr },
        { data: dbAbsensi, error: absErr },
        { data: dbSettings, error: setErr },
      ] = await Promise.all([
        supabase.from("warga").select("*").order("nama"),
        supabase.from("iuran_bulanan").select("*"),
        supabase.from("transaksi_kas").select("*").order("tanggal", { ascending: false }),
        supabase.from("kegiatan_desa").select("*").order("tanggal", { ascending: false }),
        supabase.from("absensi_kegiatan").select("*"),
        supabase.from("pengaturan_desa").select("*").eq("id", 1).maybeSingle(),
      ]);

      if (wargaErr || iuranErr || txErr || kgErr || absErr) {
        console.warn("Supabase fetch warning:", { wargaErr, iuranErr, txErr, kgErr, absErr, setErr });
        return false;
      }

      // Check if DB is completely empty (first time setup)
      if ((!dbWarga || dbWarga.length === 0) && !isSeedingRef.current) {
        isSeedingRef.current = true;
        console.log("Database Supabase masih kosong. Melakukan inisialisasi data awal (seeding)...");
        await seedInitialDataToSupabase();
        isSeedingRef.current = false;
        return true;
      }

      if (dbWarga && dbWarga.length > 0) {
        setWargaList(
          dbWarga.map((w) => ({
            id: w.id,
            nik: w.nik,
            nama: w.nama,
            blok: w.blok || w.rt || "Blok A1",
            rt: w.rt || w.blok || "Blok A1",
            rw: w.rw || "RW 01",
            no_hp: w.no_hp || "",
            alamat: w.alamat || "",
            status_kk: w.status_kk || "Kepala Keluarga",
            status_iuran: w.status_iuran || "aktif",
            pekerjaan: w.pekerjaan || "",
            created_at: w.created_at,
          }))
        );
      }

      if (dbIuran) {
        setIuranList(
          dbIuran.map((i) => ({
            id: i.id,
            warga_id: i.warga_id,
            tahun: Number(i.tahun),
            bulan: Number(i.bulan),
            nominal: Number(i.nominal),
            status: i.status,
            tanggal_bayar: i.tanggal_bayar,
            metode_bayar: i.metode_bayar,
            catatan: i.catatan || "",
            dicatat_oleh: i.dicatat_oleh || "",
            kwitansi_no: i.kwitansi_no || "",
          }))
        );
      }

      if (dbTransaksi) {
        setTransaksiList(
          dbTransaksi.map((t) => ({
            id: t.id,
            tanggal: t.tanggal,
            tipe: t.tipe,
            kategori: t.kategori,
            nominal: Number(t.nominal),
            uraian: t.uraian,
            penanggung_jawab: t.penanggung_jawab,
            bukti_nota: t.bukti_nota,
            saldo_setelah: Number(t.saldo_setelah),
            created_at: t.created_at,
          }))
        );
      }

      if (dbKegiatan) {
        setKegiatanList(
          dbKegiatan.map((k) => ({
            id: k.id,
            nama_kegiatan: k.nama_kegiatan,
            tanggal: k.tanggal,
            waktu: k.waktu,
            lokasi: k.lokasi,
            kategori: k.kategori,
            deskripsi: k.deskripsi || "",
            penanggung_jawab: k.penanggung_jawab || "",
            status_kegiatan: k.status_kegiatan || "selesai",
          }))
        );
      }

      if (dbAbsensi) {
        setAbsensiList(
          dbAbsensi.map((a) => ({
            id: a.id,
            kegiatan_id: a.kegiatan_id,
            warga_id: a.warga_id,
            status: a.status,
            waktu_absen: a.waktu_absen || "",
            keterangan: a.keterangan || "",
          }))
        );
      }

      if (dbSettings) {
        setSettings((prev) => ({
          ...prev,
          nama_desa: dbSettings.nama_desa || prev.nama_desa,
          dusun: dbSettings.dusun || prev.dusun,
          rw: dbSettings.rw || prev.rw,
          kecamatan: dbSettings.kecamatan || prev.kecamatan,
          kabupaten: dbSettings.kabupaten || prev.kabupaten,
          provinsi: dbSettings.provinsi || prev.provinsi,
          kepala_desa: dbSettings.kepala_desa || prev.kepala_desa,
          bendahara: dbSettings.bendahara || prev.bendahara,
          sekretaris: dbSettings.sekretaris || prev.sekretaris,
          nominal_iuran_bulanan: Number(dbSettings.nominal_iuran_bulanan) || prev.nominal_iuran_bulanan,
          tahun_aktif: Number(dbSettings.tahun_aktif) || prev.tahun_aktif,
          blok_list: prev.blok_list || BLOK_OPTIONS,
          rt_list: prev.rt_list || BLOK_OPTIONS,
        }));
      }

      setIsSupabaseOnline(true);
      return true;
    } catch (err) {
      console.error("Gagal sinkronisasi data dari Supabase:", err);
      setIsSupabaseOnline(false);
      return false;
    }
  }, []);

  // Seed default data into Supabase if freshly created
  const seedInitialDataToSupabase = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      await supabase.from("pengaturan_desa").upsert({
        id: 1,
        nama_desa: initialSettings.nama_desa,
        dusun: initialSettings.dusun,
        rw: initialSettings.rw || "RW 01",
        kecamatan: initialSettings.kecamatan,
        kabupaten: initialSettings.kabupaten,
        provinsi: initialSettings.provinsi,
        kepala_desa: initialSettings.kepala_desa,
        bendahara: initialSettings.bendahara,
        sekretaris: initialSettings.sekretaris,
        nominal_iuran_bulanan: initialSettings.nominal_iuran_bulanan,
        tahun_aktif: initialSettings.tahun_aktif,
      });

      await supabase.from("warga").upsert(
        initialWarga.map((w) => ({
          id: w.id,
          nik: w.nik,
          nama: w.nama,
          blok: w.blok,
          rt: w.rt || w.blok,
          rw: w.rw || "RW 01",
          no_hp: w.no_hp,
          alamat: w.alamat,
          status_kk: w.status_kk,
          status_iuran: w.status_iuran,
          pekerjaan: w.pekerjaan,
        }))
      );

      await supabase.from("iuran_bulanan").upsert(
        initialIuran.map((i) => ({
          id: i.id,
          warga_id: i.warga_id,
          tahun: i.tahun,
          bulan: i.bulan,
          nominal: i.nominal,
          status: i.status,
          tanggal_bayar: i.tanggal_bayar,
          metode_bayar: i.metode_bayar,
          catatan: i.catatan,
          dicatat_oleh: i.dicatat_oleh,
          kwitansi_no: i.kwitansi_no,
        }))
      );

      await supabase.from("transaksi_kas").upsert(
        initialTransaksi.map((t) => ({
          id: t.id,
          tanggal: t.tanggal,
          tipe: t.tipe,
          kategori: t.kategori,
          nominal: t.nominal,
          uraian: t.uraian,
          penanggung_jawab: t.penanggung_jawab,
          saldo_setelah: t.saldo_setelah,
        }))
      );

      await supabase.from("kegiatan_desa").upsert(
        initialKegiatan.map((k) => ({
          id: k.id,
          nama_kegiatan: k.nama_kegiatan,
          tanggal: k.tanggal,
          waktu: k.waktu,
          lokasi: k.lokasi,
          kategori: k.kategori,
          deskripsi: k.deskripsi,
          penanggung_jawab: k.penanggung_jawab,
          status_kegiatan: k.status_kegiatan,
        }))
      );

      await supabase.from("absensi_kegiatan").upsert(
        initialAbsensi.map((a) => ({
          id: a.id,
          kegiatan_id: a.kegiatan_id,
          warga_id: a.warga_id,
          status: a.status,
          waktu_absen: a.waktu_absen,
          keterangan: a.keterangan,
        }))
      );

      setIsSupabaseOnline(true);
    } catch (e) {
      console.error("Gagal melakukan seeding data ke Supabase:", e);
    }
  };

  // Initialize from LocalStorage or Supabase
  useEffect(() => {
    setIsClient(true);
    try {
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) setSettings(JSON.parse(storedSettings));

      const storedWarga = localStorage.getItem(STORAGE_KEYS.WARGA);
      if (storedWarga) setWargaList(JSON.parse(storedWarga));

      const storedIuran = localStorage.getItem(STORAGE_KEYS.IURAN);
      if (storedIuran) setIuranList(JSON.parse(storedIuran));

      const storedTransaksi = localStorage.getItem(STORAGE_KEYS.TRANSAKSI);
      if (storedTransaksi) setTransaksiList(JSON.parse(storedTransaksi));

      const storedKegiatan = localStorage.getItem(STORAGE_KEYS.KEGIATAN);
      if (storedKegiatan) setKegiatanList(JSON.parse(storedKegiatan));

      const storedAbsensi = localStorage.getItem(STORAGE_KEYS.ABSENSI);
      if (storedAbsensi) setAbsensiList(JSON.parse(storedAbsensi));
    } catch (e) {
      console.warn("Error reading from localStorage:", e);
    }

    // Connect and load from Supabase if configured
    if (isSupabaseConfigured && supabase) {
      loadFromSupabase();

      // Subscribe to Realtime updates for multi-device live sync
      const channel = supabase
        .channel("kas-desa-realtime-channel")
        .on("postgres_changes", { event: "*", schema: "public", table: "warga" }, () => {
          loadFromSupabase();
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "iuran_bulanan" }, () => {
          loadFromSupabase();
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "transaksi_kas" }, () => {
          loadFromSupabase();
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "kegiatan_desa" }, () => {
          loadFromSupabase();
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "absensi_kegiatan" }, () => {
          loadFromSupabase();
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "pengaturan_desa" }, () => {
          loadFromSupabase();
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setIsSupabaseOnline(true);
          }
        });

      return () => {
        if (supabase) {
          supabase.removeChannel(channel);
        }
      };
    }
  }, [loadFromSupabase]);

  // Save to LocalStorage whenever state updates (offline cache)
  useEffect(() => {
    if (!isClient) return;
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings, isClient]);

  useEffect(() => {
    if (!isClient) return;
    try {
      localStorage.setItem(STORAGE_KEYS.WARGA, JSON.stringify(wargaList));
    } catch (e) {
      console.error(e);
    }
  }, [wargaList, isClient]);

  useEffect(() => {
    if (!isClient) return;
    try {
      localStorage.setItem(STORAGE_KEYS.IURAN, JSON.stringify(iuranList));
    } catch (e) {
      console.error(e);
    }
  }, [iuranList, isClient]);

  useEffect(() => {
    if (!isClient) return;
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSAKSI, JSON.stringify(transaksiList));
    } catch (e) {
      console.error(e);
    }
  }, [transaksiList, isClient]);

  useEffect(() => {
    if (!isClient) return;
    try {
      localStorage.setItem(STORAGE_KEYS.KEGIATAN, JSON.stringify(kegiatanList));
    } catch (e) {
      console.error(e);
    }
  }, [kegiatanList, isClient]);

  useEffect(() => {
    if (!isClient) return;
    try {
      localStorage.setItem(STORAGE_KEYS.ABSENSI, JSON.stringify(absensiList));
    } catch (e) {
      console.error(e);
    }
  }, [absensiList, isClient]);

  // Operations
  const updateSettings = async (newSettings: Partial<DesaSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("pengaturan_desa").upsert({
          id: 1,
          ...newSettings,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        console.error("Gagal menyimpan pengaturan ke Supabase:", e);
      }
    }
  };

  const addWarga = async (data: Omit<Warga, "id">) => {
    const id = `w-${Date.now().toString().slice(-4)}`;
    const newWarga: Warga = { ...data, id };
    setWargaList((prev) => [...prev, newWarga]);

    // Generate dues records for current active year
    const newDues: IuranBulanan[] = [];
    for (let b = 1; b <= 12; b++) {
      newDues.push({
        id: `iuran-${id}-${b}-${settings.tahun_aktif}`,
        warga_id: id,
        tahun: settings.tahun_aktif,
        bulan: b,
        nominal: settings.nominal_iuran_bulanan,
        status: data.status_iuran === "lansia" || data.status_iuran === "keringanan" ? "bebas" : "belum",
        tanggal_bayar: null,
        metode_bayar: null,
      });
    }
    setIuranList((prev) => [...prev, ...newDues]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("warga").insert({
          id: newWarga.id,
          nik: newWarga.nik,
          nama: newWarga.nama,
          blok: newWarga.blok,
          rt: newWarga.rt || newWarga.blok,
          rw: newWarga.rw || "RW 01",
          no_hp: newWarga.no_hp,
          alamat: newWarga.alamat,
          status_kk: newWarga.status_kk,
          status_iuran: newWarga.status_iuran,
          pekerjaan: newWarga.pekerjaan,
        });

        await supabase.from("iuran_bulanan").insert(
          newDues.map((i) => ({
            id: i.id,
            warga_id: i.warga_id,
            tahun: i.tahun,
            bulan: i.bulan,
            nominal: i.nominal,
            status: i.status,
            tanggal_bayar: i.tanggal_bayar,
            metode_bayar: i.metode_bayar,
          }))
        );
      } catch (e) {
        console.error("Gagal menyimpan warga ke Supabase:", e);
      }
    }
  };

  const updateWarga = async (id: string, updated: Partial<Warga>) => {
    setWargaList((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...updated } : w))
    );

    if (isSupabaseConfigured && supabase) {
      try {
        const payload: Record<string, unknown> = { ...updated };
        if (updated.blok) {
          payload.rt = updated.blok;
        }
        await supabase.from("warga").update(payload).eq("id", id);
      } catch (e) {
        console.error("Gagal mengupdate warga ke Supabase:", e);
      }
    }
  };

  const deleteWarga = async (id: string) => {
    setWargaList((prev) => prev.filter((w) => w.id !== id));
    setIuranList((prev) => prev.filter((i) => i.warga_id !== id));
    setAbsensiList((prev) => prev.filter((a) => a.warga_id !== id));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("warga").delete().eq("id", id);
      } catch (e) {
        console.error("Gagal menghapus warga dari Supabase:", e);
      }
    }
  };

  const updateIuranStatus = async ({
    wargaId,
    tahun,
    bulan,
    status,
    nominal,
    metodeBayar,
    tanggalBayar,
    catatan,
  }: {
    wargaId: string;
    tahun: number;
    bulan: number;
    status: StatusPembayaran;
    nominal?: number;
    metodeBayar?: MetodePembayaran | null;
    tanggalBayar?: string | null;
    catatan?: string;
  }) => {
    const warga = wargaList.find((w) => w.id === wargaId);
    const today = new Date().toISOString().split("T")[0];
    const isNowLunas = status === "lunas";

    let recordToSave: IuranBulanan | null = null;
    let newTxToSave: TransaksiKas | null = null;

    setIuranList((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.warga_id === wargaId && i.tahun === tahun && i.bulan === bulan
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        const old = updated[existingIdx];
        const wasLunas = old.status === "lunas";

        const rec: IuranBulanan = {
          ...old,
          status,
          nominal: nominal !== undefined ? nominal : old.nominal,
          tanggal_bayar: isNowLunas ? (tanggalBayar || old.tanggal_bayar || today) : null,
          metode_bayar: isNowLunas ? (metodeBayar || old.metode_bayar || "tunai") : null,
          catatan: catatan !== undefined ? catatan : old.catatan,
          dicatat_oleh: isNowLunas ? settings.bendahara : undefined,
          kwitansi_no: isNowLunas
            ? old.kwitansi_no || `KW-${tahun}-${String(bulan).padStart(2, "0")}-${wargaId.toUpperCase()}`
            : undefined,
        };
        updated[existingIdx] = rec;
        recordToSave = rec;

        if (isNowLunas && !wasLunas) {
          addTransaksi({
            tanggal: tanggalBayar || today,
            tipe: "pemasukan",
            kategori: "Iuran Bulanan",
            nominal: nominal || old.nominal,
            uraian: `Iuran Bulanan ${warga?.nama || "Warga"} - Bln ${bulan}/${tahun}`,
            penanggung_jawab: settings.bendahara,
          });
        }

        return updated;
      } else {
        const rec: IuranBulanan = {
          id: `iuran-${wargaId}-${bulan}-${tahun}`,
          warga_id: wargaId,
          tahun,
          bulan,
          nominal: nominal || settings.nominal_iuran_bulanan,
          status,
          tanggal_bayar: isNowLunas ? (tanggalBayar || today) : null,
          metode_bayar: isNowLunas ? (metodeBayar || "tunai") : null,
          catatan,
          dicatat_oleh: isNowLunas ? settings.bendahara : undefined,
          kwitansi_no: isNowLunas
            ? `KW-${tahun}-${String(bulan).padStart(2, "0")}-${wargaId.toUpperCase()}`
            : undefined,
        };
        recordToSave = rec;

        if (isNowLunas) {
          addTransaksi({
            tanggal: tanggalBayar || today,
            tipe: "pemasukan",
            kategori: "Iuran Bulanan",
            nominal: rec.nominal,
            uraian: `Iuran Bulanan ${warga?.nama || "Warga"} - Bln ${bulan}/${tahun}`,
            penanggung_jawab: settings.bendahara,
          });
        }

        return [...prev, rec];
      }
    });

    if (isSupabaseConfigured && supabase && recordToSave) {
      try {
        const rec = recordToSave as IuranBulanan;
        await supabase.from("iuran_bulanan").upsert({
          id: rec.id,
          warga_id: rec.warga_id,
          tahun: rec.tahun,
          bulan: rec.bulan,
          nominal: rec.nominal,
          status: rec.status,
          tanggal_bayar: rec.tanggal_bayar,
          metode_bayar: rec.metode_bayar,
          catatan: rec.catatan,
          dicatat_oleh: rec.dicatat_oleh,
          kwitansi_no: rec.kwitansi_no,
        });
      } catch (e) {
        console.error("Gagal mengupdate status iuran di Supabase:", e);
      }
    }
  };

  const addTransaksi = async (data: Omit<TransaksiKas, "id" | "saldo_setelah">) => {
    let newTx: TransaksiKas | null = null;
    setTransaksiList((prev) => {
      const currentSaldo = prev.reduce((acc, t) => {
        return t.tipe === "pemasukan" ? acc + t.nominal : acc - t.nominal;
      }, 0);

      const delta = data.tipe === "pemasukan" ? data.nominal : -data.nominal;
      const newSaldo = currentSaldo + delta;

      newTx = {
        ...data,
        id: `tx-${Date.now().toString().slice(-5)}`,
        saldo_setelah: newSaldo,
        created_at: new Date().toISOString(),
      };
      return [...prev, newTx];
    });

    if (isSupabaseConfigured && supabase && newTx) {
      try {
        await supabase.from("transaksi_kas").insert(newTx);
      } catch (e) {
        console.error("Gagal mencatat transaksi ke Supabase:", e);
      }
    }
  };

  const deleteTransaksi = async (id: string) => {
    setTransaksiList((prev) => prev.filter((t) => t.id !== id));
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("transaksi_kas").delete().eq("id", id);
      } catch (e) {
        console.error("Gagal menghapus transaksi dari Supabase:", e);
      }
    }
  };

  const addKegiatan = async (kg: Omit<KegiatanDesa, "id">) => {
    const id = `kg-${Date.now().toString().slice(-4)}`;
    const newKg: KegiatanDesa = { ...kg, id };
    setKegiatanList((prev) => [newKg, ...prev]);

    const initialAbs: AbsensiRecord[] = wargaList.map((w) => ({
      id: `ab-${id}-${w.id}`,
      kegiatan_id: id,
      warga_id: w.id,
      status: "hadir",
      waktu_absen: kg.waktu.split("-")[0]?.trim() || "19:30",
      keterangan: "",
    }));
    setAbsensiList((prev) => [...prev, ...initialAbs]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("kegiatan_desa").insert(newKg);
        await supabase.from("absensi_kegiatan").insert(initialAbs);
      } catch (e) {
        console.error("Gagal menambah kegiatan ke Supabase:", e);
      }
    }
  };

  const updateKegiatan = async (id: string, updated: Partial<KegiatanDesa>) => {
    setKegiatanList((prev) =>
      prev.map((k) => (k.id === id ? { ...k, ...updated } : k))
    );

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("kegiatan_desa").update(updated).eq("id", id);
      } catch (e) {
        console.error("Gagal mengupdate kegiatan di Supabase:", e);
      }
    }
  };

  const deleteKegiatan = async (id: string) => {
    setKegiatanList((prev) => prev.filter((k) => k.id !== id));
    setAbsensiList((prev) => prev.filter((a) => a.kegiatan_id !== id));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("kegiatan_desa").delete().eq("id", id);
      } catch (e) {
        console.error("Gagal menghapus kegiatan dari Supabase:", e);
      }
    }
  };

  const updateAbsensi = async (
    kegiatanId: string,
    wargaId: string,
    status: StatusKehadiran,
    keterangan?: string
  ) => {
    let recordToSave: AbsensiRecord | null = null;
    const currentTime = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setAbsensiList((prev) => {
      const idx = prev.findIndex(
        (a) => a.kegiatan_id === kegiatanId && a.warga_id === wargaId
      );

      if (idx >= 0) {
        const copy = [...prev];
        const rec = {
          ...copy[idx],
          status,
          waktu_absen: status === "alpa" ? "-" : (copy[idx].waktu_absen || currentTime),
          keterangan: keterangan !== undefined ? keterangan : copy[idx].keterangan,
        };
        copy[idx] = rec;
        recordToSave = rec;
        return copy;
      } else {
        const rec = {
          id: `ab-${kegiatanId}-${wargaId}`,
          kegiatan_id: kegiatanId,
          warga_id: wargaId,
          status,
          waktu_absen: status === "alpa" ? "-" : currentTime,
          keterangan: keterangan || "",
        };
        recordToSave = rec;
        return [...prev, rec];
      }
    });

    if (isSupabaseConfigured && supabase && recordToSave) {
      try {
        await supabase.from("absensi_kegiatan").upsert(recordToSave);
      } catch (e) {
        console.error("Gagal mengupdate absensi di Supabase:", e);
      }
    }
  };

  const batchSetAbsensi = async (kegiatanId: string, status: StatusKehadiran) => {
    setAbsensiList((prev) =>
      prev.map((a) => (a.kegiatan_id === kegiatanId ? { ...a, status } : a))
    );

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from("absensi_kegiatan")
          .update({ status })
          .eq("kegiatan_id", kegiatanId);
      } catch (e) {
        console.error("Gagal batch update absensi di Supabase:", e);
      }
    }
  };

  const resetToDefaultData = async () => {
    setSettings(initialSettings);
    setWargaList(initialWarga);
    setIuranList(initialIuran);
    setTransaksiList(initialTransaksi);
    setKegiatanList(initialKegiatan);
    setAbsensiList(initialAbsensi);
    try {
      localStorage.clear();
    } catch (e) {
      console.error(e);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        // Re-seed Supabase
        await seedInitialDataToSupabase();
      } catch (e) {
        console.error("Gagal reset data di Supabase:", e);
      }
    }
  };

  const syncWithSupabase = async () => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        message: "Supabase belum terhubung. Konfigurasikan NEXT_PUBLIC_SUPABASE_URL & ANON_KEY di Vercel atau .env.local.",
      };
    }

    setIsSyncing(true);
    try {
      await seedInitialDataToSupabase();
      await loadFromSupabase();
      setIsSupabaseOnline(true);
      return {
        success: true,
        message: "Sinkronisasi berhasil! Data tersimpan di Supabase Cloud & tersinkronkan.",
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `Gagal sinkronisasi: ${errorMsg}`,
      };
    } finally {
      setIsSyncing(false);
    }
  };

  // Calculations
  const totalPemasukan = transaksiList
    .filter((t) => t.tipe === "pemasukan")
    .reduce((sum, t) => sum + t.nominal, 0);

  const totalPengeluaran = transaksiList
    .filter((t) => t.tipe === "pengeluaran")
    .reduce((sum, t) => sum + t.nominal, 0);

  const totalKas = totalPemasukan - totalPengeluaran;

  const currentMonth = 11;
  const currentYear = settings.tahun_aktif;

  const pemasukanBulanIni = transaksiList
    .filter((t) => {
      const d = new Date(t.tanggal);
      return (
        t.tipe === "pemasukan" &&
        d.getMonth() + 1 === currentMonth &&
        d.getFullYear() === currentYear
      );
    })
    .reduce((sum, t) => sum + t.nominal, 0);

  const pengeluaranBulanIni = transaksiList
    .filter((t) => {
      const d = new Date(t.tanggal);
      return (
        t.tipe === "pengeluaran" &&
        d.getMonth() + 1 === currentMonth &&
        d.getFullYear() === currentYear
      );
    })
    .reduce((sum, t) => sum + t.nominal, 0);

  const activeWarga = wargaList.filter((w) => w.status_iuran === "aktif");
  const paidDuesThisMonth = iuranList.filter(
    (i) =>
      i.tahun === currentYear &&
      i.bulan === currentMonth &&
      i.status === "lunas"
  ).length;

  const iuranBulanIniPersen = activeWarga.length > 0
    ? Math.round((paidDuesThisMonth / activeWarga.length) * 100)
    : 0;

  const totalPresensiRecords = absensiList.length;
  const totalHadir = absensiList.filter((a) => a.status === "hadir").length;
  const tingkatKehadiranRataRata = totalPresensiRecords > 0
    ? Math.round((totalHadir / totalPresensiRecords) * 100)
    : 0;

  return (
    <StoreContext.Provider
      value={{
        settings,
        updateSettings,
        wargaList,
        addWarga,
        updateWarga,
        deleteWarga,
        iuranList,
        updateIuranStatus,
        transaksiList,
        addTransaksi,
        deleteTransaksi,
        kegiatanList,
        addKegiatan,
        updateKegiatan,
        deleteKegiatan,
        absensiList,
        updateAbsensi,
        batchSetAbsensi,
        isSupabaseOnline,
        isSyncing,
        syncWithSupabase,
        resetToDefaultData,
        totalKas,
        totalPemasukan,
        totalPengeluaran,
        pemasukanBulanIni,
        pengeluaranBulanIni,
        iuranBulanIniPersen,
        tingkatKehadiranRataRata,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
