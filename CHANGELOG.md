# CHANGELOG.md
## Bintang Cake & Cookies — Online Store & Admin Dashboard (MVP)

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/). Tanggal `DD/MM/YYYY` (WITA).
Kategori: `Ditambahkan`, `Diubah`, `Diperbaiki`, `Dihapus`, `Keamanan`, `Keputusan`.

---

## [Belum dirilis]

### Ditambahkan
- **Penerapan Desain Mockup Hero, Navbar, dan Highlight Produk (`/`):**
  - Menyesuaikan tampilan Header/Navbar dengan motto resmi brand *"Partner to Enjoy Your Day"*, tombol pill putih **"Pesan"** (dengan badge jumlah keranjang belanja), dan avatar profil lingkaran sesuai referensi desain pengguna.
  - Memperbarui Hero Section pada Beranda (`HomePage.tsx`) dengan tema cokelat elegan khas Dapur Samarinda (`#372316`), ornamen batik Dayak Kalimantan, visual lingkaran oranye ceria dengan foto anak memegang kue tart berhias lilin (`hero-graphic.jpg`), serta dua tombol aksi pill utama: **"Pesan Sekarang"** (oranye `#F58220`) dan **"Reservasi"** (hijau sage `#5D936A`).
  - Menambahkan baris kartu sorotan (*Highlight Row*) berlatar gelombang lengkung hijau sage lembut dengan 4 kartu pratinjau produk unggulan toko: Birthday & Custom Cake, Macaroni Schotel Panggang, Nastar Wisman Super, dan Sajian Kuliner Dapur yang responsif dan interaktif di HP maupun laptop.
- **Pembaruan Kredensial Resmi Admin Toko (`/admin/login`):**
  - Mengatur akun resmi admin toko dengan Username: `bintang` dan Password: `Nadin13` terenkripsi aman PBKDF2.
  - Menambahkan migrasi otomatis `seedVersion: 5` pada `localStorageRepositories.ts` agar data akun langsung sinkron pada browser yang sudah berjalan.
- **Kolom Rentang Harga Varian (Harga Terendah - Harga Tertinggi) (`/admin/produk`):**
  - Menambahkan kolom **Harga Tertinggi (Rp)** di samping Harga Terendah pada editor Varian Kemasan & Harga di formulir tambah/edit produk.
  - Jika kolom harga tertinggi diisi (misal: Min Rp 400.000, Maks Rp 1.500.000), katalog produk (`ProductCard`) dan halaman detail produk (`ProductDetailPage`) akan secara otomatis menampilkan format rentang harga profesional: `Rp 400.000 - Rp 1.500.000`.
  - Menambahkan field `maxPrice?: number` pada tipe `ProductVariant` (`src/types/index.ts`).
- **Keamanan Login Admin Ketat (Wajib Username & Password) (`/admin/login`):**
  - Menghapus tombol jalan pintas demo (*direct login bypass*) pada halaman login admin.
  - Setiap akses ke Dashboard Admin kini wajib memasukkan kredensial username dan password secara manual guna menjamin keamanan toko.
- **Fitur Hapus Pesanan pada Kelola Pesanan (`/admin/pesanan`):**
  - Menambahkan tombol aksi **Hapus** pada setiap baris tabel pesanan di samping tombol Detail dan Invoice.
  - Menyediakan modal dialog konfirmasi hapus aman dengan rincian nomor pesanan, nama pembeli, total pembayaran, dan peringatan bahwa tindakan bersifat permanen.
  - Menambahkan metode `delete(id: string): void` pada `IOrderRepository` dan `LocalStorageOrderRepository` untuk menghapus data pesanan dari penyimpanan sistem.
- **Pembersihan Tulisan & Badge "MODE DEMO PERMANEN":**
  - Menghapus badge oranye `MODE DEMO PERMANEN` dari bilah atas (*topbar*) panel Admin (`AdminLayout.tsx`).
  - Menonaktifkan banner `MODE DEMO` di bagian paling atas halaman storefront pelanggan (`DemoBanner.tsx` dan `Layout.tsx`).
  - Mengubah teks simulasi demo pada halaman login admin (`AdminLoginPage.tsx`) menjadi deskripsi operasional resmi toko.
