# SCHEMA.md — Model Data Logis
## Bintang Cake & Cookies — MVP (LocalStorage) dan jalur migrasi ke Supabase

**Versi dokumen:** 1.0 (09/11/2026)
**`schemaVersion` data:** `1`
**Turunan dari:** PRD §28 (struktur data logis), §9, §12–§20, §29, §31.4.

> **Penting.** Dokumen ini mendefinisikan data untuk **MVP LocalStorage**. Bagian 14 (pemetaan Supabase) hanya **rencana**. **Jangan** membuat proyek Supabase, SQL, atau migrasi selama MVP. Setiap penambahan field di luar PRD §28 ditandai **[+]** dan dicatat alasannya di `CHANGELOG.md`.

---

## 1. Konvensi

| Hal | Aturan |
|---|---|
| ID | String unik. `crypto.randomUUID()`; jika tidak tersedia, fallback acak yang kuat. Jangan memakai urutan angka sebagai ID entitas |
| Uang | **Bilangan bulat Rupiah** (`number` integer ≥ 0). Tanpa desimal, tanpa float |
| Waktu | ISO 8601 UTC string (`2026-11-09T04:30:00.000Z`). Tampilan: WITA (UTC+8), `DD/MM/YYYY`, 24 jam |
| Tanggal tanpa jam (jadwal) | `requestedDate` = `YYYY-MM-DD` (tanggal kalender WITA); `requestedTime` = `HH:mm` (WITA) |
| Boolean | `true/false`, bukan string |
| Enum | String literal berbahasa Inggris snake_case; label Indonesia ada di util tampilan |
| Nama field | camelCase |
| Nomor WhatsApp | Disimpan dinormalisasi `62xxxxxxxxxx` (tanpa `+`, spasi, `-`; awalan `0` → `62`). Tampilan boleh diformat |
| Slug | huruf kecil, `a-z0-9-`, unik per koleksi |
| Teks bebas | Disimpan apa adanya, dirender sebagai teks biasa (lihat `SECURITY.md` §6) |
| Hapus | Entitas yang dirujuk transaksi **tidak dihapus keras**; gunakan `active=false`. Hapus keras hanya jika tak ada referensi |

---

## 2. Penyimpanan LocalStorage

Namespace `bcc:v1:`. Satu kunci per koleksi, nilai = JSON array/objek tervalidasi.

| Kunci | Isi | Tipe |
|---|---|---|
| `bcc:v1:meta` | `{ schemaVersion, seededAt, lastMigratedAt }` | objek |
| `bcc:v1:categories` | `Category[]` | array |
| `bcc:v1:products` | `Product[]` (termasuk `variants` tertanam, lihat §3.2) | array |
| `bcc:v1:customers` | `Customer[]` | array |
| `bcc:v1:orders` | `Order[]` (termasuk `items` tertanam, lihat §3.5) | array |
| `bcc:v1:chatMessages` | `ChatMessage[]` | array |
| `bcc:v1:reviews` | `Review[]` | array |
| `bcc:v1:stockAdjustments` | `StockAdjustment[]` | array |
| `bcc:v1:paymentSettings` | `PaymentSetting[]` | array |
| `bcc:v1:deliveryAreas` | `DeliveryArea[]` | array |
| `bcc:v1:storeSettings` | `StoreSettings` | objek |
| `bcc:v1:content` | `Content` | objek |
| `bcc:v1:gallery` | `GalleryItem[]` | array |
| `bcc:v1:wishlists` | `{ [customerId]: string[] }` (productId) | objek |
| `bcc:v1:carts` | Keranjang tamu/aktif (lihat §3.14) | objek |
| `bcc:v1:counters` | `{ orderSeq: { [YYMMDD]: number } }` | objek |
| `bcc:v1:session` | Sesi aktif (lihat §3.15) — **tidak ikut backup** | objek |
| `bcc:v1:adminUsers` | `AdminUser[]` | array |
| `bcc:v1:loginAttempts` | Penghitung percobaan masuk lokal | objek |

