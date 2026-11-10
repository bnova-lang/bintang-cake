# DESIGN.md — Sistem Desain
## Bintang Cake & Cookies — Tema "Elegant Premium"

**Versi:** 1.0 (09/11/2026)
**Sumber:** PRD §2, §6, §7 dan lima layar Stitch (Beranda, Produk, Paket Spesial, Galeri, Keranjang & Cara Pesan).

> **Catatan jujur tentang batas sumber.** Stitch hanya menyediakan layar **mobile** untuk sisi pelanggan. Tidak ada desain tablet, desktop, detail produk, checkout terpisah, login, akun, lacak pesanan, maupun **seluruh dashboard admin**. Bagian tersebut di dokumen ini adalah **ekstrapolasi** dari bahasa visual Stitch dan ditandai `[Ekstrapolasi]`. Nilai warna adalah **perkiraan visual** dari gambar; jika file desain Stitch asli tersedia, ambil nilai persisnya dan perbarui token + catat di `CHANGELOG.md`.

---

## 1. Prinsip desain

1. **Elegan, hangat, premium, modern, bersih, profesional** (PRD §2.2).
2. Dominasi cokelat tua, cokelat muda, cream, ivory; **gold hanya aksen** (CTA utama, lencana, ikon penting).
3. Foto makanan adalah bintang. Kartu bersih, ruang napas cukup, tipografi serif untuk judul memberi kesan butik.
4. Hindari: terlalu banyak warna, gradien norak, bayangan berat, ikon berwarna-warni, tampilan "template toko online".
5. Mobile-first. Satu bahasa visual yang sama di mobile, tablet, desktop, dan admin.

---

## 2. Referensi layar Stitch

Salin gambar ke `docs/reference/stitch/` dan beri nama sesuai isi. Kenali layar dari judul di dalamnya:

| Nama berkas disarankan | Ciri pengenal | Rute target |
|---|---|---|
| `beranda.png` | "Halo, Pencinta Manis!", Istimewa Hari Ini, Kategori Favorit, Paling Banyak Diborong, hampers Golden Royal, Cara Mudah Pesan, Kata Pelanggan Setia | `/` |
| `produk.png` | Kolom cari "Cari nastar, bolu, cookies…", chip kategori, "Oven Fresh Daily", grid 2 kolom, bilah checkout melayang | `/produk` |
| `spesial.png` | "Paket Spesial Hari Raya, Ulang Tahun & Hantaran", kartu paket, "Rancang Paket Sendiri" | `/kategori/hampers-parcel`, `/kategori/paket-custom` |
| `galeri.png` | "Galeri Kebahagiaan", Reel, grid foto, "Ingin Kue Impian Seperti di Galeri?" | `/galeri` |
| `keranjang-pesanan.png` | "Keranjang Pesanan", rincian biaya, data pemesan, pratinjau pesan WhatsApp, informasi dapur | `/keranjang`, `/checkout` |

---

## 3. Design token

Implementasikan di `src/styles/tokens.css` sebagai CSS variables. Komponen **tidak boleh** memakai warna heksa langsung; selalu lewat token.

### 3.1 Warna (perkiraan dari Stitch)

```css
:root {
  /* Cokelat */
  --brown-900: #3B2416;  /* teks utama, header gelap, kartu CTA gelap */
  --brown-800: #4A2E1C;  /* header, tombol utama gelap */
  --brown-700: #5E3B25;  /* hover tombol gelap */
  --brown-500: #8A5A3B;  /* ikon, teks sekunder hangat */
  --brown-300: #C9A78A;  /* garis halus, placeholder */

  /* Cream & Ivory */
  --ivory-50:  #FFFDF8;  /* kartu, input */
  --cream-100: #FBF6EC;  /* latar halaman */
  --cream-200: #F4ECDD;  /* panel/seksi sekunder, chip nonaktif */
  --cream-300: #E9DDC8;  /* border */

  /* Gold (aksen) */
  --gold-500:  #F2C14E;  /* tombol CTA terang, lencana */
  --gold-600:  #D9A53A;  /* hover/aktif, ikon gold */
  --gold-100:  #FBEFC7;  /* latar lencana lembut */

  /* Semantik */
  --success-600: #1F7A3E;   /* tombol WhatsApp, status berhasil */
  --success-100: #E3F2E6;
  --warning-600: #B7791F;   /* stok menipis, pre-order */
  --warning-100: #FDF0D5;
  --danger-600:  #B3392F;   /* sold out, galat, hapus */
  --danger-100:  #FBE4E1;
  --info-600:    #2F6F8F;   /* informasi netral */

  /* Teks */
  --text-primary:   var(--brown-900);
  --text-secondary: #6F5645;
  --text-muted:     #9A8575;
  --text-on-dark:   #FFF8EA;
  --text-on-gold:   var(--brown-900);
}
```

