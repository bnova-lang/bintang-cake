import React, { useState, useEffect, useMemo } from 'react';
import { Star, Eye, EyeOff, Search, MessageSquare, AlertCircle } from 'lucide-react';
import { repos } from '@/services/repositories';
import { Review, Product } from '@/types';
import { formatDateTimeWITA } from '@/utils/format';
import { useToast } from '@/app/providers/ToastContext';

export const AdminReviewsPage: React.FC = () => {
  const { addToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [productsMap, setProductsMap] = useState<Record<string, Product>>({});
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'visible' | 'hidden'>('all');

  const loadData = () => {
    const revs = repos.review.getAll();
    setReviews(revs);

    const prods = repos.product.getAll();
    const map: Record<string, Product> = {};
    prods.forEach(p => {
      map[p.id] = p;
    });
    setProductsMap(map);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleHidden = (review: Review) => {
    const ok = repos.review.toggleHidden(review.id);
    if (ok) {
      addToast(
        review.isHidden
          ? 'Ulasan sekarang ditampilkan ke publik.'
          : 'Ulasan berhasil disembunyikan dari publik.',
        'success'
      );
      loadData();
    }
  };

  const filtered = useMemo(() => {
    return reviews.filter(r => {
      if (filter === 'visible' && r.isHidden) return false;
      if (filter === 'hidden' && !r.isHidden) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const prod = productsMap[r.productId];
        const matchProd = prod ? prod.name.toLowerCase().includes(q) : false;
        const matchName = r.customerName.toLowerCase().includes(q);
        const matchComment = r.comment.toLowerCase().includes(q);
        return matchProd || matchName || matchComment;
      }
      return true;
    });
  }, [reviews, filter, search, productsMap]);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', marginBottom: '4px' }}>
          Moderasi Ulasan Pelanggan
        </h1>
        <p style={{ color: 'var(--brown-600)', fontSize: '14px' }}>
          Tinjau ulasan dan penilaian kue dari pelanggan yang telah menyelesaikan pesanan.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          backgroundColor: '#FFFFFF',
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-sm)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--brown-400)' }} />
          <input
            type="text"
            placeholder="Cari ulasan berdasarkan produk, nama pelanggan, atau komentar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--cream-300)',
              fontSize: '13px',
              backgroundColor: 'var(--cream-100)',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: filter === 'all' ? 'var(--brown-900)' : 'var(--cream-200)',
              color: filter === 'all' ? 'var(--text-on-dark)' : 'var(--brown-800)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Semua ({reviews.length})
          </button>
          <button
            onClick={() => setFilter('visible')}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: filter === 'visible' ? 'var(--brown-900)' : 'var(--cream-200)',
              color: filter === 'visible' ? 'var(--text-on-dark)' : 'var(--brown-800)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Tampil ({reviews.filter(r => !r.isHidden).length})
          </button>
          <button
            onClick={() => setFilter('hidden')}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: filter === 'hidden' ? 'var(--brown-900)' : 'var(--cream-200)',
              color: filter === 'hidden' ? 'var(--text-on-dark)' : 'var(--brown-800)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Disembunyikan ({reviews.filter(r => r.isHidden).length})
          </button>
        </div>
      </div>

      {/* Reviews Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--cream-200)', color: 'var(--brown-800)', borderBottom: '1px solid var(--cream-300)' }}>
              <th style={{ padding: '12px 16px' }}>Produk</th>
              <th style={{ padding: '12px 16px' }}>Pelanggan</th>
              <th style={{ padding: '12px 16px' }}>Rating</th>
              <th style={{ padding: '12px 16px' }}>Komentar</th>
              <th style={{ padding: '12px 16px' }}>Waktu</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Aksi Moderasi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--brown-500)' }}>
                  <AlertCircle size={32} style={{ margin: '0 auto 8px', color: 'var(--brown-400)' }} />
                  Belum ada ulasan yang sesuai dengan filter.
                </td>
              </tr>
            ) : (
              filtered.map(r => {
                const product = productsMap[r.productId];
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--cream-200)', backgroundColor: r.isHidden ? '#FFFBEB' : '#FFFFFF' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--brown-900)' }}>
                      {product ? product.name : `ID: ${r.productId}`}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--brown-800)' }}>
                      {r.customerName}
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < r.rating ? 'var(--gold-500)' : 'transparent'}
                            color={i < r.rating ? 'var(--gold-500)' : 'var(--cream-400)'}
                          />
                        ))}
                        <span style={{ fontSize: '12px', fontWeight: 700, marginLeft: '4px', color: 'var(--brown-900)' }}>
                          {r.rating}.0
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--brown-700)', maxWidth: '300px' }}>
                      <div style={{ fontStyle: 'italic', marginBottom: '4px' }}>"{r.comment}"</div>
                      {r.isHidden && (
                        <span style={{ fontSize: '10px', backgroundColor: '#FEE2E2', color: '#991B1B', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          Disembunyikan dari Publik
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--brown-500)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {formatDateTimeWITA(r.createdAt)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleToggleHidden(r)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--cream-300)',
                          backgroundColor: r.isHidden ? '#DCFCE7' : '#FEE2E2',
                          color: r.isHidden ? '#166534' : '#991B1B',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {r.isHidden ? (
                          <>
                            <Eye size={14} /> Tampilkan
                          </>
                        ) : (
                          <>
                            <EyeOff size={14} /> Sembunyikan
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
