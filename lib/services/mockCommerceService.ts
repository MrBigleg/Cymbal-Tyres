import {
  StoreLocation,
  Product,
  Cart,
  CartItem,
  CheckoutSession,
  Order,
  PurchaseIntent,
  SurveyResponse,
  DomainEvent,
  StockState,
} from '@/lib/types/commerce';
import { SEED_STORES, SEED_PRODUCTS } from '@/lib/data/seedData';
import {
  ICommerceProvider,
  IInventoryProvider,
  IEventPublisher,
  ISurveyRepository,
  IPurchaseIntentRepository,
} from './interfaces';

const STORAGE_KEYS = {
  STORES: 'cymbal_stores_v1',
  PRODUCTS: 'cymbal_products_v1',
  CART: 'cymbal_cart_v1',
  CHECKOUTS: 'cymbal_checkouts_v1',
  ORDERS: 'cymbal_orders_v1',
  INTENTS: 'cymbal_intents_v1',
  SURVEYS: 'cymbal_surveys_v1',
  EVENTS: 'cymbal_events_v1',
  SELECTED_STORE: 'cymbal_selected_store_v1',
};

type EventListener = (event: DomainEvent) => void;
type StateChangeListener = (type: string, data?: any) => void;

class MockEventPublisher implements IEventPublisher {
  private listeners: Set<EventListener> = new Set();

  async publish(event: DomainEvent): Promise<void> {
    const events = await this.getEvents();
    const updated = [event, ...events.slice(0, 99)]; // keep latest 100
    this.saveEvents(updated);
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in event listener', err);
      }
    });
  }

  async getEvents(limit = 50): Promise<DomainEvent[]> {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return parsed.slice(0, limit);
    } catch {
      return [];
    }
  }

  async clearEvents(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.EVENTS);
    }
  }

  subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private saveEvents(events: DomainEvent[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
      window.dispatchEvent(new CustomEvent('cymbal_events_updated', { detail: events }));
    }
  }
}

export const eventPublisher = new MockEventPublisher();

