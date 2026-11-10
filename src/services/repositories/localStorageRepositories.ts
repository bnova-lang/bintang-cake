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
  // Only fallback if image specifically contains the broken photo ID from initial seed
  if (c.image && c.image.includes('photo-1535141192574')) {
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

const CURRENT_SEED_VERSION = 5;

/**
 * Initializes database with demo seeds if not already initialized
 */
export function initializeSeedData(forceReset = false): void {
  const meta = LocalStorageService.getItem<{ schemaVersion: number; seedVersion?: number }>('meta');

  // If already initialized with current seed version or higher, NEVER overwrite user's saved data!
  if (meta && (meta.seedVersion || 0) >= CURRENT_SEED_VERSION && !forceReset) {
    return;
  }

  // Check if user already has data in storage before writing seed data
  const existingCategories = LocalStorageService.getItem<Category[]>('categories');
  const existingProducts = LocalStorageService.getItem<Product[]>('products');
  const existingStore = LocalStorageService.getItem<StoreSettings>('storeSettings');
  const existingContent = LocalStorageService.getItem<Content>('content');

  // Only seed fresh if no data exists at all OR if user explicitly requested forceReset
  if (!meta && !existingCategories && !existingProducts && !existingContent) {
    LocalStorageService.setItem('meta', {
      schemaVersion: 1,
      seedVersion: CURRENT_SEED_VERSION,
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

  // Preserve existing data! Only fill in missing keys:
  if (!existingCategories) LocalStorageService.setItem('categories', SEED_CATEGORIES);
  if (!existingProducts) LocalStorageService.setItem('products', SEED_PRODUCTS);
  if (!existingStore) LocalStorageService.setItem('storeSettings', SEED_STORE_SETTINGS);
  if (!existingContent) LocalStorageService.setItem('content', SEED_CONTENT);
  if (!LocalStorageService.getItem('deliveryAreas')) LocalStorageService.setItem('deliveryAreas', SEED_DELIVERY_AREAS);
  if (!LocalStorageService.getItem('paymentSettings')) LocalStorageService.setItem('paymentSettings', SEED_PAYMENT_SETTINGS);
  if (!LocalStorageService.getItem('adminUsers')) LocalStorageService.setItem('adminUsers', SEED_ADMIN_USERS);
  if (!LocalStorageService.getItem('customers')) LocalStorageService.setItem('customers', SEED_CUSTOMERS);

  // One-time migration for legacy seeds (only run if seedVersion < CURRENT_SEED_VERSION):
  const workingLapisImg = 'https://images.unsplash.com/photo-1605138693981-6c8a5ea87796?w=600&auto=format&fit=crop&q=80';
  const workingLapisProductImg = 'https://images.unsplash.com/photo-1605138693981-6c8a5ea87796?w=800&auto=format&fit=crop&q=80';

  // Only fix broken unsplash URLs if they literally still point to the 404 image 'photo-1535141192574'
  const categories = LocalStorageService.getItem<Category[]>('categories');
  if (categories) {
    let catUpdated = false;
    categories.forEach(cat => {
      if (cat.image && cat.image.includes('photo-1535141192574')) {
        cat.image = workingLapisImg;
        catUpdated = true;
      }
    });
    if (catUpdated) LocalStorageService.setItem('categories', categories);
  }

  const products = LocalStorageService.getItem<Product[]>('products');
  if (products) {
    let prodUpdated = false;
    products.forEach(p => {
      p.images.forEach(img => {
        if (img.url && img.url.includes('photo-1535141192574')) {
          img.url = workingLapisProductImg;
          prodUpdated = true;
        }
      });
    });
    if (prodUpdated) LocalStorageService.setItem('products', products);
  }

  const gallery = LocalStorageService.getItem<GalleryItem[]>('gallery');
  if (gallery) {
    let galUpdated = false;
    gallery.forEach(g => {
      if (g.imageUrl && g.imageUrl.includes('photo-1535141192574')) {
        g.imageUrl = workingLapisProductImg;
        galUpdated = true;
      }
    });
    if (galUpdated) LocalStorageService.setItem('gallery', gallery);
  }

  // Ensure Admin credentials match: username 'bintang', password 'Nadin13'
  const admins = LocalStorageService.getItem<AdminUser[]>('adminUsers') || [];
  let adminUpdated = false;
  if (admins.length > 0) {
    admins.forEach(a => {
      if (a.username !== 'bintang') {
        a.username = 'bintang';
        a.passwordHash = '90d4d3a6dd4b63088926628bc27963d9a16630c81440099f5f6e957b31b0e993';
        a.passwordSalt = 'a1b2c3d4e5f60718293a4b5c6d7e8f90';
        a.name = 'Administrator Bintang Cake';
        adminUpdated = true;
      }
    });
  } else {
    admins.push(...SEED_ADMIN_USERS);
    adminUpdated = true;
  }
  if (adminUpdated) {
    LocalStorageService.setItem('adminUsers', admins);
  }

  // Mark migration as complete
  LocalStorageService.setItem('meta', {
    ...(meta || { schemaVersion: 1 }),
    seedVersion: CURRENT_SEED_VERSION,
    migratedAt: new Date().toISOString(),
  });
}