- **Integrasi Bank SeaBank & Pengelolaan Rekening Resmi Toko (`/admin/pembayaran`):**
  - Menambahkan saluran pembayaran **Bank SeaBank** (`pay-seabank`) ke dalam sistem pembayaran toko resmi (sesuai spesifikasi PRD §14).
  - Menyediakan modal dialog formulir untuk mengubah (*Edit*) atau menambah (*Tambah Baru*) nomor rekening, nama pemilik rekening (a.n.), petunjuk transfer, dan unggah foto QRIS toko.
  - Menghapus label dan teks `(DEMO)` yang sebelumnya terpasang kaku pada kartu rekening, halaman "Cara Memesan" (`HowToOrderPage`), formulir Checkout, dan struk pesanan, sehingga toko dapat menyajikan rekening transfer nyata bagi pelanggan.
  - Menambahkan migrasi data otomatis `seedVersion: 4` pada `localStorageRepositories.ts` untuk membersihkan string demo pada data tersimpan yang sudah ada dan memastikan SeaBank langsung aktif.
- **Program Hadiah Souvenir & Diskon Belanja Otomatis (Belanja ≥ Rp 750.000):**
  - Menambahkan sistem perhitungan promo hadiah otomatis pada saat proses checkout jika subtotal belanja mencapai batas minimal (default: Rp 750.000).
  - Tampilan kartu perayaan emas (*Golden Celebration Card*) dan rincian hadiah souvenir gratis `🎁 Hadiah Souvenir: [Nama Souvenir] (GRATIS)` yang otomatis disematkan pada formulir checkout dan ringkasan pembayaran.
  - Kartu penyemangat progress belanja (*Spend & Save progress banner*) jika belanja belum mencapai Rp 750.000 (menampilkan sisa belanja yang dibutuhkan untuk mendapatkan hadiah gratis).
  - Penyertaan otomatis rincian souvenir pada teks pesanan WhatsApp toko (`buildWhatsAppMessage`), halaman sukses pemesanan (`OrderSuccessPage`), rincian pesanan di admin dashboard (`AdminOrderDetailPage`), serta lembar invoice siap cetak (`PrintableInvoicePage`).
  - Panel konfigurasi lengkap di menu `/admin/pengaturan` (*Program Hadiah Souvenir & Diskon Belanja*) yang memungkinkan pemilik toko mengaktifkan/menonaktifkan promo, mengubah batas minimal belanja (Rp 750.000), memilih bentuk promo (Souvenir / Diskon / Keduanya), mengganti nama souvenir hadiah, dan mengatur nominal potongan harga.

### Diperbaiki
- **Penyimpanan Penuh Saat Unggah Galeri (*QuotaExceededError*):**
  - Memperbaiki pengunggah foto galeri di `/admin/konten` yang sebelumnya menyimpan berkas gambar mentah uncompressed (5MB–8MB) sehingga memicu galat kuota browser.
  - Menerapkan kompresi otomatis HTML5 Canvas saat pemilihan berkas gambar galeri (resolusi optimal 850px, kualitas JPEG 0.82) sehingga ukuran file terpangkas drastis menjadi hanya ~35 KB (penghematan memori 98%) dengan visual tetap jernih.
- **Foto Kategori & Produk Lapis Legit:**
  - Mengganti URL foto Lapis Legit yang sebelumnya menghasilkan galat 404 pada Unsplash (`photo-1535141192574`) dengan foto kue lapis keemasan berlapis rapi yang aktif dan beresolusi tinggi (`photo-1605138693981`).
  - Menambahkan migrasi otomatis `seedVersion: 3` pada `initializeSeedData` agar LocalStorage pada browser pengguna langsung diperbarui tanpa perlu reset manual.
  - Menambahkan penanganan `onError` fallback pada `HomePage`, `ProductCard`, dan `ProductDetailPage` guna menjamin tidak ada ikon gambar rusak (*broken image*) yang tampil.

