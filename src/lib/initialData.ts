import { Warga, IuranBulanan, TransaksiKas, KegiatanDesa, AbsensiRecord, DesaSettings } from "./types";

export const BLOK_OPTIONS = [
  "Blok A1",
  "Blok B1",
  "Blok C1",
  "Blok D1",
  "Blok E1",
  "Blok F1",
  "Blok A2",
  "Blok B2",
  "Blok C2",
  "Blok D2",
];

export const initialSettings: DesaSettings = {
  nama_desa: "Villa Danupayan Permai",
  dusun: "Villa Danupayan Permai",
  rw: "RW 01",
  blok_list: BLOK_OPTIONS,
  rt_list: BLOK_OPTIONS,
  kecamatan: "Kecamatan Bulu",
  kabupaten: "Kabupaten Temanggung",
  provinsi: "Jawa Tengah",
  kepala_desa: "Drs. H. Mulyono",
  bendahara: "Ahmad Fauzi, S.E.",
  sekretaris: "Dian Wahyuni, S.Kom",
  nominal_iuran_bulanan: 35000,
  tahun_aktif: 2026,
};

export const initialWarga: Warga[] = [
  {
    id: "w-01",
    nik: "3323011504820001",
    nama: "Pak Joko Sutrisno",
    blok: "Blok A1",
    rt: "Blok A1",
    no_hp: "0812-3456-7890",
    alamat: "Villa Danupayan Permai Blok A1 No. 01",
    status_kk: "Kepala Keluarga",
    status_iuran: "aktif",
    pekerjaan: "PNS / Guru",
  },
  {
    id: "w-02",
    nik: "3323012209790002",
    nama: "Pak Budi Prasetyo",
    blok: "Blok A1",
    rt: "Blok A1",
    no_hp: "0813-9876-5432",
    alamat: "Villa Danupayan Permai Blok A1 No. 04",
    status_kk: "Kepala Keluarga",
    status_iuran: "aktif",
    pekerjaan: "Wiraswasta",
  },
  {
    id: "w-03",
    nik: "3323010311750003",
    nama: "Pak Slamet Riyadi",
    blok: "Blok B1",
    rt: "Blok B1",
    no_hp: "0857-1234-5678",
    alamat: "Villa Danupayan Permai Blok B1 No. 02",
    status_kk: "Kepala Keluarga",
    status_iuran: "aktif",
    pekerjaan: "Karyawan Swasta",
  },
  {
    id: "w-04",
    nik: "3323011802880004",
    nama: "H. Ridwan Kamiludin",
    blok: "Blok C1",
    rt: "Blok C1",
    no_hp: "0821-4455-6677",
    alamat: "Villa Danupayan Permai Blok C1 No. 07",
    status_kk: "Kepala Keluarga",
    status_iuran: "aktif",
    pekerjaan: "Pengusaha",
  },
  {
    id: "w-05",
    nik: "3323012906800005",
    nama: "Pak Agus Hermawan",
    blok: "Blok D1",
    rt: "Blok D1",
    no_hp: "0878-3322-1100",
    alamat: "Villa Danupayan Permai Blok D1 No. 03",
    status_kk: "Kepala Keluarga",
    status_iuran: "aktif",
    pekerjaan: "Arsitek",
  },
  {
    id: "w-06",
    nik: "3323011210850006",
    nama: "Mbah Sumo (Sesepuh Perumahan)",
    blok: "Blok E1",
    rt: "Blok E1",
    no_hp: "0852-9988-7711",
    alamat: "Villa Danupayan Permai Blok E1 No. 10",
    status_kk: "Kepala Keluarga",
    status_iuran: "lansia",
    pekerjaan: "Pensiunan",
  },
  {
    id: "w-07",
    nik: "3323011403910007",
    nama: "Pak Hendra Kurniawan",
    blok: "Blok F1",
    rt: "Blok F1",
    no_hp: "0819-7766-5544",
    alamat: "Villa Danupayan Permai Blok F1 No. 05",
    status_kk: "Kepala Keluarga",
    status_iuran: "aktif",
    pekerjaan: "Teknisi IT",
  },
  {
    id: "w-08",
    nik: "3323012808840008",
    nama: "Pak Supriadi Wardoyo",
    blok: "Blok A2",
    rt: "Blok A2",
    no_hp: "0812-8877-6655",
    alamat: "Villa Danupayan Permai Blok A2 No. 06",
    status_kk: "Kepala Keluarga",
    status_iuran: "aktif",
    pekerjaan: "Wiraswasta",
  },
  {
    id: "w-09",
    nik: "3323011905780009",
    nama: "Pak Totok Sugiyanto",
    blok: "Blok B2",
    rt: "Blok B2",
    no_hp: "0858-6655-4433",
    alamat: "Villa Danupayan Permai Blok B2 No. 08",
    status_kk: "Kepala Keluarga",
    status_iuran: "aktif",
    pekerjaan: "Supervisor",
  },
  {
    id: "w-10",
    nik: "3323011112830010",
    nama: "Pak Dedi Mulyono",
    blok: "Blok C2",
    rt: "Blok C2",
    no_hp: "0813-2233-4455",
    alamat: "Villa Danupayan Permai Blok C2 No. 02",
    status_kk: "Kepala Keluarga",
    status_iuran: "aktif",
    pekerjaan: "Konsultan",
  },
  {
    id: "w-11",
    nik: "3323010507900011",
    nama: "Ibu Siti Rohmah (Dhuafa)",
    blok: "Blok D2",
    rt: "Blok D2",
    no_hp: "0877-1122-3344",
    alamat: "Villa Danupayan Permai Blok D2 No. 12",
    status_kk: "Kepala Keluarga",
    status_iuran: "keringanan",
    pekerjaan: "Pedagang Rumahan",
  },
  {
    id: "w-12",
    nik: "3323011709860012",
    nama: "Pak Yanto Sugito",
    blok: "Blok B1",
    rt: "Blok B1",
    no_hp: "0853-4433-2211",
    alamat: "Villa Danupayan Permai Blok B1 No. 09",
    status_kk: "Kepala Keluarga",
    status_iuran: "aktif",
    pekerjaan: "Driver Eksekutif",
  },
  {
    id: "w-13",
    nik: "3323012501810013",
    nama: "Pak Rudi Hartono",
    blok: "Blok C1",
    rt: "Blok C1",
    no_hp: "0812-7788-9900",
    alamat: "Villa Danupayan Permai Blok C1 No. 11",
    status_kk: "Kepala Keluarga",
    status_iuran: "aktif",
    pekerjaan: "Kontraktor",
  },
  {
    id: "w-14",
    nik: "3323010811870014",
    nama: "Pak Wahyu Hidayat",
    blok: "Blok E1",
    rt: "Blok E1",
    no_hp: "0815-6677-8899",
    alamat: "Villa Danupayan Permai Blok E1 No. 04",
    status_kk: "Kepala Keluarga",
    status_iuran: "aktif",
    pekerjaan: "Perangkat Lingkungan",
  },
  {
    id: "w-15",
    nik: "3323011404930015",
    nama: "Pak Arif Setiawan",
    blok: "Blok A2",
    rt: "Blok A2",
    no_hp: "0823-1122-4466",
    alamat: "Villa Danupayan Permai Blok A2 No. 15",
    status_kk: "Kepala Keluarga",
    status_iuran: "aktif",
    pekerjaan: "Pegawai BUMN",
  },
];

