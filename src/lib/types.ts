export type StatusIuranWarga = "aktif" | "keringanan" | "pindah" | "lansia";

export interface Warga {
  id: string;
  nik: string;
  nama: string;
  blok: string;
  rt?: string; // backwards compatibility alias for blok
  rw?: string;
  no_hp: string;
  alamat: string;
  status_kk: "Kepala Keluarga" | "Anggota Keluarga";
  status_iuran: StatusIuranWarga;
  pekerjaan?: string;
  created_at?: string;
}

export type StatusPembayaran = "lunas" | "belum" | "bebas";
export type MetodePembayaran = "tunai" | "transfer" | "qris";

export interface IuranBulanan {
  id: string;
  warga_id: string;
  tahun: number;
  bulan: number; // 1 - 12
  nominal: number;
  status: StatusPembayaran;
  tanggal_bayar: string | null;
  metode_bayar: MetodePembayaran | null;
  catatan?: string;
  dicatat_oleh?: string;
  kwitansi_no?: string;
}

export type TipeTransaksi = "pemasukan" | "pengeluaran";

export interface TransaksiKas {
  id: string;
  tanggal: string;
  tipe: TipeTransaksi;
  kategori: string;
  nominal: number;
  uraian: string;
  penanggung_jawab: string;
  bukti_nota?: string;
  saldo_setelah?: number;
  created_at?: string;
}

export type KategoriKegiatan = "musyawarah" | "gotong_royong" | "ronda" | "posyandu" | "keagamaan" | "lainnya";

export interface KegiatanDesa {
  id: string;
  nama_kegiatan: string;
  tanggal: string;
  waktu: string;
  lokasi: string;
  kategori: KategoriKegiatan;
  deskripsi: string;
  penanggung_jawab: string;
  status_kegiatan: "selesai" | "berlangsung" | "mendatang";
}

export type StatusKehadiran = "hadir" | "izin" | "sakit" | "alpa";

export interface AbsensiRecord {
  id: string;
  kegiatan_id: string;
  warga_id: string;
  status: StatusKehadiran;
  waktu_absen: string;
  keterangan?: string;
}

export interface DesaSettings {
  nama_desa: string;
  dusun: string;
  rw?: string;
  blok_list: string[];
  rt_list: string[]; // alias
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kepala_desa: string;
  bendahara: string;
  sekretaris: string;
  nominal_iuran_bulanan: number;
  tahun_aktif: number;
}
