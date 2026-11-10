import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowLeft, CheckCircle } from 'lucide-react';
import { repos } from '@/services/repositories';
import { Order, StoreSettings } from '@/types';
import { formatRupiah, formatDateTimeWITA } from '@/utils/format';

export const PrintableInvoicePage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [store, setStore] = useState<StoreSettings | null>(null);

  useEffect(() => {
    if (orderNumber) {
      const found = repos.order.getByOrderNumber(orderNumber);
      setOrder(found);
    }
    setStore(repos.settings.getStoreSettings());
  }, [orderNumber]);

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', fontFamily: 'var(--font-sans)' }}>
        <h2>Pesanan Tidak Ditemukan</h2>
        <p>Invoice tidak dapat dimuat karena nomor pesanan tidak valid.</p>
        <Link to="/" style={{ color: 'var(--brown-900)', textDecoration: 'underline' }}>
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#F3F4F6',
        minHeight: '100vh',
        padding: '24px 16px',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Top action bar - hidden on print */}
      <div
        className="no-print"
        style={{
          maxWidth: '800px',
          margin: '0 auto 20px auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <button
          onClick={() => window.history.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #D1D5DB',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} /> Kembali
        </button>

        <button
          onClick={() => window.print()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#1E293B',
            color: '#FFFFFF',
            border: 'none',
            padding: '8px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <Printer size={16} /> Cetak / Simpan PDF
        </button>
      </div>

      {/* Printable Sheet */}
      <div
        id="invoice-paper"
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: '#FFFFFF',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          color: '#111827',
        }}
      >
        {/* Invoice Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #E5E7EB', paddingBottom: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {store?.logoUrl && (
              <img
                src={store.logoUrl}
                alt={store.storeName}
                style={{ width: '56px', height: '56px', objectFit: 'contain', borderRadius: '8px' }}
              />
            )}
            <div>
              <h1 style={{ margin: 0, fontSize: '26px', fontFamily: 'serif', color: '#78350F' }}>
                {store?.storeName || 'Bintang Cake & Cookies'}
              </h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#4B5563', lineHeight: '1.4' }}>
                {store?.address || 'Jl. Martadinata No. 12, Balikpapan Tengah'}<br />
                Balikpapan, Kalimantan Timur (WITA)<br />
                WhatsApp: {store?.whatsapp || '0812-3456-7890'}
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#1F2937', letterSpacing: '1px' }}>
              INVOICE
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#78350F', marginTop: '4px' }}>
              #{order.orderNumber}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
              Tanggal: {formatDateTimeWITA(order.createdAt)}
            </div>
          </div>
        </div>

        {/* Customer & Delivery Information */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px', fontSize: '13px' }}>
          <div>
            <div style={{ fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', fontSize: '11px', marginBottom: '6px' }}>
              Ditagihkan Kepada:
            </div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>
              {order.customerName}
            </div>
            <div style={{ color: '#4B5563', marginTop: '2px' }}>
              WhatsApp: {order.customerPhone}
            </div>
            {order.customerEmail && (
              <div style={{ color: '#4B5563' }}>Email: {order.customerEmail}</div>
            )}
          </div>

          <div>
            <div style={{ fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', fontSize: '11px', marginBottom: '6px' }}>
              Pengiriman & Pemenuhan:
            </div>
            <div style={{ fontWeight: 700, color: '#111827' }}>
              {order.deliveryMethod === 'pickup'
                ? 'Ambil Sendiri di Toko'
                : order.deliveryMethod === 'courier'
                ? 'Kurir Toko (Balikpapan)'
                : 'GoSend / GrabExpress'}
            </div>
            <div style={{ color: '#4B5563', marginTop: '2px' }}>
              Rencana Kirim / Ambil: <b>{order.fulfillmentDate}</b> {order.fulfillmentTime ? `(${order.fulfillmentTime})` : ''}
            </div>
            {order.deliveryAddress && order.deliveryMethod !== 'pickup' && (
              <div style={{ color: '#4B5563', marginTop: '4px', fontSize: '12px' }}>
                Alamat: {order.deliveryAddress.fullAddress} (Kec. {order.deliveryAddress.district || '-'})
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', width: '30px' }}>No</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Deskripsi Produk</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', width: '60px' }}>Qty</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', width: '120px' }}>Harga Satuan</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', width: '130px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6' }}>
                <td style={{ padding: '12px', verticalAlign: 'top', color: '#6B7280' }}>{idx + 1}</td>
                <td style={{ padding: '12px', verticalAlign: 'top' }}>
                  <div style={{ fontWeight: 700, color: '#111827' }}>{item.productName}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>
                    Varian: {item.variantName} • Kemasan: {item.packagingType}
                  </div>
                  {item.customTextOnCake && (
                    <div style={{ fontSize: '12px', color: '#78350F', fontStyle: 'italic', marginTop: '2px' }}>
                      Tulisan: "{item.customTextOnCake}"
                    </div>
                  )}
                  {item.specialNotes && (
                    <div style={{ fontSize: '12px', color: '#6B7280', fontStyle: 'italic' }}>
                      Catatan: "{item.specialNotes}"
                    </div>
                  )}
                </td>
                <td style={{ padding: '12px', textAlign: 'center', verticalAlign: 'top', fontWeight: 600 }}>
                  {item.quantity}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', verticalAlign: 'top', color: '#4B5563' }}>
                  {formatRupiah(item.unitPrice)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', verticalAlign: 'top', fontWeight: 700, color: '#111827' }}>
                  {formatRupiah(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Financial Breakdown */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
          <div style={{ width: '320px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
              <span>Subtotal Produk:</span>
              <span>{formatRupiah(order.subtotalAmount || order.subtotal || 0)}</span>
            </div>
            {(order.packagingFee ?? 0) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
                <span>Biaya Kemasan:</span>
                <span>{formatRupiah(order.packagingFee || 0)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
              <span>Ongkos Kirim:</span>
              <span>{formatRupiah(order.deliveryFee || order.shippingFee || 0)}</span>
            </div>
            {(order.discountAmount ?? 0) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A', fontWeight: 600 }}>
                <span>Diskon Promo Belanja:</span>
                <span>-{formatRupiah(order.discountAmount || 0)}</span>
              </div>
            )}
            {order.souvenirReward && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#B45309', fontWeight: 600, backgroundColor: '#FEF3C7', padding: '4px 8px', borderRadius: '4px' }}>
                <span>🎁 Hadiah Souvenir (≥ 750rb):</span>
                <span>GRATIS ({order.souvenirReward})</span>
              </div>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '16px',
                fontWeight: 800,
                color: '#111827',
                borderTop: '2px solid #E5E7EB',
                paddingTop: '8px',
              }}
            >
              <span>Total Akhir:</span>
              <span style={{ color: '#78350F' }}>{formatRupiah(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Payment & Signatures Footer */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', borderTop: '1px solid #E5E7EB', paddingTop: '20px', fontSize: '12px' }}>
          <div>
            <div style={{ fontWeight: 700, color: '#4B5563', marginBottom: '4px' }}>
              Status Pembayaran:
            </div>
            <div style={{ fontWeight: 700, color: order.paymentStatus === 'verified' ? '#166534' : '#991B1B' }}>
              {order.paymentStatus === 'verified' ? 'LUNAS (TERVERIFIKASI)' : 'BELUM DIVERIFIKASI / MENUNGGU'}
            </div>
            <div style={{ color: '#6B7280', marginTop: '2px' }}>
              Metode: {order.paymentChannelName || order.paymentMethod.replace(/_/g, ' ').toUpperCase()}
            </div>
            {order.orderNotes && (
              <div style={{ marginTop: '8px', fontStyle: 'italic', color: '#6B7280' }}>
                Catatan Pesanan: "{order.orderNotes}"
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#6B7280' }}>Balikpapan, {formatDateTimeWITA(order.createdAt).split(' ')[0]}</div>
            <div style={{ height: '60px' }}></div>
            <div style={{ fontWeight: 700, color: '#111827', textDecoration: 'underline' }}>
              Bintang Cake & Cookies
            </div>
            <div style={{ fontSize: '11px', color: '#6B7280' }}>Pengelola Toko</div>
          </div>
        </div>

        {/* Bottom Notice */}
        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '11px', color: '#9CA3AF', borderTop: '1px dashed #E5E7EB', paddingTop: '12px' }}>
          Terima kasih telah memesan kue & cookies di Bintang Cake & Cookies! <br />
          Dokumen ini merupakan bukti pesanan resmi (Demo MVP).
        </div>
      </div>

      <style>{`
        @media print {
          body {
            background-color: #FFFFFF !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          #invoice-paper {
            box-shadow: none !important;
            padding: 20px !important;
            max-width: 100% !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};
