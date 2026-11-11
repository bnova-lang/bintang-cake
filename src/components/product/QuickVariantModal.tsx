import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Check, Clock, Plus, Minus, ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { formatRupiah } from '@/utils/format';
import { useCart } from '@/app/providers/CartContext';
import { useToast } from '@/app/providers/ToastContext';

interface QuickVariantModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickVariantModal: React.FC<QuickVariantModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { addItem } = useCart();
  const { showToast } = useToast();

  const activeVariants = product.variants.filter(v => v.active);

  // Default to variant marked isDefault, or the first active one
  const [selectedVariantId, setSelectedVariantId] = useState<string>(() => {
    const def = activeVariants.find(v => v.isDefault) || activeVariants[0];
    return def ? def.id : '';
  });

  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  // Reset/sync selection whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const def = activeVariants.find(v => v.isDefault) || activeVariants[0];
      if (def) setSelectedVariantId(def.id);
      setQuantity(1);
      setNotes('');
    }
  }, [isOpen, product.id]);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Escape key listener to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const selectedVariant =
    activeVariants.find(v => v.id === selectedVariantId) || activeVariants[0];

  const isPreOrder = product.fulfillmentType === 'pre_order';
  const availableStock =
    product.stockMode === 'per_product'
      ? product.stockQuantity
      : (selectedVariant?.stockQuantity || 0);

  const isSoldOut = !isPreOrder && availableStock <= 0;

  const primaryImage =
    product.images.find(img => img.isPrimary)?.url ||
    product.images[0]?.url ||
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80';

  const unitPrice = selectedVariant?.price || 0;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant || isSoldOut) return;

    const ok = addItem(
      product.id,
      selectedVariant.id,
      quantity,
      notes.trim() || undefined
    );

    if (ok) {
      showToast(
        `${quantity}x ${product.name} (${selectedVariant.name}) berhasil masuk keranjang!`,
        'success'
      );
      onClose();
    } else {
      showToast('Stok tidak mencukupi untuk jumlah yang dipilih.', 'warning');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(32, 19, 12, 0.72)',
        backdropFilter: 'blur(5px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'quickModalFadeIn 0.2s ease-out',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-select-title"
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFDF9',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 50px rgba(32, 19, 12, 0.4)',
          border: '1px solid var(--cream-300)',
          animation: 'quickModalSlideUp 0.25s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 20px 14px',
            borderBottom: '1px solid var(--cream-300)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backgroundColor: 'var(--ivory-50)',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'var(--brown-800)',
                backgroundColor: 'rgba(242, 193, 78, 0.22)',
                padding: '3px 9px',
                borderRadius: 'var(--radius-full)',
                marginBottom: '6px',
              }}
            >
              <Sparkles size={12} color="var(--gold-600)" />
              <span>Pilih Paket Kemasan</span>
            </div>
            <h2
              id="quick-select-title"
              style={{
                fontSize: '18px',
                fontWeight: 700,
                fontFamily: 'var(--font-serif)',
                color: 'var(--brown-900)',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {product.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--cream-200)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--brown-800)',
              transition: 'background-color 0.15s',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleAddToCart} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', overflowY: 'auto', maxHeight: 'calc(90vh - 160px)' }}>
            {/* Product Summary Row */}
            <div
              style={{
                display: 'flex',
                gap: '14px',
                alignItems: 'center',
                padding: '12px 14px',
                backgroundColor: '#fff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--cream-300)',
                marginBottom: '18px',
              }}
            >
              <img
                src={primaryImage}
                alt={product.name}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-md)',
                  objectFit: 'cover',
                  border: '1px solid var(--cream-300)',
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                  Harga Paket Terpilih:
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--brown-800)' }}>
                  {selectedVariant
                    ? selectedVariant.maxPrice && selectedVariant.maxPrice > selectedVariant.price
                      ? `${formatRupiah(selectedVariant.price)} - ${formatRupiah(selectedVariant.maxPrice)}`
                      : formatRupiah(selectedVariant.price)
                    : formatRupiah(0)}
                </div>
                {isPreOrder ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--warning-700)', fontWeight: 600, marginTop: '2px' }}>
                    <Clock size={12} />
                    <span>Pre-Order H-{product.preOrderLeadTime} (Dipanggang Segar)</span>
                  </div>
                ) : isSoldOut ? (
                  <span style={{ fontSize: '11px', color: 'var(--danger-600)', fontWeight: 700 }}>
                    Stok paket ini habis
                  </span>
                ) : (
                  <span style={{ fontSize: '11px', color: 'var(--success-600)', fontWeight: 600 }}>
                    Ready Stock (Tersedia {availableStock} toples)
                  </span>
                )}
              </div>
            </div>

            {/* Packaging / Variant Options */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--brown-900)' }}>
                  Pilih Ukuran / Paket Yang Mau Dibeli:
                </label>
                <span style={{ fontSize: '11.5px', color: 'var(--gold-700)', fontWeight: 600 }}>
                  Wajib dipilih
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeVariants.map(variant => {
                  const isSelected = selectedVariant?.id === variant.id;
                  const isVariantSoldOut =
                    !isPreOrder &&
                    product.stockMode === 'per_variant' &&
                    variant.stockQuantity <= 0;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={isVariantSoldOut}
                      onClick={() => setSelectedVariantId(variant.id)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-lg)',
                        border: isSelected ? '2px solid var(--gold-600)' : '1px solid var(--cream-300)',
                        backgroundColor: isSelected
                          ? 'rgba(242, 193, 78, 0.12)'
                          : isVariantSoldOut
                          ? 'var(--cream-100)'
                          : '#fff',
                        opacity: isVariantSoldOut ? 0.6 : 1,
                        cursor: isVariantSoldOut ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        textAlign: 'left',
                        boxShadow: isSelected ? '0 2px 8px rgba(242, 193, 78, 0.25)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {/* Left: Radio indicator & Variant Name */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            border: isSelected ? '5px solid var(--gold-600)' : '2px solid var(--cream-400)',
                            backgroundColor: '#fff',
                            flexShrink: 0,
                            transition: 'all 0.15s ease',
                          }}
                        />
                        <div>
                          <div
                            style={{
                              fontSize: '13.5px',
                              fontWeight: isSelected ? 700 : 600,
                              color: isSelected ? 'var(--brown-900)' : 'var(--text-primary)',
                            }}
                          >
                            {variant.name}
                          </div>
                          {isVariantSoldOut ? (
                            <span style={{ fontSize: '11px', color: 'var(--danger-600)', fontWeight: 600 }}>
                              Stok Habis
                            </span>
                          ) : !isPreOrder && product.stockMode === 'per_variant' && variant.stockQuantity <= 5 ? (
                            <span style={{ fontSize: '11px', color: 'var(--warning-700)', fontWeight: 600 }}>
                              Sisa {variant.stockQuantity} toples
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Right: Price & Badge */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div
                          style={{
                            fontSize: '14px',
                            fontWeight: 700,
                            color: isSelected ? 'var(--brown-900)' : 'var(--brown-800)',
                          }}
                        >
                          {variant.maxPrice && variant.maxPrice > variant.price
                            ? `${formatRupiah(variant.price)} - ${formatRupiah(variant.maxPrice)}`
                            : formatRupiah(variant.price)}
                        </div>
                        {isSelected && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              fontSize: '10px',
                              fontWeight: 700,
                              color: 'var(--gold-700)',
                            }}
                          >
                            <Check size={11} strokeWidth={3} /> Terpilih
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper & Notes */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                backgroundColor: '#fff',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--cream-300)',
                marginBottom: '14px',
              }}
            >
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brown-900)', display: 'block' }}>
                  Jumlah Pesanan:
                </label>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Total: {formatRupiah(totalPrice)}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid var(--cream-300)',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--ivory-50)',
                  overflow: 'hidden',
                }}
              >
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isSoldOut}
                  aria-label="Kurangi jumlah"
                  style={{
                    width: '36px',
                    height: '36px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                    color: quantity <= 1 ? 'var(--text-muted)' : 'var(--brown-900)',
                  }}
                >
                  <Minus size={14} />
                </button>

                <span
                  style={{
                    width: '40px',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                    color: 'var(--brown-900)',
                  }}
                >
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={isSoldOut || (!isPreOrder && quantity >= availableStock)}
                  aria-label="Tambah jumlah"
                  style={{
                    width: '36px',
                    height: '36px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor:
                      isSoldOut || (!isPreOrder && quantity >= availableStock)
                        ? 'not-allowed'
                        : 'pointer',
                    color:
                      isSoldOut || (!isPreOrder && quantity >= availableStock)
                        ? 'var(--text-muted)'
                        : 'var(--brown-900)',
                  }}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Special Notes (Optional) */}
            <div style={{ marginBottom: '14px' }}>
              <label
                htmlFor="quick-modal-notes"
                style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}
              >
                Catatan Khusus (Opsional):
              </label>
              <input
                id="quick-modal-notes"
                type="text"
                placeholder="Contoh: toples tolong diikat pita rapi, ucapan selamat, dll."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--cream-300)',
                  backgroundColor: '#fff',
                  fontSize: '13px',
                  color: 'var(--brown-900)',
                }}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid var(--cream-300)',
              backgroundColor: 'var(--ivory-50)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <button
              type="submit"
              disabled={isSoldOut}
              style={{
                width: '100%',
                backgroundColor: isSoldOut ? 'var(--cream-300)' : 'var(--gold-500)',
                color: isSoldOut ? 'var(--text-muted)' : 'var(--brown-900)',
                padding: '12px 20px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                fontSize: '14.5px',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: isSoldOut ? 'not-allowed' : 'pointer',
                boxShadow: isSoldOut ? 'none' : '0 4px 14px rgba(242, 193, 78, 0.4)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
            >
              <ShoppingBag size={18} />
              <span>
                {isSoldOut
                  ? 'Stok Paket Habis'
                  : `Tambah ke Keranjang • ${formatRupiah(totalPrice)}`}
              </span>
            </button>

            <div style={{ textAlign: 'center' }}>
              <Link
                to={`/produk/${product.slug}`}
                onClick={onClose}
                style={{
                  fontSize: '12.5px',
                  color: 'var(--brown-700)',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>Lihat foto & ulasan lengkap produk</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes quickModalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes quickModalSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};