Aturan modul storage:
1. Baca → `JSON.parse` dalam `try/catch` → validasi zod → jika gagal, **jangan menimpa data**; salin ke `bcc:v1:corrupt:<kunci>:<timestamp>` lalu tawarkan pemulihan dari backup/seed.
2. Tulis → validasi zod sebelum `setItem`; tangkap `QuotaExceededError` dan tampilkan pesan jelas tanpa membuang data lama.
3. Perkiraan batas ±5 MB per origin. Foto: prioritaskan **URL**; jika berkas diunggah, kompres ke ≤ 200 KB (data URL `image/webp|jpeg|png`). Peringatkan admin saat penggunaan > 70%.
4. Kunci keranjang bersifat per-perangkat. Semua data hanya ada di browser itu (PRD §29.26).

---

## 3. Entitas

Tanda: **R** = wajib, **O** = opsional, **[+]** = tambahan di luar PRD §28.

### 3.1 Category
| Field | Tipe | | Aturan |
|---|---|---|---|
| id | string | R | |
| name | string | R | 1–60 karakter |
| slug | string | R | unik |
| image | string (URL/data URL) | O | lihat `SECURITY.md` §7 |
| active | boolean | R | |
| sortOrder | integer | R | ≥ 0 |

Seed: **Cake, Cookies, Lidah Kucing, Lapis Legit, Hampers / Parcel, Paket Custom** (PRD §6.5).

### 3.2 Product (+ ProductVariant tertanam)

**Product**
| Field | Tipe | | Aturan |
|---|---|---|---|
| id | string | R | |
| name | string | R | 1–120 |
| slug | string | R | unik |
| categoryId | string | R | → Category.id |
| shortDescription | string | R | ≤ 160 |
| description | string | O | ≤ 4000 |
| images | `ProductImage[]` | R | ≥ 0; satu bertanda `isPrimary` jika ada |
| featured | boolean | R | |
| newArrival | boolean | R | `true` = pilihan admin; produk baru juga bisa otomatis (lihat §10) |
| active | boolean | R | Tak aktif = tak tampil di storefront |
| fulfillmentType | `ready_stock` \| `pre_order` | R | |
| preOrderLeadTime | integer (hari) | R jika `pre_order` | ≥ 0, diatur admin |
| stockMode | `per_product` \| `per_variant` | R | PRD §9 |
| stockQuantity | integer | R jika `per_product` | ≥ 0 |
| lowStockThreshold | integer | R | ≥ 0 |
| variants | `ProductVariant[]` | R | ≥ 1 |
| createdAt, updatedAt | ISO | R | |

**ProductImage**: `{ id, url, alt?, isPrimary, sortOrder }`.

**ProductVariant**
| Field | Tipe | | Aturan |
|---|---|---|---|
| id | string | R | |
| productId | string | R | |
| label | string | R | Nama tampil, mis. "Toples 250 gr" |
| packagingType | enum `PackagingType` | R | lihat §4 |
| price | integer | R | ≥ 0. **Demo** sampai diisi admin |
| stockQuantity | integer | R jika `per_variant` | ≥ 0 |
| lowStockThreshold | integer | O | jika kosong pakai milik produk |
| active | boolean | R | hanya varian aktif tampil |
| sortOrder | integer | R | |

Aturan:
- Tidak ada `discountPrice`, `promoStart`, atau `promoEnd` (dilarang PRD §34).
- `stockMode=per_product`: stok ada di Product; varian hanya berbeda harga. `per_variant`: stok ada di varian.
- Produk **Sold Out** bila stok efektif = 0 (per_product → `stockQuantity`; per_variant → varian terpilih = 0). Semua varian 0 → produk Sold Out.
- Varian cake bebas dibuat admin (PRD §8.4): `packagingType = "custom"`.

### 3.3 Customer
| Field | Tipe | | Aturan |
|---|---|---|---|
| id | string | R | |
| fullName | string | R | 2–100 |
| whatsapp | string | R | dinormalisasi; unik di antara akun terdaftar |
| email | string | O | format email jika ada |
| passwordHash | string | R | **[+]** menggantikan `password` PRD. Hash berkunci + salt (lihat `SECURITY.md` §4). Demo saja |
| passwordSalt | string | R | **[+]** |
| addresses | `Address[]` | R | ≥ 0 |
| createdAt | ISO | R | |

**Address**: `{ id, label, recipientName, whatsapp, addressLine, deliveryAreaId?, notes?, isDefault }`.

Aturan: admin tidak pernah menerima `passwordHash`/`passwordSalt` pada tampilan atau ekspor. Pelanggan tamu **tidak** punya record Customer; datanya ada pada Order.

