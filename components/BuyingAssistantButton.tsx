'use client';

import React, { useState } from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { BuyingAssistantModal } from './BuyingAssistantModal';

export function BuyingAssistantButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-1">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900 text-white font-bold text-xs sm:text-sm shadow-xl hover:shadow-2xl border border-slate-700/80 hover:border-blue-500/80 transition-all active:scale-95 hover:bg-slate-800"
          aria-label="Open AI Buying Assistant"
        >
          {/* Glowing pulse ring */}
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-75 blur-xs group-hover:opacity-100 transition duration-300 -z-10 animate-pulse" />

          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </div>

          <div className="flex flex-col text-left">
            <span className="text-white text-xs sm:text-sm font-bold leading-tight flex items-center gap-1.5">
              <span>Ask Tyre Specialist AI</span>
              <span className="text-[9px] bg-blue-500 text-white px-1.5 py-0.2 rounded font-black tracking-wider uppercase">
                100% Grounded
              </span>
            </span>
            <span className="text-[10px] text-slate-400 font-normal leading-tight hidden sm:inline">
              Plain English • Auto Human Deferral
            </span>
          </div>
        </button>
      </div>

      <BuyingAssistantModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