Aturan pemakaian:
- Latar halaman: `--cream-100`. Kartu: `--ivory-50` dengan border `--cream-300` atau bayangan sangat lembut.
- CTA utama gelap: latar `--brown-800`, teks `--text-on-dark`. CTA utama terang (di atas latar gelap): latar `--gold-500`, teks `--brown-900`.
- Tombol WhatsApp: **hanya** `--success-600`. Jangan memakai hijau untuk hal lain selain status berhasil.
- Rasio kontras teks terhadap latar minimal 4.5:1 (teks biasa) dan 3:1 (teks besar). Periksa gold di atas cream: **jangan** menaruh teks gold di atas cream.

### 3.2 Tipografi

| Peran | Font (perkiraan dari Stitch) | Fallback |
|---|---|---|
| Judul, nama produk, harga besar | **Playfair Display** (serif, 600–700) | `Georgia, 'Times New Roman', serif` |
| Isi, tombol, label, form | **Plus Jakarta Sans** (400/500/600/700) | `system-ui, -apple-system, 'Segoe UI', sans-serif` |

Muat font lokal (`@fontsource`) atau Google Fonts dengan `font-display: swap`; jika memakai Google Fonts, sesuaikan CSP (`SECURITY.md` §10).

Skala (mobile → desktop):

| Token | Mobile | Desktop | Pemakaian |
|---|---|---|---|
| `--fs-display` | 28/34 | 44/52 | Judul hero |
| `--fs-h1` | 24/30 | 34/42 | Judul halaman |
| `--fs-h2` | 20/26 | 26/34 | Judul seksi (serif) |
| `--fs-h3` | 17/24 | 20/28 | Nama produk (serif) |
| `--fs-body` | 14/22 | 16/26 | Isi |
| `--fs-small` | 12/18 | 13/20 | Label, deskripsi kartu |
| `--fs-price` | 18/24 | 22/28 | Harga (serif, tebal) |

Harga selalu `font-variant-numeric: tabular-nums`.

### 3.3 Spasi, radius, bayangan

- Skala spasi 4 px: `4, 8, 12, 16, 20, 24, 32, 40, 56`.
- Padding halaman mobile 16 px; tablet 24 px; desktop konten maksimum 1200 px, terpusat.
- Radius: kartu `16–20 px`, tombol `12–14 px` (Stitch cenderung membulat, pil untuk chip/lencana `999 px`), input `12 px`, gambar produk `14 px`.
- Bayangan kartu: `0 1px 2px rgba(59,36,22,.06), 0 6px 18px rgba(59,36,22,.06)`. Satu level saja; hindari bayangan bertumpuk.

### 3.4 Ikon dan gambar

- Ikon garis (outline) tunggal, ketebalan 1.75–2 px, ukuran 20/24 px, `lucide-react`. Warna mengikuti teks, atau `--gold-600` untuk ikon aksen.
- Foto produk: rasio 4:3 (kartu hero/paket) dan 1:1 atau 4:3 (grid). Gunakan `object-fit: cover`, `loading="lazy"`, `alt` bermakna, ukuran terkompresi.
- **Logo:** logo sementara dalam satu komponen `<Logo />` yang membaca `StoreSettings.logoUrl`, mudah diganti (PRD §2.1). Stitch menampilkan placeholder logo di header kiri; jangan menghasilkan logo palsu yang mirip merek lain.

