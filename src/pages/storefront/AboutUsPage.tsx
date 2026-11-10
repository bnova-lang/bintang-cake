import React, { useMemo } from 'react';
import { Sparkles, MapPin, Clock, Phone, Heart } from 'lucide-react';
import { repos } from '@/services/repositories';

export const AboutUsPage: React.FC = () => {
  const store = useMemo(() => repos.settingsRepo.getStoreSettings(), []);
  const content = useMemo(() => repos.settingsRepo.getContent(), []);

  return (
    <div className="container" style={{ paddingTop: '24px', maxWidth: '800px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <span className="badge-demo" style={{ marginBottom: '10px' }}>Tentang Toko</span>
        <h1 style={{ fontSize: '32px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', marginBottom: '10px' }}>
          Profil Bintang Cake & Cookies
        </h1>
        <p style={{ fontStyle: 'italic', color: 'var(--gold-600)', fontWeight: 600 }}>
          "{store.tagline}"
        </p>
      </div>

      <div
        style={{
          backgroundColor: 'var(--ivory-50)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px 32px',
          border: '1px solid var(--cream-300)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          lineHeight: 1.7,
          color: 'var(--text-secondary)',
          fontSize: '15px',
        }}
      >
        <p>
          {content.aboutUsText}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginTop: '12px', paddingTop: '24px', borderTop: '1px solid var(--cream-300)' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <MapPin size={22} color="var(--gold-600)" style={{ flexShrink: 0 }} />
            <div>
              <b style={{ color: 'var(--brown-900)', display: 'block', marginBottom: '2px' }}>Alamat Dapur</b>
              <span style={{ fontSize: '13px' }}>{store.address}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Clock size={22} color="var(--gold-600)" style={{ flexShrink: 0 }} />
            <div>
              <b style={{ color: 'var(--brown-900)', display: 'block', marginBottom: '2px' }}>Jam Buka</b>
              <span style={{ fontSize: '13px' }}>{store.operationalHours}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Phone size={22} color="var(--gold-600)" style={{ flexShrink: 0 }} />
            <div>
              <b style={{ color: 'var(--brown-900)', display: 'block', marginBottom: '2px' }}>Kontak Resmi</b>
              <span style={{ fontSize: '13px' }}>WhatsApp: {store.phone}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