### Ditambahkan
- **Pengaturan Kecepatan & Pembesaran Ukuran Teks Tulisan Berjalan (`PromoTicker.tsx` & `/admin/konten`):**
  - Menambahkan pemilih ukuran huruf tulisan berjalan (*Font Size*): Normal (14px), Besar & Jelas (16px - Rekomendasi/Default), Ekstra Besar (18px), dan Jumbo (20px) dengan penyesuaian tinggi wadah (*bar height* 46px-62px) dan ukuran badge yang proporsional sehingga tulisan sangat nyaman dibaca dan tidak kekecilan.
  - Menambahkan slider kontrol kecepatan jalan teks (8 detik hingga 60 detik) dengan indikator label status dinamis (Sangat Santai, Lambat Nyaman, Sedang/Normal, Cepat, Sangat Cepat) serta 5 tombol pintas durasi (50s, 38s, 24s, 15s, 9s).
  - Pratinjau animasi live (*real-time preview*) di halaman admin yang langsung bergerak dengan ukuran teks dan kecepatan yang dipilih sebelum disimpan.
- **Pengunggah Foto Kategori Pilihan & Produk Istimewa Beranda (`/admin/konten` & `HomePage.tsx`):**
  - Panel visual mandiri untuk mengunggah dan mengganti seluruh gambar **Kategori Pilihan** (Cake, Cookies, Lidah Kucing, Lapis Legit, Hampers / Parcel, Paket Custom) langsung dari komputer/HP admin, lengkap dengan kompresi otomatis HTML5 Canvas (lebar 600px, ~35 KB) agar kualitas tetap tajam tanpa memenuhi kuota browser.
  - Panel visual mandiri untuk mengunggah foto produk yang tampil di bagian **Istimewa Hari Ini** (Nastar Wisman, Kastengel Edam, Bolu Gulung, Lapis Legit Prunes, dll) dengan opsi unggah foto, input URL gambar, reset foto awal, dan penyesuaian produk yang ingin ditampilkan di beranda.
  - Bilah navigasi pintas (*quick jump navigation*) di atas halaman `/admin/konten` dengan chip tautan instan ke Foto Header, Tulisan Berjalan, Foto Kategori, Produk Istimewa, Banner Hampers, Cerita Toko, dan Galeri Foto.
  - Reaktivitas instan di `HomePage.tsx` menggunakan custom events (`bcc-categories-updated` dan `bcc-products-updated`) sehingga setiap pergantian foto kategori atau produk langsung tampil seketika di beranda pembeli.
  - Tombol navigasi *"Kelola Foto Kategori"* pada menu `/admin/produk`.
- **Perluasan Ruang Penyimpanan Media & Galeri (IndexedDB & Optimizer):**
  - Mengintegrasikan modul penyimpanan berkapasitas besar `indexedDBStorage` (`indexedDB.ts`) yang memanfaatkan teknologi IndexedDB bawaan browser dengan batas kuota gigabita, melipatgandakan daya tampung galeri hingga ratusan foto.
  - Menambahkan tombol *"Optimalkan Memori"* pada panel Kelola Foto Galeri (`/admin/konten`) untuk secara otomatis mengompresi foto lama yang berukuran terlalu besar.
  - Kartu pemantau kapasitas penyimpanan galeri di atas daftar foto galeri.
- **Fitur Banner Tulisan Berjalan / Promo Momen Musiman (`/admin/konten` & `Header.tsx`):**
  - Komponen tulisan berjalan (*seamless marquee ticker*) horizontal tanpa jeda (`PromoTicker.tsx`) yang tampil tepat di bawah header navigasi di seluruh halaman website toko.
  - Editor lengkap di menu Admin Konten dengan toggle aktif/nonaktif, kustomisasi kalimat promo teks bebas, badge statis di sisi kiri, dan opsi tautan tombol promo.
  - Pilihan preset tema warna momen musiman: *Spesial Natal (Merah Marun & Emas)*, *Spesial Lebaran (Hijau Zamrud & Emas)*, *Spesial Imlek (Merah Angpao & Emas)*, *Emas & Cokelat Elegan (Bawaan Toko)*, dan *Cokelat Hangat*.
  - 4 tombol instan muat template momen (*1-click template loader*) untuk Natal, Lebaran, Imlek, dan Reguler yang langsung mengisi teks ajakan belanja profesional.
  - Pilihan kecepatan jalan (*slow / medium / fast*) serta efek *pause-on-hover* saat kursor diarahkan ke teks.
  - Kotak pratinjau animasi berjalan langsung (*live animated preview*) di panel admin sebelum disimpan.
