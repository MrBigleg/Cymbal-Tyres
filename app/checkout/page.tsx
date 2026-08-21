'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCommerce } from '@/components/CommerceContext';
import { mockCommerceService, eventPublisher } from '@/lib/services/mockCommerceService';
import { CheckoutSession, Order, FittingSlot } from '@/lib/types/commerce';
import {
  Lock,
  ShieldCheck,
  CreditCard,
  Calendar,
  Clock,
  MapPin,
  Car,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  ArrowRight,
  ArrowLeft,
  Info,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, selectedStore, refreshData, showNotification } = useCommerce();

  const [checkoutSession, setCheckoutSession] = useState<CheckoutSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Form Fields
  const [name, setName] = useState('Alex Mercer');
  const [email, setEmail] = useState('alex.mercer@example.co.uk');
  const [phone, setPhone] = useState('07700 900823');
  const [vehicleReg, setVehicleReg] = useState('BK72 XDA');
  const [address, setAddress] = useState('42 Highfield Lane');
  const [postcode, setPostcode] = useState('B15 3TR');

  // Fitting Slot
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00 - 11:00');

  // Payment method
  const [paymentType, setPaymentType] = useState<'simulated_card' | 'simulated_agent_wallet'>('simulated_card');
  const [simulatedCard, setSimulatedCard] = useState('4242 •••• •••• 4242');
  const [simulatedExpiry, setSimulatedExpiry] = useState('12/28');
  const [simulatedCvc, setSimulatedCvc] = useState('123');

  // Initialize or fetch checkout session
  useEffect(() => {
    async function initCheckout() {
      try {
        let active = await mockCommerceService.getActiveCheckout();
        if (!active && cart.items.length > 0) {
          active = await mockCommerceService.createCheckout();
        }
        setCheckoutSession(active);
      } catch (err) {
        console.error('Failed to init checkout:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initCheckout();

    // Subscribe to changes (e.g. if stalled or recovered from demo controls)
    const unsubState = mockCommerceService.subscribeToState(async () => {
      const active = await mockCommerceService.getActiveCheckout();
      if (active) setCheckoutSession(active);
    });

    return () => {
      unsubState();
    };
  }, [cart.items.length]);

  const handleSimulateStall = async () => {
    if (!checkoutSession) return;
    const updated = await mockCommerceService.markCheckoutStalled(checkoutSession.checkoutId);
    setCheckoutSession(updated);
  };

  const handleSimulateRecovery = async () => {
    if (!checkoutSession) return;
    const updated = await mockCommerceService.markCheckoutRecovered(
      checkoutSession.checkoutId,
      10,
      'Long Horizon Cart Recovery: 10% voucher applied'
    );
    setCheckoutSession(updated);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutSession) return;
    setIsProcessing(true);

    try {
      // Update session with final customer details
      await mockCommerceService.updateCheckout(checkoutSession.checkoutId, {
        customer: {
          name,
          email,
          phone,
          vehicleReg,
          addressLine1: address,
          postcode,
        },
        fittingSlot: {
          date: selectedDate,
          timeSlot: selectedTimeSlot,
          bayNumber: 'Bay 1 (Certified Alignment)',
        },
      });

      // Complete checkout and emit commerce.order.completed
      const order = await mockCommerceService.completeCheckout(checkoutSession.checkoutId, {
        method: paymentType === 'simulated_card' ? 'Simulated Visa (ending 4242)' : 'Simulated AP2 Agent Wallet',
      });

      await refreshData();
      router.push(`/order/${order.orderId}/complete`);
    } catch (err) {
      console.error('Failed to complete order:', err);
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
        <p className="text-xs text-slate-500 mt-3">Initializing UCP checkout session...</p>
      </div>
    );
  }

  if (!checkoutSession || checkoutSession.lineItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">No Active Checkout Session</h1>
        <p className="text-xs text-slate-500">Your basket is currently empty.</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Available Tyres</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Protocol and State Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-400">
                Session ID: {checkoutSession.checkoutId}
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  checkoutSession.status === 'STALLED'
                    ? 'bg-amber-500 text-slate-950 animate-pulse'
                    : checkoutSession.status === 'RECOVERY_OFFERED'
                    ? 'bg-emerald-400 text-slate-950 font-black'
                    : 'bg-blue-600 text-white'
                }`}
              >
                Status: {checkoutSession.status}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Universal Commerce Protocol (UCP) Structured Checkout Lifecycle
            </p>
          </div>
        </div>

        {/* Quick Simulator Buttons for Competition Operator */}
        <div className="flex items-center gap-2 text-xs">
          {checkoutSession.status === 'ACTIVE' && (
            <button
              type="button"
              onClick={handleSimulateStall}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold transition-colors flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simulate Abandon/Stall</span>
            </button>
          )}

          {checkoutSession.status === 'STALLED' && (
            <button
              type="button"
              onClick={handleSimulateRecovery}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply Recovery Offer</span>
            </button>
          )}

          <Link
            href="/demo-controls"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] flex items-center gap-1"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Demo Panel</span>
          </Link>
        </div>
      </div>

      {/* Recovery Offer Alert if applied */}
      {checkoutSession.status === 'RECOVERY_OFFERED' && (
        <div className="p-4 rounded-2xl bg-linear-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 border-2 border-emerald-500 text-emerald-950 dark:text-emerald-200 flex items-center gap-3 shadow-md">
          <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-300">
              Agent Cart Recovery Incentive Applied!
            </h4>
            <p>
              {checkoutSession.recoveryOfferMessage ||
                'A special 10% instant checkout credit has been applied to recover this session.'}
            </p>
          </div>
          <div className="text-right font-black text-emerald-700 dark:text-emerald-300 text-base">
            -£{checkoutSession.discounts.toFixed(2)}
          </div>
        </div>
      )}

      {/* Main Checkout Form & Summary */}
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Customer Details, Slot, Payment */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Customer Contact Info */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                Customer & Vehicle Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Vehicle Registration (for fitment verification)
                </label>
                <input
                  type="text"
                  required
                  value={vehicleReg}
                  onChange={(e) => setVehicleReg(e.target.value.toUpperCase())}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-amber-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Address Line 1
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Postcode
                </label>
                <input
                  type="text"
                  required
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Fitting Bay Slot Appointment */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              <div>
                <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Schedule Fitting Bay Slot at {selectedStore.city} Central
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedStore.address}, {selectedStore.postcode}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Preferred Appointment Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Available Bay Time Slot
                </label>
                <select
                  value={selectedTimeSlot}
                  onChange={(e) => setSelectedTimeSlot(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  <option value="08:30 - 09:30">08:30 – 09:30 (Morning Priority)</option>
                  <option value="10:00 - 11:00">10:00 – 11:00 (Popular)</option>
                  <option value="11:30 - 12:30">11:30 – 12:30</option>
                  <option value="14:00 - 15:00">14:00 – 15:00</option>
                  <option value="16:00 - 17:00">16:00 – 17:00 (Late Express)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 3: Simulated Payment Method */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Payment Method (Simulated)
                </h2>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                Test Sandbox Mode
              </span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentType === 'simulated_card'
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentType"
                    checked={paymentType === 'simulated_card'}
                    onChange={() => setPaymentType('simulated_card')}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      Simulated Card
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">Instant Mock</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Test card ending in 4242</p>
                </label>

                <label
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentType === 'simulated_agent_wallet'
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentType"
                    checked={paymentType === 'simulated_agent_wallet'}
                    onChange={() => setPaymentType('simulated_agent_wallet')}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      AP2 Agent Pre-Auth Wallet
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600">Simulated</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Delegated authority demo token</p>
                </label>
              </div>

              {/* Card Inputs Simulation */}
              {paymentType === 'simulated_card' && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Simulated Card Number
                    </label>
                    <input
                      type="text"
                      value={simulatedCard}
                      onChange={(e) => setSimulatedCard(e.target.value)}
                      className="w-full p-2 rounded-lg border dark:bg-slate-900 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Expiry
                      </label>
                      <input
                        type="text"
                        value={simulatedExpiry}
                        onChange={(e) => setSimulatedExpiry(e.target.value)}
                        className="w-full p-2 rounded-lg border dark:bg-slate-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        CVC
                      </label>
                      <input
                        type="text"
                        value={simulatedCvc}
                        onChange={(e) => setSimulatedCvc(e.target.value)}
                        className="w-full p-2 rounded-lg border dark:bg-slate-900 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Confirm Button */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-xs sticky top-24">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Order Breakdown
            </h3>

            {/* Line items mini preview */}
            <div className="space-y-3 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
              {checkoutSession.lineItems.map((item) => (
                <div key={item.productId} className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {item.quantity}x {item.product.name}
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono">{item.product.tyreSize}</div>
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    £{((item.product.price + item.fittingCostPerUnit) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Subtotal</span>
                <span>£{checkoutSession.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Fitting & Laser Alignment</span>
                <span className="text-emerald-600 font-semibold">
                  {checkoutSession.fittingTotal > 0
                    ? `£${checkoutSession.fittingTotal.toFixed(2)}`
                    : 'FREE IN-STORE'}
                </span>
              </div>
              {checkoutSession.discounts > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Recovery Discount</span>
                  <span>-£{checkoutSession.discounts.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline font-black text-xl text-slate-900 dark:text-white">
                <span>Total to Pay:</span>
                <span className="text-blue-600 dark:text-blue-400">
                  £{checkoutSession.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Place Order CTA */}
            <div>
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-75"
              >
                {isProcessing ? (
                  <span>Authorizing Order Event...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Complete Order (£{checkoutSession.total.toFixed(2)})</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Simulated Payment • Dispatches commerce.order.completed</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
