'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCommerce } from '@/components/CommerceContext';
import { StoreSelectorModal } from '@/components/StoreSelectorModal';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  MapPin,
  Wrench,
  Truck,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Tag,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    selectedStore,
    updateCartItem,
    removeFromCart,
    clearCart,
  } = useCommerce();

  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  const cartItemCount = cart.items.reduce((acc, i) => acc + i.quantity, 0);

  if (cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center border border-slate-200 dark:border-slate-700">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Your Tyre Basket is Empty
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Choose your vehicle tyres and select your preferred fitting centre or mobile technician service.
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Available Tyres</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <ShoppingCart className="w-7 h-7 text-blue-600" />
            Your Tyre Basket
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review your selected tyres and book your fitting appointment.
          </p>
        </div>

        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-semibold self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All Items</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Active Depot Bar */}
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">
                  Designated Fitting Autocentre:
                </span>{' '}
                <span className="text-slate-700 dark:text-slate-300">
                  {selectedStore.name} ({selectedStore.postcode})
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsStoreModalOpen(true)}
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
            >
              Change
            </button>
          </div>

          {/* Items */}
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div
                key={`${item.productId}-${item.fittingOption}`}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 p-2 flex items-center justify-center shrink-0">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      width={80}
                      height={80}
                      className="object-contain max-h-16"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="text-xs uppercase font-bold text-slate-500">
                      {item.product.brand}
                    </div>
                    <Link
                      href={`/product/${item.productId}`}
                      className="font-bold text-base text-slate-900 dark:text-white hover:text-blue-600 transition-colors block truncate"
                    >
                      {item.product.name}
                    </Link>
                    <div className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                      {item.product.tyreSize}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                      {item.fittingOption === 'mobile' ? (
                        <span className="flex items-center gap-1 text-blue-600 font-semibold">
                          <Truck className="w-3.5 h-3.5" /> Mobile Van Fitting (+£15.00/tyre)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                          <Wrench className="w-3.5 h-3.5" /> Free In-Store Fitting Included
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantity & Unit Total */}
                <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <button
                      type="button"
                      onClick={() => updateCartItem(item.productId, item.quantity - 1, item.fittingOption)}
                      className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 font-bold text-xs text-slate-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCartItem(item.productId, item.quantity + 1, item.fittingOption)}
                      className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                      title="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right min-w-[80px]">
                    <div className="text-base font-extrabold text-slate-900 dark:text-white">
                      £{((item.product.price + item.fittingCostPerUnit) * item.quantity).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      £{(item.product.price + item.fittingCostPerUnit).toFixed(2)} ea
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.productId)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping Tyres</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout CTA */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-xs">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Tyres Subtotal ({cartItemCount} items)</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  £{cart.subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Technician Fitting & Balancing</span>
                <span className="font-semibold text-emerald-600">
                  {cart.fittingTotal > 0 ? `£${cart.fittingTotal.toFixed(2)}` : 'FREE IN-STORE'}
                </span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Environmental Disposal & New Valves</span>
                <span className="font-semibold text-emerald-600">INCLUDED</span>
              </div>

              {cart.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold pt-1">
                  <span>Discount Applied ({cart.discountCode || 'PROMO'})</span>
                  <span>-£{cart.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline font-black text-lg sm:text-xl text-slate-900 dark:text-white">
                <span>Total Due:</span>
                <span className="text-blue-600 dark:text-blue-400">£{cart.total.toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-slate-400 text-right">Includes 20% UK VAT</p>
            </div>

            {/* Reassurance list */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs space-y-2 text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Hunter 3D Alignment check included</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Next-day bay slots ready at {selectedStore.city}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <div>
              <Link
                href="/checkout"
                className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <StoreSelectorModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
      />
    </div>
  );
}
