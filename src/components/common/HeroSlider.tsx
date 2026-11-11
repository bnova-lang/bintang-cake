import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { Content, BannerItem } from '@/types';

interface HeroSliderProps {
  content: Content;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ content }) => {
  const activeBanners: BannerItem[] = (content.banners || []).filter(b => b.active);

  // Fallback slide if no active banners exist
  const slides: BannerItem[] =
    activeBanners.length > 0
      ? activeBanners
      : [
          {
            id: 'default-hero',
            title: content.heroTitle || 'Partner to Enjoy Your day!',
            subtitle:
              content.heroSubtitle ||
              'Kelezatan kue rumahan premium dipanggang segar setiap hari dengan bahan-bahan pilihan tanpa pengawet.',
            badge: content.heroBadge || 'Hai...Pelanggan Setia Bintang Cake & Cookies',
            imageUrl:
              content.heroImageUrl ||
              '/images/banner-christmas-photo.jpg',
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
        backgroundColor: '#3B2416',
        color: 'var(--cream-100)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '420px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* 1. Full-Height Blended Background Image on the right (NO BOX / NO BORDER) */}
      <div
        key={`bg-${currentSlide.id}`}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '60%',
          backgroundImage: `url(${currentSlide.imageUrl})`,
          backgroundPosition: 'center right',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          animation: 'heroSlideFade 0.5s ease-out',
        }}
        className="hero-slider-bg"
      >
        {/* Soft Brown Gradient Overlay: Fades from solid brown on the left into transparent on the right */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to right, #3B2416 0%, rgba(59, 36, 22, 0.96) 12%, rgba(59, 36, 22, 0.6) 35%, rgba(59, 36, 22, 0.1) 65%, transparent 85%)',
          }}
          className="hero-slider-gradient"
        />

        {/* Top and Bottom soft vignetting to seamlessly integrate with header & page */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, rgba(59, 36, 22, 0.25) 0%, transparent 15%, transparent 85%, rgba(59, 36, 22, 0.4) 100%)',
          }}
        />
      </div>

      {/* 2. Solid Brown Left Base to guarantee 100% text legibility */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '45%',
          backgroundColor: '#3B2416',
          zIndex: 1,
        }}
        className="hero-slider-left-base"
      />

      {/* 3. Text Content Container (Left-aligned over the brown background) */}
      <div className="container" style={{ position: 'relative', zIndex: 2, padding: '48px 16px 56px' }}>
        <div
          key={`content-${currentSlide.id}`}
          style={{
            maxWidth: '540px',
            animation: 'heroSlideFade 0.4s ease-out',
          }}
        >
          {/* Outlined Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(242, 193, 78, 0.12)',
              color: 'var(--gold-500)',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '18px',
              border: '1px solid rgba(242, 193, 78, 0.45)',
            }}
          >
            <Sparkles size={16} />
            <span>{currentSlide.badge || content.heroBadge || 'Hai...Pelanggan Setia Bintang Cake & Cookies'}</span>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontSize:
                content.heroTitleFontFamily === 'script' ? 'clamp(36px, 6vw, 56px)' : 'clamp(32px, 5vw, 48px)',
              color: content.heroTitleColor || '#FFFFFF',
              fontFamily: getHeroTitleFont(),
              fontStyle: content.heroTitleItalic !== false ? 'italic' : 'normal',
              fontWeight: content.heroTitleWeight === 'normal' ? 400 : 700,
              marginBottom: '16px',
              lineHeight: 1.2,
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            {currentSlide.title || content.heroTitle || 'Partner to Enjoy Your day!'}
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '15.5px',
              color: 'rgba(255, 248, 234, 0.9)',
              lineHeight: 1.65,
              marginBottom: '28px',
              maxWidth: '490px',
              textShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }}
          >
            {currentSlide.subtitle ||
              content.heroSubtitle ||
              'Kelezatan kue rumahan premium dipanggang segar setiap hari dengan bahan-bahan pilihan tanpa pengawet.'}
          </p>

          {/* Action Buttons */}
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
                backgroundColor: 'rgba(59, 36, 22, 0.65)',
                color: 'var(--cream-100)',
                border: '1px solid rgba(242, 193, 78, 0.45)',
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
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'rgba(42, 26, 16, 0.75)',
              border: '1px solid rgba(242, 193, 78, 0.35)',
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
            <ChevronLeft size={20} />
          </button>

          {/* Arrow Right */}
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Slide berikutnya"
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'rgba(42, 26, 16, 0.75)',
              border: '1px solid rgba(242, 193, 78, 0.35)',
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
            <ChevronRight size={20} />
          </button>

          {/* Bottom Capsule Pill Indicator [ 🟡 | 1/2 ▶ ] */}
          <div
            style={{
              position: 'absolute',
              bottom: '18px',
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(32, 19, 12, 0.85)',
                backdropFilter: 'blur(6px)',
                padding: '5px 14px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(242, 193, 78, 0.35)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
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
                      width: isActive ? '22px' : '8px',
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

              <span style={{ width: '1px', height: '12px', backgroundColor: 'rgba(255,255,255,0.25)', margin: '0 2px' }} />

              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--cream-100)',
                  letterSpacing: '0.5px',
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
                {isPaused ? <Play size={11} fill="currentColor" /> : <Pause size={11} fill="currentColor" />}
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes heroSlideFade {
          0% {
            opacity: 0.15;
            transform: scale(1.02);
          }
          100% {
            opacity: 1;
            transform: scale(1);
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
        @media (max-width: 768px) {
          .hero-slider-bg {
            width: 100% !important;
            opacity: 0.38;
          }
          .hero-slider-gradient {
            background: linear-gradient(to bottom, rgba(59, 36, 22, 0.45) 0%, rgba(59, 36, 22, 0.88) 60%, #3B2416 100%) !important;
          }
          .hero-slider-left-base {
            display: none !important;
          }
          .slider-nav-btn {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
};