---

## 4. Tata letak dan navigasi

### 4.1 Breakpoint

| Nama | Lebar | Perilaku |
|---|---|---|
| Mobile | < 640 px | Satu kolom; katalog 2 kolom; bottom nav |
| Tablet | 640–1023 px | Katalog 3 kolom; sidebar admin ringkas (ikon) |
| Desktop | ≥ 1024 px | Katalog 4 kolom; header navigasi penuh; sidebar admin penuh |

### 4.2 Navigasi pelanggan

**Header** (sticky, latar `--brown-800`, teks `--text-on-dark`): logo + nama + tagline kecil di kiri; kanan: ikon cari, keranjang (dengan badge jumlah gold), akun. Pada Stitch, subjudul header berganti sesuai halaman (BERANDA, PRODUK, GALERI, KERANJANG CARA PESAN); implementasikan sebagai prop `section`.

**Bottom navigation (mobile)** — lima tab seperti Stitch:

| Tab | Ikon | Tujuan |
|---|---|---|
| Beranda | Timbangan/rumah | `/` |
| Produk | Kue/toples | `/produk` |
| Spesial | Hadiah | Paket Spesial (kategori Hampers/Parcel + Paket Custom) |
| Galeri | Gambar | `/galeri` |
| Pesanan | Daftar | `/keranjang` (di dalamnya tautan ke Lacak Pesanan) |

Tab aktif: ikon dan label `--brown-900` tebal; tab nonaktif `--text-muted`. `[Ekstrapolasi]` Pada ≥ 1024 px, bottom nav hilang; tautan yang sama pindah ke header (Beranda, Produk, Spesial, Galeri, Cara Memesan, Lacak Pesanan).

Halaman PRD yang tidak punya tab (About Us, Cara Memesan, Lacak Pesanan, Login, Registrasi, Akun, Wishlist) diakses dari ikon akun, footer, dan tautan dalam halaman.

---

## 5. Katalog komponen

Setiap komponen berada di `src/components/*`, punya varian dan state. Nama komponen menjadi nama file.

### 5.1 Umum
| Komponen | Spesifikasi (dari Stitch) |
|---|---|
| `Button` | Varian: `primary-dark` (cokelat), `primary-gold`, `secondary` (kontur/ivory), `whatsapp` (hijau), `ghost`, `danger`. Ukuran `md` (tinggi 44) dan `lg` (48). State: default, hover, active, focus, disabled, loading |
| `Chip` / `FilterChip` | Pil; aktif = latar `--brown-800` teks terang + ikon bintang; nonaktif = latar `--cream-200`. Baris dapat digulir horizontal |
| `Badge` | Pil kecil. Varian: `gold` ("Best Seller", "Favorit", "Signature", "New", "Fresh Oven"), `info`, `warning` ("Pre-order"), `danger` ("Sold Out"), `success` |
| `QuantityStepper` | `−` angka `+`; pada Stitch tombol `+` berlatar cokelat, `−` ivory. Min 1, maks sesuai stok |
| `SearchBar` | Ikon kaca pembesar + placeholder "Cari nastar, bolu, cookies…" + tombol filter (ikon penyetel) |
| `Logo`, `SectionHeader` | Judul serif + tautan aksi kecil di kanan ("Lihat Semua", "Gerai promo →") |
| `EmptyState`, `ErrorState`, `Skeleton` | Wajib untuk tiap daftar |
| `Toast` | Umpan balik tindakan (tambah keranjang, simpan) |

