// Domain Data Types for Bintang Cake & Cookies (SCHEMA.md §3, PRD §28)

export type StockMode = 'per_product' | 'per_variant';
export type FulfillmentType = 'ready_stock' | 'pre_order';
export type PackagingType = 'toples_250g' | 'toples_500g' | 'box_hampers_2' | 'box_hampers_3' | 'custom';

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  active: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  name: string;           // Display name (e.g. "Toples 500g")
  packagingType: string;
  price: number;          // Integer Rupiah (Harga Mulai / Harga Terendah)
  maxPrice?: number;      // Optional: Harga Tertinggi jika produk memiliki rentang harga
  stockQuantity: number;  // >= 0
  active: boolean;
  sortOrder: number;
  isDefault?: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  shortDescription: string;
  description: string;
  images: ProductImage[];
  featured: boolean;
  newArrival: boolean;
  active: boolean;
  fulfillmentType: FulfillmentType;
  preOrderLeadTime: number; // in days
  stockMode: StockMode;
  stockQuantity: number;    // if per_product
  lowStockThreshold: number;
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomerAddress {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  fullAddress?: string;
  district?: string;
  deliveryAreaId?: string;
  notes?: string;
  isDefault: boolean;
}

export type Address = CustomerAddress;

export interface Customer {
  id: string;
  name: string;
  whatsapp: string;
  email?: string;
  addressBook: CustomerAddress[];
  passwordHash: string;
  passwordSalt: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'menunggu_konfirmasi_admin'
  | 'diproses'
  | 'siap_diambil'
  | 'dikirim'
  | 'selesai'
  | 'dibatalkan';

export type PaymentStatus =
  | 'unpaid'
  | 'waiting_verification'
  | 'verified'
  | 'refunded'
  | 'rejected';

export type DeliveryMethod =
  | 'pickup'
  | 'store_courier'
  | 'online_courier'
  | 'courier';

export interface OrderItem {
  id: string;
  orderId?: string;
  productId: string;
  productName: string;
  productNameSnapshot?: string;
  variantId: string;
  variantName: string;
  variantNameSnapshot?: string;
  packagingType?: string;
  unitPrice: number;      // Snapshot price (integer)
  unitPriceSnapshot?: number;
  quantity: number;
  subtotal: number;
  lineTotal?: number;
  itemStatus: OrderStatus | 'menunggu' | 'diproses' | 'siap' | 'selesai' | 'dibatalkan';
  stockDeducted: boolean;
  itemNotes?: string;
  specialNotes?: string;
  customTextOnCake?: string;
}

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: string;      // ISO 8601 UTC
  actor: 'customer' | 'admin' | 'system' | 'guest';
  actorName: string;
  notes?: string;
}

export interface OrderChangeHistory {
  changedAt: string;
  actor: 'customer' | 'admin';
  actorName: string;
  description: string;
}

export interface Order {
  id: string;
  orderNumber: string;    // BCC-YYMMDD-NNNN
  customerId?: string | null;
  customerName: string;
  customerWhatsapp?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: OrderItem[];
  subtotalAmount?: number;
  subtotal?: number;
  packagingFee?: number;
  deliveryFee?: number;
  shippingFee?: number;
  shippingFeeConfirmed?: boolean;
  totalAmount: number;
  total?: number;
  deliveryMethod: DeliveryMethod;
  fulfillmentMethod?: DeliveryMethod;
  deliveryAreaId?: string;
  deliveryAreaName?: string;
  deliveryAddress?: any;
  shippingAddress?: string;
  onlineCourierName?: string;
  fulfillmentDate?: string;
  requestedDate?: string;
  fulfillmentTime?: string;
  requestedTime?: string;
  orderNotes?: string;
  customerNote?: string;
  notes?: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: 'bank_transfer' | 'transfer_bank' | 'qris' | 'ewallet' | 'cod' | string;
  paymentChannelName?: string;
  souvenirReward?: string;
  discountAmount?: number;
  paymentProof?: string;
  paymentReceiptUrl?: string;
  paymentReceiptUploadedAt?: string;
  paymentVerifiedAt?: string;
  stockDeductedAt?: string;
  statusHistory: OrderStatusHistory[];
  changeHistory: OrderChangeHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  orderId: string;
  senderType: 'customer' | 'admin' | 'guest' | 'system';
  senderName: string;
  message: string;
  timestamp: string;      // ISO 8601 UTC
  readAt?: string | null;
}

