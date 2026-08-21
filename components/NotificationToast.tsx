'use client';

import React from 'react';
import { useCommerce, AppNotification } from './CommerceContext';
import { X, CheckCircle2, AlertCircle, Sparkles, Package, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function NotificationToastContainer() {
  const { notifications, dismissNotification } = useCommerce();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto shadow-xl rounded-xl p-4 border backdrop-blur-md flex items-start gap-3.5 text-sm ${
              n.type === 'success'
                ? 'bg-emerald-900/90 text-white border-emerald-700'
                : n.type === 'recovery'
                ? 'bg-amber-900/95 text-amber-50 border-amber-600'
                : n.type === 'intent'
                ? 'bg-indigo-900/90 text-white border-indigo-700'
                : n.type === 'warning'
                ? 'bg-rose-900/90 text-white border-rose-700'
                : 'bg-slate-900/95 text-white border-slate-700'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {n.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-300" />}
              {n.type === 'recovery' && <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />}
              {n.type === 'intent' && <Clock className="w-5 h-5 text-indigo-300" />}
              {n.type === 'warning' && <AlertCircle className="w-5 h-5 text-rose-300" />}
              {n.type === 'info' && <Package className="w-5 h-5 text-sky-300" />}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm leading-tight text-white mb-1">{n.title}</h4>
              <p className="text-xs text-slate-200 leading-relaxed">{n.message}</p>
            </div>

            <button
              onClick={() => dismissNotification(n.id)}
              className="text-slate-300 hover:text-white p-1 rounded-md transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
