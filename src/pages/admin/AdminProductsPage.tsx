import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, X, Check, Cookie, Image, Folder } from 'lucide-react';
import { repos } from '@/services/repositories';
import { Product, ProductVariant, FulfillmentType, StockMode } from '@/types';
import { formatRupiah } from '@/utils/format';
import { useToast } from '@/app/providers/ToastContext';

export const AdminProductsPage: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>(() => repos.productRepo.getAll());
  const categories = useMemo(() => repos.categoryRepo.getAll(), []);

  const [search, setSearch] = useState<string>('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form States for Modal
  const [name, setName] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [shortDesc, setShortDesc] = useState<string>('');
  const [desc, setDesc] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('ready_stock');
  const [leadTime, setLeadTime] = useState<number>(0);
  const [stockMode, setStockMode] = useState<StockMode>('per_variant');
  const [stockQty, setStockQty] = useState<number>(10);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(3);
  const [featured, setFeatured] = useState<boolean>(false);
  const [newArrival, setNewArrival] = useState<boolean>(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const reloadProducts = () => {
    setProducts(repos.productRepo.getAll());
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (filterCat !== 'all' && p.categoryId !== filterCat) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.shortDescription.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [products, filterCat, search]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategoryId(categories[0]?.id || '');
    setShortDesc('');
    setDesc('');
    setImageUrl('https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80');
    setFulfillmentType('ready_stock');
    setLeadTime(0);
    setStockMode('per_variant');
    setStockQty(10);
    setLowStockThreshold(3);
    setFeatured(false);
    setNewArrival(false);
    setVariants([
      {
        id: 'var-1-' + Date.now(),
        name: 'Toples Bulat Segel 500 gr',
        packagingType: 'toples_500g',
        price: 95000,
        stockQuantity: 15,
        active: true,
        sortOrder: 1,
        isDefault: true,
      },
      {
        id: 'var-2-' + Date.now(),
        name: 'Toples Persegi 350 gr',
        packagingType: 'toples_350g',
        price: 75000,
        stockQuantity: 15,
        active: true,
        sortOrder: 2,
      },
      {
        id: 'var-3-' + Date.now(),
        name: 'Mini Pack 150 gr',
        packagingType: 'mini_pack_150g',
        price: 40000,
        stockQuantity: 20,
        active: true,
        sortOrder: 3,
      },
    ]);
    setModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategoryId(p.categoryId);
    setShortDesc(p.shortDescription);
    setDesc(p.description || '');
    setImageUrl(p.images[0]?.url || '');
    setFulfillmentType(p.fulfillmentType);
    setLeadTime(p.preOrderLeadTime);
    setStockMode(p.stockMode);
    setStockQty(p.stockQuantity);
    setLowStockThreshold(p.lowStockThreshold);
    setFeatured(p.featured);
    setNewArrival(p.newArrival);
    setVariants(JSON.parse(JSON.stringify(p.variants)));
    setModalOpen(true);
  };

  const handleAddPresetVariant = (presetName: string, packagingType: string, defaultPrice: number) => {
    setVariants([
      ...variants,
      {
        id: 'var-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
        name: presetName,
        packagingType,
        price: defaultPrice,
        maxPrice: undefined,
        stockQuantity: 10,
        active: true,
        sortOrder: variants.length + 1,
      },
    ]);
  };

  const handleAddVariant = () => {
    handleAddPresetVariant('Varian Baru', 'standard', 50000);
  };

  const handleRemoveVariant = (id: string) => {
    if (variants.length <= 1) {
      alert('Produk harus memiliki minimal satu varian kemasan aktif.');
      return;
    }
    setVariants(variants.filter(v => v.id !== id));
  };

  // Safe image compression handler (SECURITY.md §7)
  const handleUploadImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Format berkas harus berupa gambar JPG/PNG/WEBP.');
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 600;
        let w = img.width;
        let h = img.height;
        if (w > h && w > maxDim) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else if (h > maxDim) {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, w, h);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.70);
        setImageUrl(compressedDataUrl);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const slug = editingProduct?.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const savedProduct: Product = {
      id: editingProduct?.id || 'prod-' + Date.now(),
      name: name.trim(),
      slug,
      categoryId,
      shortDescription: shortDesc.trim(),
      description: desc.trim() || '',
      images: [
        {
          id: 'img-1',
          url: imageUrl || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80',
          altText: name.trim(),
          isPrimary: true,
        },
      ],
      featured,
      newArrival,
      active: true,
      fulfillmentType,
      preOrderLeadTime: fulfillmentType === 'pre_order' ? Number(leadTime) : 0,
      stockMode,
      stockQuantity: Number(stockQty),
      lowStockThreshold: Number(lowStockThreshold),
      variants,
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    repos.productRepo.save(savedProduct);
    window.dispatchEvent(new Event('bcc-products-updated'));
    window.dispatchEvent(new Event('bcc-settings-updated'));
    reloadProducts();
    setModalOpen(false);
    showToast(editingProduct ? 'Produk berhasil diubah!' : 'Produk baru berhasil ditambahkan!', 'success');
  };

  const handleDeleteProduct = (p: Product) => {
    if (confirm(`Yakin ingin menonaktifkan produk "${p.name}"?`)) {
      repos.productRepo.delete(p.id);
      window.dispatchEvent(new Event('bcc-products-updated'));
      window.dispatchEvent(new Event('bcc-settings-updated'));
      reloadProducts();
      showToast('Produk dinonaktifkan.', 'info');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', margin: 0 }}>
            Pengelolaan Produk & Stok
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Kelola katalog kue, varian kemasan, harga, dan ketersediaan stok
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link
            to="/admin/konten#sec-categories"
            style={{
              backgroundColor: 'var(--cream-200)',
              color: 'var(--brown-900)',
              border: '1px solid var(--cream-300)',
              padding: '10px 18px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Folder size={16} /> Kelola Foto Kategori
          </Link>

          <button
            onClick={handleOpenAddModal}
            style={{
              backgroundColor: 'var(--gold-500)',
              color: 'var(--brown-900)',
              padding: '10px 20px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Plus size={18} />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ backgroundColor: 'var(--ivory-50)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--cream-300)', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Cari nama produk atau deskripsi..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px' }}
          />
        </div>

        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '13px', fontWeight: 600 }}
        >
          <option value="all">Semua Kategori</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div style={{ backgroundColor: 'var(--ivory-50)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--cream-300)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--cream-200)', borderBottom: '2px solid var(--cream-300)', color: 'var(--brown-900)' }}>
              <th style={{ padding: '12px' }}>Produk</th>
              <th style={{ padding: '12px' }}>Kategori</th>
              <th style={{ padding: '12px' }}>Tipe Pemenuhan</th>
              <th style={{ padding: '12px' }}>Varian & Harga</th>
              <th style={{ padding: '12px' }}>Stok</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => {
              const cat = categories.find(c => c.id === p.categoryId);
              const imgUrl = p.images[0]?.url || '';
              const totalStock = p.stockMode === 'per_product' ? p.stockQuantity : p.variants.reduce((sum, v) => sum + v.stockQuantity, 0);

              return (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--cream-200)' }}>
                  <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={imgUrl} alt="" style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', objectFit: 'cover', backgroundColor: 'var(--cream-200)' }} />
                    <div>
                      <b style={{ color: 'var(--brown-900)' }}>{p.name}</b>
                      {p.featured && <span style={{ marginLeft: '6px', fontSize: '10px', backgroundColor: 'var(--gold-500)', color: 'var(--brown-900)', padding: '1px 6px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>Unggulan</span>}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>{cat?.name || '-'}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: 'var(--radius-full)', backgroundColor: p.fulfillmentType === 'pre_order' ? 'var(--warning-100)' : 'var(--success-100)', color: p.fulfillmentType === 'pre_order' ? 'var(--warning-600)' : 'var(--success-600)' }}>
                      {p.fulfillmentType === 'pre_order' ? `Pre-Order (H-${p.preOrderLeadTime})` : 'Ready Stock'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {p.variants.map(v => (
                      <div key={v.id} style={{ fontSize: '12px', marginBottom: '2px' }}>
                        {v.name}: <b>{formatRupiah(v.price)}</b> ({v.stockQuantity} pcs)
                      </div>
                    ))}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <b style={{ color: totalStock <= p.lowStockThreshold ? 'var(--danger-600)' : 'var(--brown-900)' }}>
                      {totalStock} pcs
                    </b>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: p.active ? 'var(--success-600)' : 'var(--text-muted)' }}>
                      {p.active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleOpenEditModal(p)}
                      style={{ color: 'var(--brown-800)', marginRight: '8px', cursor: 'pointer' }}
                      title="Edit Produk"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p)}
                      style={{ color: 'var(--danger-600)', cursor: 'pointer' }}
                      title="Nonaktifkan Produk"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <form
            onSubmit={handleSaveProduct}
            style={{
              backgroundColor: '#fff',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--cream-300)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', margin: 0 }}>
                {editingProduct ? 'Edit Data Produk' : 'Tambah Produk Baru'}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} style={{ cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Nama Produk *</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Kastengel Keju Edam" style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)' }} />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Kategori Produk *</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)' }}>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Deskripsi Singkat *</label>
                <input type="text" required value={shortDesc} onChange={e => setShortDesc(e.target.value)} placeholder="Ringkasan rasa dan bahan..." style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)' }} />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Tipe Pemenuhan *</label>
                <select value={fulfillmentType} onChange={e => setFulfillmentType(e.target.value as FulfillmentType)} style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)' }}>
                  <option value="ready_stock">Ready Stock (Tersedia)</option>
                  <option value="pre_order">Pre-Order (Butuh Waktu)</option>
                </select>
              </div>

              {fulfillmentType === 'pre_order' && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Pre-Order Lead Time (Hari)</label>
                  <input type="number" min="1" max="14" value={leadTime} onChange={e => setLeadTime(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)' }} />
                </div>
              )}

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Batas Peringatan Stok Tipis</label>
                <input type="number" min="0" value={lowStockThreshold} onChange={e => setLowStockThreshold(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)' }} />
              </div>

              {/* Photo Input & Upload */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Foto Produk (URL atau Unggah Berkas)</label>
                <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', marginBottom: '6px' }} />
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUploadImageFile} style={{ fontSize: '12px' }} />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>Foto otomatis dikompresi sebelum disimpan ke LocalStorage (&le; 200 KB)</span>
              </div>
            </div>

            {/* Variants Manager */}
            <div style={{ borderTop: '1px solid var(--cream-300)', paddingTop: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '14px', color: 'var(--brown-900)', margin: 0 }}>Varian Kemasan & Rentang Harga</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Atur nama varian/kemasan, harga terendah, harga tertinggi (s/d - opsional), dan stok.
                  </span>
                </div>
                <button type="button" onClick={handleAddVariant} style={{ fontSize: '12px', color: 'var(--brown-800)', fontWeight: 700, cursor: 'pointer', backgroundColor: 'var(--cream-200)', padding: '5px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--cream-300)' }}>+ Tambah Varian</button>
              </div>

              {/* Quick Preset Buttons for Packaging */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', marginBottom: '10px', backgroundColor: 'var(--ivory-50)', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-200)' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brown-800)', marginRight: '4px' }}>
                  + Contoh Kemasan Cepat:
                </span>
                <button
                  type="button"
                  onClick={() => handleAddPresetVariant('Toples Bulat Segel 500 gr', 'toples_500g', 95000)}
                  style={{ fontSize: '11px', padding: '3px 8px', borderRadius: 'var(--radius-full)', backgroundColor: '#fff', border: '1px solid var(--gold-500)', color: 'var(--brown-900)', cursor: 'pointer', fontWeight: 600 }}
                >
                  + Toples 500g
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPresetVariant('Toples Persegi 350 gr', 'toples_350g', 75000)}
                  style={{ fontSize: '11px', padding: '3px 8px', borderRadius: 'var(--radius-full)', backgroundColor: '#fff', border: '1px solid var(--gold-500)', color: 'var(--brown-900)', cursor: 'pointer', fontWeight: 600 }}
                >
                  + Toples 350g
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPresetVariant('Mini Pack 150 gr', 'mini_pack_150g', 40000)}
                  style={{ fontSize: '11px', padding: '3px 8px', borderRadius: 'var(--radius-full)', backgroundColor: '#fff', border: '1px solid var(--gold-500)', color: 'var(--brown-900)', cursor: 'pointer', fontWeight: 600 }}
                >
                  + Mini Pack 150g
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPresetVariant('Toples Tabung Silinder 400 gr', 'toples_tabung', 85000)}
                  style={{ fontSize: '11px', padding: '3px 8px', borderRadius: 'var(--radius-full)', backgroundColor: '#fff', border: '1px solid var(--gold-500)', color: 'var(--brown-900)', cursor: 'pointer', fontWeight: 600 }}
                >
                  + Toples Tabung
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPresetVariant('Box Hampers Isi 2 Toples', 'box_hampers_2', 195000)}
                  style={{ fontSize: '11px', padding: '3px 8px', borderRadius: 'var(--radius-full)', backgroundColor: '#fff', border: '1px solid var(--gold-500)', color: 'var(--brown-900)', cursor: 'pointer', fontWeight: 600 }}
                >
                  + Box Hampers
                </button>
              </div>

              {/* Column Headers */}
              <div style={{ display: 'flex', gap: '8px', padding: '0 12px 4px 12px', fontSize: '11px', fontWeight: 700, color: 'var(--brown-800)' }}>
                <span style={{ flex: 2 }}>Nama Kemasan / Varian *</span>
                <span style={{ flex: 1.2 }}>Harga Terendah (Rp) *</span>
                <span style={{ flex: 1.2 }}>Harga Tertinggi (Rp)</span>
                <span style={{ width: '65px' }}>Stok *</span>
                <span style={{ width: '24px' }}></span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {variants.map((v, idx) => (
                  <div key={v.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: 'var(--cream-100)', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)' }}>
                    <input
                      type="text"
                      placeholder="Contoh: Paket Custom Base / Toples 500g"
                      value={v.name}
                      onChange={e => {
                        const copy = [...variants];
                        copy[idx].name = e.target.value;
                        setVariants(copy);
                      }}
                      style={{ flex: 2, padding: '7px 8px', fontSize: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--cream-300)', backgroundColor: '#fff' }}
                    />
                    <input
                      type="number"
                      placeholder="Min (Rp)"
                      title="Harga Terendah / Mulai"
                      value={v.price || ''}
                      onChange={e => {
                        const copy = [...variants];
                        copy[idx].price = Number(e.target.value);
                        setVariants(copy);
                      }}
                      style={{ flex: 1.2, padding: '7px 8px', fontSize: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--cream-300)', backgroundColor: '#fff' }}
                    />
                    <input
                      type="number"
                      placeholder="Maks (Rp, opsional)"
                      title="Harga Tertinggi / s/d (kosongkan jika harga tetap)"
                      value={v.maxPrice || ''}
                      onChange={e => {
                        const copy = [...variants];
                        const val = e.target.value ? Number(e.target.value) : undefined;
                        copy[idx].maxPrice = val;
                        setVariants(copy);
                      }}
                      style={{ flex: 1.2, padding: '7px 8px', fontSize: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--cream-300)', backgroundColor: '#fff' }}
                    />
                    <input
                      type="number"
                      placeholder="Stok"
                      title="Jumlah Stok"
                      value={v.stockQuantity}
                      onChange={e => {
                        const copy = [...variants];
                        copy[idx].stockQuantity = Number(e.target.value);
                        setVariants(copy);
                      }}
                      style={{ width: '65px', padding: '7px 8px', fontSize: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--cream-300)', backgroundColor: '#fff' }}
                    />
                    <button type="button" onClick={() => handleRemoveVariant(v.id)} title="Hapus Varian" style={{ color: 'var(--danger-600)', padding: '4px', cursor: 'pointer', background: 'none', border: 'none' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '11px', color: 'var(--brown-600)', marginTop: '6px', fontStyle: 'italic' }}>
                💡 Jika kolom "Harga Tertinggi" diisi (misal Terendah: 400.000, Tertinggi: 1.500.000), di etalase toko akan otomatis tertulis rentang: <b>Rp 400.000 - Rp 1.500.000</b>.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '6px' }}>
              <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} />
                <span>Tampilkan di Produk Unggulan</span>
              </label>
              <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="checkbox" checked={newArrival} onChange={e => setNewArrival(e.target.checked)} />
                <span>Tampilkan di Produk Baru</span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '8px 18px', borderRadius: 'var(--radius-full)', border: '1px solid var(--cream-300)' }}>Batal</button>
              <button type="submit" style={{ backgroundColor: 'var(--gold-500)', color: 'var(--brown-900)', padding: '8px 24px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>Simpan Produk</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
