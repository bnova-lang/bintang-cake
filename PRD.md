# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# BINTANG CAKE & COOKIES
## Online Store & Admin Dashboard — MVP

**Versi:** 1.0  
**Status:** Disetujui untuk pengembangan MVP  
**Nama aplikasi:** Bintang Cake & Cookies  
**Tagline:** Partner to Enjoy Your Day  
**Bahasa:** Indonesia  
**Mata uang:** Rupiah (IDR)  
**Zona waktu:** WITA (UTC+8)  
**Format tanggal:** DD/MM/YYYY  
**Frontend:** React  
**Hosting:** Cloudflare Pages  
**Penyimpanan MVP:** LocalStorage  
**Backend MVP:** Belum menggunakan Supabase  

---

# 1. RINGKASAN PRODUK

Bintang Cake & Cookies merupakan aplikasi toko online yang menyediakan layanan penjualan berbagai produk cake, cookies, lidah kucing, lapis legit, hampers, dan paket custom.

Aplikasi memiliki dua bagian utama:

1. **Customer Storefront:** halaman toko online yang digunakan pelanggan untuk melihat produk, memilih kemasan, berbelanja, melakukan checkout, membayar, melacak pesanan, dan berkomunikasi dengan admin.
2. **Admin Dashboard:** halaman pengelolaan toko untuk mengatur produk, harga, stok, pesanan, pembayaran, pelanggan, pengiriman, konten website, laporan, dan pengaturan toko.

Aplikasi dibuat menggunakan React dan akan di-hosting melalui Cloudflare Pages.

Pengembangan MVP menggunakan LocalStorage dan data contoh terlebih dahulu. Integrasi Supabase baru dilakukan setelah MVP selesai dibuat, diuji, dan disetujui pemilik toko.

## 1.1 Tujuan aplikasi

- Membuat toko online Bintang Cake & Cookies yang profesional.
- Memudahkan pelanggan melakukan pemesanan tanpa harus datang ke toko.
- Menyediakan katalog produk yang dapat dikelola sendiri oleh admin.
- Memudahkan pengelolaan stok, harga, kemasan, dan varian produk.
- Memudahkan pengelolaan pesanan dan pembayaran.
- Menyediakan komunikasi langsung antara pelanggan dan admin.
- Menyediakan laporan transaksi dan penjualan.
- Memudahkan pemilik toko mengelola seluruh operasional melalui satu dashboard.

## 1.2 Target pengguna

- Pengunjung website.
- Pelanggan yang berbelanja tanpa akun.
- Pelanggan yang memiliki akun.
- Admin atau pemilik toko.

## 1.3 Prinsip pengembangan

- Mudah digunakan.
- Tampilan premium dan profesional.
- Responsif pada desktop, tablet, dan smartphone.
- Mudah dikembangkan.
- Struktur kode modular.
- Data mudah dipindahkan ke Supabase pada tahap berikutnya.
- Semua fitur MVP dapat diuji menggunakan data lokal.

---

# 2. IDENTITAS DAN DESAIN APLIKASI

## 2.1 Identitas brand

Nama: **Bintang Cake & Cookies**

Tagline: **Partner to Enjoy Your Day**

Logo resmi akan diberikan kemudian. Selama pengembangan gunakan logo sementara yang mudah diganti.

Logo digunakan pada:
- Header website.
- Halaman login admin.
- Dashboard admin.
- Invoice atau nota.
- Footer.
- Identitas aplikasi.

## 2.2 Konsep desain

Tema desain: **Elegant Premium**

Dominasi warna:
- Cokelat tua.
- Cokelat muda.
- Cream.
- Ivory.
- Gold sebagai aksen.

Karakter desain:
- Elegan.
- Hangat.
- Premium.
- Modern.
- Bersih.
- Profesional.

Hindari desain yang terlalu ramai, terlalu banyak warna, atau tampilan seperti template toko online sederhana.

## 2.3 Responsivitas

Aplikasi harus seimbang pada:

**Desktop**
- Navigasi lengkap.
- Katalog beberapa kolom.
- Dashboard dengan sidebar.
- Tabel pengelolaan data.

**Tablet**
- Grid menyesuaikan lebar layar.
- Sidebar dapat disederhanakan.
- Form tetap mudah digunakan.

**Mobile**
- Navigasi ringkas.
- Katalog satu atau dua kolom sesuai ukuran.
- Tombol mudah disentuh.
- Checkout nyaman digunakan.
- Dashboard dapat digunakan melalui layar kecil.

---

# 3. ROLE DAN HAK AKSES

Aplikasi memiliki dua role utama: Admin dan Customer.

## 3.1 Pengunjung

Pengunjung tanpa login dapat:
- Melihat homepage.
- Melihat katalog produk.
- Melihat detail produk.
- Melakukan pencarian.
- Melakukan filter produk.
- Menambahkan produk ke keranjang.
- Melakukan checkout sebagai tamu.

## 3.2 Pelanggan tamu

Pelanggan tamu dapat:
- Melakukan pemesanan tanpa membuat akun.
- Memilih produk dan kemasan.
- Melakukan pembayaran.
- Mengirim bukti pembayaran.
- Melacak pesanan.
- Menggunakan chat pesanan dengan admin.
- Menghubungi admin melalui WhatsApp.

Pelanggan tamu tidak dapat memberikan ulasan produk.

## 3.3 Pelanggan terdaftar

Pelanggan terdaftar dapat:
- Login dan logout.
- Mengedit profil.
- Mengelola alamat pengiriman.
- Melihat riwayat transaksi.
- Melacak pesanan.
- Menggunakan wishlist.
- Menggunakan chat pesanan.
- Memberikan rating dan ulasan setelah pesanan selesai.

## 3.4 Admin

Admin memiliki akses penuh untuk:
- Mengelola produk.
- Mengelola kategori.
- Mengelola kemasan dan varian.
- Mengelola stok.
- Mengelola pesanan.
- Mengelola pembayaran.
- Mengelola pelanggan.
- Mengelola chat.
- Mengelola ulasan.
- Mengelola ongkos kirim.
- Mengelola konten website.
- Mengelola informasi toko.
- Melihat laporan.
- Melakukan backup dan restore data.

