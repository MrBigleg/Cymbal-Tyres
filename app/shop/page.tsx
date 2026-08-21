'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCommerce } from '@/components/CommerceContext';
import { ProductCard } from '@/components/ProductCard';
import { StoreSelectorModal } from '@/components/StoreSelectorModal';
import { BuyingAssistantModal } from '@/components/BuyingAssistantModal';
import {
  Search,
  Filter,
  MapPin,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  X,
  Bot,
  UserCheck,
  ArrowRight,
} from 'lucide-react';

function ShopContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialBrand = searchParams.get('brand') || 'ALL';

  const { products, selectedStore, selectedStoreId } = useCommerce();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand);
  const [selectedSeason, setSelectedSeason] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'brand'>('featured');
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantInitialQuery, setAssistantInitialQuery] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const brands = useMemo(() => {
    const bSet = new Set(products.map((p) => p.brand));
    return ['ALL', ...Array.from(bSet)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Query search (name, size, model, vehicle reg)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = product.name.toLowerCase().includes(q);
          const matchSize = product.tyreSize.toLowerCase().includes(q);
          const matchBrand = product.brand.toLowerCase().includes(q);
          const matchDesc = product.description.toLowerCase().includes(q);
          if (!matchName && !matchSize && !matchBrand && !matchDesc) return false;
        }

        // Brand filter
        if (selectedBrand !== 'ALL' && product.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
          return false;
        }

        // Season filter
        if (selectedSeason !== 'ALL' && product.season !== selectedSeason) {
          return false;
        }

        // Vehicle type filter
        if (vehicleTypeFilter !== 'ALL' && product.vehicleType !== vehicleTypeFilter) {
          return false;
        }

        // Stock status filter per currently selected store
        const storeStock = product.stockByStore[selectedStoreId];
        const isOutOfStock = !storeStock || storeStock.state === 'Out of Stock' || storeStock.quantity === 0;

        if (stockFilter === 'IN_STOCK' && isOutOfStock) return false;
        if (stockFilter === 'OUT_OF_STOCK' && !isOutOfStock) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'brand') return a.brand.localeCompare(b.brand);
        return 0;
      });
  }, [products, searchQuery, selectedBrand, selectedSeason, vehicleTypeFilter, stockFilter, selectedStoreId, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedBrand('ALL');
    setSelectedSeason('ALL');
    setStockFilter('ALL');
    setVehicleTypeFilter('ALL');
    setSortBy('featured');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedBrand !== 'ALL' ||
    selectedSeason !== 'ALL' ||
    stockFilter !== 'ALL' ||
    vehicleTypeFilter !== 'ALL';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Store Quick Switch Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Tyre Catalog & Fitting Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Showing stock availability and bay scheduling for{' '}
            <strong className="text-slate-900 dark:text-white">{selectedStore.name}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsStoreModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors text-xs font-bold self-start sm:self-auto"
        >
          <MapPin className="w-4 h-4 text-blue-600" />
          <span>Switch Centre: {selectedStore.city}</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-70" />
        </button>
      </div>

      {/* Main Content Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filters Sidebar (Desktop) */}
        <aside className="hidden lg:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-6 shadow-xs sticky top-24">
          {/* AI Buying Assistant Quick Launcher Card */}
          <div className="rounded-xl bg-gradient-to-br from-slate-900 to-blue-950 p-4 text-white border border-blue-600/40 space-y-2.5 shadow-md">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Buying Assistant</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-tight">
              100% web-grounded advice with plain English test comparisons.
            </p>
            <button
              type="button"
              onClick={() => {
                setAssistantInitialQuery(searchQuery || '');
                setIsAssistantOpen(true);
              }}
              className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <span>Ask Specialist AI</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
              <Filter className="w-4 h-4 text-blue-600" />
              <span>Filter Catalog</span>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Search by Keyword / Size
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. 225/40 R18, Michelin..."
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Stock Availability Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Stock Availability ({selectedStore.city})
            </label>
            <div className="space-y-1.5 text-xs">
              {[
                { id: 'ALL', label: 'All Products' },
                { id: 'IN_STOCK', label: 'In Stock & Ready' },
                { id: 'OUT_OF_STOCK', label: 'Out of Stock (Intent ready)' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-blue-600"
                >
                  <input
                    type="radio"
                    name="stockFilter"
                    checked={stockFilter === opt.id}
                    onChange={() => setStockFilter(opt.id as any)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Tyre Manufacturer
            </label>
            <div className="space-y-1.5 text-xs">
              {brands.map((brand) => (
                <label
                  key={brand}
                  className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-blue-600"
                >
                  <input
                    type="radio"
                    name="brandFilter"
                    checked={selectedBrand.toLowerCase() === brand.toLowerCase()}
                    onChange={() => setSelectedBrand(brand)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>{brand === 'ALL' ? 'All Brands' : brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Vehicle Suitability
            </label>
            <div className="space-y-1.5 text-xs">
              {['ALL', 'Car', 'EV / Hybrid'].map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-blue-600"
                >
                  <input
                    type="radio"
                    name="vehicleTypeFilter"
                    checked={vehicleTypeFilter === type}
                    onChange={() => setVehicleTypeFilter(type)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>{type === 'ALL' ? 'All Vehicle Types' : type}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Mobile Filter Toggle & Search Bar */}
        <div className="lg:hidden col-span-1 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tyres, size..."
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          {showMobileFilters && (
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="font-bold">Active Filters</span>
                <button onClick={resetFilters} className="text-blue-600">
                  Reset
                </button>
              </div>

              <div>
                <span className="font-bold block mb-1">Brand:</span>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full p-2 rounded-lg border dark:bg-slate-800"
                >
                  {brands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="font-bold block mb-1">Stock Status:</span>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value as any)}
                  className="w-full p-2 rounded-lg border dark:bg-slate-800"
                >
                  <option value="ALL">All Products</option>
                  <option value="IN_STOCK">In Stock Only</option>
                  <option value="OUT_OF_STOCK">Out of Stock Only</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Sort & Count Bar */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              Showing <strong className="text-slate-900 dark:text-white">{filteredProducts.length}</strong> matching tyre options
            </span>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 hidden sm:inline">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-1.5 text-xs font-semibold outline-none"
              >
                <option value="featured">Featured / Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="brand">Brand A-Z</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                No matching tyres found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your search keywords, clearing brand filters, or switching to another fitting centre location.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      <StoreSelectorModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
      />

      {/* Buying Assistant Modal */}
      <BuyingAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        initialQuery={assistantInitialQuery}
      />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-xs text-slate-500 mt-3">Loading Cymbal Auto catalog...</p>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
