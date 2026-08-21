'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCommerce } from './CommerceContext';
import { StoreSelectorModal } from './StoreSelectorModal';
import {
  ShoppingCart,
  Sliders,
  ChevronDown,
  Search,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { selectedStore, cart } = useCommerce();
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartItemCount = cart.items.reduce((acc, i) => acc + i.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      {/* Sleek Primary Navbar */}
      <nav className="h-16 bg-slate-900 text-white flex items-center justify-between px-4 sm:px-8 shrink-0 z-40 sticky top-0">
        <div className="flex items-center space-x-4 sm:space-x-8">
          {/* Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold italic text-white text-base shadow-sm">
              C
            </div>
            <span className="text-xl font-bold tracking-tight text-white uppercase">
              CYMBAL AUTO
            </span>
          </Link>

          <div className="h-8 w-px bg-slate-700 hidden sm:block" />

          {/* Selected Store Selector */}
          <div
            onClick={() => setIsStoreModalOpen(true)}
            className="flex flex-col cursor-pointer group"
          >
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
              Selected Store
            </span>
            <div className="flex items-center space-x-1 group-hover:text-blue-400 text-white transition-colors">
              <span className="text-sm font-semibold">{selectedStore.name}</span>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md mx-4 lg:mx-8 hidden md:block">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tyres by size or brand..."
              className="w-full bg-slate-800 border-none rounded-md py-2 px-4 pr-9 text-sm text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <button
              type="submit"
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Navigation & Cart */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          <Link
            href="/shop"
            className="text-sm font-medium hover:text-blue-400 transition-colors hidden sm:inline"
          >
            Book Fitting
          </Link>

          <Link
            href="/demo-controls"
            className="hidden lg:inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <Sliders className="w-3 h-3 text-amber-400" />
            <span>Demo Controls</span>
          </Link>

          {/* Cart Icon with badge */}
          <Link
            href="/cart"
            className="relative cursor-pointer text-slate-200 hover:text-blue-400 transition-colors p-1"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-blue-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {cartItemCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* Sleek Sub-Navbar Category Bar */}
      <div className="h-12 bg-white border-b border-slate-200 flex items-center px-4 sm:px-8 space-x-6 text-sm shrink-0 overflow-x-auto scrollbar-none z-30">
        <Link
          href="/shop"
          className={`h-full flex items-center font-medium whitespace-nowrap transition-colors ${
            pathname === '/shop'
              ? 'font-bold text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          All Tyres
        </Link>
        <Link
          href="/shop?season=Winter"
          className="text-slate-500 hover:text-slate-800 whitespace-nowrap transition-colors"
        >
          Winter Tyres
        </Link>
        <Link
          href="/shop?sort=popular"
          className="text-slate-500 hover:text-slate-800 whitespace-nowrap transition-colors"
        >
          Performance
        </Link>
        <Link
          href="/shop?vehicleType=EV%20%2F%20Hybrid"
          className="text-slate-500 hover:text-slate-800 whitespace-nowrap transition-colors"
        >
          EV Ready
        </Link>
        <Link
          href="/shop?brand=Continental"
          className="text-slate-500 hover:text-slate-800 whitespace-nowrap transition-colors"
        >
          Commercial
        </Link>

        <div className="flex-1 min-w-4" />

        <div className="flex items-center space-x-2 text-xs shrink-0">
          <span className="text-slate-400 hidden sm:inline">Filter by:</span>
          <select
            onChange={(e) => {
              if (e.target.value) router.push(e.target.value);
            }}
            className="border-none bg-slate-100 rounded px-2 py-1 font-medium text-slate-800 outline-none text-xs"
            defaultValue=""
          >
            <option value="" disabled>
              Select Quick Size
            </option>
            <option value="/shop?q=225%2F45%20R17">Size: 225/45 R17</option>
            <option value="/shop?q=205%2F55%20R16">Size: 205/55 R16</option>
            <option value="/shop?q=245%2F40%20R18">Size: 245/40 R18</option>
            <option value="/shop?q=255%2F35%20R19">Size: 255/35 R19</option>
          </select>
        </div>
      </div>

      {/* Store Selector Modal */}
      <StoreSelectorModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
      />
    </>
  );
}

