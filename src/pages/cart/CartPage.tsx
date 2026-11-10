import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '@/app/providers/CartContext';
import { formatRupiah } from '@/utils/format';

export const CartPage: React.FC = () => {
  const { detailedItems, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  if (detailedItems.length === 0) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <div style={{ backgroundColor: 'var(--cream-200)', color: 'var(--brown-500)', width: '70px', height: '70px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <ShoppingBag size={36} />
        </div>
        <h2 style={{ fontSize: '24px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>
          Keranjang Belanja Anda Kosong
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          Pilih aneka kue kering, cake, atau hampers lezat di katalog kami.
        </p>
        <Link
          to="/produk"
          style={{
            backgroundColor: 'var(--gold-500)',
            color: 'var(--brown-900)',
            padding: '12px 28px',
            borderRadius: 'var(--radius-full)',
            fontWeight: 700,
            fontSize: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>Mulai Belanja</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '24px', maxWidth: '860px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)' }}>
            Keranjang Pesanan
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {detailedItems.length} produk pilihan dalam keranjang Anda
          </p>
        </div>
        <button
          onClick={clearCart}
          style={{ fontSize: '12px', color: 'var(--danger-600)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          <Trash2 size={14} />
          <span>Kosongkan</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        {detailedItems.map(item => {
          const imgUrl = item.product.images[0]?.url || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&auto=format&fit=crop&q=80';
          return (
            <div
              key={item.id}
              style={{
                backgroundColor: 'var(--ivory-50)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                border: '1px solid var(--cream-300)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
              }}
            >
              <img
                src={imgUrl}
                alt={item.product.name}
                style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', objectFit: 'cover', backgroundColor: 'var(--cream-200)', flexShrink: 0 }}
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', margin: 0 }}>
                    {item.product.name}
                  </h3>
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{ color: 'var(--text-muted)', padding: '4px', cursor: 'pointer' }}
                    aria-label="Hapus item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--gold-600)', fontWeight: 600, margin: '2px 0 6px' }}>
                  {item.variant.name} • {formatRupiah(item.unitPrice)}
                </div>

                {item.notes && (
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', margin: '0 0 8px' }}>
                    Catatan: "{item.notes}"
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--cream-300)', borderRadius: 'var(--radius-full)', backgroundColor: '#fff' }}>
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      style={{ width: '28px', height: '28px', fontSize: '16px', fontWeight: 700, color: 'var(--brown-900)' }}
                    >
                      -
                    </button>
                    <span style={{ minWidth: '32px', textAlign: 'center', fontSize: '13px', fontWeight: 700 }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      style={{ width: '28px', height: '28px', fontSize: '16px', fontWeight: 700, color: 'var(--brown-900)' }}
                    >
                      +
                    </button>
                  </div>

                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--brown-900)' }}>
                    {formatRupiah(item.itemSubtotal)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Summary Card */}
      <div
        style={{
          backgroundColor: 'var(--ivory-50)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          border: '1px solid var(--cream-300)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '15px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Subtotal Produk</span>
          <b style={{ color: 'var(--brown-900)', fontSize: '18px' }}>{formatRupiah(subtotal)}</b>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
          * Ongkos kirim akan dihitung pada halaman berikutnya sesuai pilihan metode pengiriman.
        </p>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <Link
            to="/produk"
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              color: 'var(--brown-800)',
              border: '1px solid var(--brown-800)',
              padding: '12px 20px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600,
              fontSize: '14px',
              textAlign: 'center',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <ArrowLeft size={16} />
            <span>Tambah Kue</span>
          </Link>
          <button
            onClick={() => navigate('/checkout')}
            style={{
              flex: 2,
              backgroundColor: 'var(--gold-500)',
              color: 'var(--brown-900)',
              padding: '12px 24px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              fontSize: '15px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <span>Lanjut ke Checkout</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
