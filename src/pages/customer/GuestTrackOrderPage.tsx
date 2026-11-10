import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, AlertCircle, CheckCircle2, Clock, PackageCheck, Truck, Home, ArrowLeft } from 'lucide-react';
import { repos } from '@/services/repositories';
import { Order, OrderStatus } from '@/types';
import { formatRupiah, formatDateWITA, normalizeWhatsapp } from '@/utils/format';
import { OrderChatBox } from '@/components/chat/OrderChatBox';

export const GuestTrackOrderPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderNumberInput, setOrderNumberInput] = useState<string>(searchParams.get('order') || '');
  const [whatsappInput, setWhatsappInput] = useState<string>(searchParams.get('wa') || '');
  const [verifiedOrder, setVerifiedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string>('');
  const [attempts, setAttempts] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const performVerification = (num: string, wa: string) => {
    setError('');

    if (isLocked) {
      setError('Terlalu banyak percobaan gagal. Silakan tunggu 60 detik.');
      return;
    }

    if (!num.trim() || !wa.trim()) {
      setError('Nomor pesanan dan nomor WhatsApp wajib diisi.');
      return;
    }

    const cleanWa = normalizeWhatsapp(wa);
    const order = repos.orderRepo.getByOrderNumber(num.trim());

    // Strict double-check: order must exist AND whatsapp must match normalized
    const orderWa = order?.customerWhatsapp || order?.customerPhone || '';
    if (!order || normalizeWhatsapp(orderWa) !== cleanWa) {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      if (nextAttempts >= 5) {
        setIsLocked(true);
        setTimeout(() => {
          setIsLocked(false);
          setAttempts(0);
        }, 60000);
      }
      // GENERIC ERROR MESSAGE per SECURITY.md §5:
      setError('Nomor pesanan atau nomor WhatsApp tidak cocok.');
      setVerifiedOrder(null);
      return;
    }

    setVerifiedOrder(order);
    setAttempts(0);
  };

  useEffect(() => {
    const o = searchParams.get('order');
    const w = searchParams.get('wa');
    if (o && w) {
      performVerification(o, w);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(orderNumberInput, whatsappInput);
  };

  const steps: { status: OrderStatus; label: string }[] = [
    { status: 'menunggu_konfirmasi_admin', label: 'Menunggu Konfirmasi' },
    { status: 'diproses', label: 'Diproses Dapur' },
    { status: 'siap_diambil', label: 'Siap / Dikirim' },
    { status: 'selesai', label: 'Selesai' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    if (status === 'menunggu_konfirmasi_admin') return 0;
    if (status === 'diproses') return 1;
    if (status === 'siap_diambil' || status === 'dikirim') return 2;
    if (status === 'selesai') return 3;
    return -1; // dibatalkan
  };

  return (
    <div className="container" style={{ paddingTop: '24px', maxWidth: '800px' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <span className="badge-demo" style={{ marginBottom: '8px' }}>Pelacakan Mandiri</span>
        <h1 style={{ fontSize: '28px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>
          Lacak Pesanan Pelanggan
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Masukkan nomor pesanan unik dan nomor WhatsApp Anda untuk melihat status dan berkomunikasi langsung dengan admin.
        </p>
      </div>

      {/* Verification Search Form */}
      <div
        style={{
          backgroundColor: 'var(--ivory-50)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 28px',
          border: '1px solid var(--cream-300)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '28px',
        }}
      >
        {error && (
          <div style={{ backgroundColor: 'var(--danger-100)', color: 'var(--danger-600)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brown-900)', display: 'block', marginBottom: '4px' }}>
              Nomor Pesanan *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: BCC-261109-0001"
              value={orderNumberInput}
              onChange={e => setOrderNumberInput(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brown-900)', display: 'block', marginBottom: '4px' }}>
              Nomor WhatsApp Pemesan *
            </label>
            <input
              type="tel"
              required
              placeholder="Contoh: 082158739760"
              value={whatsappInput}
              onChange={e => setWhatsappInput(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', fontSize: '14px' }}
            />
          </div>

          <button
            type="submit"
            disabled={isLocked}
            style={{
              backgroundColor: 'var(--gold-500)',
              color: 'var(--brown-900)',
              padding: '11px 20px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '14px',
              cursor: isLocked ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Search size={16} />
            <span>Lacak Pesanan</span>
          </button>
        </form>
      </div>

      {/* Verified Order Details */}
      {verifiedOrder && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Timeline Status Card */}
          <div style={{ backgroundColor: 'var(--ivory-50)', padding: '24px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--cream-300)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Status Pesanan:</span>
                <h3 style={{ fontSize: '18px', color: verifiedOrder.orderStatus === 'dibatalkan' ? 'var(--danger-600)' : 'var(--brown-900)', textTransform: 'capitalize', margin: 0 }}>
                  {verifiedOrder.orderStatus.replace(/_/g, ' ')}
                </h3>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Jadwal: <b>{formatDateWITA(verifiedOrder.requestedDate || verifiedOrder.fulfillmentDate || '')} ({verifiedOrder.requestedTime || verifiedOrder.fulfillmentTime || '10:00'} WITA)</b>
              </div>
            </div>

            {/* Stepper indicator if not cancelled */}
            {verifiedOrder.orderStatus !== 'dibatalkan' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', position: 'relative' }}>
                {steps.map((step, idx) => {
                  const currentIdx = getStepIndex(verifiedOrder.orderStatus);
                  const isDone = currentIdx >= idx;
                  const isCurrent = currentIdx === idx;
                  return (
                    <div key={step.status} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: isDone ? 'var(--gold-500)' : 'var(--cream-200)',
                          color: isDone ? 'var(--brown-900)' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '13px',
                          border: isCurrent ? '2px solid var(--brown-800)' : 'none',
                        }}
                      >
                        {isDone ? <CheckCircle2 size={18} /> : idx + 1}
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'var(--brown-900)' : 'var(--text-muted)' }}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ backgroundColor: 'var(--danger-100)', color: 'var(--danger-600)', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 600 }}>
                Pesanan ini telah dibatalkan oleh admin atau pelanggan.
              </div>
            )}
          </div>

          {/* Items & Payment Info */}
          <div style={{ backgroundColor: 'var(--ivory-50)', padding: '24px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--cream-300)' }}>
            <h4 style={{ fontSize: '16px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', marginBottom: '14px' }}>
              Rincian Barang & Pembayaran
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', fontSize: '13px' }}>
              {verifiedOrder.items.map(i => (
                <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--cream-200)' }}>
                  <span>{i.quantity}x {i.productName} ({i.variantName})</span>
                  <b>{formatRupiah(i.subtotal)}</b>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 700, borderTop: '1px solid var(--cream-300)', paddingTop: '10px' }}>
              <span>Total Tagihan:</span>
              <span style={{ color: 'var(--brown-900)' }}>{formatRupiah(verifiedOrder.totalAmount)}</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Status Pembayaran: <b style={{ textTransform: 'capitalize', color: verifiedOrder.paymentStatus === 'verified' ? 'var(--success-600)' : 'var(--warning-600)' }}>{verifiedOrder.paymentStatus}</b>
            </div>
          </div>

          {/* Live Order Chat */}
          <OrderChatBox
            orderId={verifiedOrder.id}
            senderType="guest"
            senderName={verifiedOrder.customerName}
          />
        </div>
      )}
    </div>
  );
};
