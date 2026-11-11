import React, { useState, useEffect } from 'react';
import { X, Search, Image as ImageIcon, Check, Plus } from 'lucide-react';
import { GalleryItem } from '@/types';

interface GalleryPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTitle: string;
  galleryItems: GalleryItem[];
  onSelect: (item: GalleryItem) => void;
  onOpenUploadNew?: () => void;
}

export const GalleryPickerModal: React.FC<GalleryPickerModalProps> = ({
  isOpen,
  onClose,
  targetTitle,
  galleryItems,
  onSelect,
  onOpenUploadNew,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedCat('all');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = Array.from(
    new Set(galleryItems.map(g => g.category || 'Kue & Cookies').filter(Boolean))
  );

  const filteredItems = galleryItems.filter(item => {
    if (selectedCat !== 'all' && item.category !== selectedCat) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchCat = (item.category || '').toLowerCase().includes(q);
      if (!matchTitle && !matchCat) return false;
    }
    return true;
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(32, 19, 12, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'galleryPickerFadeIn 0.2s ease-out',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFDF9',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(32, 19, 12, 0.45)',
          border: '1px solid var(--cream-300)',
          animation: 'galleryPickerSlideUp 0.25s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--cream-300)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--ivory-50)',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--gold-700)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '4px',
              }}
            >
              <ImageIcon size={14} />
              <span>Gunakan Foto Dari Galeri Toko</span>
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: '18px',
                color: 'var(--brown-900)',
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
              }}
            >
              {targetTitle}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela galeri"
            style={{
              width: '34px',
              height: '34px',
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

        {/* Search & Category Filter Toolbar */}
        <div
          style={{
            padding: '14px 24px',
            backgroundColor: '#fff',
            borderBottom: '1px solid var(--cream-200)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Cari foto galeri berdasarkan judul atau kategori..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--cream-300)',
                fontSize: '13px',
                backgroundColor: 'var(--ivory-50)',
              }}
            />
          </div>

          {/* Category Chips */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            <button
              type="button"
              onClick={() => setSelectedCat('all')}
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11.5px',
                fontWeight: selectedCat === 'all' ? 700 : 500,
                border: selectedCat === 'all' ? '1.5px solid var(--gold-600)' : '1px solid var(--cream-300)',
                backgroundColor: selectedCat === 'all' ? 'var(--gold-100)' : '#fff',
                color: selectedCat === 'all' ? 'var(--brown-900)' : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Semua Foto ({galleryItems.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCat(cat)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11.5px',
                  fontWeight: selectedCat === cat ? 700 : 500,
                  border: selectedCat === cat ? '1.5px solid var(--gold-600)' : '1px solid var(--cream-300)',
                  backgroundColor: selectedCat === cat ? 'var(--gold-100)' : '#fff',
                  color: selectedCat === cat ? 'var(--brown-900)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, maxHeight: 'calc(90vh - 200px)' }}>
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--cream-200)',
                  color: 'var(--brown-600)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                }}
              >
                <ImageIcon size={30} />
              </div>
              <h4 style={{ fontSize: '15px', color: 'var(--brown-900)', margin: '0 0 6px' }}>
                {galleryItems.length === 0 ? 'Belum Ada Foto di Galeri' : 'Tidak Ada Foto yang Cocok'}
              </h4>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto 16px' }}>
                {galleryItems.length === 0
                  ? 'Foto-foto kue yang Anda unggah ke galeri toko akan muncul di sini dan siap digunakan untuk Banner Hampers, Foto Header, maupun Slider Banner.'
                  : 'Coba ubah kata kunci pencarian atau pilih kategori lain.'}
              </p>
              {onOpenUploadNew && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenUploadNew();
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 18px',
                    backgroundColor: 'var(--gold-500)',
                    color: 'var(--brown-900)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={16} /> Unggah Foto ke Galeri Sekarang
                </button>
              )}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '14px',
              }}
            >
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => onSelect(item)}
                  style={{
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    border: '1.5px solid var(--cream-300)',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.18s ease',
                  }}
                  className="gallery-picker-card"
                >
                  {/* Photo Thumbnail */}
                  <div style={{ position: 'relative', width: '100%', height: '140px', backgroundColor: 'var(--cream-200)', overflow: 'hidden' }}>
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1605138693981-6c8a5ea87796?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div
                      className="gallery-hover-overlay"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(59, 36, 22, 0.7)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        color: '#fff',
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: 'var(--gold-500)',
                          color: 'var(--brown-900)',
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        }}
                      >
                        <Check size={20} strokeWidth={3} />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                        Gunakan Foto Ini
                      </span>
                    </div>

                    {item.category && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '6px',
                          left: '6px',
                          backgroundColor: 'rgba(32, 19, 12, 0.75)',
                          color: 'var(--gold-300)',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        {item.category}
                      </span>
                    )}
                  </div>

                  {/* Caption & Select Button */}
                  <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: 'var(--brown-900)',
                        marginBottom: '6px',
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {item.title}
                    </div>

                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onSelect(item);
                      }}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--gold-500)',
                        color: 'var(--brown-900)',
                        fontWeight: 700,
                        fontSize: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        transition: 'background-color 0.15s',
                      }}
                    >
                      <Check size={13} strokeWidth={3} />
                      <span>Pilih Foto Ini</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 24px',
            borderTop: '1px solid var(--cream-300)',
            backgroundColor: 'var(--ivory-50)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Menampilkan {filteredItems.length} dari {galleryItems.length} foto galeri
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 18px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--cream-300)',
              backgroundColor: '#fff',
              color: 'var(--brown-800)',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Tutup
          </button>
        </div>
      </div>

      <style>{`
        @keyframes galleryPickerFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes galleryPickerSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .gallery-picker-card:hover {
          border-color: var(--gold-600) !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(0,0,0,0.12) !important;
        }
        .gallery-picker-card:hover .gallery-hover-overlay {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};
