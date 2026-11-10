import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Cookie } from 'lucide-react';
import { repos } from '@/services/repositories';
import { ProductCard } from '@/components/product/ProductCard';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const category = useMemo(() => {
    return repos.categoryRepo.getBySlug(slug || '');
  }, [slug]);

  const products = useMemo(() => {
    if (!category) return [];
    return repos.productRepo.getByCategory(category.id);
  }, [category]);

  if (!category) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', color: 'var(--brown-900)', marginBottom: '12px' }}>Kategori Tidak Ditemukan</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Kategori yang Anda tuju tidak tersedia.</p>
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

  return (
    <div className="container" style={{ paddingTop: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/produk" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--brown-700)', fontWeight: 600, marginBottom: '12px' }}>
          <ArrowLeft size={16} />
          <span>Semua Kategori</span>
        </Link>
        <h1 style={{ fontSize: '32px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>
          {category.name}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Koleksi sajian terbaik untuk kategori {category.name}
        </p>
      </div>

      {products.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          {products.map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      ) : (
        <div
          style={{
            backgroundColor: 'var(--ivory-50)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--cream-300)',
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Cookie size={32} color="var(--brown-500)" />
          <h3 style={{ fontSize: '18px', color: 'var(--brown-900)' }}>Belum ada produk di kategori ini</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Produk untuk kategori {category.name} sedang dalam proses persiapan dapur kami.
          </p>
        </div>
      )}
    </div>
  );
};
