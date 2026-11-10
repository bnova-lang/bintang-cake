import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, Download, TrendingUp, DollarSign, ShoppingBag, CheckCircle } from 'lucide-react';
import { repos } from '@/services/repositories';
import { Order } from '@/types';
import { formatRupiah, formatDateTimeWITA } from '@/utils/format';
import { useToast } from '@/app/providers/ToastContext';

export const AdminReportsPage: React.FC = () => {
  const { addToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(repos.order.getAll());
  }, []);

  // PRD §22.1 & D-23: Revenue ONLY counts orders with paymentStatus === 'verified' and orderStatus !== 'dibatalkan'
  const verifiedOrders = useMemo(() => {
    return orders.filter(o => o.paymentStatus === 'verified' && o.orderStatus !== 'dibatalkan');
  }, [orders]);

  const totalRevenue = useMemo(() => {
    return verifiedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  }, [verifiedOrders]);

  const completedOrdersCount = useMemo(() => {
    return orders.filter(o => o.orderStatus === 'selesai').length;
  }, [orders]);

  const aov = useMemo(() => {
    if (verifiedOrders.length === 0) return 0;
    return Math.round(totalRevenue / verifiedOrders.length);
  }, [totalRevenue, verifiedOrders]);

  // Product sales breakdown
  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; quantity: number; revenue: number }> = {};
    verifiedOrders.forEach(o => {
      o.items.forEach(item => {
        if (!map[item.productId]) {
          map[item.productId] = { name: item.productName, quantity: 0, revenue: 0 };
        }
        map[item.productId].quantity += item.quantity;
        map[item.productId].revenue += item.subtotal;
      });
    });

    return Object.values(map).sort((a, b) => b.quantity - a.quantity);
  }, [verifiedOrders]);

  // Chart data: daily grouping (last 7 entries or all dates)
  const chartData = useMemo(() => {
    const dailyMap: Record<string, number> = {};
    verifiedOrders.forEach(o => {
      const dateKey = o.fulfillmentDate || o.createdAt.split('T')[0];
      dailyMap[dateKey] = (dailyMap[dateKey] || 0) + o.totalAmount;
    });

    return Object.entries(dailyMap).map(([date, total]) => ({
      date: date.slice(5), // MM-DD
      pendapatan: total,
    }));
  }, [verifiedOrders]);

  // CSV Export handler
  const handleExportCSV = () => {
    if (orders.length === 0) {
      addToast('Tidak ada data pesanan untuk diekspor.', 'warning');
      return;
    }

    const headers = [
      'Nomor Pesanan',
      'Tanggal (WITA)',
      'Nama Pelanggan',
      'No WhatsApp',
      'Metode Pengiriman',
      'Tanggal Pengiriman',
      'Metode Pembayaran',
      'Status Pembayaran',
      'Status Pesanan',
      'Subtotal Produk',
      'Biaya Kemasan',
      'Ongkir',
      'Total (Rp)',
    ];

    const rows = orders.map(o => [
      `"${o.orderNumber}"`,
      `"${formatDateTimeWITA(o.createdAt)}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.customerPhone}"`,
      `"${o.deliveryMethod}"`,
      `"${o.fulfillmentDate}"`,
      `"${o.paymentMethod}"`,
      `"${o.paymentStatus}"`,
      `"${o.orderStatus}"`,
      o.subtotalAmount,
      o.packagingFee,
      o.deliveryFee,
      o.totalAmount,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `laporan-penjualan-bintang-cake-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast('File laporan CSV berhasil diunduh!', 'success');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', marginBottom: '4px' }}>
            Laporan Penjualan & Keuangan
          </h1>
          <p style={{ color: 'var(--brown-600)', fontSize: '14px' }}>
            Ringkasan pendapatan terverifikasi, volume pesanan, dan ekspor data transaksi.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          style={{
            padding: '10px 18px',
            backgroundColor: 'var(--brown-900)',
            color: 'var(--gold-500)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Download size={16} /> Unduh CSV Laporan
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--brown-600)', fontWeight: 600 }}>Pendapatan Terverifikasi</span>
            <DollarSign size={20} color="var(--gold-600)" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--brown-900)' }}>
            {formatRupiah(totalRevenue)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--brown-500)', marginTop: '4px' }}>
            Dari {verifiedOrders.length} pesanan terverifikasi
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--brown-600)', fontWeight: 600 }}>Rata-rata Pesanan (AOV)</span>
            <TrendingUp size={20} color="#166534" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--brown-900)' }}>
            {formatRupiah(aov)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--brown-500)', marginTop: '4px' }}>
            Nilai transaksi rata-rata
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--brown-600)', fontWeight: 600 }}>Pesanan Selesai</span>
            <CheckCircle size={20} color="var(--success-500)" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--brown-900)' }}>
            {completedOrdersCount}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--brown-500)', marginTop: '4px' }}>
            Total pesanan berstatus selesai
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--brown-600)', fontWeight: 600 }}>Total Transaksi Masuk</span>
            <ShoppingBag size={20} color="var(--brown-700)" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--brown-900)' }}>
            {orders.length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--brown-500)', marginTop: '4px' }}>
            Semua status pesanan
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', color: 'var(--brown-900)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={18} color="var(--gold-600)" /> Grafik Pendapatan Terverifikasi
        </h2>

        {chartData.length === 0 ? (
          <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brown-500)', fontSize: '13px' }}>
            Belum ada data pendapatan terverifikasi untuk ditampilkan.
          </div>
        ) : (
          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--cream-300)" />
                <XAxis dataKey="date" stroke="var(--brown-500)" fontSize={12} />
                <YAxis
                  stroke="var(--brown-500)"
                  fontSize={12}
                  tickFormatter={val => `Rp ${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value: number) => [formatRupiah(value), 'Pendapatan']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--cream-300)', fontSize: '12px' }}
                />
                <Bar dataKey="pendapatan" fill="var(--brown-800)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Product Ranking Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ fontSize: '16px', color: 'var(--brown-900)', marginBottom: '16px' }}>
          Peringkat Produk Terlaris
        </h2>

        {topProducts.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--brown-500)', fontSize: '13px' }}>
            Belum ada penjualan terverifikasi.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--cream-200)', color: 'var(--brown-800)' }}>
                  <th style={{ padding: '10px 14px', width: '40px' }}>No</th>
                  <th style={{ padding: '10px 14px' }}>Nama Produk</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Total Terjual (Qty)</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Total Omset</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((prod, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--cream-200)' }}>
                    <td style={{ padding: '10px 14px', color: 'var(--brown-500)', fontWeight: 600 }}>{idx + 1}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--brown-900)' }}>{prod.name}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700 }}>{prod.quantity} pcs</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--brown-900)' }}>
                      {formatRupiah(prod.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
