'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  StoreLocation,
  Product,
  Cart,
  DomainEvent,
  PurchaseIntent,
  Order,
  CheckoutSession,
} from '@/lib/types/commerce';
import { mockCommerceService, eventPublisher } from '@/lib/services/mockCommerceService';
import { SEED_STORES, SEED_PRODUCTS } from '@/lib/data/seedData';

export interface AppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'intent' | 'recovery';
  title: string;
  message: string;
  timestamp: string;
}

interface CommerceContextType {
  stores: StoreLocation[];
  selectedStoreId: string;
  selectedStore: StoreLocation;
  setSelectedStoreId: (storeId: string) => Promise<void>;
  products: Product[];
  isLoading: boolean;
  cart: Cart;
  addToCart: (productId: string, quantity: number, fittingOption?: 'in_store' | 'mobile' | 'delivery_only') => Promise<void>;
  updateCartItem: (productId: string, quantity: number, fittingOption?: 'in_store' | 'mobile' | 'delivery_only') => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  recentEvents: DomainEvent[];
  notifications: AppNotification[];
  dismissNotification: (id: string) => void;
  showNotification: (notification: Omit<AppNotification, 'id' | 'timestamp'>) => void;
  refreshData: () => Promise<void>;
}

const defaultCart: Cart = {
  items: [],
  storeId: 'birmingham',
  subtotal: 0,
  fittingTotal: 0,
  discount: 0,
  total: 0,
};

const CommerceContext = createContext<CommerceContextType | null>(null);

export function CommerceProvider({ children }: { children: React.ReactNode }) {
  const [stores, setStores] = useState<StoreLocation[]>(SEED_STORES);
  const [selectedStoreId, setSelectedStoreIdState] = useState<string>('birmingham');
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [cart, setCart] = useState<Cart>(defaultCart);
  const [recentEvents, setRecentEvents] = useState<DomainEvent[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const showNotification = useCallback((n: Omit<AppNotification, 'id' | 'timestamp'>) => {
    const newN: AppNotification = {
      ...n,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
    };
    setNotifications((prev) => [newN, ...prev.slice(0, 4)]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const [sList, pList, cData, eList] = await Promise.all([
        mockCommerceService.getStores(),
        mockCommerceService.getProducts(),
        mockCommerceService.getCart(),
        eventPublisher.getEvents(20),
      ]);
      setStores(sList);
      setProducts(pList);
      setCart(cData);
      setRecentEvents(eList);
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('cymbal_selected_store_v1');
        if (stored) setSelectedStoreIdState(stored);
      }
    } catch (err) {
      console.error('Failed to load commerce data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadInitial = async () => {
      try {
        const [sList, pList, cData, eList] = await Promise.all([
          mockCommerceService.getStores(),
          mockCommerceService.getProducts(),
          mockCommerceService.getCart(),
          eventPublisher.getEvents(20),
        ]);
        if (isMounted) {
          setStores(sList);
          setProducts(pList);
          setCart(cData);
          setRecentEvents(eList);
          if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('cymbal_selected_store_v1');
            if (stored) setSelectedStoreIdState(stored);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load initial commerce data:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    loadInitial();

    // Subscribe to mock service state changes
    const unsubState = mockCommerceService.subscribeToState(() => {
      refreshData();
    });

    // Subscribe to domain event stream
    const unsubEvents = eventPublisher.subscribe((event) => {
      setRecentEvents((prev) => [event, ...prev.slice(0, 49)]);

      if (event.eventType === 'inventory.replenished') {
        showNotification({
          type: 'info',
          title: '📦 Inventory Replenished',
          message: `${event.payload.productName || 'Stock'} replenished at ${event.payload.locationId}. Current stock: ${event.payload.availableQuantity} units.`,
        });
      } else if (event.eventType === 'commerce.checkout.stalled') {
        showNotification({
          type: 'warning',
          title: '⏳ Checkout Stalled',
          message: `Checkout ${event.payload.checkoutId?.substring(0, 10)}... marked stalled. Ready for recovery agent evaluation.`,
        });
      } else if (event.eventType === 'commerce.checkout.recovered') {
        showNotification({
          type: 'recovery',
          title: '🎁 Recovery Incentive Applied',
          message: `Special recovery offer £${event.payload.discountApplied} off applied to checkout session.`,
        });
      } else if (event.eventType === 'commerce.intent.fulfilled') {
        showNotification({
          type: 'success',
          title: '⚡ AP2 Auto-Purchase Executed',
          message: `Intent ${event.payload.intentId} fulfilled automatically upon replenishment. Order ${event.payload.orderId} placed.`,
        });
      } else if (event.eventType === 'commerce.intent.created') {
        showNotification({
          type: 'intent',
          title: '🎯 Out-of-Stock Intent Registered',
          message: `Waiting for stock replenishment at ${event.payload.storeId || event.payload.locationId}.`,
        });
      }
    });

    return () => {
      unsubState();
      unsubEvents();
    };
  }, [refreshData, showNotification]);

  const setSelectedStoreId = async (storeId: string) => {
    setSelectedStoreIdState(storeId);
    await mockCommerceService.setSelectedStore(storeId);
    await refreshData();
  };

  const addToCart = async (
    productId: string,
    quantity: number,
    fittingOption: 'in_store' | 'mobile' | 'delivery_only' = 'in_store'
  ) => {
    const updated = await mockCommerceService.addToCart(productId, quantity, fittingOption);
    setCart(updated);
    showNotification({
      type: 'success',
      title: 'Added to Basket',
      message: `${quantity} tyre(s) added for fitting at ${selectedStore?.name || 'selected store'}.`,
    });
  };

  const updateCartItem = async (
    productId: string,
    quantity: number,
    fittingOption?: 'in_store' | 'mobile' | 'delivery_only'
  ) => {
    const updated = await mockCommerceService.updateCartItem(productId, quantity, fittingOption);
    setCart(updated);
  };

  const removeFromCart = async (productId: string) => {
    const updated = await mockCommerceService.removeFromCart(productId);
    setCart(updated);
  };

  const clearCart = async () => {
    const updated = await mockCommerceService.clearCart();
    setCart(updated);
  };

  const selectedStore = stores.find((s) => s.id === selectedStoreId) || stores[0] || SEED_STORES[0];

  return (
    <CommerceContext.Provider
      value={{
        stores,
        selectedStoreId,
        selectedStore,
        setSelectedStoreId,
        products,
        isLoading,
        cart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        recentEvents,
        notifications,
        dismissNotification,
        showNotification,
        refreshData,
      }}
    >
      {children}
    </CommerceContext.Provider>
  );
}

export function useCommerce() {
  const ctx = useContext(CommerceContext);
  if (!ctx) throw new Error('useCommerce must be used within CommerceProvider');
  return ctx;
}
