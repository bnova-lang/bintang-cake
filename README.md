# Bintang Cake & Cookies — Online Store & Admin Dashboard (MVP)

> **Partner to Enjoy Your Day**  
> Toko online modern untuk pemesanan cake, cookies, lidah kucing, lapis legit, hampers, dan paket custom premium.

---

## 1. Ikhtisar Proyek

Aplikasi web MVP (Minimum Viable Product) untuk **Bintang Cake & Cookies** yang dibangun menggunakan React, TypeScript (mode strict), Vite, CSS Variables (desain token bertema *Elegant Premium*), dan lapisan penyimpanan LocalStorage terpusat (*Repository Pattern*).

Aplikasi ini memenuhi 100% spesifikasi kebutuhan fungsional pada `PRD.md`, arsitektur `SCHEMA.md`, aturan keamanan `SECURITY.md`, dan panduan visual `DESIGN.md`.

---

## 2. Fitur Utama

### 🛒 Storefront & Pelanggan
- **Beranda & Katalog Interaktif:** Menampilkan 6 kategori resmi (*Cake, Cookies, Lidah Kucing, Lapis Legit, Hampers / Parcel, Paket Custom*), filter pemenuhan (Ready Stock vs Pre-Order), filter harga, dan pencarian instan.
- **Detail Produk & Varian:** Pemilihan kemasan/toples dengan harga dinamis, kalkulator lead-time pre-order otomatis, catatan khusus tulisan kue, dan ulasan pelanggan.
- **Keranjang & Checkout Mandiri:** Rincian belanja transparan, pilihan pengiriman (Ambil Sendiri Rp0, Kurir Toko flat per kecamatan Balikpapan, GoSend/Grab estimasi manual), dan pembuatan pesanan format resmi `BCC-YYMMDD-NNNN`.
- **Halaman Berhasil & Handoff WhatsApp:** Format pesan siap kirim ke WhatsApp admin dan form simulasi unggah bukti transfer.
- **Akun Pelanggan & Alamat:** Pendaftaran/login dengan password ber-hash aman (PBKDF2 Web Crypto), buku alamat pengiriman, dan riwayat pesanan.
- **Lacak Pesanan Tamu (Guest Track):** Pelacakan status transparan dengan verifikasi ganda (No Pesanan + No WhatsApp) dan pesan anti-enumerasi.
- **Chat Interaktif Pesanan:** Komunikasi langsung per nomor pesanan antara pelanggan/tamu dan admin.

### 🛡️ Dashboard Pengelola (Admin)
- **Ringkasan Penjualan:** Metrik omset terverifikasi, pesanan menunggu konfirmasi, alert stok menipis, dan produk aktif.
- **Kelola Produk & Varian:** Tambah, edit, atur varian kemasan, stok per produk/varian, batas minimum stok, dan unggah foto dengan kompresi Canvas otomatis.
- **Manajemen Pesanan & Idempotensi Stok:** Konfirmasi pesanan dengan pengurangan stok otomatis dan atomik (semua item divalidasi terlebih dahulu; jika satu kurang, nol stok berkurang). Pembatalan dan tindakan restock admin eksplisit.
- **Cetak Invoice Standar:** Halaman cetak invoice siap print (`/pesanan/:orderNumber/invoice`) lengkap dengan rincian snapshot harga dan stempel toko.
- **Verifikasi Pembayaran & Rekening Demo:** Tinjau bukti transfer yang diunggah pelanggan dan toggle rekening demo perbankan (BRI, Mandiri, QRIS, COD).
- **Tarif Pengiriman:** Atur tarif kurir toko untuk setiap wilayah kecamatan di Balikpapan dan estimasi waktu antar.
- **Moderasi Ulasan:** Sembunyikan atau tampilkan ulasan pelanggan.
- **Konten Website & Galeri:** Atur running text pengumuman, hero banner, teks Tentang Kami, panduan Cara Memesan, dan kurasi foto galeri.
- **Laporan & Ekspor Data:** Grafik penjualan harian via Recharts, peringkat produk terlaris, dan tombol unduh laporan transaksi dalam format file CSV.
- **Backup, Restore & Reset:** Unduh seluruh database LocalStorage ke file JSON cadangan, pulihkan dari file JSON, atau reset kembali ke data bawaan demo.

---

