'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCommerce } from '@/components/CommerceContext';
import { TyreBadge } from '@/components/TyreBadge';
import { StockStatusBadge } from '@/components/StockStatusBadge';
import { IntentModal } from '@/components/IntentModal';
import { StoreSelectorModal } from '@/components/StoreSelectorModal';
import {
  ShoppingCart,
  Clock,
  MapPin,
  ShieldCheck,
  Wrench,
  Truck,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Car,
  ChevronRight,
} from 'lucide-react';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { products, selectedStore, selectedStoreId, addToCart, stores } = useCommerce();

  const [quantity, setQuantity] = useState<number>(2);
  const [fittingOption, setFittingOption] = useState<'in_store' | 'mobile' | 'delivery_only'>('in_store');
  const [isIntentModalOpen, setIsIntentModalOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const product = products.find((p) => p.id === resolvedParams.id);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Product Not Found</h1>
        <p className="text-sm text-slate-500">The tyre you requested does not exist in our catalog.</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>
    );
  }

  const stockInfo = product.stockByStore[selectedStoreId] || {
    state: 'Out of Stock',
    quantity: 0,
    bayAvailable: false,
  };

  const isOutOfStock = stockInfo.state === 'Out of Stock' || stockInfo.quantity === 0;

  const unitFittingFee = fittingOption === 'mobile' ? 15 : 0;
  const itemSubtotal = product.price * quantity;
  const itemFittingTotal = unitFittingFee * quantity;
  const grandTotal = itemSubtotal + itemFittingTotal;

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart(product.id, quantity, fittingOption);
      router.push('/cart');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link href="/shop" className="hover:text-blue-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Catalog</span>
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-700 dark:text-slate-200">{product.brand}</span>
        <span>/</span>
        <span className="truncate max-w-[200px] sm:max-w-none text-slate-900 dark:text-white font-bold">
          {product.name}
        </span>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Image & EU Tyre Label */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 flex items-center justify-center relative overflow-hidden shadow-xs">
            <div className="relative h-72 sm:h-96 w-full flex items-center justify-center">
              <Image
                src={product.image}
                alt={product.name}
                width={500}
                height={500}
                priority
                className="object-contain max-h-80 drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="px-3 py-1 text-xs font-black uppercase rounded-full bg-slate-900 text-white shadow-md">
                {product.brand}
              </span>
              {product.vehicleType === 'EV / Hybrid' && (
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-600 text-white shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> EV Certified
                </span>
              )}
            </div>
          </div>

          {/* EU Tyre Label Spec Box */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Official EU Tyre Label Ratings
              </h3>
              <span className="text-[11px] text-slate-500">Reg. (EU) 2020/740</span>
            </div>

            <TyreBadge
              fuel={product.fuelEfficiency}
              wetGrip={product.wetGrip}
              noiseDb={product.noiseLevelDb}
              size="md"
            />

            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Fuel Efficiency</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">Class {product.fuelEfficiency}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Wet Grip</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">Class {product.wetGrip}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Exterior Noise</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{product.noiseLevelDb} dB</span>
              </div>
            </div>
          </div>

          {/* Other Stores Availability Matrix */}
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
              National Network Availability
            </h4>
            <div className="space-y-2">
              {stores.map((s) => {
                const sStock = product.stockByStore[s.id];
                const isCur = s.id === selectedStoreId;
                return (
                  <div
                    key={s.id}
                    className={`p-3 rounded-xl flex items-center justify-between text-xs border ${
                      isCur
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 font-semibold'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>{s.name}</span>
                      {isCur && <span className="text-[10px] text-blue-600 font-bold">(Your Depot)</span>}
                    </div>
                    <StockStatusBadge
                      state={sStock?.state || 'Out of Stock'}
                      quantity={sStock?.quantity}
                      size="sm"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, Store Bay Booking & Purchase / Intent Actions */}
        <div className="lg:col-span-6 space-y-6">
          {/* Title and Specs Header */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5 shadow-xs">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                <span>{product.season} Tyre</span>
                <span>•</span>
                <span>{product.vehicleType}</span>
                {product.runFlat && (
                  <>
                    <span>•</span>
                    <span className="text-amber-600 font-bold">Run-Flat (RFT)</span>
                  </>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {product.name}
              </h1>

              <div className="mt-2 inline-block px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono font-bold text-sm text-slate-800 dark:text-slate-200">
                {product.tyreSize}
              </div>
            </div>

            {/* Price section */}
            <div className="flex items-baseline justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                  £{product.price.toFixed(2)}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Per tyre • Fully fitted inc. VAT, standard balancing, and new valve
                </p>
              </div>

              {product.recommendedRetailPrice && (
                <div className="text-right">
                  <span className="text-xs text-slate-400 line-through">
                    RRP £{product.recommendedRetailPrice.toFixed(2)}
                  </span>
                  <div className="text-xs font-bold text-emerald-600">
                    Save £{(product.recommendedRetailPrice - product.price).toFixed(2)} each
                  </div>
                </div>
              )}
            </div>

            {/* Current Store Status Banner */}
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                isOutOfStock
                  ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200'
                  : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shrink-0 shadow-xs">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs font-bold">{selectedStore.name}</div>
                  <div className="text-[11px] opacity-80">
                    {isOutOfStock
                      ? 'Out of stock at this location'
                      : `${stockInfo.quantity} tyres in stock & ready for bay fitting`}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsStoreModalOpen(true)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
              >
                Change Store
              </button>
            </div>

            {/* Fitting Options Selector */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Select Fitting Method
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFittingOption('in_store')}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                    fittingOption === 'in_store'
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                      <Wrench className="w-3.5 h-3.5 text-blue-600" />
                      <span>In-Store Autocentre</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      FREE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Book precision bay fitting at {selectedStore.city}.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFittingOption('mobile')}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                    fittingOption === 'mobile'
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                      <Truck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Mobile Van Fitting</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      +£15 / tyre
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    We come to your home or office driveway.
                  </p>
                </button>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Quantity
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuantity(num)}
                    className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                      quantity === num
                        ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {num} {num === 1 ? 'Tyre' : 'Tyres'}
                  </button>
                ))}
              </div>
            </div>

            {/* Cost Summary Box */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>
                  {quantity}x {product.name} (£{product.price.toFixed(2)} ea)
                </span>
                <span>£{itemSubtotal.toFixed(2)}</span>
              </div>
              {unitFittingFee > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Mobile Van Fitting ({quantity}x £15.00)</span>
                  <span>£{itemFittingTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Total Payable:</span>
                <span className="text-blue-600 dark:text-blue-400">£{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* PRIMARY CTA: In-Stock Purchase vs Out-of-Stock Intent */}
            {isOutOfStock ? (
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsIntentModalOpen(true)}
                  className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Clock className="w-5 h-5 text-slate-950" />
                  <span>Buy when back in stock</span>
                </button>
                <div className="text-xs text-center text-slate-500 dark:text-slate-400 space-y-1">
                  <p>
                    Currently out of stock at <strong>{selectedStore.name}</strong>.
                  </p>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                    Set a max price & auto-purchase intent via simulated AP2 agent.
                  </p>
                </div>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{isAdding ? 'Adding to Basket...' : 'Add to Basket & Book Fitting'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Description & Technical Features */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5 shadow-xs">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Product Overview & Engineering
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {product.description}
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Key Performance Highlights
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Out of stock Intent Modal */}
      {isIntentModalOpen && (
        <IntentModal
          isOpen={isIntentModalOpen}
          onClose={() => setIsIntentModalOpen(false)}
          product={product}
        />
      )}

      {/* Store Selector Modal */}
      <StoreSelectorModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        productIdToCheck={product.id}
      />
    </div>
  );
}