Tidak diperlukan role karyawan pada MVP.

---

# 4. REGISTRASI DAN LOGIN

## 4.1 Registrasi pelanggan

Form registrasi:

| Field | Ketentuan |
|---|---|
| Nama lengkap | Wajib |
| Nomor WhatsApp | Wajib |
| Email | Opsional |
| Password | Wajib |
| Konfirmasi password | Wajib |

## 4.2 Login pelanggan

Pelanggan login menggunakan identitas akun dan password.

Setelah login, pelanggan dapat membuka halaman akun.

## 4.3 Profil pelanggan

Pelanggan dapat mengubah:
- Nama lengkap.
- Nomor WhatsApp.
- Password.
- Email jika tersedia.

Pelanggan juga dapat menyimpan beberapa alamat pengiriman.

## 4.4 Login admin

Admin menggunakan:
- Username.
- Password.

Halaman admin harus dilindungi dari akses pengunjung dan pelanggan.

Untuk MVP, autentikasi lokal hanya digunakan sebagai simulasi. Jangan menganggap penyimpanan password di browser sebagai keamanan produksi.

---

# 5. STRUKTUR HALAMAN WEBSITE

## 5.1 Halaman pelanggan

| Halaman | Fungsi |
|---|---|
| Home | Halaman utama toko |
| Produk | Seluruh katalog |
| Kategori | Produk berdasarkan kategori |
| Detail Produk | Informasi dan pilihan kemasan |
| Keranjang | Daftar belanja |
| Checkout | Form pemesanan |
| Pesanan Berhasil | Informasi nomor pesanan |
| Lacak Pesanan | Pelacakan pesanan |
| Login | Login pelanggan |
| Registrasi | Pendaftaran pelanggan |
| Akun Saya | Informasi akun |
| Profil | Pengaturan profil dan alamat |
| Riwayat Pesanan | Daftar transaksi |
| Wishlist | Produk favorit |
| About Us | Profil toko |
| Cara Memesan | Panduan pemesanan |

## 5.2 Halaman admin

| Halaman | Fungsi |
|---|---|
| Login Admin | Autentikasi admin |
| Dashboard | Ringkasan operasional |
| Produk | Pengelolaan produk |
| Kategori | Pengelolaan kategori |
| Pesanan | Pengelolaan transaksi |
| Pembayaran | Verifikasi pembayaran |
| Chat | Komunikasi pelanggan |
| Pelanggan | Data pelanggan |
| Ulasan | Moderasi ulasan |
| Stok | Pengelolaan stok |
| Pengiriman | Pengaturan wilayah dan tarif |
| Pembayaran Settings | Rekening dan metode pembayaran |
| Konten Website | Homepage dan About Us |
| Pengaturan Toko | Informasi toko |
| Laporan | Laporan penjualan |
| Backup | Backup dan restore data |

---

# 6. HOMEPAGE

Homepage merupakan halaman utama yang pertama kali dilihat pelanggan.

Susunan bagian homepage:

1. Header.
2. Hero banner.
3. Slider promosi.
4. Pengumuman toko.
5. Kategori produk.
6. Produk unggulan.
7. Produk terbaru.
8. Katalog produk.
9. Cara memesan.
10. Informasi alamat dan kontak.
11. Footer.

## 6.1 Header

Menampilkan:
- Logo.
- Nama Bintang Cake & Cookies.
- Navigasi.
- Pencarian.
- Keranjang.
- Login atau akun pelanggan.
- Menu navigasi mobile.

## 6.2 Hero banner

Menampilkan:
- Gambar utama.
- Nama brand.
- Tagline.
- Deskripsi singkat.
- Tombol Lihat Produk.

Tagline awal:

**Partner to Enjoy Your Day**

Admin dapat mengganti gambar dan teks melalui dashboard.

## 6.3 Slider promosi

Admin dapat:
- Menambahkan beberapa gambar promosi.
- Mengunggah gambar.
- Memasukkan URL gambar.
- Mengaktifkan atau menonaktifkan banner.
- Mengubah urutan banner.
- Menghapus banner.
- Mengganti gambar banner.

Slider mendukung perpindahan otomatis dan navigasi manual.

## 6.4 Pengumuman

Admin dapat membuat pengumuman berupa:
- Teks.
- Gambar.
- Teks dan gambar.

Contoh:
- Informasi produk terbaru.
- Informasi jadwal pemesanan.
- Informasi libur toko.
- Informasi hampers hari raya.

## 6.5 Kategori produk

Kategori awal:

1. Cake.
2. Cookies.
3. Lidah Kucing.
4. Lapis Legit.
5. Hampers / Parcel.
6. Paket Custom.

Setiap kategori memiliki gambar dan tautan menuju katalog kategori.

## 6.6 Produk unggulan

Admin dapat memilih produk yang ditampilkan sebagai produk unggulan.

## 6.7 Produk terbaru

Produk yang baru ditambahkan dapat ditampilkan otomatis atau dipilih oleh admin.

## 6.8 Footer

Menampilkan:
- Logo.
- Nama toko.
- Tagline.
- Alamat.
- Nomor WhatsApp.
- Jam operasional.
- Navigasi website.

Tidak perlu menyediakan tautan media sosial.

---

# 7. KATALOG DAN DETAIL PRODUK

## 7.1 Katalog

Pelanggan dapat melihat seluruh produk yang aktif.

Informasi kartu produk:
- Foto.
- Nama produk.
- Kategori.
- Harga.
- Status ketersediaan.
- Tombol detail.

## 7.2 Pencarian dan filter

Fitur pencarian:
- Nama produk.

Filter:
- Kategori.
- Rentang harga.
- Produk unggulan.
- Produk terbaru.

Pengurutan:
- Terbaru.
- Harga terendah.
- Harga tertinggi.

## 7.3 Detail produk