- **Kustomisasi Font & Tulisan Miring Judul Utama Header (`/admin/konten`):**
  - Pemilih variasi jenis font untuk Judul Utama Hero: Playfair Display (Serif Elegan), Dancing Script (Tulisan Indah Bersambung / Kaligrafi), Cormorant Garamond (Serif Butik Klasik), Plus Jakarta Sans (Modern Clean), dan Georgia.
  - Opsi tulisan miring (*Italic*) yang dapat diaktifkan dengan sekali klik.
  - Pengaturan ketebalan huruf (Normal 400, Semi-Tebal 600, Tebal 700) serta pilihan warna teks judul (Putih Krem, Emas Berkilau, Putih Bersih, Krem Lembut).
  - Kotak pratinjau teks instan (*live typography preview*) dengan latar cokelat gelap header beranda.
  - Penyesuaian responsif dinamis di Hero Section Beranda toko (`HomePage.tsx`).
- **Kelola Foto & Teks Banner Promo Hampers Beranda (`/admin/konten`):**
  - Fitur unggah foto kartu promo hampers & parcel (foto kado pita) langsung dari komputer dengan kompresi otomatis HTML5 Canvas.
  - Editor teks lengkap untuk badge promo ("Spesial Momen"), judul banner ("Hampers & Parcel Eksklusif"), pesan ajakan/deskripsi, dan teks tombol aksi ("Pilih Paket Hampers").
  - Kotak pratinjau (*live preview*) dengan bingkai cokelat elegan yang mencerminkan tampilan aslinya di Beranda.
  - Sinkronisasi dinamis instan pada `HomePage.tsx` via custom event `bcc-settings-updated`.
- **Fitur Unggah & Ganti Logo Resmi Toko (`/admin/pengaturan`):**
  - Fitur unggah file logo resmi Bintang Cake & Cookies langsung dari komputer dengan kompresi otomatis HTML5 Canvas (mendukung PNG transparan, JPG, WEBP).
  - Opsi alternatif memasukkan URL gambar logo eksternal serta tombol reset kembali ke ikon bintang bawaan toko.
  - Kotak pratinjau langsung (*live preview*) dengan simulasi latar gelap header.
  - Penerapan logo resmi secara dinamis di seluruh penjuru aplikasi:
    - Sudut kiri atas Header navigasi storefront (`Header.tsx`).
    - Area profil brand pada Footer storefront (`Footer.tsx`).
    - Topbar panel navigasi Admin Dashboard (`AdminLayout.tsx`).
    - Kop surat lembar Invoice pesanan siap cetak (`PrintableInvoicePage.tsx`).
  - Mekanisme sinkronisasi tampilan instan (*reactive update*) via custom event `bcc-settings-updated` tanpa perlu refresh halaman manual.
- **Kelola Header & Foto Hero Beranda (`/admin/konten`):**
  - Fitur unggah foto header langsung dari komputer dengan kompresi otomatis HTML5 Canvas (resolusi optimal tanpa membebani browser).
  - Opsi memasukkan URL foto gambar eksternal atau reset ke foto bawaan.
  - Editor teks lengkap untuk badge header atas, judul utama sambutan, subjudul/deskripsi, dan kartu nilai resep di atas foto.
  - Tampilan pratinjau (*live preview*) foto header sebelum disimpan.

### Status tahap
| Tahap | Status |
|---|---|
| 0 Dokumentasi | **Selesai** |
| 1 Fondasi | **Selesai** |
| 2 Storefront | **Selesai** |
| 3 Akun pelanggan | **Selesai** |
| 4 Keranjang & checkout | **Selesai** |
| 5 Admin dashboard | **Selesai** |
| 6 Pesanan & pembayaran | **Selesai** |
| 7 Chat & fitur pelanggan | **Selesai** |
| 8 Pengaturan & laporan | **Selesai** |
| 9 Pengujian & Build | **Selesai** |

---

## [1.0.0-mvp] — 09/11/2026 — Rilis MVP Penuh

