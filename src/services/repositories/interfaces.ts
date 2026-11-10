// Repository interfaces for Bintang Cake & Cookies (SCHEMA.md §13)
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

export interface ICategoryRepository {
  getAll(): Category[];
  getById(id: string): Category | null;
  getBySlug(slug: string): Category | null;
  save(category: Category): void;
  delete(id: string): void;
}

export interface IProductRepository {
  getAll(): Product[];
  getById(id: string): Product | null;
  getBySlug(slug: string): Product | null;
  getByCategory(categoryId: string): Product[];
  save(product: Product): void;
  delete(id: string): void;
  updateStock(productId: string, variantId: string | undefined, delta: number, reason: string, refType: StockAdjustment['refType'], refId?: string, actor?: string): boolean;
}

export interface IOrderRepository {
  getAll(): Order[];
  getById(id: string): Order | null;
  getByOrderNumber(orderNumber: string): Order | null;
  create(order: Order): void;
  update(order: Order): void;
  confirmOrderAndDeductStock(orderId: string, actorName: string, productRepo: IProductRepository): { success: boolean; error?: string };
  cancelOrder(orderId: string, actorName: string, reason: string): boolean;
  restockOrder(orderId: string, actorName: string, productRepo: IProductRepository): boolean;
  delete(id: string): void;
  getNextOrderNumber(): string;
}

export interface ICustomerRepository {
  getAll(): Customer[];
  getById(id: string): Customer | null;
  getByWhatsapp(whatsapp: string): Customer | null;
  save(customer: Customer): void;
}

export interface IChatRepository {
  getByOrderId(orderId: string): ChatMessage[];
  addMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage;
  markAsRead(orderId: string, readerType: 'admin' | 'customer' | 'guest'): void;
}

export interface IReviewRepository {
  getAll(): Review[];
  getByProductId(productId: string, includeHidden?: boolean): Review[];
  add(review: Omit<Review, 'id' | 'createdAt'>): Review;
  toggleHidden(reviewId: string): boolean;
}

export interface IStockAdjustmentRepository {
  getAll(): StockAdjustment[];
  getByProduct(productId: string): StockAdjustment[];
  add(adj: Omit<StockAdjustment, 'id' | 'adjustedAt'>): StockAdjustment;
}

export interface ISettingsRepository {
  getPaymentSettings(): PaymentSetting[];
  savePaymentSetting(setting: PaymentSetting): void;
  getDeliveryAreas(): DeliveryArea[];
  saveDeliveryArea(area: DeliveryArea): void;
  deleteDeliveryArea(id: string): void;
  getStoreSettings(): StoreSettings;
  saveStoreSettings(settings: StoreSettings): void;
  getContent(): Content;
  saveContent(content: Content): void;
  getGallery(): GalleryItem[];
  saveGalleryItem(item: GalleryItem): void;
  deleteGalleryItem(id: string): void;
  getAdminUsers(): AdminUser[];
  saveAdminUser(admin: AdminUser): void;
}

export interface ICartRepository {
  getCart(): Cart;
  saveCart(cart: Cart): void;
  clearCart(): void;
}

export interface ISessionRepository {
  getSession(): Session | null;
  setSession(session: Session): void;
  clearSession(): void;
}
