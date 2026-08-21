'use client';

import React from 'react';
import { StockState } from '@/lib/types/commerce';

interface StockStatusBadgeProps {
  state: StockState;
  quantity?: number;
  storeName?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StockStatusBadge({
  state,
  quantity,
  storeName,
  size = 'md',
}: StockStatusBadgeProps) {
  if (state === 'In Stock') {
    return (
      <div className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide inline-flex items-center gap-1">
        <span>In Stock</span>
        {quantity !== undefined && quantity > 0 && <span>({quantity})</span>}
      </div>
    );
  }

  if (state === 'Low Stock') {
    return (
      <div className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide inline-flex items-center gap-1">
        <span>Low Stock {quantity !== undefined ? `(${quantity})` : ''}</span>
      </div>
    );
  }

  // Out of stock
  return (
    <div className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide inline-flex items-center gap-1">
      <span>Out of Stock {storeName ? `at ${storeName}` : ''}</span>
    </div>
  );
}

