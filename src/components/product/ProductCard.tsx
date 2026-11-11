import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Clock } from 'lucide-react';
import { Product } from '@/types';
import { formatRupiah } from '@/utils/format';
import { useCart } from '@/app/providers/CartContext';
import { useToast } from '@/app/providers/ToastContext';
import { QuickVariantModal } from './QuickVariantModal';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const primaryImage = product.images.find(img => img.isPrimary)?.url || product.images[0]?.url || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80';

  // Calculate price range
  const activeVariants = product.variants.filter(v => v.active);
  const positivePrices = activeVariants.map(v => v.price).filter(p => p > 0);
  const positiveMaxPrices = activeVariants.map(v => (v.maxPrice && v.maxPrice > v.price ? v.maxPrice : v.price)).filter(p => p > 0);
  const minPrice = positivePrices.length ? Math.min(...positivePrices) : 0;
  const maxPrice = positiveMaxPrices.length ? Math.max(...positiveMaxPrices) : (positivePrices.length ? Math.max(...positivePrices) : 0);

  // Check stock
  const isPreOrder = product.fulfillmentType === 'pre_order';
  const totalStock = product.stockMode === 'per_product'
    ? product.stockQuantity
    : activeVariants.reduce((sum, v) => sum + v.stockQuantity, 0);

  const isSoldOut = !isPreOrder && totalStock <= 0;
  const isLowStock = !isPreOrder && totalStock > 0 && totalStock <= product.lowStockThreshold;

  const defaultVariant = activeVariants.find(v => v.isDefault) || activeVariants[0];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut) return;

    // Always open modal so customer can comfortably choose package size & quantity
    setIsModalOpen(true);
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--ivory-50)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--cream-300)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      className="product-card"
    >
      <Link to={`/produk/${product.slug}`} style={{ position: 'relative', width: '100%', paddingTop: '80%', overflow: 'hidden', backgroundColor: 'var(--cream-200)', display: 'block' }}>
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s',
          }}
          className="product-img"
          onError={e => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1605138693981-6c8a5ea87796?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Badges on Image */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {isPreOrder && (
            <span
              style={{
                backgroundColor: 'var(--warning-600)',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Clock size={12} />
              Pre-Order H-{product.preOrderLeadTime}
            </span>
          )}

          {isSoldOut ? (
            <span
              style={{
                backgroundColor: 'var(--danger-600)',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              Habis (Sold Out)
            </span>
          ) : isLowStock ? (
            <span
              style={{
                backgroundColor: 'var(--warning-100)',
                color: 'var(--warning-600)',
                border: '1px solid var(--warning-600)',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              Sisa {totalStock}
            </span>
          ) : null}
        </div>
      </Link>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Link to={`/produk/${product.slug}`}>
          <h3
            style={{
              fontSize: '15px',
              fontWeight: 700,
              fontFamily: 'var(--font-serif)',
              color: 'var(--brown-900)',
              marginBottom: '6px',
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '38px',
            }}
          >
            {product.name}
          </h3>
        </Link>

        <p
          style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            marginBottom: '12px',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '34px',
          }}
        >
          {product.shortDescription}
        </p>

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px dashed var(--cream-300)' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Harga</span>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--brown-800)' }}>
              {minPrice === 0 && maxPrice === 0
                ? 'Hubungi Toko'
                : minPrice === maxPrice || minPrice === 0
                ? formatRupiah(maxPrice || minPrice)
                : `${formatRupiah(minPrice)} - ${formatRupiah(maxPrice)}`}
            </span>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isSoldOut}
            title={`Pilih paket kemasan untuk ${product.name}`}
            aria-label={`Pilih paket kemasan untuk ${product.name}`}
            style={{
              backgroundColor: isSoldOut ? 'var(--cream-300)' : 'var(--gold-500)',
              color: isSoldOut ? 'var(--text-muted)' : 'var(--brown-900)',
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isSoldOut ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s, transform 0.15s, box-shadow 0.15s',
              border: 'none',
              boxShadow: isSoldOut ? 'none' : '0 2px 8px rgba(242, 193, 78, 0.4)',
            }}
            className="product-quick-btn"
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>

      {/* Quick Select Modal for choosing variant & packaging */}
      {activeVariants.length > 0 && (
        <QuickVariantModal
          product={product}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      <style>{`
        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }
        .product-card:hover .product-img {
          transform: scale(1.04);
        }
        .product-quick-btn:hover:not(:disabled) {
          transform: scale(1.08);
          background-color: var(--gold-600) !important;
        }
      `}</style>
    </div>
  );
};
