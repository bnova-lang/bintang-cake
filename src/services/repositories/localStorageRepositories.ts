// LocalStorage Repository implementations (SCHEMA.md §6, §13, PRD §29)
import { LocalStorageService, STORAGE_PREFIX } from '@/services/storage/localStorage';
import {
  Category,
  Product,
  Order,
  Customer,
  ChatMessage,
  Review,
  StockAdjustment,
  PaymentSetting,
  DeliveryArea,
  StoreSettings,
  Content,
  GalleryItem,
  Cart,
  Session,
  AdminUser,
} from '@/types';
import {
  ICategoryRepository,
  IProductRepository,
  IOrderRepository,
  ICustomerRepository,
  IChatRepository,
  IReviewRepository,
  IStockAdjustmentRepository,
  ISettingsRepository,
  ICartRepository,
  ISessionRepository,
} from './interfaces';
import {
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_STORE_SETTINGS,
  SEED_CONTENT,
  SEED_DELIVERY_AREAS,
  SEED_PAYMENT_SETTINGS,
  SEED_GALLERY,
  SEED_ADMIN_USERS,
  SEED_CUSTOMERS,
} from '@/data/seed/initialData';
import { generateOrderNumber } from '@/utils/format';

const sanitizeCategory = (c: Category): Category => {
  if (c.id === 'cat-lapis' && (!c.image || c.image.includes('photo-1535141192574'))) {
    return {
      ...c,
      image: 'https://images.unsplash.com/photo-1605138693981-6c8a5ea87796?w=600&auto=format&fit=crop&q=80',
    };
  }
  return c;
};

export class LocalStorageCategoryRepository implements ICategoryRepository {
  getAll(): Category[] {
    const items = LocalStorageService.getItem<Category[]>('categories', undefined, []);
    return (items || [])
      .filter(c => c.active)
      .map(sanitizeCategory)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  getById(id: string): Category | null {
    const items = LocalStorageService.getItem<Category[]>('categories', undefined, []);
    const found = (items || []).find(c => c.id === id);
    return found ? sanitizeCategory(found) : null;
  }

  getBySlug(slug: string): Category | null {
    const items = LocalStorageService.getItem<Category[]>('categories', undefined, []);
    const found = (items || []).find(c => c.slug === slug);
    return found ? sanitizeCategory(found) : null;
  }

  save(category: Category): void {
    const items = LocalStorageService.getItem<Category[]>('categories', undefined, []) || [];
    const index = items.findIndex(c => c.id === category.id);
    if (index >= 0) {
      items[index] = category;
    } else {
      items.push(category);
    }
    LocalStorageService.setItem('categories', items);
  }

  delete(id: string): void {
    const items = LocalStorageService.getItem<Category[]>('categories', undefined, []) || [];
    const updated = items.map(c => c.id === id ? { ...c, active: false } : c);
    LocalStorageService.setItem('categories', updated);
  }
}

export class LocalStorageProductRepository implements IProductRepository {
  getAll(): Product[] {
    const items = LocalStorageService.getItem<Product[]>('products', undefined, []);
    return items || [];
  }

  getById(id: string): Product | null {
    const items = this.getAll();
    return items.find(p => p.id === id) || null;
  }

  getBySlug(slug: string): Product | null {
    const items = this.getAll();
    return items.find(p => p.slug === slug) || null;
  }

  getByCategory(categoryId: string): Product[] {
    const items = this.getAll();
    return items.filter(p => p.active && p.categoryId === categoryId);
  }

