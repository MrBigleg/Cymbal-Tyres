'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useCommerce } from '@/components/CommerceContext';
import { mockCommerceService, eventPublisher } from '@/lib/services/mockCommerceService';
import {
  Order,
  CheckoutSession,
  PurchaseIntent,
  SurveyResponse,
  DomainEvent,
  StockState,
} from '@/lib/types/commerce';
import {
  Sliders,
  RotateCcw,
  Package,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  HeartHandshake,
  Activity,
  Copy,
  Trash2,
  ArrowRight,
  ExternalLink,
  Plus,
  Play,
  Zap,
} from 'lucide-react';

export default function DemoControlsPage() {
  const {
    stores,
    products,
    refreshData,
    showNotification,
    recentEvents,
  } = useCommerce();

  // Selected store and product for inventory mutations
  const [invStoreId, setInvStoreId] = useState('birmingham');
  const [invProductId, setInvProductId] = useState('michelin-pilot-sport-5');
  const [replenishQty, setReplenishQty] = useState(8);
  const [replenishPrice, setReplenishPrice] = useState(119.99);

  // Entities
  const [checkouts, setCheckouts] = useState<CheckoutSession[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [intents, setIntents] = useState<PurchaseIntent[]>([]);
  const [surveys, setSurveys] = useState<SurveyResponse[]>([]);
  const [copiedEventId, setCopiedEventId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'checkout' | 'orders' | 'intents' | 'survey' | 'events'>('inventory');

  const loadAllData = useCallback(async () => {
    try {
      const [cList, oList, iList, sList] = await Promise.all([
        mockCommerceService.getCheckouts(),
        mockCommerceService.getOrders(),
        mockCommerceService.getIntents(),
        mockCommerceService.getAllSurveys(),
      ]);
      setCheckouts(cList);
      setOrders(oList);
      setIntents(iList);
      setSurveys(sList);
    } catch (err) {
      console.error('Failed to load demo data', err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchInitial = async () => {
      try {
        const [cList, oList, iList, sList] = await Promise.all([
          mockCommerceService.getCheckouts(),
          mockCommerceService.getOrders(),
          mockCommerceService.getIntents(),
          mockCommerceService.getAllSurveys(),
        ]);
        if (mounted) {
          setCheckouts(cList);
          setOrders(oList);
          setIntents(iList);
          setSurveys(sList);
        }
      } catch (err) {
        console.error('Failed to fetch initial demo data', err);
      }
    };

    fetchInitial();

    const unsub = mockCommerceService.subscribeToState(() => {
      loadAllData();
    });
    return () => {
      mounted = false;
      unsub();
    };
  }, [loadAllData]);

  // --- INVENTORY ACTIONS ---
  const handleSetStock = async (state: StockState, qty: number) => {
    await mockCommerceService.updateStock(invProductId, invStoreId, qty, state);
    await refreshData();
    showNotification({
      type: 'info',
      title: 'Inventory Updated',
      message: `${invProductId} set to ${state} (${qty} units) at ${invStoreId}.`,
    });
  };

  const handleReplenishStock = async () => {
    const { product, event } = await mockCommerceService.replenishStock(
      invProductId,
      invStoreId,
      replenishQty,
      replenishPrice
    );
    await refreshData();
    await loadAllData();
    showNotification({
      type: 'success',
      title: '📦 Inventory Replenished',
      message: `Added ${replenishQty} units of ${product.name} at ${invStoreId} @ £${replenishPrice}.`,
    });
  };

  // --- CHECKOUT ACTIONS ---
  const handleCreateActiveCheckout = async () => {
    const session = await mockCommerceService.createCheckout();
    await loadAllData();
    showNotification({
      type: 'success',
      title: 'Active Checkout Created',
      message: `Session ${session.checkoutId} ready for testing.`,
    });
  };

  const handleMarkStalled = async (checkoutId?: string) => {
    const targetId = checkoutId || checkouts[0]?.checkoutId;
    if (!targetId) {
      const created = await mockCommerceService.createCheckout();
      await mockCommerceService.markCheckoutStalled(created.checkoutId);
    } else {
      await mockCommerceService.markCheckoutStalled(targetId);
    }
    await loadAllData();
    showNotification({
      type: 'warning',
      title: 'Checkout Marked Stalled',
      message: `Event commerce.checkout.stalled emitted.`,
    });
  };

  const handleMarkRecovered = async (checkoutId?: string) => {
    const targetId = checkoutId || checkouts.find((c) => c.status === 'STALLED')?.checkoutId || checkouts[0]?.checkoutId;
    if (!targetId) {
      alert('Please create or stall a checkout first');
      return;
    }
    await mockCommerceService.markCheckoutRecovered(
      targetId,
      10,
      'Cart Recovery Agent: 10% instant checkout credit applied'
    );
    await loadAllData();
    showNotification({
      type: 'recovery',
      title: 'Checkout Recovered',
      message: `Recovery offer applied with coupon RECOVER10.`,
    });
  };

  // --- ORDER ACTIONS ---
  const handleCreateMockOrder = async () => {
    const session = await mockCommerceService.createCheckout();
    const order = await mockCommerceService.completeCheckout(session.checkoutId, {
      method: 'Simulated Demo Visa',
    });
    await refreshData();
    await loadAllData();
    showNotification({
      type: 'success',
      title: 'Mock Order Completed',
      message: `Order ${order.orderNumber} placed at ${order.storeName}.`,
    });
  };

  // --- SURVEY SIMULATION ACTIONS ---
  const handleSimulateSurvey = async (score: number, defaultComment: string) => {
    const sampleToken = `srv_sim_${Date.now()}`;
    const sampleOrder = orders[0];
    await mockCommerceService.submitSurvey({
      surveyToken: sampleToken,
      orderId: sampleOrder?.orderId || `ord_demo_${Date.now()}`,
      locationId: invStoreId,
      storeName: stores.find((s) => s.id === invStoreId)?.name || 'Cymbal Auto',
      score,
      comment: defaultComment,
      customerName: 'Alex Mercer (Simulated)',
      submittedAt: new Date().toISOString(),
    });
    await loadAllData();
    showNotification({
      type: 'success',
      title: `Survey ${score}/10 Recorded`,
      message: `Emitted commerce.survey.submitted event for ${invStoreId}.`,
    });
  };

  // --- RESET DEMO ---
  const handleResetDemo = async () => {
    if (confirm('Reset all demo state (inventory, checkouts, orders, intents, surveys, events) back to default seed?')) {
      setIsResetting(true);
      await mockCommerceService.resetAllDemoData();
      await refreshData();
      await loadAllData();
      setIsResetting(false);
      showNotification({
        type: 'info',
        title: 'Demo Environment Reset',
        message: 'All stores, products, inventory, and mock event logs restored.',
      });
    }
  };

  const copyEventJson = (event: DomainEvent) => {
    navigator.clipboard.writeText(JSON.stringify(event, null, 2));
    setCopiedEventId(event.eventId);
    setTimeout(() => setCopiedEventId(null), 2000);
  };

  const selectedProduct = products.find((p) => p.id === invProductId) || products[0];
  const currentProductStock = selectedProduct?.stockByStore[invStoreId];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold">
            <Sliders className="w-3.5 h-3.5" />
            <span>OPERATOR CONTROL SUITE • AGENTIC COMMERCE TEST HARNESS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Cymbal Auto Demo & Protocol Controls
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Simulate stock shortages, out-of-stock conditional purchase intents (AP2), abandoned checkout stalls, recovery agent offers, and real-time domain events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleResetDemo}
            disabled={isResetting}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isResetting ? 'Resetting...' : 'Reset Demo to Default'}</span>
          </button>

          <Link
            href="/shop"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center gap-2"
          >
            <span>Open Customer Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2 text-xs font-bold">
        {[
          { id: 'inventory', label: '1. Inventory & Replenish', icon: Package, badge: null },
          { id: 'checkout', label: '2. Abandoned Checkout', icon: ShoppingCart, badge: checkouts.length },
          { id: 'intents', label: '3. Out-of-Stock Intents', icon: Zap, badge: intents.length },
          { id: 'orders', label: '4. Orders', icon: CheckCircle2, badge: orders.length },
          { id: 'survey', label: '5. Post-Purchase Survey', icon: HeartHandshake, badge: surveys.length },
          { id: 'events', label: '6. Domain Event Bus', icon: Activity, badge: recentEvents.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-3 px-4 border-b-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== null && tab.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-800 dark:text-slate-300">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: INVENTORY & REPLENISHMENT */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Multi-Store Inventory Mutation
              </h2>
              <span className="text-xs font-mono text-slate-400">InventoryProvider</span>
            </div>

            {/* Store & Product Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Store Depot
                </label>
                <select
                  value={invStoreId}
                  onChange={(e) => setInvStoreId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Product Model
                </label>
                <select
                  value={invProductId}
                  onChange={(e) => setInvProductId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.tyreSize})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Current Stock Snapshot */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">
                  Current Status at {invStoreId}:
                </div>
                <div className="text-slate-500 font-mono mt-0.5">
                  {selectedProduct?.name} • £{selectedProduct?.price.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`font-bold px-2.5 py-1 rounded-full text-xs ${
                    currentProductStock?.state === 'In Stock'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : currentProductStock?.state === 'Low Stock'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {currentProductStock?.state} ({currentProductStock?.quantity} units)
                </span>
              </div>
            </div>

            {/* Instant State Presets */}
            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-700 dark:text-slate-300">
                Instant State Trigger
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSetStock('In Stock', 10)}
                  className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors"
                >
                  Set In Stock (10)
                </button>
                <button
                  type="button"
                  onClick={() => handleSetStock('Low Stock', 2)}
                  className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors"
                >
                  Set Low Stock (2)
                </button>
                <button
                  type="button"
                  onClick={() => handleSetStock('Out of Stock', 0)}
                  className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-xs font-bold hover:bg-rose-100 transition-colors"
                >
                  Set Out of Stock (0)
                </button>
              </div>
            </div>

            {/* Replenishment Event Action */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Simulate Supplier Replenishment Event
                </h3>
                <p className="text-xs text-slate-500">
                  Emits <code className="font-mono text-blue-600">inventory.replenished</code> and automatically fulfills or alerts waiting purchase intents.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Units to Add</label>
                  <input
                    type="number"
                    value={replenishQty}
                    onChange={(e) => setReplenishQty(Number(e.target.value))}
                    min={1}
                    className="w-full p-2 rounded-xl border dark:bg-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Replenishment Price (£)</label>
                  <input
                    type="number"
                    step="0.50"
                    value={replenishPrice}
                    onChange={(e) => setReplenishPrice(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border dark:bg-slate-800 font-bold"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleReplenishStock}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Replenish Stock & Emit Domain Event</span>
              </button>
            </div>
          </div>

          {/* Quick Matrix Overview */}
          <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Live Stock Matrix Across All Stores
            </h3>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2"
                >
                  <div className="font-bold text-slate-900 dark:text-white flex justify-between">
                    <span>{prod.name}</span>
                    <span className="font-mono text-blue-600">£{prod.price.toFixed(2)}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-[11px]">
                    {stores.map((st) => {
                      const stInfo = prod.stockByStore[st.id];
                      return (
                        <div
                          key={st.id}
                          className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center"
                        >
                          <div className="text-slate-400 uppercase font-semibold text-[9px] truncate">
                            {st.city}
                          </div>
                          <div
                            className={`font-bold mt-0.5 ${
                              stInfo?.state === 'In Stock'
                                ? 'text-emerald-600'
                                : stInfo?.state === 'Low Stock'
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {stInfo?.quantity || 0} qty
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ABANDONED CHECKOUT & RECOVERY */}
      {activeTab === 'checkout' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                Abandoned Checkout & Long Horizon Recovery Simulation
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                State transitions between ACTIVE → STALLED → RECOVERY_OFFERED → COMPLETED.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCreateActiveCheckout}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Active Checkout</span>
              </button>

              <button
                type="button"
                onClick={() => handleMarkStalled()}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Mark Stalled (Stall Event)</span>
              </button>

              <button
                type="button"
                onClick={() => handleMarkRecovered()}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate Agent Recovery Offer</span>
              </button>
            </div>
          </div>

          {/* Checkout Sessions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Session ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Store</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {checkouts.map((chk) => (
                  <tr key={chk.checkoutId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-mono font-bold text-blue-600">{chk.checkoutId}</td>
                    <td className="p-3">
                      <div className="font-semibold">{chk.customer.name}</div>
                      <div className="text-slate-400 text-[10px]">{chk.customer.email}</div>
                    </td>
                    <td className="p-3 uppercase font-semibold">{chk.storeId}</td>
                    <td className="p-3">{chk.lineItems.reduce((acc, i) => acc + i.quantity, 0)} tyres</td>
                    <td className="p-3 font-bold">£{chk.total.toFixed(2)}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          chk.status === 'STALLED'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                            : chk.status === 'RECOVERY_OFFERED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black'
                            : chk.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {chk.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleMarkStalled(chk.checkoutId)}
                        className="text-amber-600 hover:underline font-semibold"
                      >
                        Stall
                      </button>
                      <button
                        onClick={() => handleMarkRecovered(chk.checkoutId)}
                        className="text-emerald-600 hover:underline font-semibold"
                      >
                        Offer Recovery
                      </button>
                      <Link
                        href="/checkout"
                        className="text-blue-600 hover:underline font-bold"
                      >
                        Open UI →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {checkouts.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                No checkout sessions in memory. Click &ldquo;Create Active Checkout&rdquo; to start.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: OUT-OF-STOCK PURCHASE INTENTS (AP2) */}
      {activeTab === 'intents' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Registered Out-of-Stock Purchase Intents (AP2 Queue)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Structured pre-authorizations created when customers click &ldquo;Buy when back in stock&rdquo;.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Intent ID</th>
                  <th className="p-3">Product</th>
                  <th className="p-3">Store</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Max Cap</th>
                  <th className="p-3">Approval Mode</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {intents.map((intent) => (
                  <tr key={intent.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-mono font-bold text-blue-600">{intent.id}</td>
                    <td className="p-3">
                      <div className="font-bold">{intent.productName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{intent.tyreSize}</div>
                    </td>
                    <td className="p-3">{intent.storeName}</td>
                    <td className="p-3 font-bold">{intent.quantity}</td>
                    <td className="p-3 font-bold text-emerald-600">£{intent.maxTotalPrice.toFixed(2)}</td>
                    <td className="p-3">
                      <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        {intent.approvalMode === 'automatic' ? '⚡ Autonomous AP2' : '👤 Human Approval'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          intent.status === 'fulfilled'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : intent.status === 'waiting_for_stock'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {intent.status}
                      </span>
                      {intent.fulfillmentNote && (
                        <div className="text-[10px] text-slate-500 mt-1">{intent.fulfillmentNote}</div>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {intent.status === 'waiting_for_stock' && (
                        <button
                          onClick={async () => {
                            await mockCommerceService.cancelIntent(intent.id);
                            await loadAllData();
                          }}
                          className="text-rose-600 hover:underline font-semibold"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {intents.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active purchase intents in queue. Go to an out-of-stock product (e.g. Michelin PS5 at Birmingham) and click &ldquo;Buy when back in stock&rdquo;!
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Completed Orders Ledger
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Orders generate <code className="font-mono text-blue-600">commerce.order.completed</code> and a unique survey handoff token.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCreateMockOrder}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Mock Order</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Order Number</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Store</th>
                  <th className="p-3">Total Paid</th>
                  <th className="p-3">PIN</th>
                  <th className="p-3">Survey Token</th>
                  <th className="p-3 text-right">Links</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.map((ord) => (
                  <tr key={ord.orderId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-mono font-bold text-blue-600">{ord.orderNumber}</td>
                    <td className="p-3">{ord.customer.name}</td>
                    <td className="p-3">{ord.storeName}</td>
                    <td className="p-3 font-bold">£{ord.total.toFixed(2)}</td>
                    <td className="p-3 font-mono font-bold text-amber-600">{ord.collectionPin}</td>
                    <td className="p-3 font-mono text-[10px] text-slate-400">{ord.surveyToken}</td>
                    <td className="p-3 text-right space-x-2">
                      <Link
                        href={`/order/${ord.orderId}/complete`}
                        className="text-blue-600 hover:underline font-bold"
                      >
                        Receipt →
                      </Link>
                      <Link
                        href={`/survey/${ord.surveyToken}`}
                        className="text-emerald-600 hover:underline font-bold"
                      >
                        Survey →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                No orders placed yet. Complete checkout or click &ldquo;Create Mock Order&rdquo;.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: SURVEY SIMULATION & FEEDBACK */}
      {activeTab === 'survey' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-blue-600" />
                Post-Purchase Survey Simulation
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Quickly trigger promoter, passive, or detractor feedback payloads.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSimulateSurvey(10, 'Outstanding fitting speed and flawless alignment check!')}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                Simulate 10/10 (Promoter)
              </button>

              <button
                type="button"
                onClick={() => handleSimulateSurvey(8, 'Collection took slightly longer than expected.')}
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
              >
                Simulate 8/10 (Passive)
              </button>

              <button
                type="button"
                onClick={() => handleSimulateSurvey(3, 'Fitting bay was delayed by 40 minutes with no coffee.')}
                className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                Simulate 3/10 (Detractor)
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Store</th>
                  <th className="p-3">NPS Score</th>
                  <th className="p-3">Customer Feedback</th>
                  <th className="p-3">Order Ref</th>
                  <th className="p-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {surveys.map((srv, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-semibold uppercase">{srv.locationId}</td>
                    <td className="p-3">
                      <span
                        className={`font-black px-2.5 py-1 rounded-full text-xs ${
                          srv.score >= 9
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : srv.score >= 7
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {srv.score} / 10
                      </span>
                    </td>
                    <td className="p-3 max-w-xs">{srv.comment || '—'}</td>
                    <td className="p-3 font-mono text-slate-400">{srv.orderId}</td>
                    <td className="p-3 text-right font-mono text-[10px] text-slate-400">
                      {new Date(srv.submittedAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {surveys.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                No survey responses recorded yet. Click one of the simulation buttons above.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: DOMAIN EVENT BUS */}
      {activeTab === 'events' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Live Domain Event Bus Stream
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Real-time events published via <code className="font-mono text-blue-600">EventPublisher</code> interface (ready for Cloud Pub/Sub).
              </p>
            </div>

            <button
              type="button"
              onClick={async () => {
                await eventPublisher.clearEvents();
                await refreshData();
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Log</span>
            </button>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {recentEvents.map((evt) => (
              <div
                key={evt.eventId}
                className="p-4 rounded-2xl bg-slate-900 text-white font-mono text-xs space-y-2 border border-slate-800 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        evt.eventType.includes('order')
                          ? 'bg-emerald-600 text-white'
                          : evt.eventType.includes('stalled')
                          ? 'bg-amber-600 text-white'
                          : evt.eventType.includes('replenish')
                          ? 'bg-blue-600 text-white'
                          : evt.eventType.includes('intent')
                          ? 'bg-indigo-600 text-white'
                          : 'bg-purple-600 text-white'
                      }`}
                    >
                      {evt.eventType}
                    </span>
                    <span className="text-slate-400 text-[10px]">{evt.eventId}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{evt.timestamp}</span>
                    <button
                      onClick={() => copyEventJson(evt)}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Copy Event JSON"
                    >
                      {copiedEventId === evt.eventId ? (
                        <span className="text-emerald-400 text-[10px]">Copied!</span>
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <pre className="text-[11px] text-emerald-400 bg-slate-950 p-2.5 rounded-lg overflow-x-auto leading-relaxed">
                  {JSON.stringify(evt.payload, null, 2)}
                </pre>
              </div>
            ))}

            {recentEvents.length === 0 && (
              <div className="p-12 text-center text-slate-400 text-xs">
                No events emitted in current session. Perform storefront actions to stream events.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