### Ditambahkan
- **Fondasi & Infrastruktur (Tahap 1):**
  - Proyek Vite + React 18 + TypeScript strict mode + React Router v6.
  - Sistem styling CSS custom properties tema "Elegant Premium" (`tokens.css` dan `global.css`).
  - Repository layer terpusat (`LocalStorageCategoryRepository`, `LocalStorageProductRepository`, `LocalStorageOrderRepository`, `LocalStorageCustomerRepository`, `LocalStorageChatRepository`, `LocalStorageReviewRepository`, `LocalStorageStockAdjustmentRepository`, `LocalStorageSettingsRepository`, `LocalStorageCartRepository`, `LocalStorageSessionRepository`).
  - Layanan penyimpanan LocalStorage terisolasi namespace `bcc:v1:*` dengan proteksi quota dan safe JSON parse.
  - Mockup Stitch disalin ke `docs/reference/stitch/` (5 berkas layar mobile).
  - Konfigurasi Cloudflare Pages: `public/_redirects` (`/* /index.html 200`), `public/_headers` (CSP, anti-sniff, frame-deny, noindex untuk `/admin/*`), dan `public/robots.txt`.
- **Storefront & Katalog (Tahap 2):**
  - `HomePage`: Hero banner hangat, pengumuman info, grid 6 kategori resmi, produk unggulan, pendatang baru, pilar nilai, dan kartu hampers spesial.
  - `ProductsPage`: Katalog produk lengkap dengan pencarian nama/deskripsi, filter kategori (chip), filter tipe pemenuhan (Ready Stock vs Pre-Order), rentang harga, dan pengurutan (Terbaru, Harga Terendah, Harga Tertinggi).
  - `CategoryPage`: Tampilan produk per kategori terpilih.
  - `ProductDetailPage`: Galeri multi-foto dengan thumbnail, selektor varian & kemasan aktif dengan harga dinamis, stepper kuantitas, kalkulator lead-time pre-order, catatan tulisan cake, dan daftar ulasan pelanggan terverifikasi.
  - `SpecialPackagesPage`: Tab Hampers & Parcel kurasi dan konsultasi WhatsApp untuk Paket Custom.
  - `GalleryPage`: Galeri inspirasi kue kurasi admin dengan modal lightbox resolusi penuh.
  - `AboutUsPage`: Cerita toko, alamat operasional dapur, jam kerja WITA, dan kontak resmi.
  - `HowToOrderPage`: Panduan 5 langkah pemesanan kue dan cookies.
- **Akun Pelanggan (Tahap 3):**
  - `RegisterPage`: Registrasi dengan nomor WhatsApp yang dinormalisasi (`628...`) dan hashing kata sandi PBKDF2 Web Crypto API.
  - `LoginPage`: Masuk pelanggan dengan tombol bantuan isi otomatis akun demo.
  - `AccountPage`: Manajemen profil, buku alamat multi-lokasi (tambah/edit/hapus/set default), riwayat pesanan, dan pemicu ulasan untuk pesanan selesai.
- **Keranjang & Checkout (Tahap 4):**
  - `CartPage`: Daftar belanja interaktif, rincian varian & catatan tulisan cake, stepper kuantitas, perhitungan subtotal instan.
  - `CheckoutPage`: Formulir pemesan, pilihan 3 metode pengiriman (Ambil Sendiri Rp0, Kurir Toko flat per kecamatan Balikpapan, GoSend/Grab manual estimate), selektor tanggal & jam WITA dengan validasi ketat lead-time pre-order, pilihan metode bayar, dan snapshot harga pesanan.
  - `OrderSuccessPage`: Tampilan nomor pesanan resmi `BCC-YYMMDD-NNNN`, status awal `Menunggu Konfirmasi Admin`, rincian rekening demo, form simulasi unggah bukti bayar, dan pembuat tautan pesan WhatsApp.
- **Admin Dashboard (Tahap 5):**
  - `AdminLoginPage`: Rute login admin terlindungi dengan proteksi navigasi `AdminLayout`.
  - `AdminOverviewPage`: Metrik utama (pendapatan terverifikasi, pesanan menunggu konfirmasi, alert stok menipis, produk aktif), grafik dan daftar pesanan terbaru.
  - `AdminProductsPage`: Tabel CRUD katalog produk, alert stok, modal tambah/edit produk dengan manajemen varian dinamis, toggle pre-order, dan kompresi foto via HTML5 Canvas.