Halaman detail produk menampilkan:
- Foto utama.
- Galeri foto.
- Nama produk.
- Kategori.
- Deskripsi.
- Pilihan kemasan atau varian.
- Harga sesuai pilihan.
- Ketersediaan stok.
- Status ready stock/pre-order.
- Waktu minimum pre-order.
- Pilihan jumlah.
- Catatan khusus.
- Tombol tambah ke keranjang.
- Tombol bagikan melalui WhatsApp.

Contoh:

Produk: Sagu Keju

Pelanggan dapat memilih:
- Toples 200 gr.
- Toples 250 gr.
- Toples 350 gr.

Harga berubah sesuai pilihan kemasan.

Pelanggan tidak perlu mengunggah foto referensi untuk produk cookies standar.

---

# 8. MANAJEMEN PRODUK ADMIN

Admin dapat melakukan:
- Tambah produk.
- Edit produk.
- Hapus produk.
- Aktifkan produk.
- Nonaktifkan produk.
- Menentukan produk unggulan.
- Menentukan produk terbaru.

## 8.1 Data produk

Setiap produk memiliki:
- Nama.
- Kategori.
- Deskripsi singkat.
- Deskripsi lengkap.
- Foto utama.
- Galeri foto.
- Harga melalui varian/kemasan.
- Stok.
- Batas minimum stok.
- Status aktif.
- Status ready stock/pre-order.
- Lead time pre-order.

## 8.2 Kemasan cookies

Pilihan kemasan yang tersedia:

1. Ecopack.
2. Toples 200 gr.
3. Toples 250 gr.
4. Toples 350 gr.
5. Toples persegi.
6. Kemasan 500 gr.
7. Kemasan 1 Kg.
8. Kemasan Three in 1.
9. Toples Kaca 150 gr.

Admin dapat mengaktifkan atau menonaktifkan pilihan kemasan untuk setiap produk.

## 8.3 Kemasan hampers

Pilihan awal:
- Paket 1.
- Paket 2.
- Paket 3.
- Paket 4.
- Paket 5.
- Paket 6.
- Bingkisan A.
- Bingkisan B.

## 8.4 Varian cake

Varian cake dibuat dan diatur sendiri oleh admin sesuai kebutuhan produk.

## 8.5 Harga

Setiap kombinasi produk dan kemasan dapat memiliki harga berbeda.

Contoh ilustrasi:

| Produk | Kemasan | Harga |
|---|---|---:|
| Sagu Keju | 200 gr | Rp... |
| Sagu Keju | 250 gr | Rp... |
| Sagu Keju | 350 gr | Rp... |

Harga aktual diisi oleh admin. Jangan menganggap contoh sebagai harga resmi.

## 8.6 Foto produk

Admin dapat:
- Mengunggah foto dari perangkat.
- Memasukkan URL gambar.
- Menentukan foto utama.
- Menambah foto galeri.
- Mengubah urutan foto.
- Menghapus foto.
- Mengganti foto.

Untuk MVP, prioritaskan URL gambar atau gambar berukuran kecil yang telah dikompresi. Hindari menyimpan gambar besar dalam jumlah banyak di LocalStorage.

---

# 9. MANAJEMEN STOK

Sistem mendukung dua metode stok:

1. Stok per produk.
2. Stok per varian atau kemasan.

Admin menentukan metode stok untuk setiap produk.

Fitur:
- Menambahkan stok.
- Mengurangi stok manual.
- Koreksi stok.
- Menentukan batas minimum.
- Peringatan stok menipis.
- Riwayat perubahan stok.

Aturan:
- Jika stok nol, produk menampilkan Sold Out.
- Produk habis tidak dapat ditambahkan ke keranjang.
- Stok otomatis berkurang ketika admin mengonfirmasi pesanan.
- Stok tidak boleh berkurang dua kali karena admin menekan tombol konfirmasi berulang.
- Sebelum konfirmasi, seluruh item harus diperiksa ketersediaannya.
- Jika pesanan dibatalkan setelah stok dikurangi, admin harus melakukan tindakan restock secara eksplisit.

---

# 10. READY STOCK DAN PRE-ORDER

Admin dapat menentukan jenis pemenuhan setiap produk:

- Ready Stock.
- Pre-order.

## Ready Stock

Produk dapat dipesan selama stok tersedia.

## Pre-order

Admin dapat mengatur waktu minimum pemesanan sebelum tanggal pengambilan atau pengiriman.

Contoh ilustrasi:
- Cake custom: 5 hari.
- Hampers: 3 hari.
- Lapis legit: 3 hari.

Nilai tersebut tidak boleh dianggap sebagai aturan tetap. Admin dapat mengaturnya.

Sistem harus:
- Menampilkan informasi pre-order.
- Memeriksa tanggal yang dipilih pelanggan.
- Menolak tanggal yang terlalu dekat.
- Memberi tahu produk yang belum memenuhi waktu pemesanan.
- Mengizinkan admin memeriksa dan mengonfirmasi ketersediaan.

---

# 11. KERANJANG BELANJA

Keranjang dapat berisi beberapa produk sekaligus.

Setiap item mencatat:
- Produk.
- Kemasan atau varian.
- Harga satuan.
- Jumlah.
- Total item.
- Catatan khusus.

Pelanggan dapat:
- Mengubah jumlah.
- Mengubah kemasan/varian.
- Menghapus produk.
- Melihat subtotal.
- Melanjutkan checkout.

Keranjang disimpan secara lokal pada MVP.

---

# 12. CHECKOUT DAN PEMESANAN

## 12.1 Data checkout

Form checkout berisi:

- Nama lengkap.
- Nomor WhatsApp.
- Email opsional.
- Metode pengambilan/pengiriman.
- Alamat pengiriman jika diperlukan.
- Wilayah pengiriman.
- Tanggal pesanan.
- Waktu pesanan.
- Metode pembayaran.
- Catatan khusus.

Pelanggan terdaftar dapat menggunakan alamat tersimpan.

Pelanggan tamu mengisi data pada checkout.

## 12.2 Catatan khusus

Pelanggan dapat menambahkan:
- Tulisan pada cake.
- Ucapan.
- Permintaan khusus.
- Instruksi lainnya.