class MockCommerceService
  implements
    ICommerceProvider,
    IInventoryProvider,
    ISurveyRepository,
    IPurchaseIntentRepository
{
  private stateListeners: Set<StateChangeListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeIfEmpty();
      window.addEventListener('storage', (e) => {
        if (e.key && Object.values(STORAGE_KEYS).includes(e.key)) {
          this.notifyStateChange('storage_sync');
        }
      });
    }
  }

  public subscribeToState(listener: StateChangeListener): () => void {
    this.stateListeners.add(listener);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  private notifyStateChange(type: string, data?: any) {
    this.stateListeners.forEach((l) => {
      try {
        l(type, data);
      } catch (err) {
        console.error('State listener error', err);
      }
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cymbal_state_changed', { detail: { type, data } }));
    }
  }

  private initializeIfEmpty() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(STORAGE_KEYS.STORES)) {
      localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(SEED_STORES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SELECTED_STORE)) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_STORE, 'birmingham');
    }
    if (!localStorage.getItem(STORAGE_KEYS.CART)) {
      const initialCart: Cart = {
        items: [],
        storeId: 'birmingham',
        subtotal: 0,
        fittingTotal: 0,
        discount: 0,
        total: 0,
      };
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(initialCart));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CHECKOUTS)) {
      localStorage.setItem(STORAGE_KEYS.CHECKOUTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.INTENTS)) {
      localStorage.setItem(STORAGE_KEYS.INTENTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SURVEYS)) {
      localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify([]));
    }
  }

  // --- STORES ---
  async getStores(): Promise<StoreLocation[]> {
    if (typeof window === 'undefined') return SEED_STORES;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.STORES);
      return raw ? JSON.parse(raw) : SEED_STORES;
    } catch {
      return SEED_STORES;
    }
  }

  async getStoreById(storeId: string): Promise<StoreLocation | null> {
    const stores = await this.getStores();
    return stores.find((s) => s.id === storeId) || null;
  }

  // --- PRODUCTS ---
  async getProducts(): Promise<Product[]> {
    if (typeof window === 'undefined') return SEED_PRODUCTS;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return raw ? JSON.parse(raw) : SEED_PRODUCTS;
    } catch {
      return SEED_PRODUCTS;
    }
  }

  async getProductById(productId: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find((p) => p.id === productId) || null;
  }

  // --- CART ---
  async getCart(): Promise<Cart> {
    if (typeof window === 'undefined') {
      return {
        items: [],
        storeId: 'birmingham',
        subtotal: 0,
        fittingTotal: 0,
        discount: 0,
        total: 0,
      };
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CART);
      const selectedStore = localStorage.getItem(STORAGE_KEYS.SELECTED_STORE) || 'birmingham';
      if (!raw) {
        const c: Cart = { items: [], storeId: selectedStore, subtotal: 0, fittingTotal: 0, discount: 0, total: 0 };
        return c;
      }
      const parsed: Cart = JSON.parse(raw);
      if (!parsed.storeId) parsed.storeId = selectedStore;
      return parsed;
    } catch {
      return { items: [], storeId: 'birmingham', subtotal: 0, fittingTotal: 0, discount: 0, total: 0 };
    }
  }

  private saveCart(cart: Cart): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
      this.notifyStateChange('cart_updated', cart);
    }
  }

  private recalculateCart(items: CartItem[], storeId: string, discount = 0, discountCode?: string): Cart {
    const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const fittingTotal = items.reduce((acc, item) => acc + item.fittingCostPerUnit * item.quantity, 0);
    const calculatedTotal = Math.max(0, subtotal + fittingTotal - discount);
    return {
      items,
      storeId,
      subtotal: Number(subtotal.toFixed(2)),
      fittingTotal: Number(fittingTotal.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      discountCode,
      total: Number(calculatedTotal.toFixed(2)),
    };
  }

  async addToCart(
    productId: string,
    quantity: number,
    fittingOption: 'in_store' | 'mobile' | 'delivery_only' = 'in_store'
  ): Promise<Cart> {
    const cart = await this.getCart();
    const product = await this.getProductById(productId);
    if (!product) throw new Error(`Product ${productId} not found`);

    const existingIndex = cart.items.findIndex(
      (item) => item.productId === productId && item.fittingOption === fittingOption
    );

    // Fitting cost: in_store is free or included, mobile fitting is £15/tyre, delivery only is £0
    const fittingCostPerUnit = fittingOption === 'mobile' ? 15 : 0;

    let newItems = [...cart.items];
    if (existingIndex >= 0) {
      newItems[existingIndex] = {
        ...newItems[existingIndex],
        quantity: newItems[existingIndex].quantity + quantity,
        product,
      };
    } else {
      newItems.push({
        productId,
        product,
        quantity,
        fittingOption,
        fittingCostPerUnit,
      });
    }

    const updated = this.recalculateCart(newItems, cart.storeId, cart.discount, cart.discountCode);
    this.saveCart(updated);
    return updated;
  }

  async updateCartItem(
    productId: string,
    quantity: number,
    fittingOption?: 'in_store' | 'mobile' | 'delivery_only'
  ): Promise<Cart> {
    const cart = await this.getCart();
    if (quantity <= 0) {
      return this.removeFromCart(productId);
    }

    const newItems = cart.items.map((item) => {
      if (item.productId === productId) {
        const opt = fittingOption || item.fittingOption;
        return {
          ...item,
          quantity,
          fittingOption: opt,
          fittingCostPerUnit: opt === 'mobile' ? 15 : 0,
        };
      }
      return item;
    });

    const updated = this.recalculateCart(newItems, cart.storeId, cart.discount, cart.discountCode);
    this.saveCart(updated);
    return updated;
  }

  async removeFromCart(productId: string): Promise<Cart> {
    const cart = await this.getCart();
    const newItems = cart.items.filter((i) => i.productId !== productId);
    const updated = this.recalculateCart(newItems, cart.storeId, cart.discount, cart.discountCode);
    this.saveCart(updated);
    return updated;
  }

  async clearCart(): Promise<Cart> {
    const current = await this.getCart();
    const empty: Cart = {
      items: [],
      storeId: current.storeId,
      subtotal: 0,
      fittingTotal: 0,
      discount: 0,
      total: 0,
    };
    this.saveCart(empty);
    return empty;
  }

  async setSelectedStore(storeId: string): Promise<Cart> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SELECTED_STORE, storeId);
    }
    const cart = await this.getCart();
    const updated = { ...cart, storeId };
    this.saveCart(updated);
    this.notifyStateChange('store_selected', storeId);
    return updated;
  }

  // --- CHECKOUT ---
  async getCheckouts(): Promise<CheckoutSession[]> {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CHECKOUTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveCheckouts(checkouts: CheckoutSession[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CHECKOUTS, JSON.stringify(checkouts));
      this.notifyStateChange('checkouts_updated', checkouts);
    }
  }

  async getCheckout(checkoutId: string): Promise<CheckoutSession | null> {
    const list = await this.getCheckouts();
    return list.find((c) => c.checkoutId === checkoutId) || null;
  }

  async getActiveCheckout(): Promise<CheckoutSession | null> {
    const list = await this.getCheckouts();
    // Return newest active or stalled/recovery_offered checkout
    return list.find((c) => c.status === 'ACTIVE' || c.status === 'STALLED' || c.status === 'RECOVERY_OFFERED') || null;
  }

  async createCheckout(sessionData?: Partial<CheckoutSession>): Promise<CheckoutSession> {
    const cart = await this.getCart();
    const checkoutId = `chk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 2 * 3600 * 1000).toISOString(); // 2 hours

    const newSession: CheckoutSession = {
      checkoutId,
      customer: sessionData?.customer || {
        name: 'Alex Mercer',
        email: 'alex.mercer@example.co.uk',
        phone: '07700 900823',
        vehicleReg: 'BK72 XDA',
        addressLine1: '42 Highfield Lane',
        postcode: 'B15 3TR',
      },
      lineItems: sessionData?.lineItems || [...cart.items],
      storeId: sessionData?.storeId || cart.storeId,
      fittingSlot: sessionData?.fittingSlot || {
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        timeSlot: '10:00 - 11:00',
        bayNumber: 'Bay 2',
      },
      subtotal: sessionData?.subtotal ?? cart.subtotal,
      fittingTotal: sessionData?.fittingTotal ?? cart.fittingTotal,
      discounts: sessionData?.discounts ?? cart.discount,
      discountCode: sessionData?.discountCode ?? cart.discountCode,
      total: sessionData?.total ?? cart.total,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      expiresAt,
      paymentMethod: sessionData?.paymentMethod || {
        type: 'simulated_card',
        lastFour: '4242',
      },
    };

    const existing = await this.getCheckouts();
    this.saveCheckouts([newSession, ...existing]);

    await eventPublisher.publish({
      eventId: `evt_${Date.now()}`,
      eventType: 'commerce.checkout.created',
      timestamp: now,
      payload: {
        checkoutId: newSession.checkoutId,
        customerId: newSession.customer.email,
        total: newSession.total,
        storeId: newSession.storeId,
      },
    });

    return newSession;
  }

  async updateCheckout(checkoutId: string, updates: Partial<CheckoutSession>): Promise<CheckoutSession> {
    const list = await this.getCheckouts();
    const index = list.findIndex((c) => c.checkoutId === checkoutId);
    if (index === -1) throw new Error(`Checkout ${checkoutId} not found`);

    const current = list[index];
    const updated: CheckoutSession = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    this.saveCheckouts(list);
    return updated;
  }

  async markCheckoutStalled(checkoutId: string): Promise<CheckoutSession> {
    const updated = await this.updateCheckout(checkoutId, { status: 'STALLED' });

    await eventPublisher.publish({
      eventId: `evt_${Date.now()}`,
      eventType: 'commerce.checkout.stalled',
      timestamp: new Date().toISOString(),
      payload: {
        checkoutId: updated.checkoutId,
        customerId: updated.customer.email,
        total: updated.total,
        storeId: updated.storeId,
        stalledAt: new Date().toISOString(),
        note: 'Customer paused in checkout flow. Eligible for Long Horizon recovery agent.',
      },
    });

    return updated;
  }

  async markCheckoutRecovered(
    checkoutId: string,
    recoveryDiscountPercent = 10,
    message = 'Special Agent Recovery Offer: 10% instant checkout credit applied'
  ): Promise<CheckoutSession> {
    const checkout = await this.getCheckout(checkoutId);
    if (!checkout) throw new Error(`Checkout ${checkoutId} not found`);

    const discountAmount = Number(((checkout.subtotal * recoveryDiscountPercent) / 100).toFixed(2));
    const newTotal = Number((Math.max(0, checkout.subtotal + checkout.fittingTotal - discountAmount)).toFixed(2));

    const updated = await this.updateCheckout(checkoutId, {
      status: 'RECOVERY_OFFERED',
      discounts: discountAmount,
      discountCode: `RECOVER${recoveryDiscountPercent}`,
      recoveryOfferApplied: true,
      recoveryOfferMessage: message,
      total: newTotal,
    });

    await eventPublisher.publish({
      eventId: `evt_${Date.now()}`,
      eventType: 'commerce.checkout.recovered',
      timestamp: new Date().toISOString(),
      payload: {
        checkoutId: updated.checkoutId,
        customerId: updated.customer.email,
        discountApplied: discountAmount,
        newTotal: updated.total,
        offerCode: updated.discountCode,
      },
    });

    return updated;
  }

  async completeCheckout(
    checkoutId: string,
    paymentDetails: { method: string; simulatedCardNumber?: string }
  ): Promise<Order> {
    const checkout = await this.getCheckout(checkoutId);
    if (!checkout) throw new Error(`Checkout ${checkoutId} not found`);

    const store = await this.getStoreById(checkout.storeId);
    const orderId = `ord_${Date.now()}`;
    const orderNumber = `CYM-${Math.floor(100000 + Math.random() * 900000)}`;
    const collectionPin = `${Math.floor(1000 + Math.random() * 9000)}`;
    const surveyToken = `srv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    const order: Order = {
      orderId,
      orderNumber,
      checkoutId,
      customerId: checkout.customer.email,
      customer: checkout.customer,
      lineItems: checkout.lineItems,
      storeId: checkout.storeId,
      storeName: store?.name || 'Cymbal Auto',
      storeAddress: store?.address || 'Birmingham Retail Park',
      storePostcode: store?.postcode || 'B4 7XU',
      fittingSlot: checkout.fittingSlot,
      subtotal: checkout.subtotal,
      fittingTotal: checkout.fittingTotal,
      discount: checkout.discounts,
      total: checkout.total,
      paymentMethod: paymentDetails.method || 'Simulated Card (Ending 4242)',
      paymentStatus: 'PAID_SIMULATED',
      status: 'CONFIRMED',
      collectionPin,
      surveyToken,
      createdAt: now,
    };

    // Save order
    const orders = await this.getOrders();
    this.saveOrders([order, ...orders]);

    // Update checkout status to completed
    await this.updateCheckout(checkoutId, { status: 'COMPLETED' });

    // Empty cart
    await this.clearCart();

    // Deduct stock
    for (const item of order.lineItems) {
      const product = await this.getProductById(item.productId);
      if (product && product.stockByStore[order.storeId]) {
        const currentQty = product.stockByStore[order.storeId].quantity;
        const newQty = Math.max(0, currentQty - item.quantity);
        const newState: StockState = newQty === 0 ? 'Out of Stock' : newQty <= 2 ? 'Low Stock' : 'In Stock';
        await this.updateStock(item.productId, order.storeId, newQty, newState);
      }
    }

    // Publish commerce.order.completed event
    await eventPublisher.publish({
      eventId: `evt_${Date.now()}`,
      eventType: 'commerce.order.completed',
      timestamp: now,
      payload: {
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        locationId: order.storeId,
        total: order.total,
        itemCount: order.lineItems.reduce((acc, i) => acc + i.quantity, 0),
        surveyToken: order.surveyToken,
        timestamp: now,
      },
    });

    return order;
  }

  // --- ORDERS ---
  async getOrders(): Promise<Order[]> {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    const orders = await this.getOrders();
    return orders.find((o) => o.orderId === orderId || o.orderNumber === orderId) || null;
  }

  private saveOrders(orders: Order[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      this.notifyStateChange('orders_updated', orders);
    }
  }

  // --- INVENTORY ---
  async getStock(productId: string, storeId: string): Promise<{ state: StockState; quantity: number } | null> {
    const product = await this.getProductById(productId);
    if (!product || !product.stockByStore[storeId]) return null;
    return {
      state: product.stockByStore[storeId].state,
      quantity: product.stockByStore[storeId].quantity,
    };
  }

  async updateStock(
    productId: string,
    storeId: string,
    quantity: number,
    state?: StockState
  ): Promise<Product> {
    const products = await this.getProducts();
    const index = products.findIndex((p) => p.id === productId);
    if (index === -1) throw new Error(`Product ${productId} not found`);

    const product = { ...products[index] };
    const determinedState: StockState =
      state || (quantity === 0 ? 'Out of Stock' : quantity <= 3 ? 'Low Stock' : 'In Stock');

    product.stockByStore = {
      ...product.stockByStore,
      [storeId]: {
        ...product.stockByStore[storeId],
        quantity,
        state: determinedState,
        bayAvailable: quantity > 0,
      },
    };

    products[index] = product;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      this.notifyStateChange('inventory_updated', { productId, storeId, quantity, state: determinedState });
    }

    return product;
  }

  async replenishStock(
    productId: string,
    storeId: string,
    addedQuantity: number,
    price?: number
  ): Promise<{ product: Product; event: DomainEvent }> {
    const product = await this.getProductById(productId);
    if (!product) throw new Error(`Product ${productId} not found`);

    const currentQty = product.stockByStore[storeId]?.quantity || 0;
    const newQty = currentQty + addedQuantity;
    const updatedPrice = price !== undefined ? price : product.price;

    const updatedProduct = await this.updateStock(productId, storeId, newQty, 'In Stock');
    if (price !== undefined) {
      updatedProduct.price = updatedPrice;
      const all = await this.getProducts();
      const pIdx = all.findIndex((p) => p.id === productId);
      if (pIdx >= 0) {
        all[pIdx].price = updatedPrice;
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(all));
      }
    }

    const event: DomainEvent = {
      eventId: `evt_replenish_${Date.now()}`,
      eventType: 'inventory.replenished',
      timestamp: new Date().toISOString(),
      payload: {
        productId,
        productName: updatedProduct.name,
        locationId: storeId,
        availableQuantity: newQty,
        addedQuantity,
        price: updatedPrice,
        timestamp: new Date().toISOString(),
      },
    };

    await eventPublisher.publish(event);

    // Scan for waiting purchase intents matching this replenishment!
    await this.processReplenishmentIntents(productId, storeId, newQty, updatedPrice);

    return { product: updatedProduct, event };
  }

  private async processReplenishmentIntents(
    productId: string,
    storeId: string,
    availableQty: number,
    currentPrice: number
  ) {
    const intents = await this.getIntents({ productId, storeId, status: 'waiting_for_stock' });
    if (intents.length === 0) return;

    for (const intent of intents) {
      const isPriceAcceptable = currentPrice * intent.quantity <= intent.maxTotalPrice;
      if (isPriceAcceptable && availableQty >= intent.quantity) {
        if (intent.approvalMode === 'automatic') {
          // Simulate AP2 automatic purchase fulfillment
          const autoOrderNumber = `AUTOPAY-${Math.floor(100000 + Math.random() * 900000)}`;
          await this.updateIntentStatus(
            intent.id,
            'fulfilled',
            `AP2 Agent automatic purchase triggered: Order ${autoOrderNumber} created at £${currentPrice * intent.quantity}`,
            autoOrderNumber
          );

          await eventPublisher.publish({
            eventId: `evt_intent_fulfilled_${Date.now()}`,
            eventType: 'commerce.intent.fulfilled',
            timestamp: new Date().toISOString(),
            payload: {
              intentId: intent.id,
              orderId: autoOrderNumber,
              productId,
              locationId: storeId,
              approvalMode: 'automatic',
              totalCharged: currentPrice * intent.quantity,
              message: 'Pre-authorized intent fulfilled autonomously via mock AP2',
            },
          });
        } else {
          // Human present: Notification triggered to prompt customer
          await eventPublisher.publish({
            eventId: `evt_intent_alert_${Date.now()}`,
            eventType: 'commerce.intent.created',
            timestamp: new Date().toISOString(),
            payload: {
              intentId: intent.id,
              productId,
              locationId: storeId,
              approvalMode: 'human_present',
              notificationSent: true,
              message: `Customer notification sent: ${intent.productName} is back in stock at ${storeId}. Waiting for approval.`,
            },
          });
        }
      }
    }
  }

  async resetInventory(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
      this.notifyStateChange('inventory_reset');
    }
  }

  // --- PURCHASE INTENTS ---
  async getIntents(filter?: { storeId?: string; productId?: string; status?: string }): Promise<PurchaseIntent[]> {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.INTENTS);
      let list: PurchaseIntent[] = raw ? JSON.parse(raw) : [];
      if (filter?.storeId) list = list.filter((i) => i.storeId === filter.storeId);
      if (filter?.productId) list = list.filter((i) => i.productId === filter.productId);
      if (filter?.status) list = list.filter((i) => i.status === filter.status);
      return list;
    } catch {
      return [];
    }
  }

  async getIntent(intentId: string): Promise<PurchaseIntent | null> {
    const list = await this.getIntents();
    return list.find((i) => i.id === intentId) || null;
  }

  async createIntent(
    intentData: Omit<PurchaseIntent, 'id' | 'createdAt' | 'status'>
  ): Promise<PurchaseIntent> {
    const id = `intent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const intent: PurchaseIntent = {
      ...intentData,
      id,
      status: 'waiting_for_stock',
      createdAt: now,
    };

    const list = await this.getIntents();
    const updated = [intent, ...list];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.INTENTS, JSON.stringify(updated));
      this.notifyStateChange('intents_updated', updated);
    }

    await eventPublisher.publish({
      eventId: `evt_intent_${Date.now()}`,
      eventType: 'commerce.intent.created',
      timestamp: now,
      payload: {
        intentId: intent.id,
        productId: intent.productId,
        productName: intent.productName,
        storeId: intent.storeId,
        quantity: intent.quantity,
        maxTotalPrice: intent.maxTotalPrice,
        approvalMode: intent.approvalMode,
        allowSubstitution: intent.allowSubstitution,
        expiresAt: intent.expiresAt,
        status: intent.status,
      },
    });

    return intent;
  }

  async updateIntentStatus(
    intentId: string,
    status: PurchaseIntent['status'],
    fulfillmentNote?: string,
    orderId?: string
  ): Promise<PurchaseIntent> {
    const list = await this.getIntents();
    const idx = list.findIndex((i) => i.id === intentId);
    if (idx === -1) throw new Error(`Intent ${intentId} not found`);

    list[idx] = {
      ...list[idx],
      status,
      fulfillmentNote: fulfillmentNote || list[idx].fulfillmentNote,
      fulfilledOrderId: orderId || list[idx].fulfilledOrderId,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.INTENTS, JSON.stringify(list));
      this.notifyStateChange('intents_updated', list);
    }

    return list[idx];
  }

  async cancelIntent(intentId: string): Promise<PurchaseIntent> {
    return this.updateIntentStatus(intentId, 'cancelled', 'Cancelled by customer or operator');
  }

  // --- SURVEYS ---
  async getAllSurveys(): Promise<SurveyResponse[]> {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SURVEYS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  async getSurveyByToken(token: string): Promise<SurveyResponse | null> {
    const list = await this.getAllSurveys();
    return list.find((s) => s.surveyToken === token) || null;
  }

  async getSurveyByOrderId(orderId: string): Promise<SurveyResponse | null> {
    const list = await this.getAllSurveys();
    return list.find((s) => s.orderId === orderId) || null;
  }

  async submitSurvey(survey: SurveyResponse): Promise<SurveyResponse> {
    const list = await this.getAllSurveys();
    // Filter existing for this token/order
    const filtered = list.filter((s) => s.surveyToken !== survey.surveyToken);
    const updated = [survey, ...filtered];

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify(updated));
      this.notifyStateChange('surveys_updated', updated);
    }

    await eventPublisher.publish({
      eventId: `evt_survey_${Date.now()}`,
      eventType: 'commerce.survey.submitted',
      timestamp: survey.submittedAt,
      payload: {
        orderId: survey.orderId,
        locationId: survey.locationId,
        score: survey.score,
        comment: survey.comment || '',
        submittedAt: survey.submittedAt,
      },
    });

    return survey;
  }

  // --- FULL DEMO RESET ---
  async resetAllDemoData(): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(SEED_STORES));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.SELECTED_STORE, 'birmingham');
    localStorage.setItem(
      STORAGE_KEYS.CART,
      JSON.stringify({
        items: [],
        storeId: 'birmingham',
        subtotal: 0,
        fittingTotal: 0,
        discount: 0,
        total: 0,
      })
    );
    localStorage.setItem(STORAGE_KEYS.CHECKOUTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.INTENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify([]));
    this.notifyStateChange('demo_reset_full');
  }
}

// Single singleton mock commerce service instance
export const mockCommerceService = new MockCommerceService();
