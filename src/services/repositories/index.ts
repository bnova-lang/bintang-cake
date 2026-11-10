// Central Repository Registry (PRD §31.2, AGENTS.md §6)
import {
  LocalStorageCategoryRepository,
  LocalStorageProductRepository,
  LocalStorageOrderRepository,
  LocalStorageCustomerRepository,
  LocalStorageChatRepository,
  LocalStorageReviewRepository,
  LocalStorageStockAdjustmentRepository,
  LocalStorageSettingsRepository,
  LocalStorageCartRepository,
  LocalStorageSessionRepository,
  initializeSeedData,
} from './localStorageRepositories';
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

export class RepositoryRegistry {
  private static instance: RepositoryRegistry;

  public categoryRepo: ICategoryRepository;
  public productRepo: IProductRepository;
  public orderRepo: IOrderRepository;
  public customerRepo: ICustomerRepository;
  public chatRepo: IChatRepository;
  public reviewRepo: IReviewRepository;
  public stockAdjustmentRepo: IStockAdjustmentRepository;
  public settingsRepo: ISettingsRepository;
  public cartRepo: ICartRepository;
  public sessionRepo: ISessionRepository;

  private constructor() {
    this.categoryRepo = new LocalStorageCategoryRepository();
    this.productRepo = new LocalStorageProductRepository();
    this.orderRepo = new LocalStorageOrderRepository();
    this.customerRepo = new LocalStorageCustomerRepository();
    this.chatRepo = new LocalStorageChatRepository();
    this.reviewRepo = new LocalStorageReviewRepository();
    this.stockAdjustmentRepo = new LocalStorageStockAdjustmentRepository();
    this.settingsRepo = new LocalStorageSettingsRepository();
    this.cartRepo = new LocalStorageCartRepository();
    this.sessionRepo = new LocalStorageSessionRepository();
  }

  get category(): ICategoryRepository { return this.categoryRepo; }
  get product(): IProductRepository { return this.productRepo; }
  get order(): IOrderRepository { return this.orderRepo; }
  get customer(): ICustomerRepository { return this.customerRepo; }
  get chat(): IChatRepository { return this.chatRepo; }
  get review(): IReviewRepository { return this.reviewRepo; }
  get stock(): IStockAdjustmentRepository { return this.stockAdjustmentRepo; }
  get settings(): ISettingsRepository { return this.settingsRepo; }
  get cart(): ICartRepository { return this.cartRepo; }
  get session(): ISessionRepository { return this.sessionRepo; }

  public static getInstance(): RepositoryRegistry {
    if (!RepositoryRegistry.instance) {
      RepositoryRegistry.instance = new RepositoryRegistry();
    }
    return RepositoryRegistry.instance;
  }
}

export const repos = RepositoryRegistry.getInstance();
export { initializeSeedData };
export * from './interfaces';