// Generate initial dues records for 2026
export const initialIuran: IuranBulanan[] = [];

initialWarga.forEach((w) => {
  for (let bulan = 1; bulan <= 12; bulan++) {
    let status: "lunas" | "belum" | "bebas" = "belum";
    let tanggal_bayar: string | null = null;
    let metode_bayar: "tunai" | "transfer" | "qris" | null = null;
    let kwitansi_no: string | undefined = undefined;

    if (w.status_iuran === "lansia" || w.status_iuran === "keringanan") {
      status = "bebas";
    } else {
      if (bulan <= 10) {
        const isPaid = (parseInt(w.id.replace("w-", "")) + bulan) % 7 !== 0;
        if (isPaid) {
          status = "lunas";
          const day = Math.min(28, (parseInt(w.id.replace("w-", "")) * 3) % 25 + 1);
          tanggal_bayar = `2026-${String(bulan).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          metode_bayar = bulan % 3 === 0 ? "qris" : bulan % 2 === 0 ? "transfer" : "tunai";
          kwitansi_no = `KW-VDP-2026-${String(bulan).padStart(2, "0")}-${w.id.toUpperCase()}`;
        }
      } else if (bulan === 11) {
        const isPaid = (parseInt(w.id.replace("w-", "")) % 2) === 1;
        if (isPaid) {
          status = "lunas";
          tanggal_bayar = `2026-11-05`;
          metode_bayar = "qris";
          kwitansi_no = `KW-VDP-2026-11-${w.id.toUpperCase()}`;
        }
      }
    }

    initialIuran.push({
      id: `iuran-${w.id}-${bulan}-2026`,
      warga_id: w.id,
      tahun: 2026,
      bulan,
      nominal: 35000,
      status,
      tanggal_bayar,
      metode_bayar,
      catatan: status === "lunas" ? "Lunas iuran pemeliharaan lingkungan" : status === "bebas" ? "Bebas iuran sosial" : undefined,
      dicatat_oleh: status === "lunas" ? "Ahmad Fauzi (Bendahara)" : undefined,
      kwitansi_no,
    });
  }
});

export const initialTransaksi: TransaksiKas[] = [
  {
    id: "tx-01",
    tanggal: "2026-01-05",
    tipe: "pemasukan",
    kategori: "Saldo Awal",
    nominal: 18500000,
    uraian: "Saldo kas pembukuan tahun 2025 Villa Danupayan Permai",
    penanggung_jawab: "Ahmad Fauzi (Bendahara)",
    saldo_setelah: 18500000,
  },
  {
    id: "tx-02",
    tanggal: "2026-01-20",
    tipe: "pemasukan",
    kategori: "Iuran Bulanan",
    nominal: 455000,
    uraian: "Penerimaan iuran warga bulan Januari 2026 (13 KK)",
    penanggung_jawab: "Ahmad Fauzi (Bendahara)",
    saldo_setelah: 18955000,
  },
  {
    id: "tx-03",
    tanggal: "2026-02-14",
    tipe: "pengeluaran",
    kategori: "Santunan Kematian",
    nominal: 1000000,
    uraian: "Santunan duka cita keluarga warga Blok C1",
    penanggung_jawab: "Drs. H. Mulyono",
    saldo_setelah: 17955000,
  },
  {
    id: "tx-04",
    tanggal: "2026-03-10",
    tipe: "pemasukan",
    kategori: "Donasi / Sumbangan",
    nominal: 2500000,
    uraian: "Sumbangan sukarela donatur H. Ridwan untuk kas sosial perumahan",
    penanggung_jawab: "Ahmad Fauzi (Bendahara)",
    saldo_setelah: 20455000,
  },
  {
    id: "tx-05",
    tanggal: "2026-04-18",
    tipe: "pengeluaran",
    kategori: "Bantuan Warga Sakit",
    nominal: 500000,
    uraian: "Bantuan pengobatan rawat inap warga Blok A1",
    penanggung_jawab: "Ahmad Fauzi (Bendahara)",
    saldo_setelah: 19955000,
  },
  {
    id: "tx-06",
    tanggal: "2026-06-25",
    tipe: "pengeluaran",
    kategori: "Kerja Bakti & Fasum",
    nominal: 1250000,
    uraian: "Perbaikan portal gerbang utama, penerangan jalan Blok B1-F1, dan konsumsi",
    penanggung_jawab: "Pak Rudi Hartono",
    saldo_setelah: 18705000,
  },
  {
    id: "tx-07",
    tanggal: "2026-08-17",
    tipe: "pengeluaran",
    kategori: "Kegiatan Warga",
    nominal: 1500000,
    uraian: "Bantuan perlombaan & tasyakuran HUT RI warga Villa Danupayan Permai",
    penanggung_jawab: "Dian Wahyuni",
    saldo_setelah: 17205000,
  },
  {
    id: "tx-08",
    tanggal: "2026-10-15",
    tipe: "pemasukan",
    kategori: "Dana Bantuan Sosial",
    nominal: 3000000,
    uraian: "Alokasi dana bantuan sosial kemitraan lingkungan",
    penanggung_jawab: "Ahmad Fauzi (Bendahara)",
    saldo_setelah: 20205000,
  },
  {
    id: "tx-09",
    tanggal: "2026-11-02",
    tipe: "pemasukan",
    kategori: "Iuran Bulanan",
    nominal: 490000,
    uraian: "Penerimaan iuran warga bulan November 2026 (Tahap 1)",
    penanggung_jawab: "Ahmad Fauzi (Bendahara)",
    saldo_setelah: 20695000,
  },
  {
    id: "tx-10",
    tanggal: "2026-11-10",
    tipe: "pengeluaran",
    kategori: "Konsumsi & Musyawarah",
    nominal: 400000,
    uraian: "Snack & minuman rapat evaluasi keamanan dan iuran warga",
    penanggung_jawab: "Dian Wahyuni",
    saldo_setelah: 20295000,
  },
];

export const initialKegiatan: KegiatanDesa[] = [
  {
    id: "kg-01",
    nama_kegiatan: "Musyawarah Warga Villa Danupayan Permai (Evaluasi Iuran & Keamanan)",
    tanggal: "2026-11-08",
    waktu: "19:30 - 22:00 WIB",
    lokasi: "Balai Pertemuan Warga Villa Danupayan Permai",
    kategori: "musyawarah",
    deskripsi: "Pembahasan perbaikan drainase Blok A1-F1 dan penguatan sistem keamanan pos ronda.",
    penanggung_jawab: "Drs. H. Mulyono",
    status_kegiatan: "selesai",
  },
  {
    id: "kg-02",
    nama_kegiatan: "Kerja Bakti Bersih Lingkungan & Fogging Nyamuk",
    tanggal: "2026-11-01",
    waktu: "07:00 - 10:30 WIB",
    lokasi: "Taman Utama & Saluran Drainase Blok A1 s/d D2",
    kategori: "gotong_royong",
    deskripsi: "Pembersihan saluran air, perapian taman fasum, dan fogging antisipasi DBD.",
    penanggung_jawab: "Pak Rudi Hartono",
    status_kegiatan: "selesai",
  },
  {
    id: "kg-03",
    nama_kegiatan: "Ronda Malam Keamanan Lingkungan Blok A1-F1 & A2-D2",
    tanggal: "2026-11-12",
    waktu: "22:00 - 04:00 WIB",
    lokasi: "Pos Keamanan Utama Gerbang Villa Danupayan Permai",
    kategori: "ronda",
    deskripsi: "Patroli keamanan lingkungan malam akhir pekan.",
    penanggung_jawab: "Pak Supriadi Wardoyo",
    status_kegiatan: "selesai",
  },
  {
    id: "kg-04",
    nama_kegiatan: "Rapat Pertanggungjawaban Keuangan Akhir Tahun",
    tanggal: "2026-11-28",
    waktu: "19:45 - 22:00 WIB",
    lokasi: "Balai Warga Villa Danupayan Permai",
    kategori: "musyawarah",
    deskripsi: "Penyampaian LPJ Administrasi Keuangan & perumusan program kas warga tahun mendatang.",
    penanggung_jawab: "Ahmad Fauzi (Bendahara)",
    status_kegiatan: "mendatang",
  },
];

export const initialAbsensi: AbsensiRecord[] = [
  // Absensi kg-01
  { id: "ab-01", kegiatan_id: "kg-01", warga_id: "w-01", status: "hadir", waktu_absen: "19:25", keterangan: "Tepat waktu" },
  { id: "ab-02", kegiatan_id: "kg-01", warga_id: "w-02", status: "hadir", waktu_absen: "19:30", keterangan: "" },
  { id: "ab-03", kegiatan_id: "kg-01", warga_id: "w-03", status: "hadir", waktu_absen: "19:35", keterangan: "" },
  { id: "ab-04", kegiatan_id: "kg-01", warga_id: "w-04", status: "hadir", waktu_absen: "19:20", keterangan: "" },
  { id: "ab-05", kegiatan_id: "kg-01", warga_id: "w-05", status: "izin", waktu_absen: "18:00", keterangan: "Dinas luar kota" },
  { id: "ab-06", kegiatan_id: "kg-01", warga_id: "w-06", status: "izin", waktu_absen: "17:30", keterangan: "Kurang sehat / lansia" },
  { id: "ab-07", kegiatan_id: "kg-01", warga_id: "w-07", status: "hadir", waktu_absen: "19:28", keterangan: "" },
  { id: "ab-08", kegiatan_id: "kg-01", warga_id: "w-08", status: "hadir", waktu_absen: "19:32", keterangan: "" },
  { id: "ab-09", kegiatan_id: "kg-01", warga_id: "w-09", status: "hadir", waktu_absen: "19:40", keterangan: "" },
  { id: "ab-10", kegiatan_id: "kg-01", warga_id: "w-10", status: "hadir", waktu_absen: "19:30", keterangan: "" },
  { id: "ab-11", kegiatan_id: "kg-01", warga_id: "w-11", status: "sakit", waktu_absen: "16:00", keterangan: "Demam" },
  { id: "ab-12", kegiatan_id: "kg-01", warga_id: "w-12", status: "alpa", waktu_absen: "-", keterangan: "Tanpa kabar" },
  { id: "ab-13", kegiatan_id: "kg-01", warga_id: "w-13", status: "hadir", waktu_absen: "19:15", keterangan: "" },
  { id: "ab-14", kegiatan_id: "kg-01", warga_id: "w-14", status: "hadir", waktu_absen: "19:20", keterangan: "" },
  { id: "ab-15", kegiatan_id: "kg-01", warga_id: "w-15", status: "hadir", waktu_absen: "19:35", keterangan: "" },

  // Absensi kg-02
  { id: "ab-16", kegiatan_id: "kg-02", warga_id: "w-01", status: "hadir", waktu_absen: "06:55", keterangan: "Membawa alat kerja" },
  { id: "ab-17", kegiatan_id: "kg-02", warga_id: "w-02", status: "hadir", waktu_absen: "07:05", keterangan: "" },
  { id: "ab-18", kegiatan_id: "kg-02", warga_id: "w-03", status: "hadir", waktu_absen: "06:50", keterangan: "" },
  { id: "ab-19", kegiatan_id: "kg-02", warga_id: "w-04", status: "hadir", waktu_absen: "07:00", keterangan: "" },
  { id: "ab-20", kegiatan_id: "kg-02", warga_id: "w-05", status: "hadir", waktu_absen: "07:10", keterangan: "" },
  { id: "ab-21", kegiatan_id: "kg-02", warga_id: "w-07", status: "hadir", waktu_absen: "07:00", keterangan: "" },
  { id: "ab-22", kegiatan_id: "kg-02", warga_id: "w-08", status: "hadir", waktu_absen: "06:45", keterangan: "" },
  { id: "ab-23", kegiatan_id: "kg-02", warga_id: "w-10", status: "hadir", waktu_absen: "07:00", keterangan: "" },
  { id: "ab-24", kegiatan_id: "kg-02", warga_id: "w-12", status: "hadir", waktu_absen: "07:15", keterangan: "" },
  { id: "ab-25", kegiatan_id: "kg-02", warga_id: "w-13", status: "hadir", waktu_absen: "06:55", keterangan: "" },
  { id: "ab-26", kegiatan_id: "kg-02", warga_id: "w-14", status: "hadir", waktu_absen: "07:00", keterangan: "" },
  { id: "ab-27", kegiatan_id: "kg-02", warga_id: "w-15", status: "hadir", waktu_absen: "07:05", keterangan: "" },
];
