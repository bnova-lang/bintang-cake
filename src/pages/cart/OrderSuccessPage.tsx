import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, MessageCircle, Upload, MessageSquare, Copy, Check, Clock, Gift, Sparkles } from 'lucide-react';
import { repos } from '@/services/repositories';
import { formatRupiah, formatDateWITA } from '@/utils/format';
import { useToast } from '@/app/providers/ToastContext';

export const OrderSuccessPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { showToast } = useToast();
  const [copied, setCopied] = useState<boolean>(false);
  const [receiptUploaded, setReceiptUploaded] = useState<boolean>(false);

  const order = useMemo(() => {
    return repos.orderRepo.getByOrderNumber(orderNumber || '');
  }, [orderNumber]);

  const storeSettings = useMemo(() => repos.settingsRepo.getStoreSettings(), []);
  const paymentMethods = useMemo(() => repos.settingsRepo.getPaymentSettings().filter(p => p.active), []);

  if (!order) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', color: 'var(--brown-900)', marginBottom: '10px' }}>Pesanan Tidak Ditemukan</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Nomor pesanan {orderNumber} tidak ditemukan dalam catatan sistem.</p>
        <Link to="/" style={{ color: 'var(--gold-600)', fontWeight: 700 }}>Kembali ke Beranda</Link>
      </div>
    );
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Nomor pesanan disalin!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateUploadReceipt = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Harap pilih berkas gambar bukti bayar (JPG/PNG).', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let w = img.width;
        let h = img.height;
        if (w > h && w > maxDim) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else if (h > maxDim) {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, w, h);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        order.paymentReceiptUrl = compressedDataUrl;
        order.paymentReceiptUploadedAt = new Date().toISOString();
        order.paymentStatus = 'waiting_verification';
        repos.orderRepo.update(order);
        setReceiptUploaded(true);
        showToast('Bukti pembayaran berhasil diunggah! Menunggu verifikasi admin.', 'success');
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const buildWhatsAppMessage = () => {
    let itemsText = '';
    order.items.forEach(item => {
      itemsText += `• ${item.quantity}x ${item.productName} - ${item.variantName} (${formatRupiah(item.subtotal)})\n`;
    });

    let msg = `*PESANAN BARU - BINTANG CAKE & COOKIES*\n\n`;
    msg += `No. Pesanan: *${order.orderNumber}*\n`;
    msg += `Nama: ${order.customerName}\n`;
    msg += `No. WhatsApp: ${order.customerWhatsapp || order.customerPhone || ''}\n\n`;
    msg += `*Daftar Pesanan:*\n${itemsText}\n`;
    msg += `Subtotal: ${formatRupiah(order.subtotal || order.subtotalAmount || 0)}\n`;
    msg += `Ongkir: ${formatRupiah(order.shippingFee || order.deliveryFee || 0)}\n`;
    if (order.discountAmount && order.discountAmount > 0) {
      msg += `Diskon Promo: -${formatRupiah(order.discountAmount)}\n`;
    }
    if (order.souvenirReward) {
      msg += `🎁 *HADIAH SOUVENIR: ${order.souvenirReward} (GRATIS)*\n`;
    }
    msg += `*TOTAL PEMBAYARAN: ${formatRupiah(order.totalAmount)}*\n\n`;
    if (order.paymentChannelName) {
      msg += `Metode Bayar: ${order.paymentChannelName}\n`;
    }
    msg += `Pengantaran: ${order.deliveryMethod === 'pickup' ? 'Ambil di Toko' : 'Kirim Kurir'}\n`;
    if (order.shippingAddress) {
      msg += `Alamat: ${order.shippingAddress}\n`;
    }
    msg += `Jadwal Pengambilan/Kirim: ${formatDateWITA(order.requestedDate || order.fulfillmentDate || '')} (${order.requestedTime || order.fulfillmentTime || '10:00'} WITA)\n`;
    if (order.notes || order.orderNotes) {
      msg += `Catatan: ${order.notes || order.orderNotes}\n`;
    }
    msg += `\nMohon konfirmasi pesanan saya. Terima kasih!`;

    return `https://wa.me/${storeSettings.whatsapp}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="container" style={{ paddingTop: '24px', maxWidth: '780px' }}>
      {/* Success Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'var(--success-100)', color: 'var(--success-600)', width: '64px', height: '64px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <CheckCircle2 size={36} />
        </div>
        <h1 style={{ fontSize: '28px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>
          Pesanan Berhasil Dibuat!
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Terima kasih telah berbelanja di Bintang Cake & Cookies.
        </p>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--cream-200)', padding: '10px 18px', borderRadius: 'var(--radius-full)', marginTop: '14px', border: '1px solid var(--cream-300)' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Nomor Pesanan:</span>
          <b style={{ fontSize: '16px', color: 'var(--brown-900)', letterSpacing: '0.5px' }}>{order.orderNumber}</b>
          <button
            onClick={() => handleCopy(order.orderNumber)}
            style={{ color: 'var(--brown-800)', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            title="Salin nomor pesanan"
          >
            {copied ? <Check size={16} color="var(--success-600)" /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Status Tracker Banner */}
        <div style={{ backgroundColor: 'var(--ivory-50)', borderRadius: 'var(--radius-xl)', padding: '20px 24px', border: '1px solid var(--cream-300)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Status Pesanan Saat Ini:</span>
            <b style={{ fontSize: '16px', color: 'var(--warning-600)', textTransform: 'capitalize' }}>
              Menunggu Konfirmasi Admin
            </b>
          </div>
          <Link
            to={`/lacak-pesanan?order=${order.orderNumber}&wa=${order.customerWhatsapp}`}
            style={{
              backgroundColor: 'var(--cream-200)',
              color: 'var(--brown-900)',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: '13px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Buka Pelacakan & Chat Pesanan</span>
            <MessageSquare size={16} />
          </Link>
        </div>

        {/* WhatsApp Handoff CTA */}
        <div style={{ backgroundColor: 'var(--success-100)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--success-600)', textAlign: 'center' }}>
          <h3 style={{ fontSize: '18px', color: 'var(--success-600)', marginBottom: '8px', fontFamily: 'var(--font-serif)' }}>
            Lanjutkan Konfirmasi ke WhatsApp Admin
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--brown-900)', lineHeight: 1.5, marginBottom: '18px' }}>
            Klik tombol di bawah ini untuk membuka WhatsApp resmi toko Bintang Cake dengan rincian pesanan yang sudah terformat otomatis.
          </p>
          <a
            href={buildWhatsAppMessage()}
            target="_blank"
            rel="noopener noreferrer"
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
            <MessageCircle size={20} />
            <span>Kirim Pesanan ke WhatsApp Toko</span>
          </a>
        </div>

        {/* Promo Reward Banner if eligible */}
        {order.souvenirReward && (
          <div
            style={{
              backgroundColor: '#FFFBEB',
              border: '2px solid var(--gold-500)',
              borderRadius: 'var(--radius-xl)',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--gold-500)',
                color: 'var(--brown-900)',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Gift size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <b style={{ color: 'var(--brown-900)', fontSize: '16px' }}>
                  🎉 Anda Mendapatkan Hadiah Souvenir Gratis!
                </b>
                <span style={{ fontSize: '11px', backgroundColor: '#16A34A', color: '#FFFFFF', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                  KLAIM BERHASIL
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--brown-800)', lineHeight: 1.5 }}>
                Terima kasih telah berbelanja hingga Rp 750.000+. Hadiah <b>"{order.souvenirReward}"</b> akan otomatis disertakan ke dalam paket pesanan Anda tanpa biaya tambahan!
              </p>
            </div>
          </div>
        )}

        {/* Payment Transfer Info */}
        <div style={{ backgroundColor: 'var(--ivory-50)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--cream-300)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', margin: 0 }}>
              Informasi Rekening Pembayaran Resmi Toko
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--brown-800)', backgroundColor: 'var(--cream-200)', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>
              Rekening Resmi Bintang Cake
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {paymentMethods.filter(p => p.type === 'bank_transfer' || p.method === 'transfer_bank').map(bank => (
              <div key={bank.id} style={{ backgroundColor: 'var(--cream-100)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)' }}>
                <b style={{ fontSize: '14px', color: 'var(--brown-900)', display: 'block' }}>{bank.bankName || bank.accountName}</b>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--brown-800)', margin: '4px 0' }}>
                  {bank.accountNumber || '-'}
                </div>
                {bank.accountHolder && (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>A.N. {bank.accountHolder}</span>
                )}
              </div>
            ))}
          </div>

          {/* Upload Receipt */}
          <div style={{ backgroundColor: 'var(--cream-100)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px dashed var(--cream-300)' }}>
            <b style={{ fontSize: '14px', color: 'var(--brown-900)', display: 'block', marginBottom: '4px' }}>
              Unggah Bukti Transfer / Pembayaran:
            </b>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Setelah melakukan transfer, silakan unggah foto bukti transfer di bawah ini agar staf kami dapat memverifikasi pesanan Anda.
            </p>

            {order.paymentReceiptUrl || receiptUploaded ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--success-600)', fontSize: '13px', fontWeight: 600 }}>
                <CheckCircle2 size={18} />
                <span>Bukti pembayaran tersimpan! Menunggu verifikasi admin di dashboard.</span>
              </div>
            ) : (
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleSimulateUploadReceipt}
                style={{ fontSize: '13px' }}
              />
            )}
          </div>
        </div>

        {/* Order Items Breakdown */}
        <div style={{ backgroundColor: 'var(--ivory-50)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--cream-300)' }}>
          <h3 style={{ fontSize: '18px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', marginBottom: '16px' }}>
            Rincian Pesanan
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            {order.items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', paddingBottom: '8px', borderBottom: '1px solid var(--cream-200)' }}>
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--brown-900)' }}>{item.quantity}x {item.productName}</span>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>{item.variantName}</span>
                </div>
                <span style={{ fontWeight: 600, color: 'var(--brown-800)' }}>{formatRupiah(item.subtotal)}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
            <span>{formatRupiah(order.subtotal || order.subtotalAmount || 0)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Ongkos Kirim:</span>
            <span>{formatRupiah(order.shippingFee || order.deliveryFee || 0)}</span>
          </div>

          {(order.discountAmount ?? 0) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px', color: '#16A34A', fontWeight: 600 }}>
              <span>Diskon Promo Belanja:</span>
              <span>-{formatRupiah(order.discountAmount || 0)}</span>
            </div>
          )}

          {order.souvenirReward && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '12px', color: '#B45309', backgroundColor: '#FEF3C7', padding: '6px 10px', borderRadius: '6px' }}>
              <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Gift size={14} /> Hadiah Souvenir Belanja (≥ Rp 750rb):
              </span>
              <span style={{ fontWeight: 700, color: '#15803D' }}>{order.souvenirReward} (GRATIS)</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 700, paddingTop: '10px', borderTop: '2px solid var(--cream-300)' }}>
            <span style={{ color: 'var(--brown-900)' }}>Total Pembayaran:</span>
            <span style={{ color: 'var(--brown-900)' }}>{formatRupiah(order.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