### 5.2 Produk
| Komponen | Spesifikasi |
|---|---|
| `ProductCard` | Foto di atas, lencana kiri-atas, lencana ukuran/kemasan pada foto (kiri-bawah: "Toples 500gr"), nama serif, deskripsi satu baris terpotong, harga serif, aksi: tombol `+ Keranjang` (cokelat, penuh lebar) atau `QuantityStepper` bila sudah di keranjang. Status Sold Out: foto redup, tombol nonaktif |
| `ProductCardCompact` | Varian beranda: ditambah rating `★ 4.9 (1,2k)` **hanya jika ada ulasan nyata** (lihat D-09) |
| `PackageCard` (paket hampers) | Foto lebar, lencana ("Best Seller Lebaran"), lencana isi di foto ("3 Jar Cookies (3x350g)"), judul serif + harga di kanan, deskripsi, daftar 4 fitur berikon centang (2×2), baris catatan berikon (mis. "100% Halal & Butter Pilihan"), tombol `+ Pesan Paket` |
| `PackagingSelector` | Radio-pill daftar kemasan aktif; harga berubah sesuai pilihan |
| `FloatingCartBar` | Bilah gelap melayang di atas bottom nav: ikon + badge jumlah, "n Kue Terpilih", total, tombol gold "Checkout →". Hanya muncul jika keranjang tidak kosong |
| `ProductGallery` | Foto utama + thumbnail; geser di mobile |
| `ReviewSummary` / `ReviewList` | Rata-rata + jumlah ulasan terlihat (PRD §20) |

### 5.3 Halaman utama
| Komponen | Spesifikasi |
|---|---|
| `HeroCard` | Kartu cream dengan lencana ("Homemade Artisanal Bakery"), sapaan serif, kutipan tagline "Partner to enjoy your day" |
| `PromoSlider` | Kartu foto lebar dengan gradien gelap di bawah, judul serif putih, tombol/aksi panah. Geser otomatis + navigasi manual + indikator. Konten dari `Content.banners` |
| `AnnouncementBar` | Teks/gambar dari `Content.announcements` |
| `CategoryChips` / `CategoryTile` | Enam kategori PRD §6.5 |
| `FeaturedBanner` (hampers) | Kartu gelap besar, foto, judul serif, harga "Mulai dari" dan tombol gold |
| `HowToOrder` | Tiga langkah bernomor (lingkaran gold) |
| `TestimonialCarousel` | Kartu bintang + kutipan + inisial pelanggan. `[Keputusan D-09]` bersumber dari ulasan nyata |
| `ContactCtaCard` | Kartu gelap: ikon, "Butuh Custom Cake atau Tanya Menu?", tombol `Tanya Admin via WhatsApp`, jam operasional |

### 5.4 Keranjang dan checkout
| Komponen | Spesifikasi |
|---|---|
| `CartItemRow` | Foto 72 px, nama serif, kemasan • varian, harga serif, ikon hapus, `QuantityStepper`, catatan khusus |
| `CostBreakdown` | Judul "Rincian Biaya Transparan". Baris: Subtotal, Ongkos Kirim, **Total Pembayaran** (serif besar). **Tanpa** baris voucher dan **tanpa** baris biaya kemasan (D-01, D-05) |
| `OrderForm` | Nama lengkap, WhatsApp aktif, metode penerimaan (segmented: Ambil Sendiri / Kurir Toko / GoSend-GrabExpress), alamat, wilayah, tanggal & jam (WITA), pembayaran, catatan (tulisan di cake/ucapan) |
| `HowToOrderSteps` | Tiga kartu kecil bernomor |
| `WhatsAppPreview` | Kotak monospace "Pratinjau Format Pesan Otomatis WhatsApp" |
| `WhatsAppCta` | Tombol hijau penuh lebar "Kirim Pesanan ke WhatsApp Penjual Sekarang" |
| `StoreInfoPanel` | Jam operasional, WhatsApp admin, lokasi (peta jika `mapsUrl` ada). **Tanpa Instagram** (D-04) |

### 5.5 Galeri
| Komponen | Spesifikasi |
|---|---|
| `GalleryGrid` | Kartu foto dua kolom dengan tinggi bervariasi (masonry sederhana), judul, subjudul, hitung suka/komentar **hanya jika fitur itu ada** (lihat D-03: pada MVP dihilangkan) |
| `GalleryCtaCard` | Kartu gelap "Ingin Kue Impian Seperti di Galeri?" + `Pesan Sekarang` (gold) + `Konsultasi Custom Cake` (kontur) |

