import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Award, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { Content, BannerItem } from '@/types';

interface HeroSliderProps {
  content: Content;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ content }) => {
  const activeBanners: BannerItem[] = (content.banners || []).filter(b => b.active);

  // If no active banners, synthesize a default slide from hero content
  const slides: BannerItem[] =
    activeBanners.length > 0
      ? activeBanners
      : [
          {
            id: 'default-hero',
            title: content.heroTitle || 'Hai Pelanggan Setia Bintang Cake and Cookies!',
            subtitle:
              content.heroSubtitle ||
              'Kelezatan kue rumahan premium dipanggang segar setiap hari dengan bahan-bahan pilihan tanpa pengawet.',
            badge: content.heroBadge || 'Panggangan Segar Dapur Samarinda',
            imageUrl:
              content.heroImageUrl ||
              'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop&q=80',
            buttonText: 'Lihat Seluruh Produk',
            linkUrl: '/produk',
            active: true,
            sortOrder: 1,
          },
        ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const totalSlides = slides.length;
  const intervalSeconds = content.heroSliderInterval || 5;
  const autoPlay = content.heroSliderAutoPlay !== false;

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-play timer
  useEffect(() => {
    if (totalSlides <= 1 || !autoPlay || isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, intervalSeconds * 1000);

    return () => clearInterval(timer);
  }, [totalSlides, autoPlay, isPaused, intervalSeconds, nextSlide]);

  // Touch Swipe for Mobile Phones
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = null;
  };

  const currentSlide = slides[currentIndex] || slides[0];

  const getHeroTitleFont = () => {
    switch (content.heroTitleFontFamily) {
      case 'script':
        return "'Dancing Script', 'Brush Script MT', cursive, serif";
      case 'cormorant':
        return "'Cormorant Garamond', Georgia, serif";
      case 'sans':
        return 'var(--font-sans)';
      case 'georgia':
        return "Georgia, 'Times New Roman', serif";
      case 'playfair':
      default:
        return 'var(--font-serif)';
    }
  };

  return (
    <section
      aria-label="Banner Promo Toko"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        backgroundColor: 'var(--brown-900)',
        color: 'var(--cream-100)',
        padding: '48px 0 64px',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '440px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {/* Decorative Warm Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-100px',
          right: '-80px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(242, 193, 78, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div
          key={currentSlide.id}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px',
            alignItems: 'center',
            transition: 'opacity 0.35s ease, transform 0.35s ease',
            animation: 'heroSlideFade 0.4s ease-out',
          }}
        >
          {/* Left Column: Badge, Title, Subtitle, CTA Buttons */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(242, 193, 78, 0.15)',
                color: 'var(--gold-500)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '16px',
                border: '1px solid rgba(242, 193, 78, 0.3)',
              }}
            >
              <Sparkles size={16} />
              <span>{currentSlide.badge || content.heroBadge || 'Panggangan Segar Dapur Samarinda'}</span>
            </div>

            <h1
              style={{
                fontSize: content.heroTitleFontFamily === 'script' ? 'clamp(36px, 6vw, 54px)' : 'clamp(30px, 4.8vw, 46px)',
                color: content.heroTitleColor || 'var(--text-on-dark)',
                fontFamily: getHeroTitleFont(),
                fontStyle: content.heroTitleItalic ? 'italic' : 'normal',
                fontWeight: content.heroTitleWeight === 'normal' ? 400 : content.heroTitleWeight === 'semibold' ? 600 : 700,
                marginBottom: '16px',
                lineHeight: content.heroTitleFontFamily === 'script' ? 1.25 : 1.18,
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              }}
            >
              {currentSlide.title || content.heroTitle}
            </h1>

            <p
              style={{
                fontSize: '15.5px',
                color: 'var(--cream-200)',
                lineHeight: 1.6,
                marginBottom: '28px',
                maxWidth: '520px',
              }}
            >
              {currentSlide.subtitle || content.heroSubtitle}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
              <Link
                to={currentSlide.linkUrl || '/produk'}
                style={{
                  backgroundColor: 'var(--gold-500)',
                  color: 'var(--brown-900)',
                  padding: '12px 26px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  fontSize: '15px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'transform 0.15s, box-shadow 0.15s, background-color 0.15s',
                }}
                className="hero-cta-btn"
              >
                <span>{currentSlide.buttonText || 'Lihat Seluruh Produk'}</span>
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
                  transition: 'background-color 0.15s',
                }}
              >
                <span>Paket Hampers & Spesial</span>
              </Link>
            </div>
          </div>

          {/* Right Column: High Quality Slide Image & Family Recipe Badge */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)',
                border: '4px solid rgba(242, 193, 78, 0.35)',
                aspectRatio: '4/3',
                backgroundColor: 'rgba(0,0,0,0.2)',
                position: 'relative',
              }}
            >
              <img
                src={currentSlide.imageUrl}
                alt={currentSlide.title || 'Bintang Cake & Cookies'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>

            {/* Quality & Recipe Floating Card */}
            <div
              style={{
                position: 'absolute',
                bottom: '-16px',
                right: '16px',
                backgroundColor: 'var(--ivory-50)',
                color: 'var(--brown-900)',
                padding: '10px 18px',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                border: '1px solid var(--cream-300)',
              }}
            >
              <div
                style={{
                  backgroundColor: 'var(--gold-100)',
                  color: 'var(--gold-600)',
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Award size={22} />
              </div>
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    display: 'block',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                  }}
                >
                  {content.heroCardLabel || 'Resep Keluarga'}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-serif)' }}>
                  {content.heroCardText || '100% Butter & Bahan Premium'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls: Only render if more than 1 slide */}
      {totalSlides > 1 && (
        <>
          {/* Arrow Left */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Slide sebelumnya"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'rgba(59, 36, 22, 0.75)',
              border: '1px solid rgba(242, 193, 78, 0.4)',
              color: 'var(--gold-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              transition: 'background-color 0.2s, transform 0.15s',
            }}
            className="slider-nav-btn"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Arrow Right */}
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Slide berikutnya"
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'rgba(59, 36, 22, 0.75)',
              border: '1px solid rgba(242, 193, 78, 0.4)',
              color: 'var(--gold-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              transition: 'background-color 0.2s, transform 0.15s',
            }}
            className="slider-nav-btn"
          >
            <ChevronRight size={22} />
          </button>

          {/* Bottom Dots & Controls Bar */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              zIndex: 10,
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(42, 26, 16, 0.75)',
                backdropFilter: 'blur(4px)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(242, 193, 78, 0.3)',
              }}
            >
              {slides.map((slide, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => goToSlide(idx)}
                    aria-label={`Buka slide ${idx + 1}`}
                    style={{
                      width: isActive ? '24px' : '8px',
                      height: '8px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: isActive ? 'var(--gold-500)' : 'rgba(255,255,255,0.35)',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                    }}
                  />
                );
              })}

              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--cream-200)',
                  marginLeft: '4px',
                }}
              >
                {currentIndex + 1}/{totalSlides}
              </span>

              {/* Pause / Play Indicator Button */}
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                title={isPaused ? 'Lanjutkan putar otomatis' : 'Jeda putar otomatis'}
                aria-label={isPaused ? 'Putar otomatis' : 'Jeda otomatis'}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--cream-200)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: '2px',
                }}
              >
                {isPaused ? <Play size={12} /> : <Pause size={12} />}
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes heroSlideFade {
          0% {
            opacity: 0.2;
            transform: translateY(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .slider-nav-btn:hover {
          background-color: var(--brown-800) !important;
          transform: translateY(-50%) scale(1.08) !important;
        }
        .hero-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(242, 193, 78, 0.45) !important;
        }
        @media (max-width: 640px) {
          .slider-nav-btn {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
};