## 12.3 Metode pemenuhan

### A. Ambil sendiri

- Biaya pengiriman Rp0.
- Pelanggan menentukan tanggal dan waktu pengambilan.

### B. Kurir toko

- Ongkos kirim berdasarkan wilayah.
- Pelanggan memilih wilayah.
- Tarif otomatis mengikuti pengaturan admin.

### C. GoSend / GrabExpress

- Tidak menggunakan API.
- Biaya merupakan estimasi manual.
- Admin dapat mengonfirmasi biaya akhir.

## 12.4 Proses checkout

1. Pelanggan mengisi checkout.
2. Sistem membuat nomor pesanan unik.
3. Pesanan masuk ke admin.
4. Status menjadi Menunggu Konfirmasi Admin.
5. Admin memeriksa stok, jadwal, dan detail pesanan.
6. Admin mengonfirmasi pesanan.
7. Pelanggan menerima instruksi pembayaran.
8. Pelanggan melakukan pembayaran.
9. Admin memverifikasi pembayaran.
10. Pesanan masuk ke proses produksi/persiapan.

Pesanan tidak boleh dianggap telah dikonfirmasi hanya karena pelanggan menekan tombol checkout.

---

# 13. PERUBAHAN DAN PEMBATALAN PESANAN

## 13.1 Perubahan pesanan

Sebelum admin mengonfirmasi:
- Pelanggan dapat mengubah jumlah.
- Pelanggan dapat mengubah kemasan.
- Pelanggan dapat mengubah varian.
- Pelanggan dapat mengubah jadwal.

Setelah admin mengonfirmasi:
- Pelanggan mengajukan perubahan melalui chat.
- Admin memeriksa permintaan.
- Admin menyetujui atau menolak.
- Admin menerapkan perubahan.
- Sistem menghitung ulang total jika diperlukan.

Riwayat perubahan harus disimpan.

Jika pelanggan sudah membayar, selisih pembayaran atau pengembalian dana ditangani manual oleh admin.

## 13.2 Pembatalan

Pelanggan dapat membatalkan pesanan selama admin belum mulai memprosesnya.

Setelah proses dimulai, pembatalan ditangani admin melalui komunikasi dengan pelanggan.

Admin harus dapat mencatat alasan pembatalan.

Jika stok telah dikurangi, admin melakukan restock secara manual melalui tindakan yang tercatat.

---

# 14. METODE PEMBAYARAN

Pilihan pembayaran:

1. Transfer BRI.
2. Transfer Mandiri.
3. Transfer SeaBank.
4. QRIS.
5. DANA.
6. OVO.
7. GoPay.
8. COD.

## 14.1 Pengaturan pembayaran admin

Admin dapat mengelola:
- Nama bank.
- Nomor rekening.
- Nama pemilik rekening.
- Gambar QRIS.
- Nomor DANA.
- Nomor OVO.
- Nomor GoPay.
- Status aktif/nonaktif.
- Instruksi pembayaran.

Pelanggan bebas memilih rekening BRI, Mandiri, atau SeaBank.

## 14.2 Bukti pembayaran

Pelanggan dapat:
- Mengunggah bukti pembayaran melalui aplikasi.
- Mengirim bukti melalui WhatsApp.

Admin dapat:
- Melihat bukti pembayaran.
- Menyetujui pembayaran.
- Menolak pembayaran.
- Memberikan alasan penolakan.

Tidak ada payment gateway pada MVP.

Verifikasi dilakukan secara manual.

---

# 15. PENGIRIMAN DAN ONGKOS KIRIM

Admin dapat mengatur wilayah pengiriman secara fleksibel, termasuk dalam dan luar kota.

Pengaturan wilayah:
- Nama wilayah/kecamatan.
- Kota atau daerah.
- Tarif.
- Catatan pengiriman.
- Status aktif/nonaktif.

Admin dapat:
- Menambah wilayah.
- Mengubah tarif.
- Menghapus wilayah.
- Mengaktifkan atau menonaktifkan wilayah.

Tarif kurir toko mengikuti wilayah yang dipilih pelanggan.

Pickup gratis.

GoSend dan GrabExpress menggunakan estimasi biaya manual.

---

# 16. STATUS PESANAN

Status utama:

1. Pesanan masuk.
2. Menunggu konfirmasi admin.
3. Menunggu pembayaran.
4. Pembayaran diverifikasi.
5. Pesanan sedang diproses.
6. Pesanan siap diambil/dikirim.
7. Pesanan selesai.
8. Pesanan dibatalkan.

Admin dapat melihat seluruh status pesanan.

## 16.1 Status per produk

Satu nomor pesanan dapat memiliki beberapa produk dengan status berbeda.

Contoh:
- Cookies: siap.
- Cake custom: sedang diproses.
- Hampers: menunggu persiapan.

Admin dapat memperbarui status setiap item secara terpisah.

Pelanggan harus dapat melihat status keseluruhan dan status setiap produk.

---

# 17. CHAT PELANGGAN DAN ADMIN

Setiap pesanan memiliki ruang chat tersendiri.

Fitur:
- Pesan teks.
- Riwayat percakapan.
- Pengirim pesan.
- Waktu pengiriman.
- Status sudah dibaca/belum.
- Indikator pesan belum dibaca.
- Daftar percakapan admin.

Chat dapat digunakan oleh:
- Pelanggan terdaftar.
- Pelanggan tamu.

Pelanggan tamu harus memverifikasi nomor pesanan dan nomor WhatsApp.

Chat tidak mendukung lampiran gambar atau file.

Notifikasi:
- Notifikasi dalam aplikasi.
- Jumlah pesan belum dibaca.
- Penanda pesan sudah dibaca.

Pada MVP LocalStorage, chat hanya simulasi lokal dan belum dapat berkomunikasi lintas perangkat secara realtime. Fitur lintas perangkat akan dibuat pada integrasi backend berikutnya.

---

# 18. PELACAKAN PESANAN

## Pelanggan terdaftar

Dapat melihat pesanan melalui halaman akun dan riwayat transaksi.

## Pelanggan tamu