---

## 6. Spesifikasi per halaman pelanggan

Susunan vertikal mobile (urutan dari atas):

- **Beranda `/`** (PRD §6): Header → HeroCard → PromoSlider ("Istimewa Hari Ini") → AnnouncementBar → Kategori Favorit → Produk unggulan ("Paling Banyak Diborong"; sumber: `featured`) → Produk terbaru → FeaturedBanner hampers → Cara Mudah Pesan → Testimoni → ContactCtaCard → Footer (logo, nama, tagline, alamat, WhatsApp, jam, navigasi; tanpa media sosial).
- **Produk `/produk`**: SearchBar + filter (kategori, rentang harga, unggulan, terbaru) + urutan (terbaru, harga ↑, harga ↓) → banner informasi ("Oven Fresh Daily" — dari `Content.announcements`) → grid `ProductCard` → kartu "Butuh Kue Kustom / Hampers?" → FloatingCartBar.
- **Detail produk `/produk/:slug`** `[Ekstrapolasi]`: ProductGallery → nama, kategori, lencana (Ready Stock / Pre-order + lead time) → `PackagingSelector` → harga → stok → `QuantityStepper` → catatan khusus → tombol `+ Keranjang` + tombol bagikan WhatsApp → deskripsi → ulasan.
- **Spesial** (kategori Hampers/Parcel dan Paket Custom): judul + banner serif, chip subkategori, daftar `PackageCard`, kartu "Rancang Paket Sendiri" dengan CTA `Konsultasi Pembuat Kue` (WhatsApp).
- **Keranjang `/keranjang`**: daftar `CartItemRow` → `CostBreakdown` sementara (subtotal; ongkir dihitung di checkout) → tombol `Lanjut ke Checkout`.
- **Checkout `/checkout`**: `OrderForm` → `CostBreakdown` final → ringkasan pembayaran → `Buat Pesanan`. Opsional tombol WhatsApp handoff setelah pesanan dibuat.
- **Pesanan Berhasil `/pesanan/berhasil/:orderNumber`** `[Ekstrapolasi]`: nomor pesanan besar, status "Menunggu Konfirmasi Admin", langkah berikutnya, tombol WhatsApp, tombol Lacak.
- **Lacak Pesanan `/lacak`** `[Ekstrapolasi]`: form nomor pesanan + WhatsApp → detail (PRD §18) + status per item (timeline) + chat.
- **Login/Registrasi/Akun/Profil/Alamat/Wishlist/Riwayat** `[Ekstrapolasi]`: kartu ivory, form satu kolom, validasi inline.
- **About Us / Cara Memesan** `[Ekstrapolasi]`: halaman konten dari `Content`.
- **Galeri `/galeri`**: judul + hitung momen → filter chip → `GalleryGrid` → `GalleryCtaCard`.

Desktop `[Ekstrapolasi]`: grid katalog 4 kolom; hero dua kolom (teks + foto); keranjang dua kolom (daftar kiri, ringkasan lengket di kanan); checkout dua kolom; detail produk dua kolom (galeri kiri, pembelian kanan).

---

## 7. State dan interaksi

- **Loading:** skeleton sesuai bentuk kartu. **Empty:** ilustrasi sederhana + teks Indonesia + tindakan. **Error:** pesan jelas + tombol coba lagi.
- **Sold Out:** lencana merah, foto redup, tombol nonaktif, tidak bisa ke keranjang.
- **Pre-order:** lencana kuning "Pre-order · min. n hari"; di checkout, tanggal terlalu dekat ditolak dengan pesan yang menyebut produk.
- **Stok menipis:** hanya di admin.
- **Umpan balik:** tombol punya state `loading`; aksi sukses memunculkan toast.
- **Animasi:** halus dan fungsional (150–250 ms, easing standar). Hormati `prefers-reduced-motion`. Slider tidak berputar otomatis jika reduced motion aktif.
- **Hover bukan satu-satunya jalan** menuju fungsi (PRD §30).

