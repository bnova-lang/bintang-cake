import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Gift, ArrowRight } from 'lucide-react';
import { repos } from '@/services/repositories';
import { Content } from '@/types';

export const PromoTicker: React.FC = () => {
  const location = useLocation();
  const [content, setContent] = useState<Content>(() => repos.settingsRepo.getContent());

  useEffect(() => {
    const handleUpdate = () => {
      setContent(repos.settingsRepo.getContent());
    };
    handleUpdate();
    window.addEventListener('bcc-settings-updated', handleUpdate);
    return () => window.removeEventListener('bcc-settings-updated', handleUpdate);
  }, [location.pathname]);

  // If disabled, don't show
  if (content.tickerActive === false) {
    return null;
  }

  const theme = content.tickerTheme || 'gold';
  const badgeText =
    content.tickerBadge ||
    (theme === 'natal'
      ? '🎄 SPESIAL NATAL & TAHUN BARU'
      : theme === 'lebaran'
      ? '🌙 SPESIAL RAMADHAN & LEBARAN'
      : theme === 'imlek'
      ? '🧧 SPESIAL IMLEK & HARI RAYA'
      : '✨ PROMO SPESIAL');

  const defaultText =
    theme === 'natal'
      ? '🎄 Promo Spesial Natal & Tahun Baru: Buka Pre-Order Paket Hampers Eksklusif & Cake Hantaran Mewah! Hubungi WhatsApp untuk reservasi slot pengiriman • Dipanggang segar setiap hari dengan 100% Butter Wijsman'
      : theme === 'lebaran'
      ? '🌙 Spesial Hari Raya Idul Fitri: Paket Hampers Nastar Keju Wijsman, Kastengel & Lapis Legit Spekkoek siap diantar! Pesan lebih awal sebelum kuota penuh • Pengiriman aman toples bersegel'
      : theme === 'imlek'
      ? '🧧 Spesial Imlek: Nikmati Manisnya Lapis Legit Wijsman & Aneka Cookies Keberuntungan untuk Keluarga Tercinta! Pesan sekarang'
      : '✨ Buka Setiap Hari: 08.00 - 20.00 WITA • Nikmati Kelezatan Cake, Cookies, dan Hampers Eksklusif Bintang Cake & Cookies • Pengiriman Wilayah Samarinda & Balikpapan';

  const rawText = content.tickerText?.trim() || defaultText;

  // Theme styling configurations
  const getThemeStyles = () => {
    switch (theme) {
      case 'natal':
        return {
          background: 'linear-gradient(90deg, #7F1D1D 0%, #991B1B 50%, #7F1D1D 100%)',
          borderColor: '#B91C1C',
          textColor: '#FFFDF8',
          badgeBg: '#FEF08A',
          badgeColor: '#7F1D1D',
          linkBg: 'rgba(254, 240, 138, 0.2)',
          linkColor: '#FEF08A',
        };
      case 'lebaran':
        return {
          background: 'linear-gradient(90deg, #064E3B 0%, #065F46 50%, #064E3B 100%)',
          borderColor: '#047857',
          textColor: '#FFFDF8',
          badgeBg: '#FDE047',
          badgeColor: '#064E3B',
          linkBg: 'rgba(253, 224, 71, 0.2)',
          linkColor: '#FDE047',
        };
      case 'imlek':
        return {
          background: 'linear-gradient(90deg, #991B1B 0%, #B91C1C 50%, #991B1B 100%)',
          borderColor: '#DC2626',
          textColor: '#FFFDF8',
          badgeBg: '#FEF08A',
          badgeColor: '#7F1D1D',
          linkBg: 'rgba(254, 240, 138, 0.2)',
          linkColor: '#FEF08A',
        };
      case 'brown':
        return {
          background: 'linear-gradient(90deg, #4A2E1C 0%, #5E3B25 50%, #4A2E1C 100%)',
          borderColor: '#8A5A3B',
          textColor: '#FFF8EA',
          badgeBg: '#FBEFC7',
          badgeColor: '#4A2E1C',
          linkBg: 'rgba(251, 239, 199, 0.15)',
          linkColor: '#FBEFC7',
        };
      case 'gold':
      default:
        return {
          background: 'linear-gradient(90deg, #2A170C 0%, #3B2416 50%, #2A170C 100%)',
          borderColor: 'var(--gold-600)',
          textColor: 'var(--gold-100)',
          badgeBg: 'var(--gold-500)',
          badgeColor: 'var(--brown-900)',
          linkBg: 'rgba(242, 193, 78, 0.2)',
          linkColor: 'var(--gold-500)',
        };
    }
  };

  const themeStyle = getThemeStyles();

  // Speed duration
  const getDuration = () => {
    if (content.tickerSpeedSeconds && content.tickerSpeedSeconds >= 5 && content.tickerSpeedSeconds <= 120) {
      return `${content.tickerSpeedSeconds}s`;
    }
    switch (content.tickerSpeed) {
      case 'very_slow':
        return '50s';
      case 'slow':
        return '38s';
      case 'fast':
        return '15s';
      case 'very_fast':
        return '9s';
      case 'medium':
      default:
        return '24s';
    }
  };

  // Font size & dimensions
  const getDimensions = () => {
    switch (content.tickerFontSize) {
      case 'normal':
        return {
          fontSize: '14px',
          height: '46px',
          badgeFontSize: '11px',
          badgePadding: '0 14px',
          linkFontSize: '11px',
        };
      case 'xlarge':
        return {
          fontSize: '18px',
          height: '56px',
          badgeFontSize: '13px',
          badgePadding: '0 18px',
          linkFontSize: '13px',
        };
      case 'jumbo':
        return {
          fontSize: '20px',
          height: '62px',
          badgeFontSize: '14px',
          badgePadding: '0 20px',
          linkFontSize: '14px',
        };
      case 'large':
      default:
        // Default to 16px (Besar & Jelas) so it is no longer too small
        return {
          fontSize: '16px',
          height: '50px',
          badgeFontSize: '12px',
          badgePadding: '0 16px',
          linkFontSize: '12px',
        };
    }
  };

  const dimensions = getDimensions();
  const linkTarget = content.tickerLink || '/spesial';

  return (
    <div
      style={{
        background: themeStyle.background,
        borderBottom: `2px solid ${themeStyle.borderColor}`,
        color: themeStyle.textColor,
        fontSize: dimensions.fontSize,
        fontWeight: 600,
        height: dimensions.height,
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        zIndex: 40,
        boxShadow: 'var(--shadow-sm)',
        userSelect: 'none',
      }}
    >
      {/* Sticky Badge Label on Left */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: dimensions.badgePadding,
          height: '100%',
          backgroundColor: themeStyle.badgeBg,
          color: themeStyle.badgeColor,
          fontWeight: 800,
          fontSize: dimensions.badgeFontSize,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          flexShrink: 0,
          zIndex: 2,
          boxShadow: '2px 0 8px rgba(0,0,0,0.25)',
        }}
      >
        <span>{badgeText}</span>
      </div>

      {/* Scrolling Text Wrapper */}
      <div
        className="bcc-ticker-wrapper"
        style={
          {
            '--ticker-duration': getDuration(),
          } as React.CSSProperties
        }
      >
        <div className="bcc-ticker-track">
          {/* Duplicate 2 times for seamless infinite scroll */}
          {[1, 2].map(copyIdx => (
            <div
              key={copyIdx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '24px',
                paddingRight: '36px',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                {rawText}
              </span>

              {content.tickerLink && (
                <Link
                  to={linkTarget}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: themeStyle.linkBg,
                    color: themeStyle.linkColor,
                    padding: '3px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: dimensions.linkFontSize,
                    fontWeight: 700,
                    textDecoration: 'none',
                    border: `1px solid ${themeStyle.linkColor}`,
                  }}
                >
                  <span>Lihat Detail</span>
                  <ArrowRight size={13} />
                </Link>
              )}

              <span style={{ opacity: 0.6 }}>✦</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