Mengisi:
- Nomor pesanan.
- Nomor WhatsApp.

Sistem memeriksa kecocokan kedua informasi tersebut sebelum menampilkan detail pesanan.

Informasi yang ditampilkan:
- Nomor pesanan.
- Tanggal.
- Produk.
- Jumlah.
- Metode pembayaran.
- Status pembayaran.
- Status pesanan.
- Jadwal pengambilan/pengiriman.
- Ongkos kirim.
- Total pembayaran.
- Chat pesanan.

Jika verifikasi gagal, jangan tampilkan detail pesanan.

---

# 19. WISHLIST

Pelanggan terdaftar dapat:
- Menambahkan produk ke wishlist.
- Menghapus produk dari wishlist.
- Melihat daftar produk favorit.
- Membuka detail produk dari wishlist.

---

# 20. RATING DAN ULASAN

Aturan:
- Hanya pelanggan terdaftar yang dapat memberikan ulasan.
- Pesanan harus berstatus selesai.
- Produk harus tercantum dalam pesanan tersebut.
- Rating menggunakan skala 1–5 bintang.
- Pelanggan dapat menambahkan komentar.
- Ulasan langsung tampil setelah dikirim.
- Admin dapat menyembunyikan ulasan.
- Admin dapat menampilkan kembali ulasan yang disembunyikan.
- Ulasan tersembunyi tetap tersimpan dalam sistem.

Tampilkan rata-rata rating dan jumlah ulasan yang terlihat.

Pelanggan tidak boleh mengulas produk yang belum dibeli melalui pesanan selesai.

---

# 21. INVOICE / NOTA

Setiap pesanan menghasilkan invoice dengan informasi:

- Logo.
- Nama toko.
- Alamat.
- Nomor WhatsApp.
- Nomor invoice.
- Tanggal dan waktu WITA.
- Nama pelanggan.
- Nomor WhatsApp pelanggan.
- Produk.
- Kemasan/varian.
- Jumlah.
- Harga satuan.
- Total per item.
- Subtotal.
- Ongkos kirim.
- Total akhir.
- Metode pembayaran.
- Status pembayaran.
- Status pesanan.

Admin dapat:
- Melihat invoice.
- Mencetak invoice.
- Mengunduh invoice PDF.

Jika pembuatan PDF langsung belum memungkinkan, gunakan halaman invoice yang siap dicetak melalui browser.

---

# 22. DASHBOARD ADMIN

## 22.1 Dashboard utama

Tampilkan kartu ringkasan:

- Total pendapatan.
- Pesanan hari ini.
- Menunggu konfirmasi.
- Menunggu pembayaran.
- Sedang diproses.
- Pesanan selesai.
- Produk terlaris.
- Stok menipis.
- Chat belum dibaca.

Tambahkan:
- Grafik penjualan harian.
- Grafik mingguan.
- Grafik bulanan.
- Transaksi terbaru.
- Pesanan yang membutuhkan tindakan.
- Peringatan stok.

Perhitungan pendapatan harus konsisten. Pesanan COD belum dihitung sebagai pendapatan yang sudah diterima sebelum pembayaran dicatat.

## 22.2 Modul dashboard

1. Ringkasan.
2. Produk.
3. Kategori.
4. Kemasan dan varian.
5. Stok.
6. Pesanan.
7. Pembayaran.
8. Chat.
9. Pelanggan.
10. Ulasan.
11. Pengiriman.
12. Pengaturan pembayaran.
13. Konten website.
14. Pengaturan toko.
15. Laporan.
16. Backup dan restore.

---

# 23. MANAJEMEN PELANGGAN

Admin dapat melihat:
- Nama pelanggan.
- Nomor WhatsApp.
- Email jika tersedia.
- Riwayat transaksi.
- Jumlah pesanan.
- Status transaksi.

Jangan pernah menampilkan password pelanggan kepada admin.

Data pelanggan tamu tetap tercatat pada transaksi tanpa perlu membuat akun.

---

# 24. PENGELOLAAN KONTEN

Admin dapat mengubah konten website tanpa mengedit kode.

## Homepage
- Hero banner.
- Judul.
- Deskripsi.
- Tagline.
- Tombol CTA.
- Slider promosi.
- Pengumuman.
- Produk unggulan.
- Produk terbaru.

## About Us
- Profil usaha.
- Cerita perjalanan usaha.
- Komitmen kualitas.
- Keunggulan produk.
- Foto pendukung.

## Cara Memesan
- Langkah pemesanan.
- Instruksi pembayaran.
- Cara pengambilan.
- Cara pengiriman.
- Informasi pre-order.

## Informasi toko
- Nama toko.
- Logo.
- Alamat.
- WhatsApp.
- Jam operasional.
- Google Maps.
- Tagline.

Tidak perlu menyediakan pengaturan tautan media sosial.

---

# 25. PENGATURAN TOKO

Informasi awal:

**Nama:** Bintang Cake & Cookies  
**Tagline:** Partner to Enjoy Your Day  
**WhatsApp:** 0821-5873-9760  
**Alamat:** Jalan K.H. Wahid Hasyim II Gg. Sungai 1 RT.11 No.83  
**Jam operasional:** 08.00–20.00 WITA  

Seluruh informasi harus dapat diedit oleh admin.

Google Maps dapat ditambahkan kemudian.

Pelanggan tetap dapat melihat katalog dan melakukan checkout di luar jam operasional. Pemrosesan pesanan dilakukan admin selama jam operasional toko.

---

# 26. LAPORAN PENJUALAN

Laporan dapat difilter berdasarkan:
- Tanggal tertentu.
- Harian.
- Mingguan.
- Bulanan.

Data laporan:
- Pendapatan.
- Jumlah transaksi.
- Produk terlaris.
- Metode pembayaran.
- Pesanan selesai.
- Pesanan dibatalkan.
- Ringkasan status pesanan.

Ekspor:
- Excel.
- PDF.

Jika MVP menggunakan CSV sebagai pengganti Excel, tampilkan label CSV secara jelas.

---

# 27. BACKUP DAN RESTORE

