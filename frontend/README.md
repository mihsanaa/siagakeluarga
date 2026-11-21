# SiagaKeluarga — Frontend Web

Frontend React (Vite) untuk platform kesiapsiagaan bencana SiagaKeluarga. Tampilan dan alur mengikuti file desain figcraft `siagakeluarga.figcraft`, dan terhubung ke REST API backend (`siagakeluarga-.zip` → folder `backend/`).

## Menjalankan di lokal

```bash
# 1. Jalankan backend lebih dulu (lihat backend/README.md), default http://localhost:3000
# 2. Di folder frontend:
npm install
npm run dev          # http://localhost:5173 — /api diteruskan ke localhost:3000 lewat proxy Vite
```

Akun demo dari backend: `demo@siagakeluarga.id` / `demo1234`.

## Build & deployment

```bash
npm run build        # hasil di dist/
```

Untuk produksi, isi `VITE_API_URL` dengan URL backend (mis. `https://<domain-vercel>/api`). `vercel.json` sudah menyiapkan rewrite SPA.

## Peta halaman (figcraft → route)

| Halaman di figcraft | Route | Catatan |
|---|---|---|
| Landing (Beranda — Desktop/Mobile/Tablet) | `/` | Hero, cara kerja, statistik BNPB (count-up), fitur, FAQ |
| 03 Masuk dan Daftar | `/masuk`, `/daftar` | |
| 04 Onboarding (3 langkah) | `/onboarding` | Langkah kondisi rumah belum disimpan, lihat catatan |
| 05 Beranda Saya | `/app` | Skor kesiapan, cuaca BMKG, titik kumpul, keluarga |
| 06 Profil Keluarga | `/app/profil` | CRUD anggota, lokasi, tautan kartu darurat |
| 07 Rencana Darurat | `/app/rencana` | Generate AI, bagikan tautan, cetak/PDF |
| 08 Tas Siaga | `/app/tas-siaga` | Checklist, kedaluwarsa, tambah/hapus |
| 09 Risiko dan Cuaca | `/app/risiko` | Prakiraan BMKG, zona risiko, titik kumpul |
| 10 Tanya AI | `/app/tanya` | Tanya Siaga (RAG) dengan sumber |
| 11 Latihan | `/app/latihan` | Kuis skenario dari AI, skor tersimpan sebagai simulasi |
| 02 Panduan Bencana | `/panduan` | Konten statis dari desain |
| 12 Rencana Publik | `/r/:token` | Tanpa login, mode hanya baca |
| 13 Admin | `/app/admin` | Hanya akun ADMIN, untuk reindex panduan |
| 14 Error (404 & luring) | `*` | Halaman 404 |

## Struktur folder

```
src/
  main.jsx, App.jsx          # entry dan routing
  lib/
    api.js                   # klien HTTP (format { success, message, data })
    auth.jsx                 # konteks login, token di localStorage
    readiness.js             # skor kesiapan & langkah berikutnya (estimasi klien)
    content.js               # konten statis: panduan, skenario latihan, FAQ, kontak
    format.js, useCountUp.js
  components/                # AppShell, UI primitives, komponen cuaca
  pages/                     # satu file per halaman
  styles/global.css          # token desain (warna, radius, tombol, kartu, responsif, cetak)
```

Token warna diambil dari variabel figcraft: navy `#0b2545`, oranye `#c2410c`, krem `#f4f1ea`, teks `#0f172a`, teks sekunder `#475569`, dan warna bencana (banjir, gempa, longsor, cuaca, tsunami). Font: Onest.

## Endpoint backend yang dipakai

- Auth: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- Keluarga: `GET/PUT /household`, `POST/PUT/DELETE /household/members[/:id]`, `GET /regions`
- Risiko: `GET /risk`
- Tas siaga: `GET/POST /kit`, `PATCH/DELETE /kit/:id`
- Simulasi: `GET/POST /drills`
- AI: `POST /ai/plan`, `POST /ai/ask`, `POST /ai/quiz`
- Publik: `GET /share/:token`
- Admin: `POST /admin/reindex-guides`

## Catatan dan batasan

1. **Wilayah demo.** Seeder backend berisi Kota Bengkulu (Kec. Teluk Segara). Desain figcraft memakai Dayeuhkolot, Kab. Bandung. Frontend menampilkan data dari API, jadi nama wilayah di layar mengikuti database, bukan teks desain.
2. **Langkah "Kondisi rumah" (onboarding)** dan **kontak darurat kustom** ada di desain, tetapi belum ada field-nya di schema backend. Saya tidak menyimpannya agar tidak menampilkan data palsu. Tambahkan kolom di Prisma dan endpoint terkait jika dibutuhkan.
3. **Kategori tas siaga per bencana** (Khusus banjir, Khusus gempa, dll.) juga belum ada di schema.
4. **Panduan bencana** di `src/lib/content.js` diambil dari teks desain. Backend belum punya endpoint daftar panduan. Verifikasi isinya dengan dokumen resmi BNPB sebelum dipublikasikan.
5. **Skor kesiapan** dihitung di klien dengan bobot: tas siaga 40%, rencana 30%, latihan 20%, anggota 10%. Sesuaikan jika tim menetapkan rumus lain.
6. **Animasi.** Scroll-linked hero (K1→K5) dari catatan motion di figcraft disederhanakan menjadi hero statis dengan count-up pada statistik. Preferensi `prefers-reduced-motion` dihormati.
7. **Cetak / PDF rencana** memakai dialog cetak browser (`window.print`) dengan CSS khusus cetak. Ini belum PDF satu halaman A4 yang dibuat server.
8. **Mode luring** dari desain belum diimplementasikan (perlu service worker).
