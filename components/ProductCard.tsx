'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types/commerce';
import { useCommerce } from './CommerceContext';
import { StockStatusBadge } from './StockStatusBadge';
import { IntentModal } from './IntentModal';
import { TyreBadge } from './TyreBadge';
import { Clock, ShoppingCart, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { selectedStoreId, selectedStore, addToCart } = useCommerce();
  const [isIntentModalOpen, setIsIntentModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const stockInfo = product.stockByStore[selectedStoreId] || {
    state: 'Out of Stock',
    quantity: 0,
    bayAvailable: false,
  };

  const isOutOfStock = stockInfo.state === 'Out of Stock' || stockInfo.quantity === 0;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    try {
      await addToCart(product.id, 2, 'in_store');
    } finally {
      setIsAdding(false);
    }
  };

  const [viewPackage, setViewPackage] = useState(false);

  const currentImage = viewPackage && product.wheelPackageImage ? product.wheelPackageImage : product.image;

  return (
    <>
      <div
        className={`bg-white rounded-xl shadow-xs border flex flex-col p-5 overflow-hidden transition-all duration-200 hover:shadow-md ${
          isOutOfStock
            ? 'border-2 border-rose-100'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        {/* Top Header: Badge & Price */}
        <div className="flex justify-between items-start mb-3">
          <StockStatusBadge
            state={stockInfo.state}
            quantity={stockInfo.quantity}
            storeName={isOutOfStock ? selectedStore.city : undefined}
            size="sm"
          />
          <div className="text-right">
            <span className="text-lg font-bold text-slate-900 leading-none">
              £{product.price.toFixed(2)}
            </span>
            <div className="text-[9px] uppercase font-bold text-slate-400">
              inc. VAT & fitting
            </div>
          </div>
        </div>

        {/* Tyre Image / Visual Container with Style Toggle */}
        <div className="relative mb-4">
          <Link
            href={`/product/${product.id}`}
            className="h-44 sm:h-48 bg-slate-50/80 rounded-xl flex items-center justify-center relative overflow-hidden group/img border border-slate-100"
          >
            <Image
              src={currentImage}
              alt={product.name}
              width={260}
              height={260}
              className="object-contain max-h-40 sm:max-h-44 group-hover/img:scale-105 transition-transform duration-300 drop-shadow-md"
              referrerPolicy="no-referrer"
            />
            {product.vehicleType === 'EV / Hybrid' && (
              <span className="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 bg-emerald-600 text-white rounded shadow-xs flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> EV
              </span>
            )}
          </Link>

          {/* Quick toggle between Tyre only and Fitted Wheel Package */}
          {product.wheelPackageImage && (
            <div className="absolute bottom-2 right-2 flex bg-white/90 backdrop-blur-xs border border-slate-200 rounded-lg p-0.5 shadow-xs text-[10px] font-semibold">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setViewPackage(false);
                }}
                className={`px-2 py-0.5 rounded ${
                  !viewPackage
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tyre
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setViewPackage(true);
                }}
                className={`px-2 py-0.5 rounded ${
                  viewPackage
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Wheel
              </button>
            </div>
          )}
        </div>

        {/* Tyre Brand & Name */}
        <div className="mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            {product.brand} • {product.season}
          </span>
          <Link
            href={`/product/${product.id}`}
            className="font-bold text-slate-900 hover:text-blue-600 transition-colors leading-tight text-base line-clamp-1"
          >
            {product.name}
          </Link>
        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-500 mb-3 flex-1 line-clamp-2">
          {product.shortDescription}
        </p>

        {/* Spec Grid */}
        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500 uppercase mb-3">
          <div className="bg-slate-50 p-1.5 rounded text-center truncate">
            Size: {product.tyreSize}
          </div>
          <div className="bg-slate-50 p-1.5 rounded text-center truncate">
            {isOutOfStock ? `Depot: ${selectedStore.city}` : 'Fit: 45 min'}
          </div>
        </div>

        {/* EU Rating Tag Bar */}
        <div className="mb-4">
          <TyreBadge
            fuel={product.fuelEfficiency}
            wetGrip={product.wetGrip}
            noiseDb={product.noiseLevelDb}
            size="sm"
          />
        </div>

        {/* Primary CTA Button */}
        {isOutOfStock ? (
          <button
            type="button"
            onClick={() => setIsIntentModalOpen(true)}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 active:scale-98 transition-colors flex items-center justify-center space-x-2 shadow-xs"
          >
            <Clock className="w-4 h-4 text-white" />
            <span>Buy when back in stock</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isAdding}
            className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-slate-800 active:scale-98 transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-75"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{isAdding ? 'Adding...' : 'Add to Basket'}</span>
          </button>
        )}
      </div>

      {/* Out of stock purchase intent modal */}
      {isIntentModalOpen && (
        <IntentModal
          isOpen={isIntentModalOpen}
          onClose={() => setIsIntentModalOpen(false)}
          product={product}
        />
      )}
    </>
  );
}