export interface Review {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  productId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  isHidden: boolean;
  createdAt: string;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  variantId?: string;
  previousStock: number;
  quantityDelta: number;  // Negative for deduction, positive for restock
  newStock: number;
  reason: string;
  refType: 'order' | 'manual' | 'cancel_restock' | 'initial_seed';
  refId?: string;
  adjustedAt: string;
  adjustedBy: string;
}

export interface PaymentSetting {
  id: string;
  method?: string;
  type?: string;
  accountName?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  qrisImageUrl?: string;
  instructions?: string;
  isDemo: boolean;
  active: boolean;
}

export interface DeliveryArea {
  id: string;
  name?: string;
  areaName?: string;
  fee: number;            // Integer Rupiah (0 for pickup)
  estimatedTime?: string;
  estimatedHours?: string;
  active: boolean;
}

export interface StoreSettings {
  storeName: string;
  tagline?: string;
  logoUrl?: string;
  address: string;
  phone?: string;
  whatsapp: string;
  email?: string;
  operationalHours?: string;
  operatingHours?: string;
  orderCutoffTime?: string;
  defaultPreOrderLeadDays?: number;
  isDemoMode?: boolean;
  noticeBanner?: string;
  promoRewardActive?: boolean;
  promoRewardType?: 'souvenir' | 'discount' | 'both';
  promoMinSpend?: number;
  promoSouvenirName?: string;
  promoSouvenirDescription?: string;
  promoDiscountType?: 'fixed' | 'percentage';
  promoDiscountValue?: number;
}

export interface BannerItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  imageUrl: string;
  linkUrl?: string;
  buttonText?: string;
  active: boolean;
  sortOrder?: number;
}

export interface Content {
  heroBadge?: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl?: string;
  heroCardLabel?: string;
  heroCardText?: string;
  heroTitleFontFamily?: 'playfair' | 'script' | 'cormorant' | 'sans' | 'georgia' | string;
  heroTitleItalic?: boolean;
  heroTitleWeight?: 'normal' | 'semibold' | 'bold' | string;
  heroTitleColor?: string;
  heroSliderEnabled?: boolean;
  heroSliderInterval?: number; // detik (default: 5)
  heroSliderAutoPlay?: boolean;
  announcements?: string[];
  announcementText?: string;
  announcementActive?: boolean;
  banners?: BannerItem[];
  aboutUs?: string;
  aboutUsText?: string;
  howToOrder?: string;
  howToOrderText?: string;
  hampersBannerImageUrl?: string;
  hampersBadge?: string;
  hampersTitle?: string;
  hampersSubtitle?: string;
  hampersButtonText?: string;
  tickerActive?: boolean;
  tickerText?: string;
  tickerTheme?: 'gold' | 'natal' | 'lebaran' | 'imlek' | 'brown' | string;
  tickerBadge?: string;
  tickerSpeed?: 'very_slow' | 'slow' | 'medium' | 'fast' | 'very_fast' | string;
  tickerSpeedSeconds?: number;
  tickerFontSize?: 'normal' | 'large' | 'xlarge' | 'jumbo' | string;
  tickerLink?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category?: string;
  description?: string;
  imageUrl: string;
  active?: boolean;
  sortOrder?: number;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  packagingType?: string;
  customTextOnCake?: string;
  notes?: string;
}

export interface Cart {
  items: CartItem[];
  updatedAt: string;
}

export interface Session {
  role: 'admin' | 'customer';
  userId: string;
  userName: string;
  userWhatsapp?: string;
  expiresAt: string;      // ISO 8601 UTC
}

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  passwordSalt: string;
  name: string;
  active: boolean;
  createdAt: string;
}
