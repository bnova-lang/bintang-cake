import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { AdminLayout } from '@/components/layout/AdminLayout';

// Storefront pages
import { HomePage } from '@/pages/storefront/HomePage';
import { ProductsPage } from '@/pages/storefront/ProductsPage';
import { ProductDetailPage } from '@/pages/storefront/ProductDetailPage';
import { CategoryPage } from '@/pages/storefront/CategoryPage';
import { SpecialPackagesPage } from '@/pages/storefront/SpecialPackagesPage';
import { GalleryPage } from '@/pages/storefront/GalleryPage';
import { AboutUsPage } from '@/pages/storefront/AboutUsPage';
import { HowToOrderPage } from '@/pages/storefront/HowToOrderPage';

// Cart & Checkout pages
import { CartPage } from '@/pages/cart/CartPage';
import { CheckoutPage } from '@/pages/cart/CheckoutPage';
import { OrderSuccessPage } from '@/pages/cart/OrderSuccessPage';

// Customer pages
import { LoginPage } from '@/pages/customer/LoginPage';
import { RegisterPage } from '@/pages/customer/RegisterPage';
import { AccountPage } from '@/pages/customer/AccountPage';
import { GuestTrackOrderPage } from '@/pages/customer/GuestTrackOrderPage';

// Admin pages
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { AdminOverviewPage } from '@/pages/admin/AdminOverviewPage';
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage';
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage';
import { AdminOrderDetailPage } from '@/pages/admin/AdminOrderDetailPage';
import { AdminPaymentsPage } from '@/pages/admin/AdminPaymentsPage';
import { AdminShippingPage } from '@/pages/admin/AdminShippingPage';
import { AdminReviewsPage } from '@/pages/admin/AdminReviewsPage';
import { AdminContentPage } from '@/pages/admin/AdminContentPage';
import { AdminReportsPage } from '@/pages/admin/AdminReportsPage';
import { AdminBackupPage } from '@/pages/admin/AdminBackupPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';
import { PrintableInvoicePage } from '@/pages/admin/PrintableInvoicePage';

// 404 Page
const NotFoundPage: React.FC = () => (
  <div style={{ textAlign: 'center', padding: '80px 20px', maxWidth: '500px', margin: '0 auto' }}>
    <h1 style={{ fontSize: '64px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', margin: '0 0 12px 0' }}>
      404
    </h1>
    <h2 style={{ fontSize: '20px', color: 'var(--brown-800)', marginBottom: '8px' }}>
      Halaman Tidak Ditemukan
    </h2>
    <p style={{ color: 'var(--brown-600)', fontSize: '14px', marginBottom: '24px' }}>
      Halaman yang Anda tuju mungkin sudah dipindahkan, dihapus, atau alamat URL salah.
    </p>
    <Link
      to="/"
      style={{
        padding: '12px 24px',
        backgroundColor: 'var(--brown-900)',
        color: 'var(--gold-500)',
        borderRadius: 'var(--radius-md)',
        textDecoration: 'none',
        fontWeight: 700,
        fontSize: '14px',
        display: 'inline-block',
      }}
    >
      Kembali ke Beranda
    </Link>
  </div>
);

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public Storefront with Header, DemoBanner, BottomNav, Footer */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/produk" element={<ProductsPage />} />
        <Route path="/produk/:slug" element={<ProductDetailPage />} />
        <Route path="/kategori/:slug" element={<CategoryPage />} />
        <Route path="/spesial" element={<SpecialPackagesPage />} />
        <Route path="/galeri" element={<GalleryPage />} />
        <Route path="/tentang-kami" element={<AboutUsPage />} />
        <Route path="/cara-memesan" element={<HowToOrderPage />} />

        {/* Cart & Checkout */}
        <Route path="/keranjang" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/pesanan-berhasil/:orderNumber" element={<OrderSuccessPage />} />

        {/* Customer Account & Tracking */}
        <Route path="/masuk" element={<LoginPage />} />
        <Route path="/daftar" element={<RegisterPage />} />
        <Route path="/akun" element={<AccountPage />} />
        <Route path="/lacak-pesanan" element={<GuestTrackOrderPage />} />

        {/* 404 Not Found inside layout */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Invoice (Clean Printable Layout) */}
      <Route path="/pesanan/:orderNumber/invoice" element={<PrintableInvoicePage />} />

      {/* Admin Login */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Protected Admin Dashboard with AdminLayout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminOverviewPage />} />
        <Route path="produk" element={<AdminProductsPage />} />
        <Route path="pesanan" element={<AdminOrdersPage />} />
        <Route path="pesanan/:id" element={<AdminOrderDetailPage />} />
        <Route path="pembayaran" element={<AdminPaymentsPage />} />
        <Route path="pengiriman" element={<AdminShippingPage />} />
        <Route path="ulasan" element={<AdminReviewsPage />} />
        <Route path="konten" element={<AdminContentPage />} />
        <Route path="laporan" element={<AdminReportsPage />} />
        <Route path="backup" element={<AdminBackupPage />} />
        <Route path="pengaturan" element={<AdminSettingsPage />} />
      </Route>
    </Routes>
  );
};
