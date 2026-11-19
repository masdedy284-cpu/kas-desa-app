"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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

  // Initialize from LocalStorage or Fallback
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

    // Check Supabase connection
    if (isSupabaseConfigured && supabase) {
      Promise.resolve(
        supabase.from("warga").select("count", { count: "exact", head: true })
      )
        .then(({ error }) => {
          if (!error) setIsSupabaseOnline(true);
        })
        .catch(() => setIsSupabaseOnline(false));
    }
  }, []);

  // Save to LocalStorage whenever state updates
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
  const updateSettings = (newSettings: Partial<DesaSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const addWarga = (data: Omit<Warga, "id">) => {
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
  };

  const updateWarga = (id: string, updated: Partial<Warga>) => {
    setWargaList((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...updated } : w))
    );
  };

  const deleteWarga = (id: string) => {
    setWargaList((prev) => prev.filter((w) => w.id !== id));
    setIuranList((prev) => prev.filter((i) => i.warga_id !== id));
    setAbsensiList((prev) => prev.filter((a) => a.warga_id !== id));
  };

  const updateIuranStatus = ({
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
    setIuranList((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.warga_id === wargaId && i.tahun === tahun && i.bulan === bulan
      );

      const warga = wargaList.find((w) => w.id === wargaId);
      const today = new Date().toISOString().split("T")[0];

      if (existingIdx >= 0) {
        const updated = [...prev];
        const old = updated[existingIdx];
        const isNowLunas = status === "lunas";
        const wasLunas = old.status === "lunas";

        updated[existingIdx] = {
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

        // If newly marked as lunas, optionally log transaction to general cash
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
        const isNowLunas = status === "lunas";
        const newRecord: IuranBulanan = {
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

        if (isNowLunas) {
          addTransaksi({
            tanggal: tanggalBayar || today,
            tipe: "pemasukan",
            kategori: "Iuran Bulanan",
            nominal: newRecord.nominal,
            uraian: `Iuran Bulanan ${warga?.nama || "Warga"} - Bln ${bulan}/${tahun}`,
            penanggung_jawab: settings.bendahara,
          });
        }

        return [...prev, newRecord];
      }
    });
  };

  const addTransaksi = (data: Omit<TransaksiKas, "id" | "saldo_setelah">) => {
    setTransaksiList((prev) => {
      // Calculate new running balance
      const currentSaldo = prev.reduce((acc, t) => {
        return t.tipe === "pemasukan" ? acc + t.nominal : acc - t.nominal;
      }, 0);

      const delta = data.tipe === "pemasukan" ? data.nominal : -data.nominal;
      const newSaldo = currentSaldo + delta;

      const newTx: TransaksiKas = {
        ...data,
        id: `tx-${Date.now().toString().slice(-5)}`,
        saldo_setelah: newSaldo,
        created_at: new Date().toISOString(),
      };
      return [...prev, newTx];
    });
  };

  const deleteTransaksi = (id: string) => {
    setTransaksiList((prev) => prev.filter((t) => t.id !== id));
  };

  const addKegiatan = (kg: Omit<KegiatanDesa, "id">) => {
    const id = `kg-${Date.now().toString().slice(-4)}`;
    const newKg: KegiatanDesa = { ...kg, id };
    setKegiatanList((prev) => [newKg, ...prev]);

    // Pre-populate absensi list with default entries for active residents
    const initialAbs: AbsensiRecord[] = wargaList.map((w) => ({
      id: `ab-${id}-${w.id}`,
      kegiatan_id: id,
      warga_id: w.id,
      status: "hadir",
      waktu_absen: kg.waktu.split("-")[0]?.trim() || "19:30",
      keterangan: "",
    }));
    setAbsensiList((prev) => [...prev, ...initialAbs]);
  };

  const updateKegiatan = (id: string, updated: Partial<KegiatanDesa>) => {
    setKegiatanList((prev) =>
      prev.map((k) => (k.id === id ? { ...k, ...updated } : k))
    );
  };

  const deleteKegiatan = (id: string) => {
    setKegiatanList((prev) => prev.filter((k) => k.id !== id));
    setAbsensiList((prev) => prev.filter((a) => a.kegiatan_id !== id));
  };

  const updateAbsensi = (
    kegiatanId: string,
    wargaId: string,
    status: StatusKehadiran,
    keterangan?: string
  ) => {
    setAbsensiList((prev) => {
      const idx = prev.findIndex(
        (a) => a.kegiatan_id === kegiatanId && a.warga_id === wargaId
      );
      const currentTime = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });

      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          status,
          waktu_absen: status === "alpa" ? "-" : (copy[idx].waktu_absen || currentTime),
          keterangan: keterangan !== undefined ? keterangan : copy[idx].keterangan,
        };
        return copy;
      } else {
        return [
          ...prev,
          {
            id: `ab-${kegiatanId}-${wargaId}`,
            kegiatan_id: kegiatanId,
            warga_id: wargaId,
            status,
            waktu_absen: status === "alpa" ? "-" : currentTime,
            keterangan: keterangan || "",
          },
        ];
      }
    });
  };

  const batchSetAbsensi = (kegiatanId: string, status: StatusKehadiran) => {
    setAbsensiList((prev) =>
      prev.map((a) => (a.kegiatan_id === kegiatanId ? { ...a, status } : a))
    );
  };

  const resetToDefaultData = () => {
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
  };

  const syncWithSupabase = async () => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        message: "Supabase belum dikonfigurasi. Atur NEXT_PUBLIC_SUPABASE_URL & KEY di file .env.local",
      };
    }

    setIsSyncing(true);
    try {
      // Sync warga
      const { error: wargaErr } = await supabase.from("warga").upsert(
        wargaList.map((w) => ({
          id: w.id,
          nik: w.nik,
          nama: w.nama,
          rt: w.rt,
          rw: w.rw,
          no_hp: w.no_hp,
          alamat: w.alamat,
          status_kk: w.status_kk,
          status_iuran: w.status_iuran,
          pekerjaan: w.pekerjaan,
        }))
      );
      if (wargaErr) throw wargaErr;

      // Sync iuran
      const { error: iuranErr } = await supabase.from("iuran_bulanan").upsert(
        iuranList.map((i) => ({
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
      if (iuranErr) throw iuranErr;

      setIsSupabaseOnline(true);
      return {
        success: true,
        message: "Sinkronisasi berhasil! Data tersimpan di Supabase Cloud.",
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

  // Current month stats (Bulan 11 / November 2026)
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

  // Dues percentage for current month
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

  // Average attendance rate
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