Dashboard menyediakan fitur:

1. Backup seluruh data ke JSON.
2. Restore data dari JSON.
3. Reset data ke data awal.
4. Ekspor data produk.
5. Ekspor data pelanggan.
6. Ekspor data pesanan.

Ketentuan:
- Validasi file sebelum restore.
- Konfirmasi sebelum reset.
- Berikan peringatan bahwa data dapat tertimpa.
- Tampilkan hasil berhasil/gagal.
- Jangan menghapus data sebelum file restore dinyatakan valid.
- Sediakan langkah konfirmasi tambahan untuk reset.

---

# 28. STRUKTUR DATA LOGIS

Gunakan struktur data yang mudah dipindahkan ke Supabase nantinya.

Entitas utama:

## Product
- id
- name
- slug
- categoryId
- shortDescription
- description
- images
- featured
- newArrival
- active
- fulfillmentType
- preOrderLeadTime
- stockMode
- stockQuantity
- lowStockThreshold
- variants
- createdAt
- updatedAt

## ProductVariant
- id
- productId
- label
- packagingType
- price
- stockQuantity
- lowStockThreshold
- active
- sortOrder

## Category
- id
- name
- slug
- image
- active
- sortOrder

## Customer
- id
- fullName
- whatsapp
- email
- password
- addresses
- createdAt

Catatan: Password pada MVP tidak boleh dianggap aman untuk produksi. Jangan menyimpan kredensial nyata.

## Order
- id
- orderNumber
- customerId
- customerName
- whatsapp
- email
- fulfillmentMethod
- deliveryAddress
- deliveryAreaId
- requestedDate
- requestedTime
- paymentMethod
- paymentAccountSnapshot
- paymentEvidence
- paymentStatus
- orderStatus
- subtotal
- shippingFee
- total
- customerNote
- adminNote
- cancellationReason
- createdAt
- updatedAt
- statusHistory

## OrderItem
- id
- orderId
- productId
- productNameSnapshot
- variantId
- variantNameSnapshot
- unitPriceSnapshot
- quantity
- lineTotal
- specialNote
- itemStatus
- stockDeducted

## PaymentSetting
- id
- method
- displayName
- accountNumber
- accountHolder
- qrImage
- instructions
- active

## DeliveryArea
- id
- name
- region
- shippingFee
- notes
- active

## ChatMessage
- id
- orderId
- senderType
- senderId
- message
- createdAt
- readAt

## Review
- id
- customerId
- orderId
- productId
- rating
- comment
- isVisible
- createdAt
- updatedAt

## StoreSettings
- storeName
- address
- whatsapp
- operatingHours
- mapsUrl
- logoUrl
- tagline

## Content
- heroContent
- announcements
- banners
- aboutUsContent
- howToOrderContent

## StockAdjustment
- id
- productId
- variantId
- adjustmentType
- quantityDelta
- reason
- createdAt
- createdBy

---

# 29. ATURAN BISNIS UTAMA

1. Pengunjung dapat melihat produk tanpa login.
2. Pelanggan dapat checkout sebagai tamu.
3. Hanya pelanggan terdaftar dapat memberikan ulasan.
4. Ulasan hanya dapat diberikan setelah pesanan selesai.
5. Admin dapat menyembunyikan dan menampilkan kembali ulasan.
6. Pesanan harus dikonfirmasi admin sebelum masuk ke pembayaran.
7. Stok dikurangi ketika admin mengonfirmasi pesanan.
8. Sistem harus mencegah pengurangan stok ganda.
9. Semua stok item harus diperiksa sebelum konfirmasi.
10. Pre-order harus memenuhi lead time produk.
11. Kemasan yang ditampilkan hanya yang aktif.
12. Harga dapat berbeda berdasarkan kemasan.
13. Pickup gratis.
14. Kurir toko menggunakan tarif wilayah.
15. Kurir online menggunakan estimasi manual.
16. Transfer BRI, Mandiri, dan SeaBank dapat dipilih pelanggan.
17. Pembayaran diverifikasi secara manual.
18. Chat terhubung dengan nomor pesanan.
19. Chat mendukung pelanggan tamu dan terdaftar.
20. Pelacakan tamu membutuhkan nomor pesanan dan nomor WhatsApp.
21. Perubahan pesanan sebelum konfirmasi dapat dilakukan pelanggan.
22. Perubahan setelah konfirmasi membutuhkan persetujuan admin.
23. Pembatalan mandiri hanya sebelum proses pesanan dimulai.
24. Pesanan dapat memiliki status berbeda untuk setiap item.
25. Semua tanggal dan waktu menggunakan WITA.
26. Data LocalStorage hanya tersimpan pada browser/perangkat terkait.
27. Data contoh dan informasi rekening contoh harus diberi label demo.

---

# 30. KRITERIA PENERIMAAN (ACCEPTANCE CRITERIA)

## Katalog
- [ ] Enam kategori awal tersedia.
- [ ] Produk dapat dicari.
- [ ] Filter kategori bekerja.
- [ ] Filter harga bekerja.
- [ ] Pengurutan harga bekerja.
- [ ] Produk unggulan dan terbaru ditampilkan.
- [ ] Detail produk menampilkan galeri.
- [ ] Harga berubah sesuai kemasan.
- [ ] Produk habis tidak dapat dibeli.

## Checkout
- [ ] Keranjang mendukung beberapa produk.
- [ ] Pelanggan dapat mengubah jumlah.
- [ ] Pelanggan dapat menambahkan catatan.
- [ ] Checkout tamu bekerja.
- [ ] Checkout pelanggan terdaftar bekerja.
- [ ] Pilihan pickup tersedia.
- [ ] Pilihan kurir toko tersedia.
- [ ] Pilihan GoSend/GrabExpress tersedia.
- [ ] Ongkir sesuai wilayah.
- [ ] Validasi pre-order bekerja.
- [ ] Nomor pesanan unik dibuat.
- [ ] Pesanan masuk ke status menunggu konfirmasi admin.

