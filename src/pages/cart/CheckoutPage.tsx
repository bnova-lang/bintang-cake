import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, Store, MapPin, Calendar, Clock, CreditCard, AlertCircle, ArrowLeft, Gift, Sparkles, Check } from 'lucide-react';
import { useCart } from '@/app/providers/CartContext';
import { useAuth } from '@/app/providers/AuthContext';
import { useToast } from '@/app/providers/ToastContext';
import { repos } from '@/services/repositories';
import { formatRupiah, normalizeWhatsapp } from '@/utils/format';
import { Order, OrderItem, DeliveryMethod } from '@/types';

export const CheckoutPage: React.FC = () => {
  const { detailedItems, subtotal, clearCart } = useCart();
  const { customer } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const storeSettings = useMemo(() => repos.settingsRepo.getStoreSettings(), []);
  const deliveryAreas = useMemo(() => repos.settingsRepo.getDeliveryAreas().filter(d => d.active), []);
  const paymentMethods = useMemo(() => repos.settingsRepo.getPaymentSettings().filter(p => p.active), []);

  // Form States
  const [customerName, setCustomerName] = useState<string>(customer?.name || '');
  const [customerWhatsapp, setCustomerWhatsapp] = useState<string>(customer?.whatsapp || '');
  const [customerEmail, setCustomerEmail] = useState<string>(customer?.email || '');

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('pickup');
  const [selectedAreaId, setSelectedAreaId] = useState<string>(() => {
    const defaultCourier = deliveryAreas.find(a => a.id !== 'area-pickup');
    return defaultCourier ? defaultCourier.id : (deliveryAreas[0]?.id || '');
  });
  const [shippingAddress, setShippingAddress] = useState<string>(() => {
    return customer?.addressBook.find(a => a.isDefault)?.addressLine || '';
  });

  // Calculate default earliest date in WITA (UTC+8)
  const todayWITA = useMemo(() => {
    const now = new Date();
    const wita = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    return wita.toISOString().split('T')[0];
  }, []);

  const [requestedDate, setRequestedDate] = useState<string>(todayWITA);
  const [requestedTime, setRequestedTime] = useState<string>('10:00');
  const [selectedPaymentSettingId, setSelectedPaymentSettingId] = useState<string>(() => paymentMethods[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<'transfer_bank' | 'qris' | 'cod'>('transfer_bank');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Shipping fee calculation
  const shippingFee = useMemo(() => {
    if (deliveryMethod === 'pickup') return 0;
    if (deliveryMethod === 'online_courier') return 0; // Manual estimate
    const area = deliveryAreas.find(a => a.id === selectedAreaId);
    return area ? area.fee : 0;
  }, [deliveryMethod, selectedAreaId, deliveryAreas]);

  // Promo Souvenir & Discount calculation (Automatic reward for spend >= Rp 750.000 or admin configured amount)
  const promoMinSpend = storeSettings?.promoMinSpend || 750000;
  const isPromoActive = storeSettings?.promoRewardActive !== false;
  const isPromoEligible = isPromoActive && subtotal >= promoMinSpend;
  const promoRewardType = storeSettings?.promoRewardType || 'souvenir';

  const souvenirName = isPromoEligible && (promoRewardType === 'souvenir' || promoRewardType === 'both')
    ? (storeSettings?.promoSouvenirName || 'Souvenir Eksklusif Bintang Cake (Toples Mini Cookies Cantik)')
    : undefined;

  const discountAmount = isPromoEligible && (promoRewardType === 'discount' || promoRewardType === 'both')
    ? (storeSettings?.promoDiscountValue || 0)
    : 0;

  const grandTotal = Math.max(0, subtotal + shippingFee - discountAmount);

  // Pre-order validation calculation (PRD §10, §29.6)
  const preOrderValidation = useMemo(() => {
    const now = new Date();
    const currentWITA = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    currentWITA.setUTCHours(0, 0, 0, 0);

    const targetDate = new Date(requestedDate + 'T00:00:00.000Z');
    const diffDays = Math.round((targetDate.getTime() - currentWITA.getTime()) / (1000 * 60 * 60 * 24));

    for (const item of detailedItems) {
      if (item.product.fulfillmentType === 'pre_order') {
        const requiredLead = item.product.preOrderLeadTime || 1;
        if (diffDays < requiredLead) {
          return {
            valid: false,
            error: `Produk "${item.product.name}" membutuhkan waktu pembuatan minimal ${requiredLead} hari (Pre-Order H-${requiredLead}). Tanggal terpilih terlalu dekat.`,
          };
        }
      }
    }
    return { valid: true };
  }, [requestedDate, detailedItems]);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (detailedItems.length === 0) {
      setErrorMessage('Keranjang Anda kosong.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage('Nama lengkap pemesan wajib diisi.');
      return;
    }

    const cleanWhatsapp = normalizeWhatsapp(customerWhatsapp);
    if (!cleanWhatsapp || cleanWhatsapp.length < 10) {
      setErrorMessage('Nomor WhatsApp tidak valid (contoh: 082158739760).');
      return;
    }

    if (deliveryMethod !== 'pickup' && !shippingAddress.trim()) {
      setErrorMessage('Alamat pengiriman lengkap wajib diisi untuk layanan kurir.');
      return;
    }

    if (!preOrderValidation.valid) {
      setErrorMessage(preOrderValidation.error || 'Tanggal pemesanan tidak memenuhi ketentuan pre-order.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderNumber = repos.orderRepo.getNextOrderNumber();
      const now = new Date().toISOString();

      // Snapshot items
      const orderItems: OrderItem[] = detailedItems.map(item => ({
        id: 'ord-item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        productId: item.product.id,
        productName: item.product.name,
        variantId: item.variant.id,
        variantName: item.variant.name,
        packagingType: item.variant.packagingType,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.itemSubtotal,
        itemStatus: 'menunggu_konfirmasi_admin',
        stockDeducted: false,
        itemNotes: item.notes,
      }));

      const selectedArea = deliveryAreas.find(a => a.id === selectedAreaId);
      const selectedSetting = paymentMethods.find(p => p.id === selectedPaymentSettingId) || paymentMethods[0];

      const newOrder: Order = {
        id: 'ord-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        orderNumber,
        customerId: customer?.id || undefined,
        customerName: customerName.trim(),
        customerWhatsapp: cleanWhatsapp,
        customerEmail: customerEmail.trim() || undefined,
        items: orderItems,
        subtotal,
        shippingFee,
        shippingFeeConfirmed: deliveryMethod !== 'online_courier',
        totalAmount: grandTotal,
        souvenirReward: souvenirName,
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
        deliveryMethod,
        deliveryAreaId: deliveryMethod === 'store_courier' ? selectedAreaId : undefined,
        deliveryAreaName: deliveryMethod === 'store_courier' ? selectedArea?.areaName : undefined,
        shippingAddress: deliveryMethod !== 'pickup' ? shippingAddress.trim() : undefined,
        onlineCourierName: deliveryMethod === 'online_courier' ? 'GoSend/GrabExpress (Estimasi)' : undefined,
        requestedDate,
        requestedTime,
        notes: orderNotes.trim() || undefined,
        orderStatus: 'menunggu_konfirmasi_admin',
        paymentStatus: 'unpaid',
        paymentMethod: (selectedSetting?.method as any) || paymentMethod,
        paymentChannelName: selectedSetting?.bankName || selectedSetting?.accountName,
        statusHistory: [
          {
            status: 'menunggu_konfirmasi_admin',
            timestamp: now,
            actor: customer ? 'customer' : 'guest',
            actorName: customerName.trim(),
            notes: 'Pesanan baru dibuat oleh pelanggan.',
          },
        ],
        changeHistory: [],
        createdAt: now,
        updatedAt: now,
      };

      // Create order
      repos.orderRepo.create(newOrder);

      // Clear cart
      clearCart();
      showToast(`Pesanan ${orderNumber} berhasil dibuat!`, 'success');
      navigate(`/pesanan-berhasil/${orderNumber}`);
    } catch (err: unknown) {
      console.error('Error creating order:', err);
      setErrorMessage('Terjadi kesalahan saat memproses pesanan. Silakan coba kembali.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '24px', maxWidth: '860px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/keranjang" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--brown-700)', fontWeight: 600, marginBottom: '10px' }}>
          <ArrowLeft size={16} />
          <span>Kembali ke Keranjang</span>
        </Link>
        <h1 style={{ fontSize: '28px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)' }}>
          Checkout & Pemesanan
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Lengkapi data pemesanan dan jadwal penerimaan kue Anda
        </p>
      </div>

      {errorMessage && (
        <div style={{ backgroundColor: 'var(--danger-100)', color: 'var(--danger-600)', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Customer Information Box */}
        <div style={{ backgroundColor: 'var(--ivory-50)', padding: '24px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--cream-300)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '18px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', marginBottom: '16px' }}>
            1. Data Pemesan
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brown-900)', display: 'block', marginBottom: '6px' }}>
                Nama Lengkap *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Contoh: Ibu Rina S."
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', backgroundColor: '#fff', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brown-900)', display: 'block', marginBottom: '6px' }}>
                Nomor WhatsApp Aktif *
              </label>
              <input
                type="tel"
                required
                value={customerWhatsapp}
                onChange={e => setCustomerWhatsapp(e.target.value)}
                placeholder="Contoh: 082158739760"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', backgroundColor: '#fff', fontSize: '14px' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Digunakan untuk konfirmasi pesanan & pelacakan status
              </span>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brown-900)', display: 'block', marginBottom: '6px' }}>
                Alamat Email (opsional)
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                placeholder="Contoh: rina@gmail.com"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', backgroundColor: '#fff', fontSize: '14px' }}
              />
            </div>
          </div>
        </div>

        {/* Delivery Method Box */}
        <div style={{ backgroundColor: 'var(--ivory-50)', padding: '24px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--cream-300)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '18px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', marginBottom: '16px' }}>
            2. Metode Pengiriman / Pengambilan
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => setDeliveryMethod('pickup')}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                border: deliveryMethod === 'pickup' ? '2px solid var(--gold-600)' : '1px solid var(--cream-300)',
                backgroundColor: deliveryMethod === 'pickup' ? 'var(--cream-100)' : '#fff',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brown-900)', fontWeight: 700 }}>
                <Store size={18} color="var(--gold-600)" />
                <span>Ambil di Toko (Pickup)</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--success-600)', fontWeight: 700 }}>Gratis (Rp 0)</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ambil di dapur Jl. K.H. Wahid Hasyim II</span>
            </button>

            <button
              type="button"
              onClick={() => setDeliveryMethod('store_courier')}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                border: deliveryMethod === 'store_courier' ? '2px solid var(--gold-600)' : '1px solid var(--cream-300)',
                backgroundColor: deliveryMethod === 'store_courier' ? 'var(--cream-100)' : '#fff',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brown-900)', fontWeight: 700 }}>
                <Truck size={18} color="var(--gold-600)" />
                <span>Kurir Toko Resmi</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--brown-800)', fontWeight: 700 }}>Tarif Sesuai Wilayah</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Diantar langsung staf Bintang Cake</span>
            </button>

            <button
              type="button"
              onClick={() => setDeliveryMethod('online_courier')}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                border: deliveryMethod === 'online_courier' ? '2px solid var(--gold-600)' : '1px solid var(--cream-300)',
                backgroundColor: deliveryMethod === 'online_courier' ? 'var(--cream-100)' : '#fff',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brown-900)', fontWeight: 700 }}>
                <Clock size={18} color="var(--gold-600)" />
                <span>GoSend / GrabExpress</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--info-600)', fontWeight: 700 }}>Estimasi Manual</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ongkir dikonfirmasi admin via WA</span>
            </button>
          </div>

          {/* Area selection for store courier */}
          {deliveryMethod === 'store_courier' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brown-900)', display: 'block', marginBottom: '6px' }}>
                Pilih Wilayah Pengiriman:
              </label>
              <select
                value={selectedAreaId}
                onChange={e => setSelectedAreaId(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', backgroundColor: '#fff', fontSize: '14px' }}
              >
                {deliveryAreas.filter(a => a.fee > 0).map(area => (
                  <option key={area.id} value={area.id}>
                    {area.areaName} ({formatRupiah(area.fee)}) — {area.estimatedTime}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Address input if not pickup */}
          {deliveryMethod !== 'pickup' && (
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brown-900)', display: 'block', marginBottom: '6px' }}>
                Alamat Pengiriman Lengkap *
              </label>
              <textarea
                required
                value={shippingAddress}
                onChange={e => setShippingAddress(e.target.value)}
                placeholder="Tuliskan nama jalan, nomor rumah, RT/RW, patokan/gang terdekat..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', backgroundColor: '#fff', fontSize: '14px', minHeight: '80px' }}
              />
            </div>
          )}
        </div>

        {/* Delivery Schedule & Pre-order Date */}
        <div style={{ backgroundColor: 'var(--ivory-50)', padding: '24px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--cream-300)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '18px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', marginBottom: '16px' }}>
            3. Jadwal Penerimaan Kue
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brown-900)', display: 'block', marginBottom: '6px' }}>
                Tanggal (WITA) *
              </label>
              <input
                type="date"
                required
                min={todayWITA}
                value={requestedDate}
                onChange={e => setRequestedDate(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', backgroundColor: '#fff', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brown-900)', display: 'block', marginBottom: '6px' }}>
                Perkiraan Jam (WITA) *
              </label>
              <input
                type="time"
                required
                value={requestedTime}
                onChange={e => setRequestedTime(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', backgroundColor: '#fff', fontSize: '14px' }}
              />
            </div>
          </div>

          {!preOrderValidation.valid && (
            <div style={{ backgroundColor: 'var(--warning-100)', color: 'var(--warning-600)', border: '1px solid var(--warning-600)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>{preOrderValidation.error}</span>
            </div>
          )}
        </div>

        {/* Payment Method Selection */}
        <div style={{ backgroundColor: 'var(--ivory-50)', padding: '24px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--cream-300)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '18px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', marginBottom: '16px' }}>
            4. Metode Pembayaran Resmi Toko
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            {paymentMethods.map(p => {
              const isSelected = selectedPaymentSettingId ? selectedPaymentSettingId === p.id : paymentMethod === p.method;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => {
                    setSelectedPaymentSettingId(p.id);
                    setPaymentMethod(p.method as 'transfer_bank' | 'qris' | 'cod');
                  }}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-lg)',
                    border: isSelected ? '2px solid var(--gold-600)' : '1px solid var(--cream-300)',
                    backgroundColor: isSelected ? 'var(--cream-100)' : '#fff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <b style={{ fontSize: '14px', color: 'var(--brown-900)' }}>{p.bankName || p.accountName || p.accountHolder}</b>
                    {isSelected && (
                      <span style={{ backgroundColor: 'var(--gold-500)', color: 'var(--brown-900)', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  {p.type === 'bank_transfer' && p.accountNumber && (
                    <div style={{ fontSize: '12px', color: 'var(--brown-700)', marginBottom: '4px' }}>
                      No. Rek: <code style={{ backgroundColor: 'var(--cream-200)', padding: '1px 4px', borderRadius: '3px', fontWeight: 600 }}>{p.accountNumber}</code>
                    </div>
                  )}
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                    {p.instructions}
                  </p>
                </button>
              );
            })}
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brown-900)', display: 'block', marginBottom: '6px' }}>
              Catatan Keseluruhan Pesanan (opsional):
            </label>
            <input
              type="text"
              placeholder="Contoh: Mohon dikirim sebelum jam 12 siang..."
              value={orderNotes}
              onChange={e => setOrderNotes(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-300)', backgroundColor: '#fff', fontSize: '14px' }}
            />
          </div>
        </div>

        {/* Promo Reward Souvenir / Discount Banner */}
        {isPromoActive && (
          <div>
            {isPromoEligible ? (
              <div
                style={{
                  backgroundColor: '#FFFBEB',
                  border: '2px solid var(--gold-500)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'var(--gold-500)',
                    color: 'var(--brown-900)',
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Gift size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <b style={{ color: 'var(--brown-900)', fontSize: '15px' }}>
                      🎉 Hadiah Spesial Pembelian Rp {formatRupiah(promoMinSpend)}+
                    </b>
                    <span style={{ fontSize: '11px', backgroundColor: 'var(--gold-400)', color: 'var(--brown-900)', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                      OTOMATIS DITERAPKAN
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--brown-800)', lineHeight: 1.5 }}>
                    Selamat! Total belanja Anda telah mencapai Rp {formatRupiah(promoMinSpend)}. Anda berhak mendapatkan:
                  </p>
                  {souvenirName && (
                    <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#FFFFFF', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gold-400)', color: 'var(--brown-900)', fontWeight: 700, fontSize: '13px' }}>
                      <Sparkles size={16} color="var(--gold-600)" />
                      <span>{souvenirName} — <span style={{ color: '#16A34A' }}>GRATIS</span></span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div style={{ marginTop: '6px', fontSize: '13px', color: '#16A34A', fontWeight: 600 }}>
                      + Potongan Diskon Spesial: -{formatRupiah(discountAmount)}
                    </div>
                  )}
                  <div style={{ fontSize: '11px', color: 'var(--brown-600)', marginTop: '6px' }}>
                    *Hadiah souvenir akan otomatis disertakan ke dalam kemasan pesanan Anda saat disiapkan oleh staf.
                  </div>
                </div>
              </div>
            ) : subtotal > 0 ? (
              <div
                style={{
                  backgroundColor: 'var(--cream-100)',
                  border: '1px dashed var(--gold-500)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '13px',
                }}
              >
                <Gift size={20} color="var(--gold-600)" style={{ flexShrink: 0 }} />
                <div style={{ color: 'var(--brown-800)', lineHeight: 1.4 }}>
                  <b>Promo Hadiah Souvenir:</b> Belanja hingga <b>{formatRupiah(promoMinSpend)}</b> untuk mendapatkan <b>{storeSettings?.promoSouvenirName || 'Souvenir Eksklusif Bintang Cake'}</b> GRATIS! Tambah belanja <b>{formatRupiah(promoMinSpend - subtotal)}</b> lagi untuk klaim hadiah.
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Order Summary & Submit Button */}
        <div style={{ backgroundColor: 'var(--cream-200)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--cream-300)' }}>
          <h3 style={{ fontSize: '18px', color: 'var(--brown-900)', fontFamily: 'var(--font-serif)', marginBottom: '16px' }}>
            Rincian Biaya Transaksi
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal Produk ({detailedItems.length} item)</span>
              <span style={{ fontWeight: 600 }}>{formatRupiah(subtotal)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Ongkos Kirim</span>
              <span style={{ fontWeight: 600 }}>
                {deliveryMethod === 'pickup'
                  ? 'Gratis (Ambil di Toko)'
                  : deliveryMethod === 'online_courier'
                  ? 'Estimasi Manual (Konfirmasi Admin)'
                  : formatRupiah(shippingFee)}
              </span>
            </div>

            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A' }}>
                <span style={{ fontWeight: 600 }}>Diskon Promo Belanja (≥ {formatRupiah(promoMinSpend)})</span>
                <span style={{ fontWeight: 700 }}>-{formatRupiah(discountAmount)}</span>
              </div>
            )}

            {souvenirName && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#B45309', backgroundColor: '#FEF3C7', padding: '6px 10px', borderRadius: '6px' }}>
                <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Gift size={14} /> Hadiah Souvenir Belanja
                </span>
                <span style={{ fontWeight: 700, color: '#15803D' }}>GRATIS (1x {souvenirName})</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--cream-300)', fontSize: '18px' }}>
              <b style={{ color: 'var(--brown-900)' }}>Total Pembayaran</b>
              <b style={{ color: 'var(--brown-900)' }}>{formatRupiah(grandTotal)}</b>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !preOrderValidation.valid}
            style={{
              width: '100%',
              backgroundColor: !preOrderValidation.valid ? 'var(--cream-300)' : 'var(--gold-500)',
              color: 'var(--brown-900)',
              padding: '16px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              fontSize: '16px',
              cursor: !preOrderValidation.valid ? 'not-allowed' : 'pointer',
              boxShadow: 'var(--shadow-md)',
              textAlign: 'center',
            }}
          >
            {isSubmitting ? 'Memproses Pesanan...' : 'Buat Pesanan Sekarang'}
          </button>
        </div>
      </form>
    </div>
  );
};
