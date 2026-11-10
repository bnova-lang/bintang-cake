import React, { useMemo, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, Heart, Award, ShieldCheck, ChevronRight } from 'lucide-react';
import { repos } from '@/services/repositories';
import { ProductCard } from '@/components/product/ProductCard';

export const HomePage: React.FC = () => {
  const location = useLocation();
  const [content, setContent] = useState(() => repos.settingsRepo.getContent());
  const [categories, setCategories] = useState(() => repos.categoryRepo.getAll().filter(c => c.active));
  const [allProducts, setAllProducts] = useState(() => repos.productRepo.getAll().filter(p => p.active));

  useEffect(() => {
    const handleUpdate = () => {
      setContent(repos.settingsRepo.getContent());
      setCategories(repos.categoryRepo.getAll().filter(c => c.active));
      setAllProducts(repos.productRepo.getAll().filter(p => p.active));
    };
    handleUpdate();
    window.addEventListener('bcc-settings-updated', handleUpdate);
    window.addEventListener('bcc-categories-updated', handleUpdate);
    window.addEventListener('bcc-products-updated', handleUpdate);
    return () => {
      window.removeEventListener('bcc-settings-updated', handleUpdate);
      window.removeEventListener('bcc-categories-updated', handleUpdate);
      window.removeEventListener('bcc-products-updated', handleUpdate);
    };
  }, [location.pathname]);

  const featuredProducts = useMemo(() => allProducts.filter(p => p.featured), [allProducts]);
  const newArrivals = useMemo(() => allProducts.filter(p => p.newArrival), [allProducts]);

  const getHeroTitleFont = () => {
    switch (content.heroTitleFontFamily) {
      case 'script':
        return "'Dancing Script', 'Brush Script MT', cursive, serif";
      case 'cormorant':
        return "'Cormorant Garamond', Georgia, serif";
      case 'sans':
        return "var(--font-sans)";
      case 'georgia':
        return "Georgia, 'Times New Roman', serif";
      case 'playfair':
      default:
        return "var(--font-serif)";
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {/* Hero Section */}
      <section style={{ backgroundColor: 'var(--brown-900)', color: 'var(--cream-100)', padding: '48px 0 64px', position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(242, 193, 78, 0.15)', color: 'var(--gold-500)', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
              <Sparkles size={16} />
              <span>{content.heroBadge || 'Panggangan Segar Dapur Samarinda'}</span>
            </div>
            <h1
              style={{
                fontSize: content.heroTitleFontFamily === 'script' ? 'clamp(36px, 6vw, 54px)' : 'clamp(32px, 5vw, 48px)',
                color: content.heroTitleColor || 'var(--text-on-dark)',
                fontFamily: getHeroTitleFont(),
                fontStyle: content.heroTitleItalic ? 'italic' : 'normal',
                fontWeight: content.heroTitleWeight === 'normal' ? 400 : content.heroTitleWeight === 'semibold' ? 600 : 700,
                marginBottom: '16px',
                lineHeight: content.heroTitleFontFamily === 'script' ? 1.25 : 1.15,
                textShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              {content.heroTitle}
            </h1>
            <p style={{ fontSize: '16px', color: 'var(--cream-200)', lineHeight: 1.6, marginBottom: '28px', maxWidth: '520px' }}>
              {content.heroSubtitle}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              <Link
                to="/produk"
                style={{
                  backgroundColor: 'var(--gold-500)',
                  color: 'var(--brown-900)',
                  padding: '12px 24px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  fontSize: '15px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <span>Lihat Seluruh Produk</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/spesial"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--cream-100)',
                  border: '1px solid var(--gold-500)',
                  padding: '12px 24px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                  fontSize: '15px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>Paket Hampers & Spesial</span>
              </Link>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div
              style={{
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)',
                border: '4px solid rgba(242, 193, 78, 0.3)',
                aspectRatio: '4/3',
              }}
            >
              <img
                src={content.heroImageUrl || (content.banners && content.banners[0]?.imageUrl) || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop&q=80'}
                alt="Bintang Cake & Cookies"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: '-16px',
                right: '16px',
                backgroundColor: 'var(--ivory-50)',
                color: 'var(--brown-900)',
                padding: '12px 20px',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                border: '1px solid var(--cream-300)',
              }}
            >
              <div style={{ backgroundColor: 'var(--gold-100)', color: 'var(--gold-600)', width: '38px', height: '38px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={22} />
              </div>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>
                  {content.heroCardLabel || 'Resep Keluarga'}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-serif)' }}>
                  {content.heroCardText || '100% Butter & Bahan Premium'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements Bar */}
      {Boolean(content.announcements && content.announcements.length > 0) && (
        <section className="container">
          <div
            style={{
              backgroundColor: 'var(--cream-200)',
              border: '1px solid var(--cream-300)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--brown-800)' }}>
              <span className="badge-demo">Info</span>
              <span>{(content.announcements || []).join(' • ')}</span>
            </div>
            <Link to="/cara-memesan" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brown-800)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span>Panduan Pesan</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* Categories Grid (6 Kategori Resmi PRD §6.5) */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '24px', color: 'var(--brown-900)' }}>Kategori Pilihan</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Aneka sajian manis untuk menemani momen istimewa Anda</p>
          </div>
          <Link to="/produk" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brown-800)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Lihat Semua</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/kategori/${cat.slug}`}
              style={{
                backgroundColor: 'var(--ivory-50)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--cream-300)',
                overflow: 'hidden',
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.2s',
              }}
              className="cat-card"
            >
              <div style={{ width: '100%', height: '110px', overflow: 'hidden', backgroundColor: 'var(--cream-200)' }}>
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1605138693981-6c8a5ea87796?w=600&auto=format&fit=crop&q=80'}
                  alt={cat.name}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1605138693981-6c8a5ea87796?w=600&auto=format&fit=crop&q=80';
                  }}
                />
              </div>
              <div style={{ padding: '12px 8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--brown-900)' }}>
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        <style>{`
          .cat-card:hover { transform: translateY(-4px); border-color: var(--gold-500); }
        `}</style>
      </section>

      {/* Featured Products (Istimewa Hari Ini) */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '24px', color: 'var(--brown-900)' }}>Istimewa Hari Ini</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Kue favorit paling banyak diborong para pelanggan setia</p>
          </div>
          <Link to="/produk" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brown-800)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Katalog Lengkap</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          {featuredProducts.slice(0, 4).map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* Value Pillars Banner */}
      <section style={{ backgroundColor: 'var(--cream-200)', padding: '40px 0', borderTop: '1px solid var(--cream-300)', borderBottom: '1px solid var(--cream-300)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: 'var(--gold-500)', color: 'var(--brown-900)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
              <Heart size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '16px', marginBottom: '4px', color: 'var(--brown-900)' }}>Bahan Berkualitas</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Menggunakan butter Wijsman asli, telur segar, dan buah nanas pilihan tanpa pengawet buatan.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: 'var(--gold-500)', color: 'var(--brown-900)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '16px', marginBottom: '4px', color: 'var(--brown-900)' }}>Oven Fresh Daily</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Dipanggang secara berkala dengan higienis untuk menjaga kerenyahan dan kesegaran rasa.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: 'var(--gold-500)', color: 'var(--brown-900)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '16px', marginBottom: '4px', color: 'var(--brown-900)' }}>Kemasan Aman</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Toples tersegel rapat dan opsi kotak hampers kokoh menjamin kue tiba dalam kondisi utuh.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      {newArrivals.length > 0 && (
        <section className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '24px', color: 'var(--brown-900)' }}>Kreasi Terbaru</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Varian baru segar yang wajib Anda coba minggu ini</p>
            </div>
            <Link to="/produk" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brown-800)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Lihat Semua</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
            {newArrivals.slice(0, 4).map(prod => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* Special Hampers Promo Card */}
      <section className="container">
        <div
          style={{
            backgroundColor: 'var(--brown-800)',
            color: 'var(--cream-100)',
            borderRadius: 'var(--radius-xl)',
            padding: '36px 32px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
            alignItems: 'center',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div>
            <span style={{ backgroundColor: 'var(--gold-500)', color: 'var(--brown-900)', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--radius-full)', textTransform: 'uppercase' }}>
              {content.hampersBadge || 'Spesial Momen'}
            </span>
            <h2 style={{ fontSize: '28px', color: 'var(--gold-500)', margin: '14px 0 10px', fontFamily: 'var(--font-serif)' }}>
              {content.hampersTitle || 'Hampers & Parcel Eksklusif'}
            </h2>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--cream-200)', marginBottom: '20px' }}>
              {content.hampersSubtitle || 'Sampaikan ungkapan terima kasih, ucapan selamat, dan doa tulus kepada keluarga serta rekan bisnis dengan paket hantaran mewah berbalut hardbox eksklusif.'}
            </p>
            <Link
              to="/spesial"
              style={{
                backgroundColor: 'var(--gold-500)',
                color: 'var(--brown-900)',
                padding: '12px 24px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>{content.hampersButtonText || 'Pilih Paket Hampers'}</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', maxHeight: '260px' }}>
            <img
              src={content.hampersBannerImageUrl || 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop&q=80'}
              alt="Hampers Bintang Cake"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
