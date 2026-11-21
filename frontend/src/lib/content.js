// Konten statis dari desain figcraft (halaman Panduan & Landing).
// Backend belum menyediakan endpoint daftar panduan; sumber resminya BNPB.

export const GUIDES = [
  {
    id: 'banjir',
    nama: 'Banjir',
    jenis: 'BANJIR',
    fase: {
      sebelum: [
        { judul: 'Kenali jalur evakuasi dan titik kumpul terdekat', detail: 'Catat jarak dan waktu tempuh dari rumah ke titik kumpul terdekat.' },
        { judul: 'Siapkan tas siaga untuk setiap anggota', detail: 'Termasuk obat rutin untuk lansia dan perlengkapan bayi bila ada.' },
        { judul: 'Pantau prakiraan BMKG secara berkala', detail: 'Aktifkan notifikasi cuaca ekstrem di aplikasi SiagaKeluarga.' },
      ],
      saat: [
        { judul: 'Matikan listrik dan menuju titik kumpul', detail: 'Cabut peralatan elektronik dan tutup sumber gas untuk mencegah korsleting.' },
        { judul: 'Menuju titik kumpul lewat jalur tertinggi', detail: 'Hindari melewati arus deras atau genangan yang dalam.' },
      ],
      sesudah: [
        { judul: 'Periksa listrik dan bersihkan rumah dengan aman', detail: 'Pastikan instalasi listrik kering sebelum menyalakan MCB dan periksa sumber air bersih.' },
      ],
    },
    siapkan: ['Senter dan baterai cadangan', 'Air minum 3 liter per orang', 'Obat rutin dan dokumen penting', 'Ponsel dan power bank terisi penuh'],
    hindari: 'Jangan menerobos arus deras (lebih dari 30 cm) dan jauhi tiang listrik yang tergenang.',
  },
  {
    id: 'gempa',
    nama: 'Gempa',
    jenis: 'GEMPA',
    fase: {
      sebelum: [{ judul: 'Amankan perabot berat ke dinding', detail: 'Lemari dan rak tinggi yang tidak terikat mudah roboh saat guncangan.' }],
      saat: [{ judul: 'Berlindung di bawah meja kokoh', detail: 'Lindungi kepala dan leher, lalu tunggu guncangan berhenti sebelum keluar.' }],
      sesudah: [],
    },
    siapkan: ['Kotak P3K lengkap', 'Radio baterai', 'Air minum kemasan dan biskuit energi'],
    hindari: 'Jangan menggunakan lift dan jangan berlari keluar saat guncangan masih berlangsung.',
  },
  {
    id: 'longsor',
    nama: 'Longsor',
    jenis: 'LONGSOR',
    fase: {
      sebelum: [{ judul: 'Kenali tanda retakan tanah di sekitar rumah', detail: 'Perhatikan retakan di tanah, dinding, atau pohon yang miring di lereng.' }],
      saat: [{ judul: 'Jauhi lereng dan menuju tempat lebih tinggi', detail: 'Gerakkan keluarga menjauh dari aliran air dan material tanah.' }],
      sesudah: [],
    },
    siapkan: ['Peluit darurat dan senter kepala', 'Sepatu bot karet', 'Masker debu N95'],
    hindari: 'Jangan kembali ke rumah di lereng sebelum petugas menyatakan aman.',
  },
  {
    id: 'cuaca-ekstrem',
    nama: 'Cuaca ekstrem',
    jenis: 'CUACA_EKSTREM',
    fase: {
      sebelum: [{ judul: 'Pantau prakiraan BMKG tiap 3 jam', detail: 'Siapkan jas hujan, terpal, dan sepatu bot sebelum hujan lebat datang.' }],
      saat: [],
      sesudah: [{ judul: 'Periksa kondisi rumah dan laporkan kerusakan', detail: 'Foto kerusakan untuk laporan dan klaim bantuan.' }],
    },
    siapkan: ['Jas hujan dan sepatu bot', 'Terpal plastik kedap air', 'Obat alergi'],
    hindari: 'Hindari berteduh di bawah pohon besar atau papan reklame saat angin kencang.',
  },
];

export const KONTAK_DARURAT = [
  { nama: 'Darurat Nasional', nomor: '112', catatan: 'Semua jenis darurat' },
  { nama: 'BNPB', nomor: '117', catatan: 'Informasi kebencanaan nasional' },
  { nama: 'SAR', nomor: '115', catatan: 'Pencarian dan pertolongan' },
  { nama: 'Ambulans', nomor: '118 / 119', catatan: 'Layanan medis darurat' },
];

export const SKENARIO_LATIHAN = [
  { jenis: 'BANJIR', judul: 'Banjir malam hari', ringkas: 'Air masuk halaman saat malam. Lansia di rumah sedang tidur.' },
  { jenis: 'GEMPA', judul: 'Gempa saat di sekolah', ringkas: 'Guncangan kuat terjadi ketika anak berada di kelas.' },
  { jenis: 'LONGSOR', judul: 'Longsor setelah hujan deras', ringkas: 'Retakan tanah muncul di belakang rumah.' },
  { jenis: 'CUACA_EKSTREM', judul: 'Cuaca ekstrem di jalan pulang', ringkas: 'Angin kencang dan hujan deras saat perjalanan pulang.' },
];

export const FAQ = [
  { q: 'Apakah SiagaKeluarga gratis dipakai?', a: 'Ya. Menyusun profil keluarga dan rencana darurat dasar tidak dipungut biaya.' },
  { q: 'Apakah data keluarga saya aman?', a: 'Data disimpan di server dan hanya bisa diakses oleh akunmu. Kartu darurat publik hanya memuat informasi yang kamu bagikan.' },
  { q: 'Apakah AI menggantikan arahan BPBD?', a: 'Tidak. Rencana dan jawaban AI berpedoman pada panduan resmi, tetapi instruksi petugas di lapangan selalu lebih utama.' },
  { q: 'Bagaimana cara membagikan rencana ke keluarga?', a: 'Salin tautan rencana darurat lalu kirim ke grup WhatsApp keluarga. Penerima bisa membukanya tanpa login.' },
];
