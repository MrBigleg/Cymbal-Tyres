import {
  Product,
  StoreLocation,
  Cart,
  CartItem,
  CheckoutSession,
  Order,
  PurchaseIntent,
  SurveyResponse,
  DomainEvent,
  StockState,
} from '@/lib/types/commerce';

/**
 * CommerceProvider abstraction.
 * Note: Replace MockCommerceProvider with UcpCommerceProvider in integration phase.
 */
export interface ICommerceProvider {
  getStores(): Promise<StoreLocation[]>;
  getStoreById(storeId: string): Promise<StoreLocation | null>;
  getProducts(): Promise<Product[]>;
  getProductById(productId: string): Promise<Product | null>;

  // Cart operations
  getCart(): Promise<Cart>;
  addToCart(productId: string, quantity: number, fittingOption?: 'in_store' | 'mobile' | 'delivery_only'): Promise<Cart>;
  updateCartItem(productId: string, quantity: number, fittingOption?: 'in_store' | 'mobile' | 'delivery_only'): Promise<Cart>;
  removeFromCart(productId: string): Promise<Cart>;
  clearCart(): Promise<Cart>;
  setSelectedStore(storeId: string): Promise<Cart>;

  // Checkout operations (Mapping cleanly onto UCP checkout session lifecycle)
  createCheckout(sessionData?: Partial<CheckoutSession>): Promise<CheckoutSession>;
  getCheckout(checkoutId: string): Promise<CheckoutSession | null>;
  getActiveCheckout(): Promise<CheckoutSession | null>;
  updateCheckout(checkoutId: string, updates: Partial<CheckoutSession>): Promise<CheckoutSession>;
  markCheckoutStalled(checkoutId: string): Promise<CheckoutSession>;
  markCheckoutRecovered(checkoutId: string, recoveryDiscountPercent?: number, message?: string): Promise<CheckoutSession>;
  completeCheckout(checkoutId: string, paymentDetails: { method: string; simulatedCardNumber?: string }): Promise<Order>;

  // Orders
  getOrderById(orderId: string): Promise<Order | null>;
  getOrders(): Promise<Order[]>;
}

/**
 * InventoryProvider abstraction for multi-location stock queries & updates.
 */
export interface IInventoryProvider {
  getStock(productId: string, storeId: string): Promise<{ state: StockState; quantity: number } | null>;
  updateStock(productId: string, storeId: string, quantity: number, state?: StockState): Promise<Product>;
  replenishStock(productId: string, storeId: string, addedQuantity: number, price?: number): Promise<{ product: Product; event: DomainEvent }>;
  resetInventory(): Promise<void>;
}

/**
 * EventPublisher abstraction.
 * For now local event bus; can be swapped with Google Cloud Pub/Sub provider.
 */
export interface IEventPublisher {
  publish(event: DomainEvent): Promise<void>;
  getEvents(limit?: number): Promise<DomainEvent[]>;
  clearEvents(): Promise<void>;
  subscribe(listener: (event: DomainEvent) => void): () => void;
}

/**
 * SurveyRepository abstraction for post-purchase NPS / customer feedback.
 */
export interface ISurveyRepository {
  submitSurvey(survey: SurveyResponse): Promise<SurveyResponse>;
  getSurveyByToken(token: string): Promise<SurveyResponse | null>;
  getSurveyByOrderId(orderId: string): Promise<SurveyResponse | null>;
  getAllSurveys(): Promise<SurveyResponse[]>;
}

/**
 * PurchaseIntentRepository abstraction for "Buy when back in stock" (AP2 ready).
 */
export interface IPurchaseIntentRepository {
  createIntent(intent: Omit<PurchaseIntent, 'id' | 'createdAt' | 'status'>): Promise<PurchaseIntent>;
  getIntent(intentId: string): Promise<PurchaseIntent | null>;
  getIntents(filter?: { storeId?: string; productId?: string; status?: string }): Promise<PurchaseIntent[]>;
  updateIntentStatus(intentId: string, status: PurchaseIntent['status'], fulfillmentNote?: string, orderId?: string): Promise<PurchaseIntent>;
  cancelIntent(intentId: string): Promise<PurchaseIntent>;
}