### 3.4 AdminUser **[+]**
`{ id, username, passwordHash, passwordSalt, displayName, createdAt }`. Satu admin demo pada seed (kredensial demo berlabel, lihat `SECURITY.md` §3). Tidak ada role karyawan.

### 3.5 Order (+ OrderItem tertanam)

**Order**
| Field | Tipe | | Aturan |
|---|---|---|---|
| id | string | R | |
| orderNumber | string | R | unik; format `BCC-YYMMDD-NNNN` (NNNN dari `counters.orderSeq`, mulai 0001 per hari WITA) |
| customerId | string \| null | R | `null` = tamu |
| customerName | string | R | |
| whatsapp | string | R | dinormalisasi |
| email | string | O | |
| fulfillmentMethod | `pickup` \| `store_courier` \| `online_courier` | R | `online_courier` = GoSend/GrabExpress, estimasi manual |
| onlineCourierName | `gosend` \| `grabexpress` \| null | O | **[+]** |
| deliveryAddress | string | R jika bukan `pickup` | |
| deliveryAreaId | string | R jika `store_courier` | |
| requestedDate | `YYYY-MM-DD` | R | harus memenuhi lead time |
| requestedTime | `HH:mm` | R | |
| paymentMethod | enum `PaymentMethod` | R | lihat §4 |
| paymentAccountSnapshot | `PaymentAccountSnapshot` \| null | R | salinan rekening yang dipakai saat pesanan dikonfirmasi |
| paymentEvidence | `PaymentEvidence[]` | R | ≥ 0 |
| paymentStatus | enum `PaymentStatus` | R | |
| orderStatus | enum `OrderStatus` | R | |
| subtotal | integer | R | Σ `lineTotal` |
| shippingFee | integer | R | pickup = 0 |
| shippingFeeConfirmed | boolean | R | **[+]** `false` untuk estimasi kurir online sampai admin konfirmasi |
| total | integer | R | `subtotal + shippingFee` |
| customerNote | string | O | ≤ 1000 |
| adminNote | string | O | internal |
| cancellationReason | string | O | R jika `dibatalkan` |
| stockDeductedAt | ISO \| null | R | **[+]** penanda konfirmasi sudah mengurangi stok |
| items | `OrderItem[]` | R | ≥ 1 |
| statusHistory | `StatusHistoryEntry[]` | R | |
| changeHistory | `OrderChangeEntry[]` | R | **[+]** PRD §13.1 "riwayat perubahan harus disimpan" |
| createdAt, updatedAt | ISO | R | |

**PaymentAccountSnapshot**: `{ method, displayName, accountNumber?, accountHolder?, qrImage?, instructions, isDemo }`.
**PaymentEvidence**: `{ id, channel: "app_upload" \| "whatsapp", imageUrl?, note?, uploadedAt, review: "pending" \| "approved" \| "rejected", reviewReason? , reviewedAt? }`.
**StatusHistoryEntry**: `{ at, scope: "order" \| "payment" \| "item", itemId?, from, to, by: "system" \| "admin" \| "customer", note? }`.
**OrderChangeEntry**: `{ at, by, type: "qty" \| "packaging" \| "variant" \| "schedule" \| "address" \| "other", before, after, status: "applied" \| "requested" \| "approved" \| "rejected", note? }`.

**OrderItem**
| Field | Tipe | | Aturan |
|---|---|---|---|
| id | string | R | |
| orderId | string | R | |
| productId | string | R | |
| productNameSnapshot | string | R | |
| variantId | string | R | |
| variantNameSnapshot | string | R | |
| unitPriceSnapshot | integer | R | harga saat checkout |
| quantity | integer | R | ≥ 1 |
| lineTotal | integer | R | `unitPriceSnapshot × quantity` |
| specialNote | string | O | tulisan cake, ucapan |
| itemStatus | enum `ItemStatus` | R | |
| stockDeducted | boolean | R | **kunci idempotensi**, default `false` |

Invarian:
1. `lineTotal = unitPriceSnapshot × quantity`; `subtotal = Σ lineTotal`; `total = subtotal + shippingFee`. Dihitung ulang oleh satu fungsi murni; divalidasi saat tulis.
2. `orderNumber` unik. Jika tabrakan, naikkan urutan dan ulangi.
3. Snapshot nama/harga tidak pernah diubah oleh perubahan master produk.
4. Order tak boleh `selesai` jika masih ada item bukan `selesai`/`dibatalkan`.

