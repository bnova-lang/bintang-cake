import React, { useState, useMemo } from 'react';
import { Gift, MessageCircle, Sparkles } from 'lucide-react';
import { repos } from '@/services/repositories';
import { ProductCard } from '@/components/product/ProductCard';

export const SpecialPackagesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hampers' | 'custom'>('hampers');

  const products = useMemo(() => repos.productRepo.getAll().filter(p => p.active), []);

  const hampersProducts = useMemo(() => {
    const cat = repos.categoryRepo.getBySlug('hampers-parcel');
    return cat ? products.filter(p => p.categoryId === cat.id) : [];
  }, [products]);

  const customProducts = useMemo(() => {
    const cat = repos.categoryRepo.getBySlug('paket-custom');
    return cat ? products.filter(p => p.categoryId === cat.id) : [];
  }, [products]);

  const storeSettings = useMemo(() => repos.settingsRepo.getStoreSettings(), []);

  const handleWhatsAppConsultation = () => {
    const msg = `Halo Bintang Cake & Cookies, saya ingin berkonsultasi mengenai pesanan Paket Custom / Hampers spesial. Mohon informasinya. Terima kasih!`;
    window.open(`https://wa.me/${storeSettings.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="container" style={{ paddingTop: '24px' }}>
      <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 32px' }}>
        <span className="badge-demo" style={{ marginBottom: '10px' }}>Edisi Butik Eksklusif</span>
        <h1 style={{ fontSize: '32px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', marginBottom: '10px' }}>
          Paket Spesial Hari Raya & Hantaran
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Sempurnakan momen hari raya, pernikahan, dan syukuran dengan bingkisan kue premium yang dirangkai elegan dan berkesan.
        </p>

        {/* Tab Toggle */}
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: 'var(--cream-200)',
            borderRadius: 'var(--radius-full)',
            padding: '4px',
            marginTop: '20px',
            border: '1px solid var(--cream-300)',
          }}
        >
          <button
            onClick={() => setActiveTab('hampers')}
            style={{
              padding: '8px 24px',
              borderRadius: 'var(--radius-full)',
              fontSize: '14px',
              fontWeight: 700,
              backgroundColor: activeTab === 'hampers' ? 'var(--brown-800)' : 'transparent',
              color: activeTab === 'hampers' ? 'var(--text-on-dark)' : 'var(--brown-800)',
              transition: 'all 0.2s',
            }}
          >
            Hampers & Parcel
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            style={{
              padding: '8px 24px',
              borderRadius: 'var(--radius-full)',
              fontSize: '14px',
              fontWeight: 700,
              backgroundColor: activeTab === 'custom' ? 'var(--brown-800)' : 'transparent',
              color: activeTab === 'custom' ? 'var(--text-on-dark)' : 'var(--brown-800)',
              transition: 'all 0.2s',
            }}
          >
            Paket Custom & Tart
          </button>
        </div>
      </div>

      {activeTab === 'hampers' ? (
        <div>
          {hampersProducts.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
              {hampersProducts.map(prod => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada hampers aktif saat ini.</p>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {customProducts.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
              {customProducts.map(prod => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}

          {/* Consultation Box matching Stitch */}
          <div
            style={{
              backgroundColor: 'var(--ivory-50)',
              border: '2px dashed var(--gold-500)',
              borderRadius: 'var(--radius-xl)',
              padding: '36px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              maxWidth: '680px',
              margin: '0 auto',
            }}
          >
            <div style={{ backgroundColor: 'var(--gold-100)', color: 'var(--gold-600)', width: '56px', height: '56px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Sparkles size={28} />
            </div>
            <h3 style={{ fontSize: '22px', fontFamily: 'var(--font-serif)', color: 'var(--brown-900)', marginBottom: '10px' }}>
              Rancang Paket Impian Anda
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
              Punya ide kue tart khusus, tema warna hampers, atau budget tertentu untuk acara kantor/pernikahan? Konsultasikan langsung bersama pembuat kue kami via WhatsApp resmi toko.
            </p>
            <button
              onClick={handleWhatsAppConsultation}
              style={{
                backgroundColor: 'var(--success-600)',
                color: '#fff',
                padding: '12px 28px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                fontSize: '15px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <MessageCircle size={18} />
              <span>Konsultasi Pembuat Kue via WhatsApp</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
