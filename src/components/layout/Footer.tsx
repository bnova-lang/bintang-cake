import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Phone, Clock } from 'lucide-react';
import { repos } from '@/services/repositories';

export const Footer: React.FC = () => {
  const store = repos.settingsRepo.getStoreSettings();

  return (
    <footer
      style={{
        backgroundColor: 'var(--brown-900)',
        color: 'var(--cream-200)',
        marginTop: 'auto',
        borderTop: '3px solid var(--gold-500)',
        padding: '48px 0 80px', // Extra bottom padding for mobile bottom nav
      }}
    >
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
        {/* Brand Information */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            {store.logoUrl ? (
              <img
                src={store.logoUrl}
                alt={store.storeName}
                style={{
                  width: '38px',
                  height: '38px',
                  objectFit: 'contain',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  padding: '2px',
                }}
              />
            ) : (
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: 'var(--gold-500)',
                  color: 'var(--brown-900)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={20} />
              </div>
            )}
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 700, color: 'var(--gold-500)' }}>
              {store.storeName}
            </span>
          </div>
          <p style={{ fontStyle: 'italic', fontSize: '13px', color: 'var(--gold-100)', marginBottom: '14px' }}>
            {store.tagline}
          </p>
          <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--cream-300)' }}>
            Kue rumahan berkualitas premium dipanggang segar dengan cinta di Samarinda. Mitra manis untuk menemani momen bahagia Anda.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ color: 'var(--gold-500)', fontSize: '16px', marginBottom: '16px', fontFamily: 'var(--font-serif)' }}>
            Navigasi Toko
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
            <li><Link to="/produk" style={{ color: 'var(--cream-200)' }}>Katalog Seluruh Produk</Link></li>
            <li><Link to="/spesial" style={{ color: 'var(--cream-200)' }}>Paket Hampers & Custom</Link></li>
            <li><Link to="/galeri" style={{ color: 'var(--cream-200)' }}>Galeri Kreasi</Link></li>
            <li><Link to="/cara-memesan" style={{ color: 'var(--cream-200)' }}>Panduan Cara Memesan</Link></li>
            <li><Link to="/tentang-kami" style={{ color: 'var(--cream-200)' }}>Profil Toko Kami</Link></li>
            <li><Link to="/lacak-pesanan" style={{ color: 'var(--gold-500)', fontWeight: 600 }}>Lacak Pesanan Tamu</Link></li>
          </ul>
        </div>

        {/* Contact & Hours */}
        <div>
          <h4 style={{ color: 'var(--gold-500)', fontSize: '16px', marginBottom: '16px', fontFamily: 'var(--font-serif)' }}>
            Lokasi & Jam Dapur
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', lineHeight: 1.5 }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <MapPin size={18} style={{ color: 'var(--gold-500)', flexShrink: 0, marginTop: '2px' }} />
              <span>{store.address}</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Clock size={18} style={{ color: 'var(--gold-500)', flexShrink: 0, marginTop: '2px' }} />
              <span>{store.operationalHours}</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Phone size={18} style={{ color: 'var(--gold-500)', flexShrink: 0, marginTop: '2px' }} />
              <span>WhatsApp: <b>{store.phone}</b></span>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--brown-700)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
        <div>
          © 2026 {store.storeName}. Seluruh hak cipta dilindungi.
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span className="badge-demo">VERSI DEMO MVP</span>
          <Link to="/admin/login" style={{ color: 'var(--cream-300)' }}>Masuk Admin</Link>
        </div>
      </div>
    </footer>
  );
};