## Akun pelanggan
- [ ] Registrasi bekerja.
- [ ] Login bekerja.
- [ ] Profil dapat diedit.
- [ ] Alamat dapat disimpan.
- [ ] Riwayat pesanan tampil.
- [ ] Wishlist bekerja.
- [ ] Pelanggan dapat melacak pesanan.

## Admin
- [ ] Login admin bekerja.
- [ ] Semua halaman admin dilindungi.
- [ ] Produk dapat ditambah dan diedit.
- [ ] Kemasan dapat diatur.
- [ ] Harga per kemasan dapat diatur.
- [ ] Stok dapat diatur.
- [ ] Pesanan dapat dikonfirmasi.
- [ ] Stok dikurangi satu kali.
- [ ] Status item dapat diubah terpisah.
- [ ] Pembayaran dapat diverifikasi.
- [ ] Chat dapat dibalas.
- [ ] Ulasan dapat disembunyikan.
- [ ] Ongkos kirim dapat diatur.
- [ ] Informasi toko dapat diedit.

## Pembayaran dan pengiriman
- [ ] BRI tersedia.
- [ ] Mandiri tersedia.
- [ ] SeaBank tersedia.
- [ ] QRIS tersedia.
- [ ] DANA tersedia.
- [ ] OVO tersedia.
- [ ] GoPay tersedia.
- [ ] COD tersedia.
- [ ] Pelanggan dapat mengunggah bukti pembayaran.
- [ ] WhatsApp handoff tersedia.
- [ ] Admin dapat mengatur tarif wilayah.

## Chat dan ulasan
- [ ] Setiap pesanan memiliki chat.
- [ ] Pelanggan tamu dapat mengakses chat setelah verifikasi.
- [ ] Pesan belum dibaca memiliki indikator.
- [ ] Pesan dapat ditandai sudah dibaca.
- [ ] Ulasan hanya dapat dikirim oleh pelanggan yang memenuhi syarat.
- [ ] Admin dapat menyembunyikan ulasan.

## Laporan dan backup
- [ ] Laporan harian tersedia.
- [ ] Laporan mingguan tersedia.
- [ ] Laporan bulanan tersedia.
- [ ] Laporan dapat diekspor.
- [ ] Backup JSON bekerja.
- [ ] Restore JSON bekerja.
- [ ] Reset membutuhkan konfirmasi.

## Responsivitas
- [ ] Tampilan desktop baik.
- [ ] Tampilan tablet baik.
- [ ] Tampilan smartphone baik.
- [ ] Form memiliki validasi.
- [ ] Tombol memiliki status yang jelas.
- [ ] Halaman memiliki empty state.
- [ ] Tidak ada fitur penting yang hanya tersedia melalui hover.

---

# 31. PANDUAN TEKNIS UNTUK AI CODING AGENT

## 31.1 Teknologi

Gunakan:
- React.
- JavaScript atau TypeScript.
- React Router.
- CSS modern atau framework styling yang sesuai.
- LocalStorage untuk penyimpanan MVP.
- Cloudflare Pages untuk deployment.

Jangan memasang Supabase pada tahap MVP.

## 31.2 Arsitektur

Pisahkan kode menjadi:
- Halaman storefront.
- Halaman pelanggan.
- Halaman admin.
- Komponen umum.
- Komponen produk.
- Komponen checkout.
- Komponen pesanan.
- Komponen chat.
- Service penyimpanan.
- Utilitas format tanggal dan Rupiah.

Gunakan repository/service layer agar LocalStorage dapat diganti Supabase pada tahap berikutnya.

## 31.3 Struktur folder yang disarankan

```text
src/
  app/
    App.jsx
    router.jsx
    providers/
  components/
    common/
    layout/
    product/
    cart/
    order/
    chat/
    admin/
  pages/
    storefront/
    customer/
    admin/
  features/
    auth/
    catalog/
    cart/
    checkout/
    orders/
    payments/
    shipping/
    chat/
    reviews/
    reports/
    content/
    backup/
  services/
    repositories/
    storage/
    whatsapp/
    invoice/
    export/
  data/
    seed/
  hooks/
  utils/
  styles/
```

Struktur ini merupakan rekomendasi dan dapat disesuaikan selama pemisahan tanggung jawab tetap jelas.

## 31.4 Integritas data

- Setiap entitas memiliki ID unik.
- Setiap pesanan memiliki nomor unik.
- Data harga produk disimpan sebagai snapshot pada transaksi.
- Nama produk dan varian disimpan sebagai snapshot pada transaksi.
- Informasi rekening yang digunakan disimpan pada pesanan.
- Pengurangan stok harus idempotent.
- Validasi seluruh item sebelum perubahan stok.
- Simpan timestamp.
- Gunakan WITA untuk tampilan waktu.

## 31.5 Batasan keamanan MVP

LocalStorage bukan penyimpanan aman untuk data produksi.

Jangan:
- Menyimpan kredensial produksi.
- Menyimpan password nyata tanpa sistem keamanan yang benar.
- Menganggap login admin lokal sebagai autentikasi aman.
- Mengklaim chat lokal sebagai realtime lintas perangkat.
- Menyimpan data pembayaran sensitif yang tidak diperlukan.

Beri penjelasan bahwa autentikasi dan penyimpanan lokal hanya untuk demonstrasi.

## 31.6 Deployment Cloudflare Pages

Pastikan:
- Build berhasil.
- Output direktori dikonfigurasi.
- SPA fallback disiapkan agar deep link tidak menghasilkan 404.
- README menjelaskan instalasi dan menjalankan aplikasi.
- README menjelaskan proses deployment.

---

# 32. TAHAP PENGEMBANGAN

AI coding agent harus membangun aplikasi secara bertahap dan tidak menghilangkan fitur utama dari PRD.

## Tahap 1 — Fondasi aplikasi
- Setup React.
- Setup routing.
- Setup tema.
- Setup layout.
- Setup LocalStorage repository.
- Setup sample data.

## Tahap 2 — Storefront
- Homepage.
- Kategori.
- Katalog.
- Pencarian dan filter.
- Detail produk.
- Galeri produk.

