/**
 * PRODUCTION / STAGING INTEGRATION TEMPLATE: UcpCommerceProvider
 *
 * Use this class to replace MockCommerceService when connecting to
 * real Universal Commerce Protocol (UCP) REST / gRPC endpoints,
 * your ERP/WMS backend, and Cloud SQL/PostgreSQL databases.
 */

import {
  ICommerceProvider,
  IInventoryProvider,
  IPurchaseIntentRepository,
  ISurveyRepository,
} from './interfaces';
import {
  Product,
  StoreLocation,
  Cart,
  CheckoutSession,
  Order,
  PurchaseIntent,
  SurveyResponse,
  DomainEvent,
  StockState,
} from '@/lib/types/commerce';

export class UcpCommerceProvider
  implements ICommerceProvider, IInventoryProvider, IPurchaseIntentRepository, ISurveyRepository
{
  private baseUrl: string;
  private apiKey: string;

  constructor(
    baseUrl: string = process.env.NEXT_PUBLIC_UCP_API_URL || 'https://api.ucp.cymbalauto.co.uk/v1',
    apiKey: string = process.env.UCP_API_KEY || ''
  ) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private async fetchUcp<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'X-UCP-Version': '1.0.0',
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`UCP API Error [${response.status} ${response.statusText}]: ${errorText}`);
    }

    return response.json();
  }

  // --- STORE OPERATIONS ---
  async getStores(): Promise<StoreLocation[]> {
    return this.fetchUcp<StoreLocation[]>('/stores');
  }

  async getStoreById(storeId: string): Promise<StoreLocation | null> {
    return this.fetchUcp<StoreLocation>(`/stores/${encodeURIComponent(storeId)}`);
  }

  // --- CATALOG ---
  async getProducts(): Promise<Product[]> {
    return this.fetchUcp<Product[]>('/products');
  }

  async getProductById(productId: string): Promise<Product | null> {
    return this.fetchUcp<Product>(`/products/${encodeURIComponent(productId)}`);
  }

  // --- CART ---
  async getCart(): Promise<Cart> {
    return this.fetchUcp<Cart>('/cart');
  }

  async addToCart(
    productId: string,
    quantity: number,
    fittingOption: 'in_store' | 'mobile' | 'delivery_only' = 'in_store'
  ): Promise<Cart> {
    return this.fetchUcp<Cart>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, fittingOption }),
    });
  }

  async updateCartItem(
    productId: string,
    quantity: number,
    fittingOption?: 'in_store' | 'mobile' | 'delivery_only'
  ): Promise<Cart> {
    return this.fetchUcp<Cart>(`/cart/items/${encodeURIComponent(productId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity, fittingOption }),
    });
  }

  async removeFromCart(productId: string): Promise<Cart> {
    return this.fetchUcp<Cart>(`/cart/items/${encodeURIComponent(productId)}`, {
      method: 'DELETE',
    });
  }

  async clearCart(): Promise<Cart> {
    return this.fetchUcp<Cart>('/cart/clear', { method: 'POST' });
  }

  async setSelectedStore(storeId: string): Promise<Cart> {
    return this.fetchUcp<Cart>('/cart/store', {
      method: 'PUT',
      body: JSON.stringify({ storeId }),
    });
  }

  // --- UCP CHECKOUT SESSIONS ---
  async createCheckout(sessionData?: Partial<CheckoutSession>): Promise<CheckoutSession> {
    return this.fetchUcp<CheckoutSession>('/checkout/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData || {}),
    });
  }

  async getCheckout(checkoutId: string): Promise<CheckoutSession | null> {
    return this.fetchUcp<CheckoutSession>(`/checkout/sessions/${encodeURIComponent(checkoutId)}`);
  }

  async getActiveCheckout(): Promise<CheckoutSession | null> {
    return this.fetchUcp<CheckoutSession | null>('/checkout/sessions/active');
  }

  async updateCheckout(
    checkoutId: string,
    updates: Partial<CheckoutSession>
  ): Promise<CheckoutSession> {
    return this.fetchUcp<CheckoutSession>(
      `/checkout/sessions/${encodeURIComponent(checkoutId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }
    );
  }

  async markCheckoutStalled(checkoutId: string): Promise<CheckoutSession> {
    return this.fetchUcp<CheckoutSession>(
      `/checkout/sessions/${encodeURIComponent(checkoutId)}/stall`,
      { method: 'POST' }
    );
  }

  async markCheckoutRecovered(
    checkoutId: string,
    recoveryDiscountPercent: number = 10,
    message?: string
  ): Promise<CheckoutSession> {
    return this.fetchUcp<CheckoutSession>(
      `/checkout/sessions/${encodeURIComponent(checkoutId)}/recovery`,
      {
        method: 'POST',
        body: JSON.stringify({ discountPercent: recoveryDiscountPercent, message }),
      }
    );
  }

  async completeCheckout(
    checkoutId: string,
    paymentDetails: { method: string; simulatedCardNumber?: string }
  ): Promise<Order> {
    return this.fetchUcp<Order>(`/checkout/sessions/${encodeURIComponent(checkoutId)}/complete`, {
      method: 'POST',
      body: JSON.stringify(paymentDetails),
    });
  }

  // --- ORDERS ---
  async getOrderById(orderId: string): Promise<Order | null> {
    return this.fetchUcp<Order>(`/orders/${encodeURIComponent(orderId)}`);
  }

  async getOrders(): Promise<Order[]> {
    return this.fetchUcp<Order[]>('/orders');
  }

  // --- INVENTORY ---
  async getStock(
    productId: string,
    storeId: string
  ): Promise<{ state: StockState; quantity: number } | null> {
    return this.fetchUcp<{ state: StockState; quantity: number }>(
      `/inventory/${encodeURIComponent(productId)}/stores/${encodeURIComponent(storeId)}`
    );
  }

  async updateStock(
    productId: string,
    storeId: string,
    quantity: number,
    state?: StockState
  ): Promise<Product> {
    return this.fetchUcp<Product>(
      `/inventory/${encodeURIComponent(productId)}/stores/${encodeURIComponent(storeId)}`,
      {
        method: 'PUT',
        body: JSON.stringify({ quantity, state }),
      }
    );
  }

  async replenishStock(
    productId: string,
    storeId: string,
    addedQuantity: number,
    price?: number
  ): Promise<{ product: Product; event: DomainEvent }> {
    return this.fetchUcp<{ product: Product; event: DomainEvent }>(
      `/inventory/${encodeURIComponent(productId)}/replenish`,
      {
        method: 'POST',
        body: JSON.stringify({ storeId, addedQuantity, price }),
      }
    );
  }

  async resetInventory(): Promise<void> {
    await this.fetchUcp<void>('/inventory/reset', { method: 'POST' });
  }

  // --- AP2 PURCHASE INTENTS ---
  async createIntent(
    intent: Omit<PurchaseIntent, 'id' | 'createdAt' | 'status'>
  ): Promise<PurchaseIntent> {
    return this.fetchUcp<PurchaseIntent>('/purchase-intents', {
      method: 'POST',
      body: JSON.stringify(intent),
    });
  }

  async getIntent(intentId: string): Promise<PurchaseIntent | null> {
    return this.fetchUcp<PurchaseIntent>(`/purchase-intents/${encodeURIComponent(intentId)}`);
  }

  async getIntents(filter?: {
    storeId?: string;
    productId?: string;
    status?: string;
  }): Promise<PurchaseIntent[]> {
    const params = new URLSearchParams();
    if (filter?.storeId) params.append('storeId', filter.storeId);
    if (filter?.productId) params.append('productId', filter.productId);
    if (filter?.status) params.append('status', filter.status);
    return this.fetchUcp<PurchaseIntent[]>(`/purchase-intents?${params.toString()}`);
  }

  async updateIntentStatus(
    intentId: string,
    status: PurchaseIntent['status'],
    fulfillmentNote?: string,
    orderId?: string
  ): Promise<PurchaseIntent> {
    return this.fetchUcp<PurchaseIntent>(
      `/purchase-intents/${encodeURIComponent(intentId)}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status, fulfillmentNote, orderId }),
      }
    );
  }

  async cancelIntent(intentId: string): Promise<PurchaseIntent> {
    return this.fetchUcp<PurchaseIntent>(
      `/purchase-intents/${encodeURIComponent(intentId)}/cancel`,
      { method: 'POST' }
    );
  }

  // --- POST-PURCHASE SURVEYS ---
  async submitSurvey(survey: SurveyResponse): Promise<SurveyResponse> {
    return this.fetchUcp<SurveyResponse>('/surveys', {
      method: 'POST',
      body: JSON.stringify(survey),
    });
  }

  async getSurveyByToken(token: string): Promise<SurveyResponse | null> {
    return this.fetchUcp<SurveyResponse>(`/surveys/tokens/${encodeURIComponent(token)}`);
  }

  async getSurveyByOrderId(orderId: string): Promise<SurveyResponse | null> {
    return this.fetchUcp<SurveyResponse>(`/surveys/orders/${encodeURIComponent(orderId)}`);
  }

  async getAllSurveys(): Promise<SurveyResponse[]> {
    return this.fetchUcp<SurveyResponse[]>('/surveys');
  }
}
