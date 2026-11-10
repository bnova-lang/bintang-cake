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
      {/* Hero Section Sesuai Desain Mockup */}
      <section
        style={{
          backgroundColor: '#372316',
          backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(245, 130, 32, 0.15) 0%, transparent 60%), linear-gradient(135deg, #372316 0%, #2A1A10 100%)',
          color: 'var(--cream-100)',
          padding: '44px 0 28px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '36px', alignItems: 'center' }}>
          {/* Left Text & CTA */}
          <div style={{ zIndex: 2 }}>
            <h1
              style={{
                fontSize: content.heroTitleFontFamily === 'script' ? 'clamp(36px, 6vw, 56px)' : 'clamp(32px, 5.2vw, 52px)',
                color: content.heroTitleColor || '#FFFFFF',
                fontFamily: getHeroTitleFont(),
                fontStyle: content.heroTitleItalic ? 'italic' : 'normal',
                fontWeight: content.heroTitleWeight === 'normal' ? 400 : content.heroTitleWeight === 'semibold' ? 600 : 700,
                marginBottom: '16px',
                lineHeight: content.heroTitleFontFamily === 'script' ? 1.25 : 1.15,
                letterSpacing: '-0.5px',
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              }}
            >
              {content.heroTitle || 'Bintang Cake & Cookies'}
            </h1>
            <p
              style={{
                fontSize: '15.5px',
                color: 'rgba(255, 248, 234, 0.9)',
                lineHeight: 1.65,
                marginBottom: '32px',
                maxWidth: '520px',
              }}
            >
              {content.heroSubtitle ||
                'Kelezatan aneka cake, cookies, macaroni schotel, dan sajian kuliner istimewa dipanggang segar setiap hari dari dapur Samarinda. Menemani setiap senyum dan momen bahagia Anda bersama keluarga tercinta.'}
            </p>

            {/* Dua Tombol Sesuai Mockup: Pesan Sekarang (Orange) & Reservasi (Sage Green) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
              <Link
                to="/produk"
                style={{
                  backgroundColor: '#F58220',
                  color: '#FFFFFF',
                  padding: '13px 30px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  fontSize: '15px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(245, 130, 32, 0.45)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
              >
                <span>Pesan Sekarang</span>
              </Link>
              <Link
                to="/kategori/cat-custom"
                style={{
                  backgroundColor: '#5D936A',
                  color: '#FFFFFF',
                  padding: '13px 30px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  fontSize: '15px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(93, 147, 106, 0.45)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
              >
                <span>Reservasi</span>
              </Link>
            </div>
          </div>

          {/* Right Hero Graphic (Lingkaran Oranye & Anak Gadis Memegang Kue Ultah Lilin) */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <div
              style={{
                position: 'relative',
                borderRadius: '32px',
                overflow: 'hidden',
                boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
                border: '2px solid rgba(242, 193, 78, 0.25)',
                maxWidth: '520px',
                width: '100%',
                backgroundColor: '#372316',
              }}
            >
              <img
                src="/images/hero-graphic.jpg"
                alt="Bintang Cake & Cookies - Momen Bahagia Bersama Kue Istimewa"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '420px',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
          </div>
        </div>

        {/* Highlight Row: Sage Green Banner & 4 Rounded Cards Sesuai Mockup Bawah */}
        <div style={{ marginTop: '36px', padding: '16px 0 10px' }}>
          <div
            className="container"
            style={{
              backgroundColor: 'rgba(93, 147, 106, 0.88)',
              backdropFilter: 'blur(8px)',
              borderRadius: '24px',
              padding: '24px 20px',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
              }}
            >
              {[
                {
                  id: 'cake',
                  title: 'Birthday & Custom Cake',
                  badge: 'Kue Ulang Tahun',
                  image: '/images/highlight-card-cake.jpg',
                  link: '/kategori/cat-custom',
                },
                {
                  id: 'macaroni',
                  title: 'Macaroni Schotel',
                  badge: 'Panggang Keju Melted',
                  image: '/images/highlight-card-macaroni.jpg',
                  link: '/produk',
                },
                {
                  id: 'nastar',
                  title: 'Nastar Wisman Super',
                  badge: 'Cookies Butter Asli',
                  image: '/images/highlight-card-nastar.jpg',
                  link: '/kategori/cat-cookies',
                },
                {
                  id: 'culinary',
                  title: 'Kuliner & Catering Dapur',
                  badge: 'Sajian Lezat Pilihan',
                  image: '/images/highlight-card-culinary.jpg',
                  link: '/produk',
                },
              ].map(card => (
                <Link
                  key={card.id}
                  to={card.link}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1.5px solid rgba(255, 255, 255, 0.25)',
                    transition: 'transform 0.2s, box-shadow 0.2s, background-color 0.2s',
                    color: '#FFFFFF',
                  }}
                  className="mockup-highlight-card"
                >
                  <div style={{ height: '140px', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                    <img
                      src={card.image}
                      alt={card.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s',
                      }}
                    />
                  </div>
                  <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: 'rgba(255, 248, 234, 0.9)',
                        fontWeight: 700,
                      }}
                    >
                      {card.badge}
                    </span>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        fontFamily: 'var(--font-serif)',
                        lineHeight: 1.25,
                      }}
                    >
                      {card.title}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          .mockup-highlight-card:hover {
            transform: translateY(-4px);
            background-color: rgba(255, 255, 255, 0.22) !important;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
          }
          .mockup-highlight-card:hover img {
            transform: scale(1.05);
          }
        `}</style>
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
