import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ClipboardCheck, Truck, CreditCard, ArrowRight } from 'lucide-react';
import { repos } from '@/services/repositories';

export const HowToOrderPage: React.FC = () => {
  const content = useMemo(() => repos.settingsRepo.getContent(), []);
  const payments = useMemo(() => repos.settingsRepo.getPaymentSettings().filter(p => p.active), []);
  const deliveryAreas = useMemo(() => repos.settingsRepo.getDeliveryAreas().filter(d => d.active), []);

  return (
    <div className="container" style={{ paddingTop: '24px', maxWidth: '860px' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <span className="badge-demo" style={{ marginBottom: '10px' }}>Panduan Pelanggan</span>
        <h1 style={{ fontSize: '32px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', marginBottom: '10px' }}>
          Cara Mudah Memesan Kue
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Ikuti langkah sederhana berikut untuk memesan aneka sajian Bintang Cake & Cookies
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ backgroundColor: 'var(--ivory-50)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--cream-300)' }}>
          <div style={{ backgroundColor: 'var(--gold-100)', color: 'var(--gold-600)', width: '44px', height: '44px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
            <ShoppingCart size={22} />
          </div>
          <h3 style={{ fontSize: '16px', color: 'var(--brown-900)', marginBottom: '8px' }}>1. Pilih Kue & Kemasan</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Pilih varian toples atau hampers yang Anda inginkan di katalog, lalu klik <b>Tambah ke Keranjang</b>.
          </p>
        </div>

        <div style={{ backgroundColor: 'var(--ivory-50)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--cream-300)' }}>
          <div style={{ backgroundColor: 'var(--gold-100)', color: 'var(--gold-600)', width: '44px', height: '44px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
            <ClipboardCheck size={22} />
          </div>
          <h3 style={{ fontSize: '16px', color: 'var(--brown-900)', marginBottom: '8px' }}>2. Isi Data & Jadwal</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Masuk ke halaman Checkout, lengkapi alamat penerima dan pilih tanggal pengantaran/pengambilan yang diinginkan.
          </p>
        </div>

        <div style={{ backgroundColor: 'var(--ivory-50)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--cream-300)' }}>
          <div style={{ backgroundColor: 'var(--gold-100)', color: 'var(--gold-600)', width: '44px', height: '44px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
            <Truck size={22} />
          </div>
          <h3 style={{ fontSize: '16px', color: 'var(--brown-900)', marginBottom: '8px' }}>3. Konfirmasi & Pembayaran</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Pesanan tercatat di sistem dengan nomor unik. Anda dapat langsung transfer dan upload bukti bayar atau bayar tunai (COD).
          </p>
        </div>
      </div>

      {/* Methods Overview */}
      <div style={{ backgroundColor: 'var(--cream-200)', borderRadius: 'var(--radius-xl)', padding: '32px', marginBottom: '40px', border: '1px solid var(--cream-300)' }}>
        <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', color: 'var(--brown-900)', marginBottom: '16px' }}>
          Metode Pembayaran Tersedia
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {payments.map(p => (
            <div key={p.id} style={{ backgroundColor: 'var(--ivory-50)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <b style={{ fontSize: '14px', color: 'var(--brown-900)' }}>{p.bankName || p.accountName || p.accountHolder}</b>
                </div>
                {p.type === 'bank_transfer' && p.accountNumber && (
                  <div style={{ fontSize: '12px', color: 'var(--brown-700)', marginBottom: '6px' }}>
                    No. Rek: <code style={{ backgroundColor: 'var(--cream-200)', padding: '2px 4px', borderRadius: '4px', fontWeight: 600 }}>{p.accountNumber}</code>
                    {p.accountHolder && <div style={{ fontSize: '11px', color: 'var(--brown-600)', marginTop: '2px' }}>a.n. {p.accountHolder}</div>}
                  </div>
                )}
                {p.instructions && (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>{p.instructions}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <Link
          to="/produk"
          style={{
            backgroundColor: 'var(--gold-500)',
            color: 'var(--brown-900)',
            padding: '12px 32px',
            borderRadius: 'var(--radius-full)',
            fontWeight: 700,
            fontSize: '15px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>Mulai Belanja Sekarang</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};
