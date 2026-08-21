'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, ShieldCheck, Cpu, ArrowRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-16 bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      {/* Upper Footer Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1: Brand */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold italic text-white text-base">
                C
              </div>
              <span className="text-xl font-bold tracking-tight text-white uppercase">
                CYMBAL AUTO
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Cymbal Auto is a modern multi-location automotive & tyre retailer operating autocentres across the UK. Providing premium brand tyres, laser alignment, and certified technician fitting.
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full Manufacturer Warranty & 100% Fitment Guarantee</span>
            </div>
          </div>

          {/* Col 2: Autocentres */}
          <div>
            <h4 className="font-bold text-white text-[11px] uppercase tracking-wider mb-3">
              Autocentres
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-200">Birmingham (Bullring)</strong>
                  <br />
                  Bullring Trade Park, B4 7XU
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-200">Bristol (Cribbs)</strong>
                  <br />
                  Lysander Road, BS10 7UB
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-200">Croydon (Purley Way)</strong>
                  <br />
                  240 Purley Way, CR0 4XJ
                </span>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Links */}
          <div>
            <h4 className="font-bold text-white text-[11px] uppercase tracking-wider mb-3">
              Catalog
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/shop" className="hover:text-blue-400 transition-colors">
                  All Tyres & Specs
                </Link>
              </li>
              <li>
                <Link href="/shop?season=Winter" className="hover:text-blue-400 transition-colors">
                  Winter Tyres
                </Link>
              </li>
              <li>
                <Link href="/shop?vehicleType=EV%20%2F%20Hybrid" className="hover:text-blue-400 transition-colors">
                  EV Ready Range
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-blue-400 transition-colors">
                  Basket & Fitting Schedule
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform */}
          <div>
            <h4 className="font-bold text-amber-400 text-[11px] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              Agent Platform
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              Prepared for Google ADK agents, Universal Commerce Protocol (UCP), and AP2 conditional purchasing.
            </p>
            <Link
              href="/demo-controls"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors"
            >
              <span>Operator Demo Controls</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Sleek Theme Bottom Bar */}
      <div className="h-12 bg-white border-t border-slate-200 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 font-medium gap-2">
        <div className="flex items-center space-x-4">
          <span>&copy; {new Date().getFullYear()} Cymbal Auto Retail UK</span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span className="text-slate-600">All Systems Operational</span>
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/demo-controls"
            className="text-blue-600 font-bold hover:underline"
          >
            DEMO CONTROLS
          </Link>
          <Link href="/shop" className="hover:text-slate-700">
            Book Fitting
          </Link>
          <span className="text-slate-400">Store Locations: Birmingham • Bristol • Croydon</span>
        </div>
      </div>
    </footer>
  );
}

