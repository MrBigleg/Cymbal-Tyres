'use client';

import React from 'react';
import { useCommerce } from './CommerceContext';
import { MapPin, Phone, Clock, Check, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StoreSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  productIdToCheck?: string;
}

export function StoreSelectorModal({
  isOpen,
  onClose,
  productIdToCheck,
}: StoreSelectorModalProps) {
  const { stores, selectedStoreId, setSelectedStoreId, products } = useCommerce();

  if (!isOpen) return null;

  const product = productIdToCheck ? products.find((p) => p.id === productIdToCheck) : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Select Your Cymbal Auto Centre
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Choose your local fitting hub for same-day collection & certified technician fitting.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Store List */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
            {stores.map((store) => {
              const isSelected = store.id === selectedStoreId;
              const stockInfo = product ? product.stockByStore[store.id] : null;

              return (
                <div
                  key={store.id}
                  onClick={async () => {
                    await setSelectedStoreId(store.id);
                    onClose();
                  }}
                  className={`p-4 sm:p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 shadow-md ring-1 ring-blue-600'
                      : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base text-slate-900 dark:text-white">
                          {store.name}
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-blue-600 text-white rounded-full">
                            <Check className="w-3 h-3" /> Selected Centre
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>{store.address}, {store.postcode}</span>
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{store.openingHours}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{store.phone}</span>
                        </div>
                      </div>

                      {product && stockInfo && (
                        <div className="mt-3 p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-between text-xs">
                          <span className="text-slate-600 dark:text-slate-300">
                            Availability for <strong className="text-slate-900 dark:text-white">{product.name}</strong>:
                          </span>
                          <span
                            className={`font-semibold px-2 py-0.5 rounded-full ${
                              stockInfo.state === 'In Stock'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : stockInfo.state === 'Low Stock'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {stockInfo.state} ({stockInfo.quantity} available)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              All centres equipped with Hunter 3D wheel laser alignment.
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