- **Pesanan & Pembayaran (Tahap 6):**
  - `AdminOrdersPage`: Tabel pesanan dengan tab filter status (`menunggu_konfirmasi_admin`, `diproses`, `siap_diambil`/`dikirim`, `selesai`, `dibatalkan`), filter status pembayaran, dan pencarian cepat.
  - `AdminOrderDetailPage`: Detail pesanan lengkap, tombol konfirmasi pesanan dengan pemotongan stok otomatis dan idempoten (PRD §29.2), pembatalan ber-alasan, restock admin eksplisit, verifikasi bukti pembayaran, dan timeline transisi status.
  - `PrintableInvoicePage`: Rute cetak invoice bersih (`/pesanan/:orderNumber/invoice`) dengan gaya cetak `@media print`, rincian snapshot pesanan, dan stempel toko.
- **Chat, Fitur Pelanggan & Moderasi (Tahap 7):**
  - `OrderChatBox`: Komponen interaktif chat per nomor pesanan untuk admin dan pelanggan/tamu.
  - `GuestTrackOrderPage`: Pelacakan pesanan tamu dengan verifikasi ganda (No Pesanan + No WhatsApp) dan pesan galat generik anti-enumerasi (SECURITY.md §5).
  - `AdminReviewsPage`: Moderasi ulasan pelanggan dengan toggle sembunyikan/tampilkan ulasan.
- **Pengaturan, Laporan & Backup (Tahap 8):**
  - `AdminPaymentsPage`: Pengaturan rekening bank demo (BRI, Mandiri), QRIS demo, toggle COD demo, dan alat verifikasi cepat bukti transfer.
  - `AdminShippingPage`: Pengaturan flat tarif ongkir kurir toko untuk seluruh wilayah kecamatan Balikpapan dan estimasi waktu kirim.
  - `AdminContentPage`: Editor teks pengumuman berjalan, judul/subjudul hero, Tentang Kami, Cara Memesan, dan manajemen foto galeri.
  - `AdminReportsPage`: Metrik penjualan (omset terverifikasi, AOV, pesanan selesai), grafik Recharts omset harian, peringkat produk terlaris, dan tombol unduh laporan CSV.
  - `AdminBackupPage`: Ekspor cadangan JSON lengkap, pemulihan (restore) dari file JSON, dan tombol reset ke data bawaan seed demo.
  - `AdminSettingsPage`: Pengaturan jam operasional WITA, cut-off harian, lead-time pre-order standar, serta form ganti password admin aman via PBKDF2 Web Crypto API.
- **Pengujian & QA (Tahap 9):**
  - Seluruh pengujian unit Vitest (10 pengujian): format Rupiah, tanggal WITA, normalisasi WhatsApp, hash PBKDF2 Web Crypto, inisialisasi 6 kategori resmi, konfirmasi pesanan + pemotongan stok idempoten, penolakan konfirmasi jika salah satu stok item kurang, dan restock pesanan dibatalkan.
  - TypeScript strict mode lolos 100% tanpa error (`npx.cmd tsc --noEmit`).
  - Production build Vite sukses menghasilkan bundel di `dist/` beserta `_redirects` dan `_headers`.

### Keamanan
- Tidak ada password disimpan dalam bentuk teks biasa; seluruh kata sandi di-hash menggunakan PBKDF2 (SHA-256, 100.000 iterasi, salt acak 16 byte) via Web Crypto API.
- Semua data perbankan, rekening, dan QRIS diberi label DEMO secara permanen.
- Guest tracking mewajibkan kecocokan ganda nomor pesanan dan nomor WhatsApp dengan pesan galat seragam untuk mencegah user enumeration.
- Input teks pada chat dan catatan pesanan dibersihkan secara aman untuk mencegah XSS.
- Komponen admin terlindungi guard session `RequireAdmin`.

---

## [0.0.0] — 09/11/2026 — Fase 0: Dokumentasi

*(Entri historis dokumentasi awal tetap dipertahankan)*