### 3.6 ChatMessage
| Field | Tipe | | Aturan |
|---|---|---|---|
| id | string | R | |
| orderId | string | R | → Order.id |
| senderType | `customer` \| `guest` \| `admin` \| `system` | R | **[+]** `guest`, `system` |
| senderId | string \| null | R | |
| message | string | R | 1–1000, **teks saja** (tanpa lampiran, PRD §17) |
| createdAt | ISO | R | |
| readAt | ISO \| null | R | `null` = belum dibaca |

Pesan belum dibaca = `readAt === null` dan `senderType` bukan pembaca. Jumlah indikator **dihitung**, tidak disimpan. Chat MVP hanya lokal (tidak realtime lintas perangkat).

### 3.7 Review
`{ id, customerId, orderId, productId, rating (1–5 integer), comment?, isVisible, createdAt, updatedAt }`

Aturan simpan: `customerId` ≠ null; Order milik pelanggan itu, `orderStatus='selesai'`, `productId` ada di item pesanan; unik per `(customerId, orderId, productId)`. Ulasan tersembunyi tetap tersimpan (`isVisible=false`). Rata-rata dan jumlah hanya menghitung `isVisible=true`.

### 3.8 PaymentSetting
`{ id, method, displayName, accountNumber?, accountHolder?, qrImage?, instructions, active, isDemo }` — `isDemo` **[+]**, `true` pada seed. Tidak boleh ada data nyata pada seed.

### 3.9 DeliveryArea
`{ id, name, region, shippingFee (integer), notes?, active }`

### 3.10 StoreSettings
`{ storeName, address, whatsapp, operatingHours, mapsUrl?, logoUrl?, tagline }`

Seed (PRD §25): `Bintang Cake & Cookies`; tagline `Partner to Enjoy Your Day`; WhatsApp `0821-5873-9760` (disimpan `6282158739760`); alamat `Jalan K.H. Wahid Hasyim II Gg. Sungai 1 RT.11 No.83`; jam `08.00–20.00 WITA`. Tanpa field media sosial.

### 3.11 Content
```text
Content {
  heroContent: { title, description, tagline, ctaLabel, ctaLink, imageUrl }
  announcements: { id, type: "text"|"image"|"text_image", text?, imageUrl?, active, sortOrder }[]
  banners: { id, imageUrl, title?, link?, active, sortOrder }[]
  aboutUsContent: { profile, story, qualityCommitment, strengths[], photos[] }
  howToOrderContent: { steps[], paymentInstructions, pickupInfo, deliveryInfo, preOrderInfo }
}
```
Produk unggulan/terbaru dipilih lewat flag di Product (bukan di Content).

### 3.12 StockAdjustment
`{ id, productId, variantId?, adjustmentType, quantityDelta (integer, boleh negatif), reason, createdAt, createdBy, refType?, refId? }`

`adjustmentType`: `add`, `reduce`, `correction`, `order_confirmed`, `restock_cancelled`. **[+]** `refType` (`order_item`) dan `refId` (`orderItem.id`) menjadi **kunci idempotensi kedua**: untuk pasangan `(refType, refId, adjustmentType='order_confirmed')` hanya boleh ada **satu** record.

### 3.13 GalleryItem **[+]** (keputusan D-03)
`{ id, imageUrl, title, subtitle?, productId?, tag?, active, sortOrder }` — dikelola admin, hanya-baca bagi pelanggan. Tanpa suka/komentar/unggah pelanggan/voucher.

### 3.14 Cart
Keranjang aktif per perangkat:
```text
{ items: { id, productId, variantId, quantity, specialNote? }[], updatedAt }
```
Harga **tidak** disimpan di keranjang; dihitung dari master saat tampil. Snapshot dibuat saat checkout. Saat memuat keranjang, item yang produk/varian-nya tidak aktif/habis ditandai dan harus diselesaikan sebelum checkout.

### 3.15 Session
`{ role: "admin" | "customer", userId, createdAt, expiresAt }` — sesi simulasi lokal; kedaluwarsa wajar (mis. 12 jam). Tidak berisi password. Tidak ikut backup.

