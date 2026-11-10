import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  FileText,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  XCircle,
  Trash2,
} from 'lucide-react';
import { repos } from '@/services/repositories';
import { Order, OrderStatus } from '@/types';
import { formatRupiah, formatDateTimeWITA } from '@/utils/format';
import { useToast } from '@/app/providers/ToastContext';

export const AdminOrdersPage: React.FC = () => {
  const { addToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  const refreshOrders = () => {
    setOrders(repos.order.getAll());
  };

  const handleDeleteOrder = () => {
    if (!orderToDelete) return;
    repos.order.delete(orderToDelete.id);
    addToast(`Pesanan ${orderToDelete.orderNumber} berhasil dihapus dari sistem.`, 'success');
    setOrderToDelete(null);
    refreshOrders();
  };

  useEffect(() => {
    refreshOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'siap_dikirim') {
          if (o.orderStatus !== 'siap_diambil' && o.orderStatus !== 'dikirim') return false;
        } else if (o.orderStatus !== statusFilter) {
          return false;
        }
      }

      // Payment filter
      if (paymentFilter !== 'all' && o.paymentStatus !== paymentFilter) {
        return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesNumber = o.orderNumber.toLowerCase().includes(q);
        const matchesName = o.customerName.toLowerCase().includes(q);
        const phone = o.customerPhone || o.customerWhatsapp || '';
        const matchesPhone = phone.includes(q);
        return matchesNumber || matchesName || matchesPhone;
      }

      return true;
    });
  }, [orders, statusFilter, paymentFilter, search]);

  const counts = useMemo(() => {
    return {
      all: orders.length,
      waiting: orders.filter(o => o.orderStatus === 'menunggu_konfirmasi_admin').length,
      processing: orders.filter(o => o.orderStatus === 'diproses').length,
      ready: orders.filter(o => o.orderStatus === 'siap_diambil' || o.orderStatus === 'dikirim').length,
      done: orders.filter(o => o.orderStatus === 'selesai').length,
      cancelled: orders.filter(o => o.orderStatus === 'dibatalkan').length,
    };
  }, [orders]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'menunggu_konfirmasi_admin':
        return (
          <span style={{ backgroundColor: 'var(--gold-100)', color: 'var(--brown-900)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> Menunggu Konfirmasi
          </span>
        );
      case 'diproses':
        return (
          <span style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> Diproses
          </span>
        );
      case 'siap_diambil':
        return (
          <span style={{ backgroundColor: '#E0E7FF', color: '#4338CA', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ShoppingBag size={12} /> Siap Diambil
          </span>
        );
      case 'dikirim':
        return (
          <span style={{ backgroundColor: '#E0E7FF', color: '#4338CA', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Truck size={12} /> Sedang Dikirim
          </span>
        );
      case 'selesai':
        return (
          <span style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={12} /> Selesai
          </span>
        );
      case 'dibatalkan':
        return (
          <span style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <XCircle size={12} /> Dibatalkan
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  const getPaymentBadge = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'unpaid':
        return <span style={{ color: 'var(--danger-500)', fontSize: '11px', fontWeight: 600 }}>Belum Bayar</span>;
      case 'waiting_verification':
        return <span style={{ color: 'var(--gold-500)', fontSize: '11px', fontWeight: 700 }}>Menunggu Verifikasi</span>;
      case 'verified':
        return <span style={{ color: '#166534', fontSize: '11px', fontWeight: 700 }}>Terverifikasi</span>;
      case 'refunded':
        return <span style={{ color: '#6B7280', fontSize: '11px', fontWeight: 600 }}>Refund</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: 'var(--brown-900)', marginBottom: '4px', fontFamily: 'var(--font-serif)' }}>
            Kelola Pesanan
          </h1>
          <p style={{ color: 'var(--brown-600)', fontSize: '14px' }}>
            Pantau alur pesanan pelanggan, konfirmasi stok, dan perbarui status pengerjaan.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
        {[
          { key: 'all', label: 'Semua', count: counts.all },
          { key: 'menunggu_konfirmasi_admin', label: 'Menunggu Konfirmasi', count: counts.waiting },
          { key: 'diproses', label: 'Diproses', count: counts.processing },
          { key: 'siap_dikirim', label: 'Siap / Dikirim', count: counts.ready },
          { key: 'selesai', label: 'Selesai', count: counts.done },
          { key: 'dibatalkan', label: 'Dibatalkan', count: counts.cancelled },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              backgroundColor: statusFilter === tab.key ? 'var(--brown-900)' : 'var(--cream-200)',
              color: statusFilter === tab.key ? 'var(--text-on-dark)' : 'var(--brown-700)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
            <span
              style={{
                backgroundColor: statusFilter === tab.key ? 'var(--gold-500)' : 'var(--cream-300)',
                color: 'var(--brown-900)',
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '10px',
                fontWeight: 700,
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters & Search */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          backgroundColor: '#FFFFFF',
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-sm)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--brown-400)' }} />
          <input
            type="text"
            placeholder="Cari nomor pesanan, nama pembeli, atau no WhatsApp..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--cream-300)',
              fontSize: '13px',
              backgroundColor: 'var(--cream-100)',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="var(--brown-600)" />
          <span style={{ fontSize: '13px', color: 'var(--brown-700)' }}>Status Bayar:</span>
          <select
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--cream-300)',
              fontSize: '13px',
              backgroundColor: 'var(--cream-100)',
            }}
          >
            <option value="all">Semua</option>
            <option value="unpaid">Belum Bayar</option>
            <option value="waiting_verification">Menunggu Verifikasi</option>
            <option value="verified">Terverifikasi</option>
            <option value="refunded">Refund</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--cream-200)', color: 'var(--brown-800)', borderBottom: '1px solid var(--cream-300)' }}>
                <th style={{ padding: '12px 16px' }}>No Pesanan</th>
                <th style={{ padding: '12px 16px' }}>Tanggal WITA</th>
                <th style={{ padding: '12px 16px' }}>Pelanggan</th>
                <th style={{ padding: '12px 16px' }}>Pengiriman</th>
                <th style={{ padding: '12px 16px' }}>Total</th>
                <th style={{ padding: '12px 16px' }}>Status Pesanan</th>
                <th style={{ padding: '12px 16px' }}>Status Bayar</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: 'var(--brown-500)' }}>
                    <AlertCircle size={32} style={{ margin: '0 auto 8px', color: 'var(--brown-400)' }} />
                    Tidak ada pesanan yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--cream-200)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <Link
                        to={`/admin/pesanan/${order.id}`}
                        style={{ fontWeight: 700, color: 'var(--brown-900)', textDecoration: 'underline' }}
                      >
                        {order.orderNumber}
                      </Link>
                      <div style={{ fontSize: '11px', color: 'var(--brown-500)' }}>
                        {order.items.length} item
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--brown-700)', whiteSpace: 'nowrap' }}>
                      {formatDateTimeWITA(order.createdAt)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--brown-900)' }}>{order.customerName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--brown-500)' }}>{order.customerPhone}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--brown-700)' }}>
                      <div>
                        {order.deliveryMethod === 'pickup'
                          ? 'Ambil Sendiri'
                          : order.deliveryMethod === 'courier'
                          ? 'Kurir Toko'
                          : 'GoSend / Grab'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--brown-500)' }}>
                        Tgl: {order.fulfillmentDate}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--brown-900)', whiteSpace: 'nowrap' }}>
                      {formatRupiah(order.totalAmount)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>{getStatusBadge(order.orderStatus)}</td>
                    <td style={{ padding: '12px 16px' }}>{getPaymentBadge(order.paymentStatus)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <Link
                          to={`/admin/pesanan/${order.id}`}
                          title="Lihat Detail Pesanan"
                          style={{
                            padding: '6px 10px',
                            backgroundColor: 'var(--cream-200)',
                            color: 'var(--brown-900)',
                            borderRadius: 'var(--radius-md)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          <Eye size={14} /> Detail
                        </Link>
                        <Link
                          to={`/pesanan/${order.orderNumber}/invoice`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Cetak Invoice"
                          style={{
                            padding: '6px 10px',
                            backgroundColor: 'var(--cream-100)',
                            border: '1px solid var(--cream-300)',
                            color: 'var(--brown-800)',
                            borderRadius: 'var(--radius-md)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                          }}
                        >
                          <FileText size={14} /> Invoice
                        </Link>
                        <button
                          onClick={() => setOrderToDelete(order)}
                          title="Hapus Pesanan"
                          style={{
                            padding: '6px 10px',
                            backgroundColor: '#FEE2E2',
                            border: '1px solid #FECACA',
                            color: '#DC2626',
                            borderRadius: 'var(--radius-md)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={14} /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus Pesanan */}
      {orderToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
          onClick={() => setOrderToDelete(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Trash2 size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#111827', fontWeight: 700 }}>
                  Konfirmasi Hapus Pesanan
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>
                  Tindakan ini akan menghapus data pesanan secara permanen.
                </p>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--cream-100)',
                border: '1px solid var(--cream-300)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                fontSize: '13px',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--brown-600)' }}>Nomor Pesanan:</span>
                <b style={{ color: 'var(--brown-900)' }}>{orderToDelete.orderNumber}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--brown-600)' }}>Pelanggan:</span>
                <span style={{ fontWeight: 600, color: 'var(--brown-900)' }}>{orderToDelete.customerName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--brown-600)' }}>Total Pembayaran:</span>
                <b style={{ color: 'var(--brown-900)' }}>{formatRupiah(orderToDelete.totalAmount)}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--brown-600)' }}>Status Saat Ini:</span>
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                  {orderToDelete.orderStatus.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                style={{
                  padding: '9px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  color: '#374151',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteOrder}
                style={{
                  padding: '9px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Trash2 size={15} /> Ya, Hapus Pesanan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
