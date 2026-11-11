import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Cookie } from 'lucide-react';
import { repos } from '@/services/repositories';
import { ProductCard } from '@/components/product/ProductCard';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('kategori') || 'semua';
  const initialQuery = searchParams.get('q') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [sortBy, setSortBy] = useState<string>('urutan');
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>('semua');
  const [maxPrice, setMaxPrice] = useState<number>(500000);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setSearchQuery(q);
    const cat = searchParams.get('kategori');
    if (cat !== null) setSelectedCategory(cat);
  }, [searchParams]);

  const categories = useMemo(() => repos.categoryRepo.getAll(), []);
  const allProducts = useMemo(() => repos.productRepo.getAll().filter(p => p.active), []);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      // Category filter
      if (selectedCategory !== 'semua') {
        const cat = categories.find(c => c.slug === selectedCategory);
        if (cat && p.categoryId !== cat.id) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(query);
        const matchDesc = p.shortDescription.toLowerCase().includes(query);
        if (!matchName && !matchDesc) return false;
      }

      // Fulfillment filter
      if (fulfillmentFilter !== 'semua' && p.fulfillmentType !== fulfillmentFilter) {
        return false;
      }

      // Price filter (min variant price)
      const minVariantPrice = Math.min(...p.variants.map(v => v.price));
      if (minVariantPrice > maxPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const minA = Math.min(...a.variants.map(v => v.price));
      const minB = Math.min(...b.variants.map(v => v.price));

      if (sortBy === 'urutan') {
        const orderA = typeof a.sortOrder === 'number' ? a.sortOrder : 999;
        const orderB = typeof b.sortOrder === 'number' ? b.sortOrder : 999;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'termurah') return minA - minB;
      if (sortBy === 'termahal') return minB - minA;
      if (sortBy === 'nama-asc') return a.name.localeCompare(b.name);
      // Terbaru
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [allProducts, categories, selectedCategory, searchQuery, fulfillmentFilter, maxPrice, sortBy]);

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    if (slug === 'semua') {
      searchParams.delete('kategori');
    } else {
      searchParams.set('kategori', slug);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="container" style={{ paddingTop: '24px' }}>
      {/* Page Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', marginBottom: '6px' }}>
          Katalog Produk
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Pilihan cake lembut, cookies renyah, lidah kucing, lapis legit, dan hampers eksklusif
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div
        style={{
          backgroundColor: 'var(--ivory-50)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--cream-300)',
          padding: '16px 20px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Cari nastar, lidah kucing, lapis legit..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--cream-300)',
                backgroundColor: '#fff',
                fontSize: '14px',
              }}
            />
          </div>

          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SlidersHorizontal size={16} color="var(--text-muted)" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--cream-300)',
                backgroundColor: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--brown-900)',
              }}
            >
              <option value="urutan">Urutan Rekomendasi Toko</option>
              <option value="terbaru">Terbaru</option>
              <option value="termurah">Harga: Termurah</option>
              <option value="termahal">Harga: Termahal</option>
              <option value="nama-asc">Nama: A - Z</option>
            </select>
          </div>

          {/* Fulfillment Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              value={fulfillmentFilter}
              onChange={e => setFulfillmentFilter(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--cream-300)',
                backgroundColor: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--brown-900)',
              }}
            >
              <option value="semua">Semua Tipe Stok</option>
              <option value="ready_stock">Ready Stock</option>
              <option value="pre_order">Pre-Order</option>
            </select>
          </div>
        </div>

        {/* Category Horizontal Chips */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button
            onClick={() => handleCategorySelect('semua')}
            style={{
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: '13px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              backgroundColor: selectedCategory === 'semua' ? 'var(--brown-800)' : 'var(--cream-200)',
              color: selectedCategory === 'semua' ? 'var(--text-on-dark)' : 'var(--brown-800)',
              transition: 'all 0.2s',
            }}
          >
            Semua Produk ({allProducts.length})
          </button>
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.slug)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '13px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  backgroundColor: isSelected ? 'var(--brown-800)' : 'var(--cream-200)',
                  color: isSelected ? 'var(--text-on-dark)' : 'var(--brown-800)',
                  transition: 'all 0.2s',
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid or Empty State */}
      {filteredProducts.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          {filteredProducts.map(prod => (
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
          <div style={{ backgroundColor: 'var(--cream-200)', color: 'var(--brown-500)', width: '60px', height: '60px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cookie size={32} />
          </div>
          <h3 style={{ fontSize: '18px', color: 'var(--brown-900)' }}>Tidak ada produk yang sesuai</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '400px' }}>
            Coba gunakan kata kunci pencarian lain atau pilih kategori yang berbeda.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('semua');
              setSearchQuery('');
              setFulfillmentFilter('semua');
            }}
            style={{
              backgroundColor: 'var(--gold-500)',
              color: 'var(--brown-900)',
              padding: '8px 20px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              fontSize: '13px',
              marginTop: '8px',
            }}
          >
            Reset Filter
          </button>
        </div>
      )}
    </div>
  );
};