---

## 4. Enum

```text
PackagingType: ecopack | jar_200 | jar_250 | jar_350 | square_jar | pack_500 | pack_1kg
             | three_in_one | glass_jar_150 | hampers_package_1..6 | hampers_gift_a | hampers_gift_b | custom
  (label: Ecopack, Toples 200/250/350 gr, Toples persegi, Kemasan 500 gr, Kemasan 1 Kg,
   Kemasan Three in 1, Toples Kaca 150 gr, Paket 1–6, Bingkisan A/B, Kustom)

PaymentMethod: bank_bri | bank_mandiri | bank_seabank | qris | dana | ovo | gopay | cod

PaymentStatus: unpaid | awaiting_verification | verified | rejected

OrderStatus:  order_received | awaiting_admin_confirmation | awaiting_payment
            | payment_verified | in_progress | ready | completed | cancelled

ItemStatus:   awaiting_preparation | in_progress | ready | completed | cancelled
```

Label Indonesia status pesanan: Pesanan Masuk, Menunggu Konfirmasi Admin, Menunggu Pembayaran, Pembayaran Diverifikasi, Pesanan Sedang Diproses, Siap Diambil/Dikirim, Pesanan Selesai, Pesanan Dibatalkan.

---

## 5. Mesin status pesanan

`order_received` dicatat sebagai entri awal riwayat dan langsung beralih ke `awaiting_admin_confirmation` dalam transaksi checkout yang sama (PRD §12.4).

| Dari | Ke | Pelaku | Syarat dan efek samping |
|---|---|---|---|
| `awaiting_admin_confirmation` | `awaiting_payment` | admin | **Konfirmasi.** Validasi seluruh item (aktif, stok cukup, lead time). Jika semua lolos: kurangi stok **sekali** (§6), set `stockDeductedAt`, snapshot rekening. Pesanan COD tetap melewati status ini (lihat baris COD di bawah) |
| `awaiting_payment` | `payment_verified` | admin | `paymentStatus='verified'`; ada bukti disetujui atau dicatat admin |
| `awaiting_payment` | `in_progress` | admin | **Khusus COD** (`paymentMethod='cod'`): produksi boleh mulai tanpa verifikasi; `paymentStatus` tetap `unpaid` sampai admin mencatat pembayaran diterima (§7) |
| `payment_verified` | `in_progress` | admin | |
| `in_progress` | `ready` | admin | Semua item `ready` atau dibatalkan |
| `ready` | `completed` | admin | Semua item selesai/dibatalkan |
| `awaiting_admin_confirmation` \| `awaiting_payment` | `cancelled` | customer \| admin | Pelanggan hanya sebelum admin mulai memproses. Alasan wajib |
| `payment_verified` \| `in_progress` \| `ready` | `cancelled` | admin | Alasan wajib. **Tidak** mengembalikan stok otomatis |

Aturan umum:
- Transisi di luar tabel ditolak.
- Setiap transisi menambah `statusHistory` (aktor + waktu).
- Status per item bergerak independen (PRD §16.1); `orderStatus` keseluruhan tidak boleh melompati status item (aturan 4 §3.5).
- Pembayaran ditolak: `paymentStatus='rejected'`, `orderStatus` tetap `awaiting_payment`, alasan wajib; pelanggan dapat mengunggah bukti baru.

## 6. Algoritma konfirmasi dan stok (idempoten)

```text
confirmOrder(orderId):
  order = load(orderId)
  if order.orderStatus != awaiting_admin_confirmation -> return NOOP (aman diklik berulang)
  if order.stockDeductedAt != null                    -> return NOOP
  # 1. validasi SEMUA item tanpa mengubah apa pun
  for item in order.items:
     product, variant = load master
     assert product.active and variant.active
     assert leadTimeOk(product, order.requestedDate)
     need = item.quantity (jika stockMode per_product: akumulasi per product)
     assert availableStock(product, variant) >= need   # akumulasi untuk item sama produk
  if any gagal -> return GAGAL (daftar item penyebab), tulis NOL perubahan
  # 2. hitung semua perubahan di memori
  for item in order.items where item.stockDeducted == false:
     buat StockAdjustment(order_confirmed, delta = -quantity, refType=order_item, refId=item.id)
     item.stockDeducted = true
  order.stockDeductedAt = now; status -> awaiting_payment; tambah history
  # 3. tulis sekali (validasi zod), urutan: stockAdjustments, products, orders
```

