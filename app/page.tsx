'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCommerce } from '@/components/CommerceContext';
import { ProductCard } from '@/components/ProductCard';
import { TyreSearchWidget } from '@/components/TyreSearchWidget';
import {
  ShieldCheck,
  Wrench,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Star,
  Zap,
} from 'lucide-react';

export default function HomePage() {
  const { products, selectedStore } = useCommerce();

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden pt-12 pb-24 lg:pt-16 lg:pb-28">
        {/* Background Subtle Gradient & Mesh */}
        <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-900 to-blue-950/80 opacity-95" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-5">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>UK Leading Independent Autocentre Network</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white">
                Fitted Tyres from <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-300">
                  Top Premium Brands
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Same-day booking and next-day precision fitting at your local centre in{' '}
                <strong className="text-white underline decoration-blue-500 underline-offset-4">
                  {selectedStore.city}
                </strong>
                . Fully inclusive prices with free valve replacement, balancing, and environmental disposal.
              </p>

              {/* Quick USP Highlights */}
              <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free In-Store Fitting
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Hunter 3D Alignment
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 5-Star Customer Rating
                </span>
              </div>
            </div>

            {/* Quick Hero Summary Card */}
            <div className="lg:col-span-4 bg-slate-800/80 border border-slate-700/80 backdrop-blur-md rounded-2xl p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Current Depot</div>
                    <div className="font-bold text-sm text-white">{selectedStore.name}</div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Address:</span>
                  <span className="text-right font-medium">{selectedStore.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Next Bay Slot:</span>
                  <span className="text-emerald-400 font-bold">Tomorrow from 08:30</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/shop"
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Explore Available Tyres</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reg / Tyre Size Search Box Overlap */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TyreSearchWidget />
      </div>

      {/* Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs uppercase font-bold text-blue-600 tracking-wider">
              Selected Centre: {selectedStore.name}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Popular Tyres In Your Size
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Top-rated OE fitments with live stock availability for immediate booking.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <span>View all {products.length} models in stock</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Agentic Commerce & Out-of-Stock Intent Showcase Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-10 shadow-2xl border border-blue-700/40 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/20 to-transparent pointer-events-none" />

          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-400/20 text-blue-300 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Agentic Commerce Ready • AP2 Conditional Buying</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Looking for a tyre that is out of stock?
            </h3>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              With Cymbal Auto conditional purchase intents, you can set a price cap, preferred fitting depot, and let autonomous commerce agents execute the order the second our supplier replenishes the warehouse.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/product/michelin-pilot-sport-5"
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <span>Test Out-of-Stock Intent Flow (Michelin PS5)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/demo-controls"
                className="px-4 py-2.5 rounded-xl bg-blue-800/80 hover:bg-blue-700 text-white font-bold text-xs border border-blue-600/60 transition-all flex items-center gap-2"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-300" />
                <span>Open Operator Demo Panel</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Testimonial Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
            <div className="space-y-2 pr-4">
              <div className="flex items-center gap-1 text-emerald-600">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                4.9 / 5 on Trustpilot
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Over 14,000 verified UK driver reviews across Birmingham, Bristol & Croydon.
              </p>
            </div>

            <div className="space-y-2 pt-4 md:pt-0 md:px-6">
              <div className="flex items-center gap-2 text-blue-600">
                <Wrench className="w-5 h-5" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Laser Wheel Alignment
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                State-of-the-art Hunter Hawkeye Elite optical wheel alignment calibrated on every fitting.
              </p>
            </div>

            <div className="space-y-2 pt-4 md:pt-0 md:pl-6">
              <div className="flex items-center gap-2 text-emerald-600">
                <Clock className="w-5 h-5" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  60-Minute Fitting Guarantee
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Drive into your booked bay slot and drive out within 60 minutes, or receive 20% off.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
