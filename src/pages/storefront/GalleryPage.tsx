import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, X, ArrowRight } from 'lucide-react';
import { repos } from '@/services/repositories';
import { GalleryItem } from '@/types';

export const GalleryPage: React.FC = () => {
  const galleryItems = useMemo(() => {
    return repos.settingsRepo.getGallery().filter(item => item.active);
  }, []);

  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  return (
    <div className="container" style={{ paddingTop: '24px' }}>
      <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 36px' }}>
        <span className="badge-demo" style={{ marginBottom: '10px' }}>Dokumentasi Dapur</span>
        <h1 style={{ fontSize: '32px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', marginBottom: '10px' }}>
          Galeri Kebahagiaan
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Potret kreasi aneka kue, pesanan hampers pelanggan, dan panggangan hangat langsung dari dapur Bintang Cake & Cookies Samarinda.
        </p>
      </div>

      {galleryItems.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {galleryItems.map(item => (
            <div
              key={item.id}
              onClick={() => setActiveItem(item)}
              style={{
                backgroundColor: 'var(--ivory-50)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--cream-300)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              className="gallery-card"
            >
              <div style={{ width: '100%', aspectRatio: '4/3', overflow: 'hidden', backgroundColor: 'var(--cream-200)' }}>
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '14px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', marginBottom: '4px' }}>
                  {item.title}
                </h3>
                {item.description && (
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada foto galeri.</p>
      )}

      {/* CTA Box */}
      <div
        style={{
          marginTop: '48px',
          backgroundColor: 'var(--cream-200)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          textAlign: 'center',
          border: '1px solid var(--cream-300)',
        }}
      >
        <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', color: 'var(--brown-900)', marginBottom: '8px' }}>
          Ingin Pesan Kue Seperti di Galeri?
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Jelajahi katalog lengkap kami atau diskusikan pesanan kue hantaran Anda sekarang juga.
        </p>
        <Link
          to="/produk"
          style={{
            backgroundColor: 'var(--brown-800)',
            color: 'var(--text-on-dark)',
            padding: '10px 24px',
            borderRadius: 'var(--radius-full)',
            fontWeight: 700,
            fontSize: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>Pilih Produk di Katalog</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Lightbox Modal */}
      {activeItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
          onClick={() => setActiveItem(null)}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '680px',
              width: '100%',
              overflow: 'hidden',
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveItem(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                backgroundColor: 'rgba(0,0,0,0.6)',
                color: '#fff',
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>
            <img src={activeItem.imageUrl} alt={activeItem.title} style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', backgroundColor: '#000' }} />
            <div style={{ padding: '16px 20px' }}>
              <h3 style={{ fontSize: '18px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', marginBottom: '6px' }}>
                {activeItem.title}
              </h3>
              {activeItem.description && (
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {activeItem.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .gallery-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
      `}</style>
    </div>
  );
};