- Uji wajib: dipanggil dua kali → stok berkurang sekali; satu item gagal → tidak ada yang berkurang; tab ganda (dua instance) → tetap sekali (periksa `refId` saat menulis).
- **Restock** (pembatalan setelah stok berkurang): tindakan admin terpisah `restockOrder(orderId, reason)` → `StockAdjustment(restock_cancelled, delta=+quantity, refId=item.id)` hanya untuk item `stockDeducted=true`, sekali per item; set `stockDeducted=false`. Tidak otomatis.

## 7. Aturan pembayaran dan pendapatan

- `paymentMethod ≠ cod`: setelah konfirmasi → `awaiting_payment`; pelanggan unggah/kirim bukti → `awaiting_verification`; admin setujui → `verified`; tolak → `rejected` + alasan.
- `cod`: `paymentStatus` tetap `unpaid` sampai admin **mencatat** pembayaran diterima (→ `verified`). Selama itu **bukan pendapatan**.
- **Pendapatan** = Σ `total` pesanan dengan `paymentStatus='verified'` dan `orderStatus ≠ 'cancelled'`. Satu fungsi `computeRevenue` dipakai oleh dashboard dan laporan.
- Pengembalian dana/selisih bayar ditangani manual (catat di `adminNote` dan `changeHistory`).

## 8. Aturan lead time pre-order

Untuk tiap item pre-order: `requestedDate ≥ tanggalCheckoutWITA + preOrderLeadTime hari`. Dibandingkan sebagai tanggal kalender WITA. Pesanan campuran mengikuti **lead time terbesar**; tolak dengan pesan yang menyebut produk penyebab. Produk `ready_stock` tidak punya lead time.

## 9. Pelacakan tamu dan verifikasi chat

`verifyGuest(orderNumber, whatsapp)`: normalisasi nomor → cari order → bandingkan `whatsapp` dengan perbandingan waktu-konstan. Jika gagal, kembalikan **satu pesan galat generik yang sama** untuk semua jenis kegagalan, tanpa membocorkan keberadaan nomor pesanan. Batasi percobaan beruntun di `bcc:v1:loginAttempts` (`SECURITY.md` §5).

## 10. Data turunan (tidak disimpan)

Rata-rata rating; jumlah ulasan terlihat; stok efektif; status Sold Out; jumlah chat belum dibaca; produk terlaris (Σ kuantitas pesanan non-batal); peringatan stok menipis (`stok ≤ threshold`); pendapatan harian/mingguan/bulanan; "produk baru otomatis" (mis. dibuat ≤ 30 hari lalu, bila admin tak menandai manual).

---

## 11. Seed data (PRD §33)

Seed dijalankan sekali saat `meta.seededAt` kosong, serta pada fungsi "Reset ke data awal".

| Seed | Jumlah minimal | Catatan |
|---|---|---|
| Kategori | 6 | §3.1 |
| Produk | ≥ 12 tersebar di kategori | Nama sah (mis. Nastar, Kastengel, Putri Salju, Sagu Keju, Choco Lava Cake, Black Forest). Harga **demo**; deskripsi sederhana |
| Varian/kemasan | per produk sesuai jenis | Cookies: kemasan §4; hampers: Paket 1–6, Bingkisan A/B; cake: varian bebas |
| Stok | bervariasi, termasuk satu menipis dan satu habis | untuk menguji Sold Out |
| Wilayah pengiriman | ≥ 4 | tarif contoh |
| PaymentSetting | semua 8 metode | `isDemo=true`; rekening **fiktif jelas** ("0000-00-0000 — DEMO"); tanpa QRIS nyata (gambar placeholder) |
| Pesanan contoh | ≥ 1 per status utama | termasuk pesanan campuran status item, satu COD, satu dibatalkan |
| Pelanggan demo | 1–2 | kredensial demo berlabel |
| Admin demo | 1 | kredensial demo berlabel |
| Ulasan | beberapa | hanya dari pesanan selesai |
| StoreSettings, Content, Galeri | sesuai §3.10–3.13 | |

Semua teks seed yang bersifat klaim bisnis ("100% Halal", dsb.) harus berlabel contoh dan diverifikasi pemilik (D-13).