---

## 8. Dashboard Admin `[Ekstrapolasi penuh]`

Stitch tidak memuat admin. Aturan agar konsisten dengan toko:

- **Layout:** desktop = sidebar kiri `--brown-900` (logo, menu 16 modul PRD §22.2, teks terang, item aktif berlatar `--brown-700` + garis gold) + konten `--cream-100`. Tablet = sidebar ikon. Mobile = drawer + topbar.
- **Gaya:** lebih padat dan fungsional dibanding toko, namun memakai token, tipografi, radius, dan lencana yang sama. Judul halaman serif; isi tabel sans.
- **Komponen:** `DataTable` (urut, cari, paginasi; di mobile menjadi daftar kartu), `StatCard` (angka serif besar, label kecil, ikon gold), `StatusBadge` (peta warna di bawah), `ConfirmDialog` (wajib untuk hapus/reset/restore), `FormField`, `ImageUploader` (URL atau berkas kecil terkompresi, urutan seret/tombol naik-turun), `Toggle` aktif/nonaktif, `Tabs`, `Chart` (recharts, palet cokelat-gold).
- **Dashboard utama:** kartu ringkasan sesuai PRD §22.1 (pendapatan, pesanan hari ini, menunggu konfirmasi, menunggu pembayaran, diproses, selesai, produk terlaris, stok menipis, chat belum dibaca) + grafik harian/mingguan/bulanan + transaksi terbaru + antrean tindakan + peringatan stok.
- **Banner "MODE DEMO":** tampil permanen kecil di topbar admin: "Autentikasi dan data lokal — hanya demonstrasi" (`SECURITY.md` §3).
- **Pengaturan pembayaran:** lencana "DEMO — bukan rekening nyata" selama data masih contoh.

### Peta warna status

| Status pesanan | Warna lencana |
|---|---|
| Pesanan masuk | netral cokelat muda |
| Menunggu konfirmasi admin | `warning` |
| Menunggu pembayaran | `warning` (lebih gelap) |
| Pembayaran diverifikasi | `info` |
| Sedang diproses | `gold` |
| Siap diambil/dikirim | `success` muda |
| Selesai | `success` |
| Dibatalkan | `danger` |

Status pembayaran memakai skema sama (belum bayar = netral, menunggu verifikasi = warning, terverifikasi = success, ditolak = danger).

---

## 9. Konflik Stitch vs PRD dan keputusannya

PRD menang untuk fitur dan aturan bisnis; Stitch menang untuk visual. Daftar konflik yang sudah teridentifikasi:

