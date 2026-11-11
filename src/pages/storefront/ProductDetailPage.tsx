import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Clock, ShieldCheck, Star, Heart, Check } from 'lucide-react';
import { repos } from '@/services/repositories';
import { formatRupiah, formatDateWITA } from '@/utils/format';
import { useCart } from '@/app/providers/CartContext';
import { useToast } from '@/app/providers/ToastContext';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const { showToast } = useToast();

  const product = useMemo(() => {
    return repos.productRepo.getBySlug(slug || '');
  }, [slug]);

  const category = useMemo(() => {
    return product ? repos.categoryRepo.getById(product.categoryId) : null;
  }, [product]);

  const activeVariants = useMemo(() => {
    return product ? product.variants.filter(v => v.active) : [];
  }, [product]);

  const [selectedVariantId, setSelectedVariantId] = useState<string>(() => {
    const def = activeVariants.find(v => v.isDefault) || activeVariants[0];
    return def ? def.id : '';
  });

  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const selectedVariant = useMemo(() => {
    return activeVariants.find(v => v.id === selectedVariantId) || activeVariants[0];
  }, [activeVariants, selectedVariantId]);

  const reviews = useMemo(() => {
    return product ? repos.reviewRepo.getByProductId(product.id) : [];
  }, [product]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

  if (!product) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', color: 'var(--brown-900)', marginBottom: '12px' }}>Produk Tidak Ditemukan</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Produk yang Anda cari tidak tersedia atau sedang dinonaktifkan.</p>
        <Link
          to="/produk"
          style={{
            backgroundColor: 'var(--gold-500)',
            color: 'var(--brown-900)',
            padding: '10px 24px',
            borderRadius: 'var(--radius-full)',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Katalog</span>
        </Link>
      </div>
    );
  }

  // Stock evaluation
  const isPreOrder = product.fulfillmentType === 'pre_order';
  const availableStock = product.stockMode === 'per_product'
    ? product.stockQuantity
    : (selectedVariant?.stockQuantity || 0);

  const isSoldOut = !isPreOrder && availableStock <= 0;

  const handleAddToCart = () => {
    if (!selectedVariant || isSoldOut) return;
    const ok = addItem(product.id, selectedVariant.id, quantity, notes.trim() || undefined);
    if (ok) {
      showToast(`${quantity}x ${product.name} (${selectedVariant.name}) berhasil masuk keranjang!`, 'success');
      setNotes('');
    } else {
      showToast('Jumlah melebihi stok yang tersedia saat ini.', 'warning');
    }
  };

  const images = product.images.length > 0 ? product.images : [
    { id: 'def', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80', altText: product.name, isPrimary: true },
  ];

  return (
    <div className="container" style={{ paddingTop: '24px' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
        <Link to="/" style={{ color: 'var(--brown-700)' }}>Beranda</Link>
        <span>/</span>
        <Link to="/produk" style={{ color: 'var(--brown-700)' }}>Katalog</Link>
        {category && (
          <>
            <span>/</span>
            <Link to={`/kategori/${category.slug}`} style={{ color: 'var(--brown-700)' }}>{category.name}</Link>
          </>
        )}
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{product.name}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'start' }}>
        {/* Gallery Column */}
        <div>
          <div
            style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              backgroundColor: 'var(--cream-200)',
              border: '1px solid var(--cream-300)',
              boxShadow: 'var(--shadow-md)',
              aspectRatio: '1/1',
              position: 'relative',
            }}
          >
            <img
              src={images[activeImageIndex]?.url}
              alt={images[activeImageIndex]?.altText || product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1605138693981-6c8a5ea87796?w=800&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIndex(idx)}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: activeImageIndex === idx ? '2px solid var(--gold-600)' : '1px solid var(--cream-300)',
                    padding: 0,
                    cursor: 'pointer',
                  }}
                >
                  <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Purchase Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            {category && (
              <span
                style={{
                  backgroundColor: 'var(--gold-100)',
                  color: 'var(--brown-900)',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  display: 'inline-block',
                  marginBottom: '10px',
                }}
              >
                {category.name}
              </span>
            )}
            <h1 style={{ fontSize: '28px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', lineHeight: 1.25, marginBottom: '8px' }}>
              {product.name}
            </h1>

            {/* Ratings Summary */}
            {reviews.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--warning-600)', marginBottom: '12px' }}>
                <Star size={16} fill="var(--gold-500)" color="var(--gold-500)" />
                <span style={{ fontWeight: 700 }}>{averageRating}</span>
                <span style={{ color: 'var(--text-muted)' }}>({reviews.length} ulasan pelanggan)</span>
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Resep Baru Dapur Bintang Cake
              </div>
            )}

            {/* Price Display */}
            <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--brown-800)', fontFamily: 'var(--font-sans)', margin: '8px 0' }}>
              {selectedVariant
                ? selectedVariant.maxPrice && selectedVariant.maxPrice > selectedVariant.price
                  ? `${formatRupiah(selectedVariant.price)} - ${formatRupiah(selectedVariant.maxPrice)}`
                  : formatRupiah(selectedVariant.price)
                : 'Rp 0'}
            </div>
          </div>

          {/* Pre-Order / Stock Status Alert */}
          {isPreOrder ? (
            <div
              style={{
                backgroundColor: 'var(--warning-100)',
                border: '1px solid var(--warning-600)',
                color: 'var(--brown-900)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '13px',
              }}
            >
              <Clock size={20} color="var(--warning-600)" />
              <div>
                <b>Kue Sistem Pre-Order (H-{product.preOrderLeadTime})</b>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Dipanggang khusus berdasarkan pesanan Anda. Tanggal pengiriman saat checkout minimal {product.preOrderLeadTime} hari dari hari ini.
                </p>
              </div>
            </div>
          ) : isSoldOut ? (
            <div
              style={{
                backgroundColor: 'var(--danger-100)',
                border: '1px solid var(--danger-600)',
                color: 'var(--danger-600)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              Stok Habis (Sold Out) untuk hari ini.
            </div>
          ) : (
            <div
              style={{
                backgroundColor: 'var(--success-100)',
                border: '1px solid var(--success-600)',
                color: 'var(--success-600)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              <Check size={16} />
              <span>Ready Stock (Tersedia {availableStock} kemasan)</span>
            </div>
          )}

          {/* Short Description */}
          <div style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            {product.description || product.shortDescription}
          </div>

          {/* Packaging / Variant Selection */}
          {activeVariants.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brown-900)' }}>
                  Pilihan Kemasan & Varian Paket:
                </label>
                <span style={{ fontSize: '11.5px', color: 'var(--gold-700)', fontWeight: 600 }}>
                  *Klik paket yang ingin dibeli
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                {activeVariants.map(variant => {
                  const isSelected = selectedVariant?.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantId(variant.id)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-lg)',
                        border: isSelected ? '2px solid var(--gold-600)' : '1px solid var(--cream-300)',
                        backgroundColor: isSelected ? 'rgba(242, 193, 78, 0.12)' : 'var(--cream-100)',
                        textAlign: 'left',
                        boxShadow: isSelected ? '0 2px 10px rgba(242, 193, 78, 0.25)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: 700, color: isSelected ? 'var(--brown-900)' : 'var(--text-primary)' }}>
                          {variant.name}
                        </span>
                        {isSelected && (
                          <span
                            style={{
                              backgroundColor: 'var(--gold-500)',
                              color: 'var(--brown-900)',
                              borderRadius: 'var(--radius-full)',
                              padding: '2px 7px',
                              fontSize: '10px',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                            }}
                          >
                            <Check size={11} strokeWidth={3} /> Terpilih
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '13.5px', color: isSelected ? 'var(--brown-900)' : 'var(--brown-800)', fontWeight: 600 }}>
                        {variant.maxPrice && variant.maxPrice > variant.price
                          ? `${formatRupiah(variant.price)} - ${formatRupiah(variant.maxPrice)}`
                          : formatRupiah(variant.price)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Stepper & Special Notes */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Jumlah:
              </label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--cream-300)', borderRadius: 'var(--radius-full)', backgroundColor: '#fff', overflow: 'hidden' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isSoldOut}
                  style={{ width: '38px', height: '38px', fontSize: '18px', fontWeight: 700, color: 'var(--brown-900)' }}
                >
                  -
                </button>
                <span style={{ minWidth: '40px', textAlign: 'center', fontWeight: 700, fontSize: '14px' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => {
                    if (product.fulfillmentType === 'ready_stock' && quantity >= availableStock) return;
                    setQuantity(quantity + 1);
                  }}
                  disabled={isSoldOut || (product.fulfillmentType === 'ready_stock' && quantity >= availableStock)}
                  style={{ width: '38px', height: '38px', fontSize: '18px', fontWeight: 700, color: 'var(--brown-900)' }}
                >
                  +
                </button>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Catatan Khusus (opsional):
              </label>
              <input
                type="text"
                placeholder="Contoh: Tulisan di cake, pita warna..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--cream-300)',
                  backgroundColor: '#fff',
                  fontSize: '13px',
                }}
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleAddToCart}
            disabled={isSoldOut}
            style={{
              backgroundColor: isSoldOut ? 'var(--cream-300)' : 'var(--gold-500)',
              color: isSoldOut ? 'var(--text-muted)' : 'var(--brown-900)',
              padding: '14px 28px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: isSoldOut ? 'none' : 'var(--shadow-md)',
              cursor: isSoldOut ? 'not-allowed' : 'pointer',
              marginTop: '10px',
            }}
          >
            <ShoppingBag size={20} />
            <span>{isSoldOut ? 'Stok Habis' : 'Tambah ke Keranjang'}</span>
          </button>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div style={{ marginTop: '56px', paddingTop: '32px', borderTop: '1px solid var(--cream-300)' }}>
        <h3 style={{ fontSize: '22px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', marginBottom: '16px' }}>
          Ulasan & Penilaian Pelanggan ({reviews.length})
        </h3>

        {reviews.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {reviews.map(rev => (
              <div
                key={rev.id}
                style={{
                  backgroundColor: 'var(--ivory-50)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  border: '1px solid var(--cream-300)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--brown-900)' }}>
                    {rev.customerName}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {formatDateWITA(rev.createdAt)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '2px', color: 'var(--gold-500)', marginBottom: '8px' }}>
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} size={14} fill="var(--gold-500)" />
                  ))}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Belum ada ulasan untuk kue ini. Jadilah yang pertama menikmati dan memberikan ulasan setelah pesanan Anda selesai!
          </p>
        )}
      </div>
    </div>
  );
};