---

## 12. Backup, restore, migrasi

**Format backup JSON**
```text
{
  "app": "bintang-cake-cookies",
  "schemaVersion": 1,
  "exportedAt": "<ISO UTC>",
  "data": { categories, products, customers, orders, chatMessages, reviews,
            stockAdjustments, paymentSettings, deliveryAreas, storeSettings,
            content, gallery, wishlists, counters, adminUsers }
}
```
Tidak mengikutkan: `session`, `loginAttempts`, `carts`, `corrupt:*`.

**Restore**
1. Baca berkas (batas ukuran, mis. 5 MB) → `JSON.parse` aman → tolak kunci `__proto__`/`constructor`/`prototype`.
2. Validasi `app`, `schemaVersion` (≤ versi aplikasi; jika lebih lama → jalankan migrasi), dan setiap koleksi dengan zod, plus pemeriksaan referensial (mis. `categoryId`, `orderId`, `productId` ada) dan invarian §3.5.
3. **Jangan menghapus data lama sebelum seluruh file valid.** Tulis ke kunci sementara, verifikasi, lalu tukar.
4. Tampilkan hasil sukses/gagal dengan rincian; konfirmasi sebelum menimpa.

**Reset:** dua langkah konfirmasi (dialog + ketik kata konfirmasi), peringatan data tertimpa, otomatis menawarkan unduh backup dulu.

**Migrasi:** setiap perubahan struktur menaikkan `schemaVersion`, menambah fungsi `migrate_vN_to_vN+1` murni yang diuji, dan dicatat di `CHANGELOG.md`.

**Ekspor:** produk, pelanggan (tanpa hash), pesanan; laporan → CSV (diberi label **CSV**) dan PDF via halaman cetak (PRD §26).

---

## 13. Repository (antarmuka)

Antarmuka berada di `src/services/repositories/` dan tidak mengandung detail penyimpanan:

```text
ProductRepository      list(filter) get(id|slug) create update remove setActive
CategoryRepository     list get create update remove
CustomerRepository     get findByWhatsapp create update addAddress ...
OrderRepository        create get getByNumber listByCustomer listAll update appendHistory
ChatRepository         listByOrder add markRead unreadCount(by role)
ReviewRepository       listByProduct listByCustomer create setVisibility
StockRepository        listAdjustments add
PaymentSettingRepository / DeliveryAreaRepository / StoreSettingsRepository / ContentRepository
GalleryRepository      list create update remove reorder
BackupService          export restore reset validate
```

Semua method `async` (mengembalikan `Promise`) walau MVP sinkron, agar kelak implementasi Supabase tidak mengubah pemanggil. Transaksi multi-entitas (`confirmOrder`, `restockOrder`, `createOrder`) berada pada **service domain** yang memakai repository.

---

## 14. Rencana pemetaan ke Supabase (HANYA PERENCANAAN — tidak dikerjakan di MVP)

| LocalStorage | Tabel PostgreSQL (rencana) | Catatan |
|---|---|---|
| categories | `categories` | |
| products + variants | `products`, `product_variants`, `product_images` | varian & gambar menjadi tabel |
| customers | `customers` terhubung `auth.users` | password dikelola Supabase Auth; hapus `passwordHash/Salt` |
| adminUsers | `admin_profiles` + Auth + klaim/role | |
| orders + items | `orders`, `order_items`, `order_status_history`, `order_change_log` | `order_number` dari sequence/trigger |
| paymentEvidence | `payment_evidence` + Storage bucket privat | |
| chatMessages | `chat_messages` + Realtime | |
| reviews | `reviews` | |
| stockAdjustments | `stock_adjustments` + unique `(ref_type, ref_id, adjustment_type)` | idempotensi dipertahankan di DB |
| paymentSettings, deliveryAreas, storeSettings, content, gallery | tabel/JSONB bersesuaian | |
| wishlists | `wishlists` | |

Prinsip migrasi (untuk fase terpisah, lihat PRD §35): RLS pada setiap tabel; harga & stok divalidasi **di server**; konfirmasi pesanan sebagai fungsi transaksi basis data; bucket bukti pembayaran privat; pelacakan tamu lewat fungsi aman, bukan baca tabel langsung. Detailnya ditulis pada dokumen terpisah setelah MVP disetujui pemilik.
