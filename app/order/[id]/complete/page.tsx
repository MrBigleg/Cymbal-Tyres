'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { mockCommerceService } from '@/lib/services/mockCommerceService';
import { Order } from '@/lib/types/commerce';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Car,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Star,
  Printer,
  Copy,
  Sparkles,
} from 'lucide-react';

export default function OrderCompletePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedPin, setCopiedPin] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const ord = await mockCommerceService.getOrderById(resolvedParams.id);
        setOrder(ord);
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
        <p className="text-xs text-slate-500 mt-3">Retrieving confirmed order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Order Record Not Found</h1>
        <p className="text-xs text-slate-500">The requested order confirmation is unavailable.</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
        >
          <span>Return to Storefront</span>
        </Link>
      </div>
    );
  }

  const copyPin = () => {
    navigator.clipboard.writeText(order.collectionPin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Success Hero Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border-2 border-emerald-300 dark:border-emerald-700 shadow-lg">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Order Confirmed • commerce.order.completed event emitted</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Thank You, {order.customer.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Your tyre fitting order <strong className="text-slate-900 dark:text-white font-mono">{order.orderNumber}</strong> is locked in with technicians assigned.
          </p>
        </div>

        {/* Collection PIN & QR Simulation */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center gap-4 shadow-md">
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Fitting Bay Check-in PIN
              </span>
              <div className="text-2xl font-mono font-black tracking-widest text-amber-400">
                {order.collectionPin}
              </div>
            </div>
            <button
              onClick={copyPin}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Copy PIN"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3 text-left">
            <QrCode className="w-8 h-8 text-slate-700 dark:text-slate-300" />
            <div className="text-xs">
              <span className="font-bold text-slate-900 dark:text-white block">Digital Bay Pass</span>
              <span className="text-slate-500">Show to technician on arrival</span>
            </div>
          </div>
        </div>
      </div>

      {/* Post-Purchase Survey Handoff Banner */}
      <div className="rounded-3xl bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-200 bg-blue-500/30 px-2.5 py-0.5 rounded-full">
            <Star className="w-3.5 h-3.5 fill-current text-amber-300" />
            <span>Post-Purchase Experience Feedback</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            How was your booking today?
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-lg">
            Help us improve our autocentre experience. Takes only 15 seconds to submit your NPS rating for {order.storeName}.
          </p>
        </div>

        <Link
          href={`/survey/${order.surveyToken}`}
          className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-blue-900 font-extrabold text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2 shrink-0 active:scale-98"
        >
          <span>Complete 1-Minute Survey</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Order Details & Fitting Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Box: Fitting Location & Slot */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            Fitting Centre Details
          </h3>

          <div className="space-y-2 text-xs">
            <div className="font-bold text-slate-900 dark:text-white text-sm">
              {order.storeName}
            </div>
            <p className="text-slate-500">{order.storeAddress}</p>
            <p className="text-slate-500 font-mono font-semibold">{order.storePostcode}</p>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>
                  Date: <strong className="text-slate-900 dark:text-white">{order.fittingSlot?.date || 'Tomorrow'}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>
                  Slot: <strong className="text-slate-900 dark:text-white">{order.fittingSlot?.timeSlot || '10:00 - 11:00'}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Car className="w-4 h-4 text-blue-600" />
                <span>
                  Vehicle Reg:{' '}
                  <strong className="text-slate-900 dark:text-white font-mono uppercase">
                    {order.customer.vehicleReg || 'BK72 XDA'}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Box: Items & Paid Total */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            Purchased Products
          </h3>

          <div className="space-y-3 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
            {order.lineItems.map((item) => (
              <div key={item.productId} className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {item.quantity}x {item.product.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">{item.product.tyreSize}</div>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">
                  £{((item.product.price + item.fittingCostPerUnit) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span>£{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Fitting Fee:</span>
              <span>{order.fittingTotal > 0 ? `£${order.fittingTotal.toFixed(2)}` : 'FREE'}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount:</span>
                <span>-£{order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-black text-base text-slate-900 dark:text-white">
              <span>Total Paid:</span>
              <span className="text-blue-600 dark:text-blue-400">£{order.total.toFixed(2)}</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Payment Method: {order.paymentMethod}
            </div>
          </div>
        </div>
      </div>

      {/* Return Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 text-xs">
        <Link
          href="/shop"
          className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
        >
          ← Return to Cymbal Auto Storefront
        </Link>

        <Link
          href="/demo-controls"
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors flex items-center gap-2"
        >
          <span>View Emitted Event in Demo Lab</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
