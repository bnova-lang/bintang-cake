import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, Clock, AlertTriangle, ArrowRight, Package } from 'lucide-react';
import { repos } from '@/services/repositories';
import { formatRupiah, formatDateWITA } from '@/utils/format';

export const AdminOverviewPage: React.FC = () => {
  const orders = useMemo(() => repos.orderRepo.getAll(), []);
  const products = useMemo(() => repos.productRepo.getAll(), []);

  // PRD §22.1 & D-23: Revenue only counts verified and non-cancelled orders!
  const verifiedRevenue = useMemo(() => {
    return orders
      .filter(o => o.paymentStatus === 'verified' && o.orderStatus !== 'dibatalkan')
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }, [orders]);

  const pendingConfirmationOrders = useMemo(() => {
    return orders.filter(o => o.orderStatus === 'menunggu_konfirmasi_admin');
  }, [orders]);

  // Low stock products
  const lowStockItems = useMemo(() => {
    const list: { productName: string; variantName?: string; stock: number; threshold: number }[] = [];
    for (const p of products) {
      if (p.fulfillmentType === 'ready_stock' && p.active) {
        if (p.stockMode === 'per_product') {
          if (p.stockQuantity <= p.lowStockThreshold) {
            list.push({ productName: p.name, stock: p.stockQuantity, threshold: p.lowStockThreshold });
          }
        } else {
          for (const v of p.variants) {
            if (v.active && v.stockQuantity <= p.lowStockThreshold) {
              list.push({ productName: p.name, variantName: v.name, stock: v.stockQuantity, threshold: p.lowStockThreshold });
            }
          }
        }
      }
    }
    return list;
  }, [products]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{ fontSize: '26px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', marginBottom: '4px' }}>
          Ringkasan Operasional Toko
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Pantau pesanan masuk, pendapatan terverifikasi, dan peringatan stok dapur
        </p>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div style={{ backgroundColor: 'var(--ivory-50)', padding: '20px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--cream-300)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Pendapatan Terverifikasi</span>
            <div style={{ backgroundColor: 'var(--success-100)', color: 'var(--success-600)', width: '36px', height: '36px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <b style={{ fontSize: '22px', color: 'var(--brown-900)' }}>{formatRupiah(verifiedRevenue)}</b>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
            Hanya pesanan terverifikasi (PRD §22.1)
          </span>
        </div>

        <div style={{ backgroundColor: 'var(--ivory-50)', padding: '20px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--cream-300)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Total Pesanan Masuk</span>
            <div style={{ backgroundColor: 'var(--gold-100)', color: 'var(--gold-600)', width: '36px', height: '36px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={20} />
            </div>
          </div>
          <b style={{ fontSize: '22px', color: 'var(--brown-900)' }}>{orders.length}</b>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
            Seluruh transaksi lokal
          </span>
        </div>

        <div style={{ backgroundColor: 'var(--ivory-50)', padding: '20px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--cream-300)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Perlu Konfirmasi Admin</span>
            <div style={{ backgroundColor: 'var(--warning-100)', color: 'var(--warning-600)', width: '36px', height: '36px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} />
            </div>
          </div>
          <b style={{ fontSize: '22px', color: 'var(--warning-600)' }}>{pendingConfirmationOrders.length}</b>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
            Menunggu persetujuan admin & potong stok
          </span>
        </div>

        <div style={{ backgroundColor: 'var(--ivory-50)', padding: '20px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--cream-300)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Peringatan Stok Rendah</span>
            <div style={{ backgroundColor: 'var(--danger-100)', color: 'var(--danger-600)', width: '36px', height: '36px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <b style={{ fontSize: '22px', color: 'var(--danger-600)' }}>{lowStockItems.length}</b>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
            Stok ≤ batas minimum toko
          </span>
        </div>
      </div>

      {/* Low stock table alert if any */}
      {lowStockItems.length > 0 && (
        <div style={{ backgroundColor: 'var(--warning-100)', border: '1px solid var(--warning-600)', padding: '16px 20px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning-600)', fontWeight: 700, marginBottom: '8px' }}>
            <AlertTriangle size={18} />
            <span>Peringatan Stok Menipis di Dapur:</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--brown-900)' }}>
            {lowStockItems.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '4px' }}>
                <b>{item.productName}</b> {item.variantName ? `(${item.variantName})` : ''} — Tersisa: <b>{item.stock}</b> kemasan (Batas: {item.threshold})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent Orders List */}
      <div style={{ backgroundColor: 'var(--ivory-50)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--cream-300)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', margin: 0 }}>
            Pesanan Terbaru Masuk
          </h2>
          <Link to="/admin/pesanan" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brown-800)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span>Lihat Semua Pesanan</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {orders.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--cream-300)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 12px' }}>No. Pesanan</th>
                  <th style={{ padding: '10px 12px' }}>Tanggal</th>
                  <th style={{ padding: '10px 12px' }}>Pemesan</th>
                  <th style={{ padding: '10px 12px' }}>Total Tagihan</th>
                  <th style={{ padding: '10px 12px' }}>Status Pesanan</th>
                  <th style={{ padding: '10px 12px' }}>Pembayaran</th>
                  <th style={{ padding: '10px 12px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--cream-200)' }}>
                    <td style={{ padding: '12px', fontWeight: 700 }}>{o.orderNumber}</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{formatDateWITA(o.createdAt)}</td>
                    <td style={{ padding: '12px' }}>
                      <b>{o.customerName}</b>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>{o.customerWhatsapp}</span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>{formatRupiah(o.totalAmount)}</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          backgroundColor: o.orderStatus === 'selesai' ? 'var(--success-100)' : o.orderStatus === 'dibatalkan' ? 'var(--danger-100)' : 'var(--warning-100)',
                          color: o.orderStatus === 'selesai' ? 'var(--success-600)' : o.orderStatus === 'dibatalkan' ? 'var(--danger-600)' : 'var(--warning-600)',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'capitalize',
                        }}
                      >
                        {o.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          backgroundColor: o.paymentStatus === 'verified' ? 'var(--success-100)' : 'var(--cream-200)',
                          color: o.paymentStatus === 'verified' ? 'var(--success-600)' : 'var(--text-secondary)',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'capitalize',
                        }}
                      >
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Link
                        to={`/admin/pesanan/${o.id}`}
                        style={{
                          backgroundColor: 'var(--brown-800)',
                          color: 'var(--text-on-dark)',
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '12px',
                          fontWeight: 600,
                          display: 'inline-block',
                        }}
                      >
                        Kelola
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>Belum ada pesanan.</p>
        )}
      </div>
    </div>
  );
};