## Tahap 3 — Akun pelanggan
- Registrasi.
- Login.
- Profil.
- Alamat.
- Wishlist.
- Riwayat pesanan.

## Tahap 4 — Keranjang dan checkout
- Keranjang.
- Pilihan kemasan.
- Catatan khusus.
- Checkout.
- Pemilihan pengiriman.
- Validasi pre-order.

## Tahap 5 — Admin dashboard
- Login admin.
- Ringkasan.
- Produk.
- Varian.
- Kemasan.
- Stok.
- Pengaturan toko.

## Tahap 6 — Pesanan dan pembayaran
- Daftar pesanan.
- Detail pesanan.
- Status pesanan.
- Verifikasi pembayaran.
- Invoice.
- Pengelolaan stok saat konfirmasi.

## Tahap 7 — Chat dan fitur pelanggan
- Chat pesanan.
- Notifikasi lokal.
- Pelacakan tamu.
- Ulasan dan rating.
- Moderasi ulasan.

## Tahap 8 — Pengaturan dan laporan
- Pengaturan pembayaran.
- Pengaturan pengiriman.
- Konten homepage.
- About Us.
- Laporan.
- Ekspor.
- Backup dan restore.

## Tahap 9 — Pengujian
- Uji alur pelanggan.
- Uji alur admin.
- Uji stok.
- Uji pembayaran.
- Uji pesanan.
- Uji chat.
- Uji laporan.
- Uji responsivitas.
- Uji deployment.

---

# 33. DATA AWAL / SAMPLE DATA

Sediakan data contoh untuk:
- Enam kategori.
- Beberapa produk.
- Beberapa pilihan kemasan.
- Harga contoh yang diberi label demo.
- Stok contoh.
- Wilayah pengiriman contoh.
- Rekening pembayaran contoh yang jelas diberi label tidak nyata.
- Contoh pesanan dengan berbagai status.
- Akun demo pelanggan.
- Akun demo admin.

Jangan menggunakan nomor rekening atau QRIS nyata sebagai data contoh.

Admin harus dapat mengganti semua data contoh melalui dashboard.

---

# 34. FITUR DI LUAR MVP

Jangan mengimplementasikan fitur berikut pada tahap MVP:

- Supabase.
- Payment gateway.
- API GoSend.
- API GrabExpress.
- Stok bahan baku.
- Resep produksi.
- Role karyawan.
- Kupon dan voucher.
- Harga diskon produk.
- Periode promo harga.
- Tautan media sosial.
- Lampiran foto dalam chat.
- Upload foto referensi untuk cookies standar.
- Otomatisasi WhatsApp Business API.

Fitur-fitur tersebut tidak boleh menghambat penyelesaian MVP.

---

# 35. TAHAP SETELAH MVP

Setelah aplikasi selesai dan diuji, rencanakan integrasi Supabase secara terpisah.

Rencana fase backend:

1. Supabase Auth.
2. Database PostgreSQL.
3. Tabel produk dan kategori.
4. Tabel varian dan stok.
5. Tabel pelanggan.
6. Tabel pesanan dan item pesanan.
7. Tabel pembayaran.
8. Storage foto produk dan bukti pembayaran.
9. Realtime chat.
10. Notifikasi.
11. Row Level Security.
12. Hak akses admin.
13. Sinkronisasi data lintas perangkat.
14. Backup database produksi.

Jangan melakukan setup Supabase selama pengerjaan MVP.

---

# 36. DEFINITION OF DONE

MVP dinyatakan selesai apabila:

- Seluruh halaman utama telah dibuat.
- Pelanggan dapat menjelajahi katalog.
- Pelanggan dapat melakukan checkout.
- Pelanggan tamu dapat memesan.
- Pelanggan terdaftar dapat mengelola akun.
- Admin dapat mengelola produk dan stok.
- Admin dapat memproses pesanan.
- Pembayaran dapat dicatat dan diverifikasi.
- Chat pesanan dapat digunakan dalam batasan LocalStorage.
- Pelanggan dapat melacak pesanan.
- Ulasan dan rating bekerja sesuai aturan.
- Invoice dapat dicetak.
- Laporan dapat ditampilkan dan diekspor.
- Backup dan restore berfungsi.
- Aplikasi responsif.
- Tidak ada error kritis pada alur utama.
- README tersedia.
- Aplikasi dapat dijalankan secara lokal.
- Aplikasi dapat di-deploy ke Cloudflare Pages.
- Tidak ada integrasi Supabase pada MVP.
- Pemilik toko telah melakukan pengujian dan menyetujui hasil MVP.

---

# 37. INSTRUKSI AKHIR UNTUK AI CODING AGENT

Bangun aplikasi Bintang Cake & Cookies berdasarkan dokumen PRD ini.

Prioritas utama:

1. Jangan menghilangkan fitur yang sudah ditetapkan dalam PRD.
2. Jangan membuat desain yang terlalu sederhana atau generik.
3. Gunakan tema Elegant Premium dengan dominasi cokelat, cream, dan gold.
4. Buat tampilan yang profesional dan konsisten.
5. Pastikan seluruh tombol dan menu memiliki fungsi nyata.
6. Gunakan LocalStorage dan sample data untuk MVP.
7. Jangan melakukan setup Supabase.
8. Pastikan data pesanan, harga, stok, dan pembayaran konsisten.
9. Pisahkan logika bisnis dari komponen UI.
10. Buat README yang menjelaskan cara menjalankan dan melakukan deployment.
11. Lakukan pengujian pada setiap tahap.
12. Jangan menyatakan aplikasi selesai jika masih terdapat tombol atau fitur utama yang belum berfungsi.

Jika ada detail implementasi yang belum ditentukan, gunakan keputusan teknis yang paling sederhana, aman, dan mudah dikembangkan, tanpa mengubah kebutuhan bisnis yang telah disetujui.

**TUJUAN AKHIR: Menghasilkan MVP toko online Bintang Cake & Cookies yang elegan, responsif, mudah dikelola, dan siap diuji sebelum integrasi Supabase.**

---

**END OF DOCUMENT — PRD BINTANG CAKE & COOKIES v1.0**