| # | Temuan di Stitch | Aturan PRD | Keputusan |
|---|---|---|---|
| D-01 | Blok "Kupon & Voucher Berkah", kode `BINTANGMANIS15`, baris "Potongan Voucher", tombol "Hemat Rp 15.000" | §34: kupon/voucher dilarang | **Hapus** dari UI dan data. Tidak ada diskon di total |
| D-02 | Lencana "Diskon Spesial 15%" di Beranda, gambar "Hemat…" | §34: harga diskon & periode promo harga dilarang | Ganti dengan teks promosi non-harga dari `Content.banners`; tidak ada perhitungan diskon |
| D-03 | Galeri dengan unggah foto/video pelanggan, hadiah "Voucher Diskon 10%", suka/komentar/simpan, video reel | Galeri tidak ada di daftar halaman PRD; voucher dilarang | Galeri **dibuat** sebagai halaman konten **dikelola admin** (foto + judul + subjudul + tautan produk opsional). **Tanpa** unggah pelanggan, voucher, suka, komentar. Video reel ditunda (di luar PRD) |
| D-04 | Tautan Instagram `@bintangcake.cookies` di Informasi Dapur | §6.8, §24, §34: tanpa media sosial | **Hapus** |
| D-05 | Baris "Kemasan Kardus & Bubble Wrap Tebal Rp 10.000" | §12/§21: total = subtotal + ongkir | **Hapus** sebagai baris biaya; kemasan adalah varian produk |
| D-06 | WhatsApp `+62 812-3456-7890`, jam `07.30–20.00`, alamat Jl. Mahakam, peta Jakarta | §25: 0821-5873-9760, 08.00–20.00 WITA, alamat K.H. Wahid Hasyim II | **Ikuti PRD §25** |
| D-07 | "10:00 WIB" | §1: WITA | **WITA** |
| D-08 | Keranjang, data pemesan, cara pesan, pratinjau WA, informasi toko dalam **satu** halaman | §5.1: Keranjang dan Checkout halaman terpisah | **Dua rute** (`/keranjang`, `/checkout`), komponen Stitch dipakai ulang |
| D-09 | Rating "4.9 (1,2k)", "5.0 (980)", testimoni bernama | §20: rating dari ulasan nyata | Hitung dari data ulasan; sembunyikan bila belum ada. Seed demo diberi label demo |
| D-10 | Tab "Spesial" dan "Pesanan" | §5.1 | "Spesial" = Hampers/Parcel + Paket Custom. "Pesanan" = Keranjang + tautan Lacak Pesanan |
| D-11 | "Pesanan sebelum 13.00 dikirim hari ini", "Pesan H-1 Sebelum Dikirim" | Tidak ada di PRD (lead time diatur admin) | Perlakukan sebagai teks pengumuman admin, **bukan** aturan sistem. Aturan nyata = `preOrderLeadTime` |
| D-12 | Tombol "Simulasi Budget" | Tidak ada di PRD | **Jangan dibuat**. "Konsultasi Pembuat Kue" = WhatsApp handoff |
| D-13 | Klaim "100% Halal & Butter Pilihan", "Bahan Premium" | Klaim bisnis harus dari pemilik | Pakai hanya sebagai **teks contoh berlabel demo**; pemilik wajib memverifikasi sebelum rilis (`CHANGELOG` pertanyaan terbuka) |
| D-14 | Chip kategori "Aneka Cake / Kue Kering / Roti" | §6.5: enam kategori (Cake, Cookies, Lidah Kucing, Lapis Legit, Hampers/Parcel, Paket Custom) | **Ikuti PRD**; Roti tidak ada |
| D-15 | Tombol "Pesan Paket" di kartu paket | §8.3 kemasan hampers (Paket 1–6, Bingkisan A/B) | Menambah paket ke keranjang dengan pilihan kemasan hampers aktif |
| D-16 | Pengiriman hanya "Diantar Kurir / Ambil di Toko" | §12.3: tiga metode | Tambahkan GoSend/GrabExpress (estimasi manual) |
| D-17 | Harga produk contoh (Nastar Rp 95.000, dll.) | §8.5: harga contoh bukan resmi | Seed demo berlabel demo; admin mengganti |

---

## 10. Aksesibilitas dan kualitas

- Semua gambar punya `alt`; ikon dekoratif `aria-hidden`.
- Target sentuh ≥ 44 px; jarak antartarget ≥ 8 px.
- Urutan fokus logis; dialog menjebak fokus dan dapat ditutup dengan Esc.
- Jangan mengandalkan warna saja untuk status; sertakan teks/ikon.
- Teks tidak terpotong tanpa jalan keluar (tooltip bukan satu-satunya jalan).
- Uji tampilan pada ±375, ±768, ±1280 px; tidak ada gulir horizontal di body.

## 11. Konten dan nada

- Bahasa Indonesia hangat, sopan, ringkas. Sapaan khas Stitch ("Halo, Pencinta Manis!") boleh dipakai di Beranda.
- Hindari klaim berlebihan dan klaim yang belum diverifikasi pemilik (D-13).
- Pesan galat spesifik dan membantu, tidak menyalahkan pengguna.
- Format pesan WhatsApp mengikuti pratinjau Stitch: sapaan, daftar item (`Nx Nama (Rp harga)`), total, nama, metode pengiriman, ditambah nomor pesanan dan jadwal.
