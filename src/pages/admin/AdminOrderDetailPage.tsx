import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Truck,
  ShoppingBag,
  AlertTriangle,
  XCircle,
  FileText,
  DollarSign,
  Package,
  RotateCcw,
  User,
  MapPin,
  Calendar,
  Gift,
} from 'lucide-react';
import { repos } from '@/services/repositories';
import { Order, OrderStatus } from '@/types';
import { formatRupiah, formatDateTimeWITA } from '@/utils/format';
import { useAuth } from '@/app/providers/AuthContext';
import { useToast } from '@/app/providers/ToastContext';
import { OrderChatBox } from '@/components/chat/OrderChatBox';

export const AdminOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { addToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  const loadOrder = () => {
    if (!id) return;
    const found = repos.order.getById(id);
    setOrder(found);
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2 style={{ color: 'var(--brown-900)', marginBottom: '12px' }}>Pesanan Tidak Ditemukan</h2>
        <p style={{ color: 'var(--brown-600)', marginBottom: '20px' }}>
          Pesanan dengan ID tersebut tidak ada atau sudah dihapus.
        </p>
        <Link
          to="/admin/pesanan"
          style={{
            padding: '10px 20px',
            backgroundColor: 'var(--brown-900)',
            color: 'var(--text-on-dark)',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Kembali ke Daftar Pesanan
        </Link>
      </div>
    );
  }

  // Handle Order Confirmation and Stock Deduction
  const handleConfirmOrder = () => {
    const actorName = session?.userName || 'Admin Toko';
    setLoadingAction(true);
    const result = repos.order.confirmOrderAndDeductStock(order.id, actorName, repos.product);
    setLoadingAction(false);

    if (result.success) {
      addToast('Pesanan berhasil dikonfirmasi dan stok otomatis dipotong!', 'success');
      loadOrder();
    } else {
      addToast(result.error || 'Gagal mengonfirmasi pesanan.', 'error');
    }
  };

  // Handle Status Update
  const handleAdvanceStatus = (nextStatus: OrderStatus, label: string) => {
    const actorName = session?.userName || 'Admin Toko';
    const now = new Date().toISOString();

    const updated: Order = {
      ...order,
      orderStatus: nextStatus,
      updatedAt: now,
      statusHistory: [
        ...order.statusHistory,
        {
          status: nextStatus,
          timestamp: now,
          actor: 'admin',
          actorName,
          notes: `Status pesanan diubah menjadi ${nextStatus}.`,
        },
      ],
      items: order.items.map(item => ({
        ...item,
        itemStatus: nextStatus === 'selesai' ? 'selesai' : (nextStatus === 'dikirim' || nextStatus === 'siap_diambil' ? 'siap' : item.itemStatus),
      })),
    };

    repos.order.update(updated);
    addToast(`Status pesanan berhasil diubah menjadi: ${label}`, 'success');
    loadOrder();
  };

  // Handle Cancellation
  const handleCancelOrder = () => {
    if (!cancelReason.trim()) {
      addToast('Harap masukkan alasan pembatalan.', 'warning');
      return;
    }
    const actorName = session?.userName || 'Admin Toko';
    const ok = repos.order.cancelOrder(order.id, actorName, cancelReason.trim());
    if (ok) {
      addToast('Pesanan berhasil dibatalkan.', 'info');
      setCancelModalOpen(false);
      loadOrder();
    } else {
      addToast('Gagal membatalkan pesanan.', 'error');
    }
  };

  // Handle Restock
  const handleRestock = () => {
    const actorName = session?.userName || 'Admin Toko';
    const ok = repos.order.restockOrder(order.id, actorName, repos.product);
    if (ok) {
      addToast('Stok pesanan berhasil dikembalikan ke gudang.', 'success');
      loadOrder();
    } else {
      addToast('Tidak ada stok yang dapat dikembalikan atau pesanan belum dibatalkan.', 'warning');
    }
  };

  // Handle Payment Verification
  const handleVerifyPayment = (newPaymentStatus: Order['paymentStatus']) => {
    const now = new Date().toISOString();
    const actorName = session?.userName || 'Admin Toko';
    const updated: Order = {
      ...order,
      paymentStatus: newPaymentStatus,
      updatedAt: now,
      changeHistory: [
        ...order.changeHistory,
        {
          changedAt: now,
          actor: 'admin',
          actorName,
          description: `Status pembayaran diubah menjadi "${newPaymentStatus}".`,
        },
      ],
    };
    repos.order.update(updated);
    addToast(`Status pembayaran diperbarui menjadi: ${newPaymentStatus}`, 'success');
    loadOrder();
  };

  const hasDeductedStock = order.items.some(i => i.stockDeducted);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/admin/pesanan')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--brown-800)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          <ArrowLeft size={18} /> Kembali ke Daftar Pesanan
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Link
            to={`/pesanan/${order.orderNumber}/invoice`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--cream-200)',
              border: '1px solid var(--cream-300)',
              color: 'var(--brown-900)',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <FileText size={16} /> Cetak Invoice
          </Link>
        </div>
      </div>

      {/* Header Banner */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '24px',
          borderLeft: `6px solid ${
            order.orderStatus === 'selesai'
              ? 'var(--success-500)'
              : order.orderStatus === 'dibatalkan'
              ? 'var(--danger-500)'
              : 'var(--gold-500)'
          }`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '24px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)' }}>
                {order.orderNumber}
              </h1>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor:
                    order.orderStatus === 'selesai'
                      ? '#DCFCE7'
                      : order.orderStatus === 'dibatalkan'
                      ? '#FEE2E2'
                      : 'var(--gold-100)',
                  color:
                    order.orderStatus === 'selesai'
                      ? '#166534'
                      : order.orderStatus === 'dibatalkan'
                      ? '#991B1B'
                      : 'var(--brown-900)',
                }}
              >
                Status: {order.orderStatus.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
            <p style={{ color: 'var(--brown-600)', fontSize: '13px', marginTop: '4px' }}>
              Dibuat pada {formatDateTimeWITA(order.createdAt)} • Terakhir diperbarui {formatDateTimeWITA(order.updatedAt)}
            </p>
          </div>

          {/* Action buttons based on status */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {order.orderStatus === 'menunggu_konfirmasi_admin' && (
              <>
                <button
                  onClick={handleConfirmOrder}
                  disabled={loadingAction}
                  style={{
                    backgroundColor: 'var(--brown-900)',
                    color: 'var(--gold-500)',
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <CheckCircle size={16} /> Konfirmasi Pesanan & Potong Stok
                </button>

                <button
                  onClick={() => setCancelModalOpen(true)}
                  style={{
                    backgroundColor: 'var(--cream-100)',
                    color: 'var(--danger-500)',
                    border: '1px solid var(--danger-500)',
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Batalkan
                </button>
              </>
            )}

            {order.orderStatus === 'diproses' && (
              <>
                <button
                  onClick={() =>
                    handleAdvanceStatus(
                      order.deliveryMethod === 'pickup' ? 'siap_diambil' : 'dikirim',
                      order.deliveryMethod === 'pickup' ? 'Siap Diambil' : 'Sedang Dikirim'
                    )
                  }
                  style={{
                    backgroundColor: 'var(--brown-900)',
                    color: 'var(--text-on-dark)',
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Truck size={16} /> Tandai {order.deliveryMethod === 'pickup' ? 'Siap Diambil' : 'Sedang Dikirim'}
                </button>

                <button
                  onClick={() => setCancelModalOpen(true)}
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--danger-500)',
                    border: '1px solid var(--danger-500)',
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Batalkan
                </button>
              </>
            )}

            {(order.orderStatus === 'siap_diambil' || order.orderStatus === 'dikirim') && (
              <button
                onClick={() => handleAdvanceStatus('selesai', 'Selesai')}
                style={{
                  backgroundColor: 'var(--success-500)',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <CheckCircle size={16} /> Selesaikan Pesanan (Selesai)
              </button>
            )}

            {order.orderStatus === 'dibatalkan' && hasDeductedStock && (
              <button
                onClick={handleRestock}
                style={{
                  backgroundColor: 'var(--brown-900)',
                  color: 'var(--gold-500)',
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <RotateCcw size={16} /> Kembalikan Stok ke Gudang (Restock)
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Left Column: Customer & Delivery Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Customer Info Card */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '16px', color: 'var(--brown-900)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} color="var(--gold-600)" /> Informasi Pelanggan
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: '10px', fontSize: '13px' }}>
              <span style={{ color: 'var(--brown-500)' }}>Nama Pembeli:</span>
              <span style={{ fontWeight: 600, color: 'var(--brown-900)' }}>{order.customerName}</span>

              <span style={{ color: 'var(--brown-500)' }}>WhatsApp:</span>
              <span style={{ fontWeight: 600, color: 'var(--brown-900)' }}>
                <a href={`https://wa.me/${order.customerPhone}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brown-900)', textDecoration: 'underline' }}>
                  {order.customerPhone}
                </a>
              </span>

              {order.customerEmail && (
                <>
                  <span style={{ color: 'var(--brown-500)' }}>Email:</span>
                  <span style={{ color: 'var(--brown-800)' }}>{order.customerEmail}</span>
                </>
              )}

              {order.orderNotes && (
                <>
                  <span style={{ color: 'var(--brown-500)' }}>Catatan:</span>
                  <span style={{ color: 'var(--brown-800)', fontStyle: 'italic', backgroundColor: 'var(--cream-100)', padding: '8px', borderRadius: 'var(--radius-sm)' }}>
                    "{order.orderNotes}"
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Delivery Info Card */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '16px', color: 'var(--brown-900)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={18} color="var(--gold-600)" /> Pengiriman & Pemenuhan
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: '10px', fontSize: '13px' }}>
              <span style={{ color: 'var(--brown-500)' }}>Metode:</span>
              <span style={{ fontWeight: 600, color: 'var(--brown-900)' }}>
                {order.deliveryMethod === 'pickup'
                  ? 'Ambil Sendiri di Toko'
                  : order.deliveryMethod === 'courier'
                  ? 'Kurir Toko'
                  : 'GoSend / GrabExpress'}
              </span>

              <span style={{ color: 'var(--brown-500)' }}>Tanggal:</span>
              <span style={{ fontWeight: 700, color: 'var(--brown-900)' }}>
                {order.fulfillmentDate} {order.fulfillmentTime ? `(${order.fulfillmentTime})` : ''}
              </span>

              {order.deliveryMethod !== 'pickup' && order.deliveryAddress && (
                <>
                  <span style={{ color: 'var(--brown-500)' }}>Alamat:</span>
                  <span style={{ color: 'var(--brown-900)' }}>
                    <div><b>{order.deliveryAddress.recipientName}</b> ({order.deliveryAddress.phone})</div>
                    <div>{order.deliveryAddress.fullAddress}</div>
                    <div style={{ fontSize: '12px', color: 'var(--brown-600)' }}>
                      Kecamatan: {order.deliveryAddress.district || '-'}
                    </div>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Payment Info Card */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '16px', color: 'var(--brown-900)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={18} color="var(--gold-600)" /> Status Pembayaran
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: '10px', fontSize: '13px', marginBottom: '16px' }}>
              <span style={{ color: 'var(--brown-500)' }}>Metode:</span>
              <span style={{ fontWeight: 600, color: 'var(--brown-900)' }}>
                {order.paymentChannelName || (
                  order.paymentMethod === 'bank_transfer'
                    ? 'Transfer Bank'
                    : order.paymentMethod === 'qris'
                    ? 'QRIS Toko'
                    : 'Bayar di Tempat (COD)'
                )}
              </span>

              <span style={{ color: 'var(--brown-500)' }}>Status Bayar:</span>
              <div>
                <span
                  style={{
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor:
                      order.paymentStatus === 'verified'
                        ? '#DCFCE7'
                        : order.paymentStatus === 'waiting_verification'
                        ? 'var(--gold-100)'
                        : '#FEE2E2',
                    color:
                      order.paymentStatus === 'verified'
                        ? '#166534'
                        : order.paymentStatus === 'waiting_verification'
                        ? 'var(--brown-900)'
                        : '#991B1B',
                  }}
                >
                  {order.paymentStatus.toUpperCase()}
                </span>
              </div>

              {order.paymentProof && (
                <>
                  <span style={{ color: 'var(--brown-500)' }}>Bukti Bayar:</span>
                  <div>
                    <img
                      src={order.paymentProof}
                      alt="Bukti Transfer"
                      style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)' }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Payment Verification Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid var(--cream-200)', paddingTop: '12px' }}>
              <button
                onClick={() => handleVerifyPayment('verified')}
                disabled={order.paymentStatus === 'verified'}
                style={{
                  backgroundColor: order.paymentStatus === 'verified' ? 'var(--cream-300)' : '#166534',
                  color: '#FFFFFF',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: order.paymentStatus === 'verified' ? 'not-allowed' : 'pointer',
                }}
              >
                Set Terverifikasi (Lunas)
              </button>

              <button
                onClick={() => handleVerifyPayment('waiting_verification')}
                disabled={order.paymentStatus === 'waiting_verification'}
                style={{
                  backgroundColor: 'var(--cream-200)',
                  color: 'var(--brown-900)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Set Menunggu Verifikasi
              </button>

              <button
                onClick={() => handleVerifyPayment('unpaid')}
                disabled={order.paymentStatus === 'unpaid'}
                style={{
                  backgroundColor: 'var(--cream-100)',
                  color: 'var(--danger-500)',
                  border: '1px solid var(--cream-300)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Set Belum Bayar
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Items & Chat */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Items Card */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '16px', color: 'var(--brown-900)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={18} color="var(--gold-600)" /> Rincian Produk ({order.items.length})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              {order.items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: 'var(--cream-100)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--brown-900)' }}>
                      {item.productName}
                    </div>
                    <div style={{ color: 'var(--brown-600)', fontSize: '12px' }}>
                      Varian: <b>{item.variantName}</b> • Kemasan: {item.packagingType}
                    </div>
                    {item.customTextOnCake && (
                      <div style={{ fontSize: '11px', color: 'var(--gold-600)', marginTop: '2px' }}>
                        Tulisan kue: "{item.customTextOnCake}"
                      </div>
                    )}
                    {item.specialNotes && (
                      <div style={{ fontSize: '11px', color: 'var(--brown-500)', fontStyle: 'italic' }}>
                        Catatan: "{item.specialNotes}"
                      </div>
                    )}
                    <div style={{ marginTop: '4px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: item.stockDeducted ? '#DCFCE7' : '#FEE2E2',
                          color: item.stockDeducted ? '#166534' : '#991B1B',
                          fontWeight: 700,
                        }}
                      >
                        {item.stockDeducted ? 'Stok Terpotong' : 'Belum Potong Stok'}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--brown-900)' }}>
                      {formatRupiah(item.subtotal)}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--brown-600)' }}>
                      {item.quantity} × {formatRupiah(item.unitPrice)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div style={{ borderTop: '1px solid var(--cream-300)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--brown-700)' }}>
                <span>Subtotal Produk</span>
                <span>{formatRupiah(order.subtotalAmount || order.subtotal || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--brown-700)' }}>
                <span>Biaya Kemasan</span>
                <span>{formatRupiah(order.packagingFee || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--brown-700)' }}>
                <span>Ongkos Kirim</span>
                <span>{formatRupiah(order.deliveryFee || order.shippingFee || 0)}</span>
              </div>

              {(order.discountAmount ?? 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A', fontWeight: 600 }}>
                  <span>Diskon Promo Belanja</span>
                  <span>-{formatRupiah(order.discountAmount || 0)}</span>
                </div>
              )}

              {order.souvenirReward && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#B45309', fontWeight: 600, backgroundColor: '#FEF3C7', padding: '6px 10px', borderRadius: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Gift size={14} /> Hadiah Souvenir (≥ 750rb):
                  </span>
                  <span style={{ color: '#15803D', fontWeight: 700 }}>{order.souvenirReward} (GRATIS)</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '16px', color: 'var(--brown-900)', borderTop: '1px solid var(--cream-300)', paddingTop: '8px' }}>
                <span>Total Pembayaran</span>
                <span>{formatRupiah(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Timeline & Status History */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '16px', color: 'var(--brown-900)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="var(--gold-600)" /> Riwayat Transisi Status
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {order.statusHistory.map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--gold-500)', marginTop: '4px' }} />
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--brown-900)' }}>
                      {h.status.toUpperCase()}
                      <span style={{ fontWeight: 400, color: 'var(--brown-500)', marginLeft: '8px' }}>
                        oleh {h.actorName || h.actor}
                      </span>
                    </div>
                    <div style={{ color: 'var(--brown-600)' }}>{formatDateTimeWITA(h.timestamp)}</div>
                    {h.notes && <div style={{ color: 'var(--brown-700)', marginTop: '2px' }}>{h.notes}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Embedded Chat Box */}
          <OrderChatBox
            orderId={order.id}
            senderType="admin"
            senderName={session?.userName || 'Admin Toko'}
          />
        </div>
      </div>

      {/* Cancel Order Modal */}
      {cancelModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '24px', maxWidth: '450px', width: '100%' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--danger-500)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} /> Batalkan Pesanan
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--brown-700)', marginBottom: '16px' }}>
              Apakah Anda yakin ingin membatalkan pesanan <b>{order.orderNumber}</b>? Harap isi alasan pembatalan untuk dicatat pada riwayat status.
            </p>
            <textarea
              rows={3}
              placeholder="Contoh: Pembeli minta dibatalkan karena salah tanggal..."
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--cream-300)',
                fontSize: '13px',
                marginBottom: '16px',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setCancelModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--cream-200)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Batal
              </button>
              <button
                onClick={handleCancelOrder}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--danger-500)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Konfirmasi Pembatalan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