## 3. Akun Demo untuk Pengujian

Semua akun dan rekening perbankan pada MVP ini berlabel **DEMO**:

| Peran | Kredensial Masuk | Keterangan |
|---|---|---|
| **Admin Toko** | Username: `admin`<br>Password: `admin-bintang-demo` | Akses penuh dashboard admin di `/admin` |
| **Pelanggan Terdaftar** | WhatsApp: `0821-5873-9760` (atau `6282158739760`)<br>Password: `pelanggan-demo` | Akun demo pembeli dengan data buku alamat siap pakai |

---

## 4. Prasyarat & Instalasi

### Prasyarat
- Node.js versi 18+ (disarankan Node 20 LTS atau terbaru)
- npm versi 9+

### Langkah Instalasi
```bash
# 1. Clone repositori atau buka folder proyek
cd "Bintang Cake"

# 2. Pasang dependensi
npm install
```

---

## 5. Daftar Perintah Standar

```bash
# Menjalankan server pengembangan lokal (default http://localhost:5173)
npm run dev

# Catatan Pengguna Windows (PowerShell):
# Jika muncul galat "running scripts is disabled", jalankan:
npm.cmd run dev
# Atau cukup klik dua kali berkas: start-dev.bat

# Memeriksa tipe TypeScript (strict mode)
npm run typecheck
# atau: npm.cmd run typecheck

# Menjalankan seluruh pengujian unit otomatis (Vitest)
npm run test
# atau: npm.cmd test

# Membangun bundle produksi ke folder dist/
npm run build

# Menjalankan server pratinjau hasil build produksi
npm run preview
```

---

## 6. Panduan Deployment ke Cloudflare Pages

Aplikasi ini sudah dilengkapi berkas pendukung deployment Cloudflare Pages:
- `public/_redirects`: Konfigurasi SPA fallback (`/* /index.html 200`) agar deep-linking URL tidak menghasilkan galat 404.
- `public/_headers`: Konfigurasi keamanan HTTP Header (`Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `noindex, nofollow` khusus area `/admin/*`).

### Langkah Deploy:
1. Hubungkan repositori GitHub/GitLab ke **Cloudflare Pages**.
2. Pada konfigurasi build:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
3. Klik **Save and Deploy**. Situs siap diakses di domain `*.pages.dev` Anda.

---

## 7. Batasan Versi MVP (Minimum Viable Product)

Sesuai ketentuan `PRD.md` §34 dan `AGENTS.md` §3:
1. **Penyimpanan LocalStorage Per-Perangkat:** Seluruh data transaksi, akun, dan modifikasi produk disimpan pada peramban web perangkat yang sedang digunakan (namespace `bcc:v1:*`).
2. **Chat Lokal:** Obrolan pesanan disimpan di LocalStorage lokal untuk mendemonstrasikan pengalaman interaksi pelanggan-admin tanpa memerlukan server WebSocket eksternal.
3. **Data Demo:** Seluruh nomor rekening bank, QRIS, dan transaksi bersifat simulasi tanpa keterhubungan ke sistem perbankan nyata.
4. **Fitur Di Luar Ruang Lingkup MVP:** Tidak menyertakan payment gateway otomatis, integrasi live API GoSend/Grab, kupon diskon/voucher, atau WhatsApp Business API berbayar.

---

## 8. Rencana Pasca-MVP (Tahap Selanjutnya)

Setelah pengujian MVP disetujui:
1. **Migrasi Supabase Backend:**
   - Memetakan antarmuka repository (`interfaces.ts`) ke PostgreSQL Supabase Client (`@supabase/supabase-js`).
   - Supabase Auth untuk autentikasi nomor WhatsApp dengan OTP SMS/WhatsApp.
   - Supabase Storage Bucket untuk penyimpanan gambar produk, galeri, dan bukti transfer.
   - Supabase Realtime Channels untuk chat langsung dua arah lintas perangkat.
2. **Integrasi Payment Gateway:**
   - Menghubungkan Midtrans / Xendit untuk Virtual Account otomatis, QRIS dinamis, dan notifikasi webhook pembayaran lunas.
3. **Integrasi Logistik On-Demand:**
   - Menghubungkan API GoSend / GrabExpress untuk kalkulasi ongkos kirim real-time berdasarkan koordinat gerai di Balikpapan.
