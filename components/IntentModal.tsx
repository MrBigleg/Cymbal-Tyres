'use client';

import React, { useState } from 'react';
import { Product, StoreLocation, ApprovalMode, PurchaseIntent } from '@/lib/types/commerce';
import { mockCommerceService } from '@/lib/services/mockCommerceService';
import { useCommerce } from './CommerceContext';
import {
  X,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calendar,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface IntentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export function IntentModal({ isOpen, onClose, product }: IntentModalProps) {
  const { stores, selectedStoreId, showNotification } = useCommerce();

  const [storeId, setStoreId] = useState<string>(selectedStoreId);
  const [quantity, setQuantity] = useState<number>(2);
  const [maxTotalPrice, setMaxTotalPrice] = useState<number>(
    Number((product.price * 2 * 1.05).toFixed(2))
  );
  const [expiryDays, setExpiryDays] = useState<number>(14);
  const [allowSubstitution, setAllowSubstitution] = useState<boolean>(false);
  const [approvalMode, setApprovalMode] = useState<ApprovalMode>('automatic');
  const [customerName, setCustomerName] = useState<string>('Alex Mercer');
  const [customerEmail, setCustomerEmail] = useState<string>('alex.mercer@example.co.uk');
  const [customerPhone, setCustomerPhone] = useState<string>('07700 900823');
  const [vehicleReg, setVehicleReg] = useState<string>('BK72 XDA');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdIntent, setCreatedIntent] = useState<PurchaseIntent | null>(null);

  // Update max price when quantity changes if it was on default
  const handleQuantityChange = (newQty: number) => {
    setQuantity(newQty);
    setMaxTotalPrice(Number((product.price * newQty * 1.05).toFixed(2)));
  };

  if (!isOpen) return null;

  const targetStore = stores.find((s) => s.id === storeId) || stores[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const expiresAt = new Date(Date.now() + expiryDays * 24 * 3600 * 1000).toISOString();

      const intent = await mockCommerceService.createIntent({
        productId: product.id,
        productName: product.name,
        tyreSize: product.tyreSize,
        storeId: targetStore.id,
        storeName: targetStore.name,
        quantity,
        maxTotalPrice: Number(maxTotalPrice),
        unitPriceAtCreation: product.price,
        expiresAt,
        allowSubstitution,
        approvalMode,
        customerEmail,
        customerName,
        customerPhone,
        vehicleReg,
      });

      setCreatedIntent(intent);
      showNotification({
        type: 'intent',
        title: '🎯 Conditional Purchase Intent Created',
        message: `Registered intent ${intent.id} for ${product.name} at ${targetStore.city}.`,
      });
    } catch (err) {
      console.error('Failed to create purchase intent:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-900 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">Buy When Back in Stock</h3>
                <p className="text-xs text-slate-300">
                  Agentic conditional intent & stock trigger simulation
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!createdIntent ? (
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
              {/* Product summary pill */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Product Currently Unavailable
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    {product.name}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 font-mono">
                    {product.tyreSize} • £{product.price.toFixed(2)} inc. VAT
                  </div>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  Out of Stock
                </span>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Store selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Preferred Fitting Centre
                  </label>
                  <select
                    value={storeId}
                    onChange={(e) => setStoreId(e.target.value)}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.city} ({s.name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Quantity Required
                  </label>
                  <div className="flex rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden p-1">
                    {[1, 2, 4].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => handleQuantityChange(num)}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                          quantity === num
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {num} {num === 1 ? 'Tyre' : 'Tyres'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Total Price */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Max Acceptable Total (£)</span>
                    <span className="text-[11px] text-slate-500 font-normal">Cap for auto-order</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-semibold text-sm">
                      £
                    </span>
                    <input
                      type="number"
                      step="0.50"
                      min={product.price * quantity}
                      value={maxTotalPrice}
                      onChange={(e) => setMaxTotalPrice(Number(e.target.value))}
                      required
                      className="w-full text-sm pl-8 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
                    />
                  </div>
                </div>

                {/* Expiry period */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Intent Expiry Period
                  </label>
                  <select
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(Number(e.target.value))}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value={7}>7 Days (Urgent)</option>
                    <option value={14}>14 Days (Standard)</option>
                    <option value={30}>30 Days (Flexible)</option>
                    <option value={60}>60 Days (Extended)</option>
                  </select>
                </div>
              </div>

              {/* Substitution toggle */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="substitution"
                  checked={allowSubstitution}
                  onChange={(e) => setAllowSubstitution(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="substitution" className="text-xs cursor-pointer">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Allow equivalent premium substitute
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    If this specific model is delayed, match an equivalent OE premium tyre matching size {product.tyreSize} within price cap.
                  </span>
                </label>
              </div>

              {/* Approval preference selection (AP2 simulation) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Stock Replenishment Action (Approval Mode)
                </label>
                <div className="space-y-2">
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      approvalMode === 'automatic'
                        ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="approvalMode"
                      value="automatic"
                      checked={approvalMode === 'automatic'}
                      onChange={() => setApprovalMode('automatic')}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        Automatically purchase if all conditions are met
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 block mt-0.5">
                        Simulated AP2 pre-authorization. Instantly reserves stock & schedules bay appointment when replenished.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      approvalMode === 'human_present'
                        ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="approvalMode"
                      value="human_present"
                      checked={approvalMode === 'human_present'}
                      onChange={() => setApprovalMode('human_present')}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">
                        Ask me before purchasing
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 block mt-0.5">
                        Receive instant SMS/Email notification when stock arrives with a 2-hour priority lock to complete checkout.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Customer Contact Details */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Customer Notification & Matching Contact
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <input
                      type="text"
                      placeholder="Your Full Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Mobile Phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Vehicle Reg (e.g. BK72 XDA)"
                      value={vehicleReg}
                      onChange={(e) => setVehicleReg(e.target.value.toUpperCase())}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Protocol Note */}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>
                  <strong>AP2 Protocol Simulation:</strong> Payment authority is simulated for competition demonstration. In integration, this binds to UCP Agent session token.
                </span>
              </div>

              {/* Submit CTA */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    'Saving Intent...'
                  ) : (
                    <>
                      <span>Register Purchase Intent</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Confirmation Screen */
            <div className="p-6 text-center space-y-5">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border-2 border-emerald-300 dark:border-emerald-700">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Purchase Intent Confirmed
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  Your out-of-stock conditional order has been registered into the Cymbal Auto agent queue.
                </p>
              </div>

              {/* Structured Receipt Box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left font-mono text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between border-b pb-1.5 border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Intent ID:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{createdIntent.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Product:</span>
                  <span className="text-slate-900 dark:text-white font-sans font-semibold">
                    {createdIntent.productName} ({createdIntent.quantity}x)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Store:</span>
                  <span className="text-slate-900 dark:text-white font-sans">{createdIntent.storeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Max Price Cap:</span>
                  <span className="font-bold text-emerald-600">£{createdIntent.maxTotalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Approval Mode:</span>
                  <span className="font-bold uppercase text-slate-800 dark:text-slate-200">
                    {createdIntent.approvalMode === 'automatic' ? 'Autonomous (AP2)' : 'Human Approval'}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Status:</span>
                  <span className="inline-flex items-center gap-1 font-sans text-[11px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-semibold">
                    <Clock className="w-3 h-3" /> waiting_for_stock
                  </span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-xs text-blue-900 dark:text-blue-200 text-left flex items-start gap-2 max-w-md mx-auto">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Simulation Tip:</strong> Open <strong>Demo Controls</strong> (`/demo-controls`) to trigger stock replenishment for <strong>{createdIntent.storeName}</strong> to watch this intent trigger in real time!
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl transition-all"
                >
                  Close & Return to Catalog
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