  save(product: Product): void {
    const items = this.getAll();
    const index = items.findIndex(p => p.id === product.id);
    if (index >= 0) {
      items[index] = { ...product, updatedAt: new Date().toISOString() };
    } else {
      items.push({ ...product, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    LocalStorageService.setItem('products', items);
  }

  delete(id: string): void {
    const items = this.getAll();
    const updated = items.map(p => p.id === id ? { ...p, active: false, updatedAt: new Date().toISOString() } : p);
    LocalStorageService.setItem('products', updated);
  }

  updateStock(
    productId: string,
    variantId: string | undefined,
    delta: number,
    reason: string,
    refType: StockAdjustment['refType'],
    refId?: string,
    actor: string = 'system'
  ): boolean {
    const items = this.getAll();
    const product = items.find(p => p.id === productId);
    if (!product) return false;

    let previousStock = 0;
    let newStock = 0;

    if (product.stockMode === 'per_product') {
      previousStock = product.stockQuantity;
      newStock = previousStock + delta;
      if (newStock < 0) return false;
      product.stockQuantity = newStock;
    } else {
      if (!variantId) return false;
      const variant = product.variants.find(v => v.id === variantId);
      if (!variant) return false;
      previousStock = variant.stockQuantity;
      newStock = previousStock + delta;
      if (newStock < 0) return false;
      variant.stockQuantity = newStock;
    }

    product.updatedAt = new Date().toISOString();
    LocalStorageService.setItem('products', items);

    // Record adjustment
    const adjRepo = new LocalStorageStockAdjustmentRepository();
    adjRepo.add({
      productId,
      variantId,
      previousStock,
      quantityDelta: delta,
      newStock,
      reason,
      refType,
      refId,
      adjustedBy: actor,
    });

    return true;
  }
}

export class LocalStorageStockAdjustmentRepository implements IStockAdjustmentRepository {
  getAll(): StockAdjustment[] {
    return LocalStorageService.getItem<StockAdjustment[]>('stockAdjustments', undefined, []) || [];
  }

  getByProduct(productId: string): StockAdjustment[] {
    return this.getAll().filter(a => a.productId === productId);
  }

  add(adj: Omit<StockAdjustment, 'id' | 'adjustedAt'>): StockAdjustment {
    const items = this.getAll();
    const newAdj: StockAdjustment = {
      ...adj,
      id: 'adj-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      adjustedAt: new Date().toISOString(),
    };
    items.unshift(newAdj);
    LocalStorageService.setItem('stockAdjustments', items);
    return newAdj;
  }
}

export class LocalStorageOrderRepository implements IOrderRepository {
  getAll(): Order[] {
    return LocalStorageService.getItem<Order[]>('orders', undefined, []) || [];
  }

  getById(id: string): Order | null {
    return this.getAll().find(o => o.id === id) || null;
  }

  getByOrderNumber(orderNumber: string): Order | null {
    return this.getAll().find(o => o.orderNumber.trim().toUpperCase() === orderNumber.trim().toUpperCase()) || null;
  }

  create(order: Order): void {
    const items = this.getAll();
    items.unshift(order);
    LocalStorageService.setItem('orders', items);
  }

  update(order: Order): void {
    const items = this.getAll();
    const index = items.findIndex(o => o.id === order.id);
    if (index >= 0) {
      items[index] = { ...order, updatedAt: new Date().toISOString() };
      LocalStorageService.setItem('orders', items);
    }
  }

  /**
   * Confirm order and deduct stock atomically and idempotently (SCHEMA.md §6, PRD §29.2)
   */
  confirmOrderAndDeductStock(
    orderId: string,
    actorName: string,
    productRepo: IProductRepository
  ): { success: boolean; error?: string } {
    const orders = this.getAll();
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      return { success: false, error: 'Pesanan tidak ditemukan.' };
    }

    if (order.orderStatus !== 'menunggu_konfirmasi_admin') {
      return { success: false, error: `Pesanan berstatus "${order.orderStatus}", tidak dapat dikonfirmasi lagi.` };
    }

    // Check if stock already deducted (Idempotency)
    const alreadyDeducted = order.items.some(i => i.stockDeducted);
    if (alreadyDeducted) {
      return { success: false, error: 'Stok untuk pesanan ini sudah pernah dikurangi sebelumnya.' };
    }

    // Step 1: Pre-validate ALL items have sufficient stock
    for (const item of order.items) {
      const product = productRepo.getById(item.productId);
      if (!product) {
        return { success: false, error: `Produk "${item.productName}" sudah tidak tersedia di katalog.` };
      }
      let currentStock = 0;
      if (product.stockMode === 'per_product') {
        currentStock = product.stockQuantity;
      } else {
        const variant = product.variants.find(v => v.id === item.variantId);
        if (!variant) {
          return { success: false, error: `Varian "${item.variantName}" pada produk "${item.productName}" tidak ditemukan.` };
        }
        currentStock = variant.stockQuantity;
      }

      if (currentStock < item.quantity) {
        return {
          success: false,
          error: `Stok tidak mencukupi untuk "${item.productName} (${item.variantName})". Tersedia: ${currentStock}, Dibutuhkan: ${item.quantity}. Tidak ada stok yang dikurangi.`,
        };
      }
    }

    // Step 2: Atomic Deduction
    const now = new Date().toISOString();
    for (const item of order.items) {
      const ok = productRepo.updateStock(
        item.productId,
        item.variantId,
        -item.quantity,
        `Pengurangan pesanan ${order.orderNumber}`,
        'order',
        order.orderNumber,
        actorName
      );
      if (ok) {
        item.stockDeducted = true;
        item.itemStatus = 'diproses';
      }
    }

    order.orderStatus = 'diproses';
    order.stockDeductedAt = now;
    order.updatedAt = now;
    order.statusHistory.push({
      status: 'diproses',
      timestamp: now,
      actor: 'admin',
      actorName,
      notes: 'Pesanan dikonfirmasi dan stok berhasil dipotong.',
    });

    this.update(order);
    return { success: true };
  }

  cancelOrder(orderId: string, actorName: string, reason: string): boolean {
    const order = this.getById(orderId);
    if (!order) return false;
    if (order.orderStatus === 'selesai' || order.orderStatus === 'dibatalkan') return false;

    const now = new Date().toISOString();
    order.orderStatus = 'dibatalkan';
    order.updatedAt = now;
    order.statusHistory.push({
      status: 'dibatalkan',
      timestamp: now,
      actor: 'admin',
      actorName,
      notes: reason || 'Pesanan dibatalkan oleh admin.',
    });

    this.update(order);
    return true;
  }

  restockOrder(orderId: string, actorName: string, productRepo: IProductRepository): boolean {
    const order = this.getById(orderId);
    if (!order || order.orderStatus !== 'dibatalkan') return false;

    const itemsToRestock = order.items.filter(i => i.stockDeducted);
    if (itemsToRestock.length === 0) return false;

    for (const item of itemsToRestock) {
      productRepo.updateStock(
        item.productId,
        item.variantId,
        item.quantity,
        `Restock pembatalan pesanan ${order.orderNumber}`,
        'cancel_restock',
        order.orderNumber,
        actorName
      );
      item.stockDeducted = false;
    }

    const now = new Date().toISOString();
    order.changeHistory.push({
      changedAt: now,
      actor: 'admin',
      actorName,
      description: `Stok barang dikembalikan ke gudang (${itemsToRestock.length} item).`,
    });
    order.updatedAt = now;

    this.update(order);
    return true;
  }

  delete(id: string): void {
    const items = this.getAll().filter(o => o.id !== id);
    LocalStorageService.setItem('orders', items);
  }

  getNextOrderNumber(): string {
    const now = new Date();
    const witaDate = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const yy = String(witaDate.getUTCFullYear()).slice(-2);
    const mm = String(witaDate.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(witaDate.getUTCDate()).padStart(2, '0');
    const dateKey = `${yy}${mm}${dd}`;

    const counters = LocalStorageService.getItem<Record<string, number>>('counters', undefined, {}) || {};
    const currentSeq = (counters[dateKey] || 0) + 1;
    counters[dateKey] = currentSeq;
    LocalStorageService.setItem('counters', counters);

    return generateOrderNumber(currentSeq, now);
  }
}

export class LocalStorageCustomerRepository implements ICustomerRepository {
  getAll(): Customer[] {
    return LocalStorageService.getItem<Customer[]>('customers', undefined, []) || [];
  }

  getById(id: string): Customer | null {
    return this.getAll().find(c => c.id === id) || null;
  }

  getByWhatsapp(whatsapp: string): Customer | null {
    const clean = whatsapp.replace(/[^0-9]/g, '');
    return this.getAll().find(c => c.whatsapp.replace(/[^0-9]/g, '') === clean) || null;
  }

  save(customer: Customer): void {
    const items = this.getAll();
    const index = items.findIndex(c => c.id === customer.id);
    if (index >= 0) {
      items[index] = { ...customer, updatedAt: new Date().toISOString() };
    } else {
      items.push({ ...customer, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    LocalStorageService.setItem('customers', items);
  }
}

export class LocalStorageChatRepository implements IChatRepository {
  getByOrderId(orderId: string): ChatMessage[] {
    const all = LocalStorageService.getItem<ChatMessage[]>('chatMessages', undefined, []) || [];
    return all.filter(m => m.orderId === orderId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  addMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const all = LocalStorageService.getItem<ChatMessage[]>('chatMessages', undefined, []) || [];
    const newMsg: ChatMessage = {
      ...msg,
      id: 'chat-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
    };
    all.push(newMsg);
    LocalStorageService.setItem('chatMessages', all);
    return newMsg;
  }

  markAsRead(orderId: string, readerType: 'admin' | 'customer' | 'guest'): void {
    const all = LocalStorageService.getItem<ChatMessage[]>('chatMessages', undefined, []) || [];
    let changed = false;
    const now = new Date().toISOString();

    for (const msg of all) {
      if (msg.orderId === orderId && !msg.readAt) {
        // If reader is admin, mark customer messages as read
        if (readerType === 'admin' && (msg.senderType === 'customer' || msg.senderType === 'guest')) {
          msg.readAt = now;
          changed = true;
        } else if ((readerType === 'customer' || readerType === 'guest') && msg.senderType === 'admin') {
          msg.readAt = now;
          changed = true;
        }
      }
    }

    if (changed) {
      LocalStorageService.setItem('chatMessages', all);
    }
  }
}

export class LocalStorageReviewRepository implements IReviewRepository {
  getAll(): Review[] {
    return LocalStorageService.getItem<Review[]>('reviews', undefined, []) || [];
  }

  getByProductId(productId: string, includeHidden = false): Review[] {
    return this.getAll()
      .filter(r => r.productId === productId && (includeHidden || !r.isHidden))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  add(review: Omit<Review, 'id' | 'createdAt'>): Review {
    const all = this.getAll();
    const newRev: Review = {
      ...review,
      id: 'rev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
    };
    all.unshift(newRev);
    LocalStorageService.setItem('reviews', all);
    return newRev;
  }

  toggleHidden(reviewId: string): boolean {
    const all = this.getAll();
    const rev = all.find(r => r.id === reviewId);
    if (!rev) return false;
    rev.isHidden = !rev.isHidden;
    LocalStorageService.setItem('reviews', all);
    return true;
  }
}

export class LocalStorageSettingsRepository implements ISettingsRepository {
  getPaymentSettings(): PaymentSetting[] {
    return LocalStorageService.getItem<PaymentSetting[]>('paymentSettings', undefined, []) || [];
  }

  savePaymentSetting(setting: PaymentSetting): void {
    const items = this.getPaymentSettings();
    const index = items.findIndex(s => s.id === setting.id);
    if (index >= 0) {
      items[index] = setting;
    } else {
      items.push(setting);
    }
    LocalStorageService.setItem('paymentSettings', items);
  }

  getDeliveryAreas(): DeliveryArea[] {
    return LocalStorageService.getItem<DeliveryArea[]>('deliveryAreas', undefined, []) || [];
  }

  saveDeliveryArea(area: DeliveryArea): void {
    const items = this.getDeliveryAreas();
    const index = items.findIndex(a => a.id === area.id);
    if (index >= 0) {
      items[index] = area;
    } else {
      items.push(area);
    }
    LocalStorageService.setItem('deliveryAreas', items);
  }

  deleteDeliveryArea(id: string): void {
    const items = this.getDeliveryAreas();
    const updated = items.map(a => a.id === id ? { ...a, active: false } : a);
    LocalStorageService.setItem('deliveryAreas', updated);
  }

  getStoreSettings(): StoreSettings {
    return LocalStorageService.getItem<StoreSettings>('storeSettings', undefined, SEED_STORE_SETTINGS) || SEED_STORE_SETTINGS;
  }

  saveStoreSettings(settings: StoreSettings): void {
    LocalStorageService.setItem('storeSettings', settings);
  }

  getContent(): Content {
    return LocalStorageService.getItem<Content>('content', undefined, SEED_CONTENT) || SEED_CONTENT;
  }

  saveContent(content: Content): void {
    LocalStorageService.setItem('content', content);
  }

  getGallery(): GalleryItem[] {
    return LocalStorageService.getItem<GalleryItem[]>('gallery', undefined, []) || [];
  }

  saveGalleryItem(item: GalleryItem): void {
    const items = this.getGallery();
    const index = items.findIndex(g => g.id === item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.unshift(item);
    }
    LocalStorageService.setItem('gallery', items);
  }

  deleteGalleryItem(id: string): void {
    const items = this.getGallery();
    const updated = items.map(g => g.id === id ? { ...g, active: false } : g);
    LocalStorageService.setItem('gallery', updated);
  }

  getAdminUsers(): AdminUser[] {
    return LocalStorageService.getItem<AdminUser[]>('adminUsers', undefined, []) || [];
  }

  saveAdminUser(admin: AdminUser): void {
    const items = this.getAdminUsers();
    const index = items.findIndex(a => a.id === admin.id);
    if (index >= 0) {
      items[index] = admin;
    } else {
      items.push(admin);
    }
    LocalStorageService.setItem('adminUsers', items);
  }
}

export class LocalStorageCartRepository implements ICartRepository {
  getCart(): Cart {
    return LocalStorageService.getItem<Cart>('carts', undefined, { items: [], updatedAt: new Date().toISOString() }) || { items: [], updatedAt: new Date().toISOString() };
  }

  saveCart(cart: Cart): void {
    LocalStorageService.setItem('carts', { ...cart, updatedAt: new Date().toISOString() });
  }

  clearCart(): void {
    LocalStorageService.setItem('carts', { items: [], updatedAt: new Date().toISOString() });
  }
}

export class LocalStorageSessionRepository implements ISessionRepository {
  getSession(): Session | null {
    const session = LocalStorageService.getItem<Session>('session', undefined, null);
    if (!session) return null;
    // Check expiration
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      this.clearSession();
      return null;
    }
    return session;
  }

  setSession(session: Session): void {
    LocalStorageService.setItem('session', session);
  }

  clearSession(): void {
    LocalStorageService.removeItem('session');
  }
}

/**
 * Initializes database with demo seeds if not already initialized
 */
export function initializeSeedData(forceReset = false): void {
  const meta = LocalStorageService.getItem<{ schemaVersion: number; seedVersion?: number }>('meta');

  if (meta && meta.seedVersion === 3 && !forceReset) {
    return; // Already initialized with seed v3
  }

  if (!meta || forceReset) {
    LocalStorageService.setItem('meta', {
      schemaVersion: 1,
      seedVersion: 3,
      seededAt: new Date().toISOString(),
    });

    LocalStorageService.setItem('categories', SEED_CATEGORIES);
    LocalStorageService.setItem('products', SEED_PRODUCTS);
    LocalStorageService.setItem('storeSettings', SEED_STORE_SETTINGS);
    LocalStorageService.setItem('content', SEED_CONTENT);
    LocalStorageService.setItem('deliveryAreas', SEED_DELIVERY_AREAS);
    LocalStorageService.setItem('paymentSettings', SEED_PAYMENT_SETTINGS);
    LocalStorageService.setItem('gallery', SEED_GALLERY);
    LocalStorageService.setItem('adminUsers', SEED_ADMIN_USERS);
    LocalStorageService.setItem('customers', SEED_CUSTOMERS);
    LocalStorageService.setItem('orders', []);
    LocalStorageService.setItem('chatMessages', []);
    LocalStorageService.setItem('reviews', []);
    LocalStorageService.setItem('stockAdjustments', []);
    LocalStorageService.setItem('counters', {});
    return;
  }

  // Update existing storage to seed v3 (correct PBKDF2 hashes + fixed working Lapis Legit images)
  const existingCustomers = LocalStorageService.getItem<Customer[]>('customers') || [];
  const demoCustIdx = existingCustomers.findIndex(c => c.id === 'cust-demo-1' || c.whatsapp === '6282158739760');
  if (demoCustIdx >= 0) {
    existingCustomers[demoCustIdx].passwordHash = SEED_CUSTOMERS[0].passwordHash;
    existingCustomers[demoCustIdx].passwordSalt = SEED_CUSTOMERS[0].passwordSalt;
    LocalStorageService.setItem('customers', existingCustomers);
  } else {
    existingCustomers.unshift(SEED_CUSTOMERS[0]);
    LocalStorageService.setItem('customers', existingCustomers);
  }

  const existingAdmins = LocalStorageService.getItem<AdminUser[]>('adminUsers') || [];
  const demoAdminIdx = existingAdmins.findIndex(a => a.id === 'admin-1' || a.username === 'admin');
  if (demoAdminIdx >= 0) {
    existingAdmins[demoAdminIdx].passwordHash = SEED_ADMIN_USERS[0].passwordHash;
    existingAdmins[demoAdminIdx].passwordSalt = SEED_ADMIN_USERS[0].passwordSalt;
    LocalStorageService.setItem('adminUsers', existingAdmins);
  } else {
    existingAdmins.unshift(SEED_ADMIN_USERS[0]);
    LocalStorageService.setItem('adminUsers', existingAdmins);
  }

  // Fix Lapis Legit images in existing LocalStorage
  const workingLapisImg = 'https://images.unsplash.com/photo-1605138693981-6c8a5ea87796?w=600&auto=format&fit=crop&q=80';
  const workingLapisProductImg = 'https://images.unsplash.com/photo-1605138693981-6c8a5ea87796?w=800&auto=format&fit=crop&q=80';

  const categories = LocalStorageService.getItem<Category[]>('categories') || [];
  let catUpdated = false;
  categories.forEach(cat => {
    if (cat.id === 'cat-lapis' || (cat.image && cat.image.includes('photo-1535141192574'))) {
      cat.image = workingLapisImg;
      catUpdated = true;
    }
  });
  if (catUpdated) {
    LocalStorageService.setItem('categories', categories);
  }

  const products = LocalStorageService.getItem<Product[]>('products') || [];
  let prodUpdated = false;
  products.forEach(p => {
    if (p.id === 'prod-lapis-legit' || p.categoryId === 'cat-lapis') {
      p.images.forEach(img => {
        if (!img.url || img.url.includes('photo-1535141192574')) {
          img.url = workingLapisProductImg;
          prodUpdated = true;
        }
      });
    }
  });
  if (prodUpdated) {
    LocalStorageService.setItem('products', products);
  }

  const gallery = LocalStorageService.getItem<GalleryItem[]>('gallery') || [];
  let galUpdated = false;
  gallery.forEach(g => {
    if (g.imageUrl && g.imageUrl.includes('photo-1535141192574')) {
      g.imageUrl = workingLapisProductImg;
      galUpdated = true;
    }
  });
  if (galUpdated) {
    LocalStorageService.setItem('gallery', gallery);
  }

  const existingContent = LocalStorageService.getItem<Content>('content');
  if (existingContent && existingContent.tickerActive === undefined) {
    existingContent.tickerActive = true;
    existingContent.tickerTheme = 'gold';
    existingContent.tickerBadge = '✨ PROMO SPESIAL TOKO';
    existingContent.tickerText = '✨ Buka Setiap Hari: 08.00 - 20.00 WITA • Nikmati Kelezatan Cake, Cookies, dan Hampers Eksklusif Bintang Cake & Cookies • Pengiriman Wilayah Samarinda & Balikpapan';
    existingContent.tickerSpeed = 'medium';
    existingContent.tickerLink = '/spesial';
    LocalStorageService.setItem('content', existingContent);
  }

  // Seed v4: Add Bank SeaBank, clean demo labels from payment channels & enable promo reward
  const payments = LocalStorageService.getItem<PaymentSetting[]>('paymentSettings') || [];
  let payUpdated = false;

  // Ensure SeaBank exists
  if (!payments.some(p => p.id === 'pay-seabank' || p.bankName?.toLowerCase().includes('seabank'))) {
    payments.unshift(SEED_PAYMENT_SETTINGS[0]);
    payUpdated = true;
  }

  // Clean '(DEMO)' strings from payment settings
  payments.forEach(p => {
    if (p.bankName?.includes('(DEMO)')) {
      p.bankName = p.bankName.replace('(DEMO)', '').trim();
      payUpdated = true;
    }
    if (p.accountName?.includes('(DEMO)')) {
      p.accountName = p.accountName.replace('(DEMO)', '').trim();
      payUpdated = true;
    }
    if (p.accountNumber?.includes('(DEMO)')) {
      p.accountNumber = p.accountNumber.replace('(DEMO)', '').trim();
      payUpdated = true;
    }
    if (p.accountHolder?.includes('DEMO')) {
      p.accountHolder = p.accountHolder.replace('DEMO', '').trim();
      payUpdated = true;
    }
    if (!p.type && p.method) {
      p.type = p.method === 'transfer_bank' ? 'bank_transfer' : p.method;
      payUpdated = true;
    }
    if (!p.accountName) {
      p.accountName = p.bankName || p.accountHolder;
      payUpdated = true;
    }
    p.isDemo = false;
  });

  if (payUpdated) {
    LocalStorageService.setItem('paymentSettings', payments);
  }

  // Ensure StoreSettings has Promo Souvenir/Discount defaults
  const store = LocalStorageService.getItem<StoreSettings>('storeSettings');
  if (store && store.promoRewardActive === undefined) {
    store.promoRewardActive = true;
    store.promoRewardType = 'souvenir';
    store.promoMinSpend = 750000;
    store.promoSouvenirName = 'Souvenir Eksklusif Bintang Cake (Toples Mini Cookies Cantik)';
    store.promoSouvenirDescription = 'Hadiah spesial terima kasih untuk pembelian di atas Rp 750.000';
    store.promoDiscountType = 'fixed';
    store.promoDiscountValue = 0;
    LocalStorageService.setItem('storeSettings', store);
  }

  LocalStorageService.setItem('meta', {
    ...meta,
    seedVersion: 4,
    migratedAt: new Date().toISOString(),
  });
}
