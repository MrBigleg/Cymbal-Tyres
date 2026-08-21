'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCommerce } from './CommerceContext';
import { TyreBadge } from './TyreBadge';
import { StockStatusBadge } from './StockStatusBadge';
import { IntentModal } from './IntentModal';
import {
  Sparkles,
  Search,
  ShieldCheck,
  UserCheck,
  ExternalLink,
  PhoneCall,
  CheckCircle2,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Info,
  Car,
  X,
  ShoppingCart,
  Clock,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

interface BuyingAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

interface AssistantResponse {
  groundedAnswer: string;
  plainEnglishSummary: string;
  confidenceScore: number;
  isFullyGrounded: boolean;
  keyDifferentiator: string;
  recommendedProductIds: string[];
  drivingProfileMatch: string;
  groundingHighlights: string[];
  groundingSources?: Array<{ title: string; uri: string }>;
  webSearchQueries?: string[];
  humanInTheLoop: {
    required: boolean;
    reason?: string;
    technicianAssigned?: string;
    ticketId?: string;
    estimatedWait?: string;
  };
  suggestedNextAction: string;
}

export function BuyingAssistantModal({
  isOpen,
  onClose,
  initialQuery = '',
}: BuyingAssistantModalProps) {
  const { selectedStore, products, addToCart } = useCommerce();

  const [query, setQuery] = useState(initialQuery);
  const [vehicleReg, setVehicleReg] = useState('');
  const [selectedProfile, setSelectedProfile] = useState('Wet Weather Safety');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AssistantResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEscalating, setIsEscalating] = useState(false);
  const [escalationSuccess, setEscalationSuccess] = useState<string | null>(null);
  const [selectedProductForIntent, setSelectedProductForIntent] = useState<any | null>(null);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  if (!isOpen) return null;

  const drivingProfiles = [
    { id: 'Wet Weather Safety', label: '🌧️ Wet Weather & Braking', desc: 'Maximum grip on rain-soaked UK roads' },
    { id: 'EV Range & Low Noise', label: '⚡ EV Range & Acoustic', desc: 'Low rolling resistance & silent cabin' },
    { id: 'High Mileage Durability', label: '🚗 High Mileage Commute', desc: '40k+ mile tread life & fuel efficiency' },
    { id: 'Ultra High Performance', label: '🏁 Performance & Track', desc: 'Razor-sharp precision & cornering' },
    { id: 'Budget & Everyday Value', label: '💰 Budget & Quality', desc: 'Best safety-to-cost ratio' },
  ];

  const quickQuestions = [
    'What tyre offers the shortest wet braking distance for UK winters?',
    'I drive a Tesla Model 3 / EV — which tyre gives the quietest cabin & best range?',
    'What is the difference between Michelin Pilot Sport 5 and Goodyear Eagle F1?',
    'I drive a BMW 3 Series with 18-inch wheels — do I need staggered rear fitment?',
  ];

  const handleConsult = async (customQuery?: string) => {
    const activeQuery = customQuery || query;
    if (!activeQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setEscalationSuccess(null);

    try {
      const res = await fetch('/api/assistant/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: activeQuery,
          drivingProfile: selectedProfile,
          vehicleReg: vehicleReg.trim() || undefined,
          selectedStoreId: selectedStore.id,
          requireStrictGrounding: true,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to consult Buying Assistant');
      }

      const json = await res.json();
      if (json.success && json.data) {
        setResult(json.data);
      } else {
        throw new Error(json.error || 'Invalid assistant response');
      }
    } catch (err: any) {
      setError(err.message || 'Consultation encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdd = async (productId: string) => {
    setAddingProductId(productId);
    try {
      await addToCart(productId, 2, 'in_store');
    } finally {
      setAddingProductId(null);
    }
  };

  const handleManualEscalate = async () => {
    setIsEscalating(true);
    try {
      const res = await fetch('/api/assistant/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query || 'Customer requested direct Master Technician fitment review',
          vehicleReg: vehicleReg || 'DVLA Lookup Requested',
          storeId: selectedStore.id,
          reason: 'Customer requested human technician verification and fitment guarantee',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEscalationSuccess(
          data.message ||
            `Ticket ${data.ticket?.ticketId} created! Dave Henderson at ${selectedStore.city} has been notified.`
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEscalating(false);
    }
  };

  // Resolve recommended products from state catalog
  const matchedProducts = result?.recommendedProductIds
    ? products.filter((p) => result.recommendedProductIds.includes(p.id))
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 sm:px-7 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base sm:text-lg tracking-tight">
                  Cymbal AI Buying Assistant
                </h2>
                <span className="bg-blue-900 text-blue-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-blue-700">
                  Search Grounded
                </span>
              </div>
              <p className="text-xs text-slate-400">
                100% Grounded Tyre Advice • Plain-English Explanations • Human-in-the-Loop Safeguard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {/* Top Info Banner: Grounding & HITL Architecture */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">
                  100% Grounded Policy & Human-in-the-Loop Active
                </span>
                <span className="text-slate-500 text-[11px]">
                  All suggestions must achieve 100% test-verified confidence. Any vehicle or fitment ambiguity is automatically deferred to a senior technician at{' '}
                  <strong className="text-slate-700">{selectedStore.name}</strong>.
                </span>
              </div>
            </div>

            <button
              onClick={handleManualEscalate}
              disabled={isEscalating}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>{isEscalating ? 'Assigning...' : 'Talk to Technician'}</span>
            </button>
          </div>

          {/* Driving Profile Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Select Driving Priority
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {drivingProfiles.map((dp) => (
                <button
                  key={dp.id}
                  type="button"
                  onClick={() => setSelectedProfile(dp.id)}
                  className={`p-2.5 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
                    selectedProfile === dp.id
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 text-blue-900 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="leading-tight block mb-1">{dp.label}</span>
                  <span className="text-[10px] font-normal text-slate-400 leading-tight">
                    {dp.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Query & Vehicle Input */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. Describe your vehicle or ask a question in plain English
            </label>

            <div className="flex flex-col sm:flex-row gap-2.5">
              {/* Optional Reg Plate */}
              <div className="sm:w-44 flex items-center rounded-lg bg-amber-400 p-1 border-2 border-slate-900 shrink-0">
                <div className="bg-blue-800 text-white font-bold text-[8px] flex flex-col items-center justify-center px-1.5 py-1 rounded-l select-none">
                  <span className="text-[6px]">🇬🇧</span>
                  <span>UK</span>
                </div>
                <input
                  type="text"
                  value={vehicleReg}
                  onChange={(e) => setVehicleReg(e.target.value.toUpperCase())}
                  placeholder="OPTIONAL REG"
                  maxLength={8}
                  className="bg-amber-400 text-slate-950 font-mono font-black text-xs uppercase px-2 py-0.5 outline-none text-center w-full placeholder-slate-800/60"
                />
              </div>

              {/* Free Text Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleConsult()}
                  placeholder="e.g. Which tyre gives maximum wet grip on motorway commutes with lowest road noise?"
                  className="w-full h-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => handleConsult()}
                disabled={isLoading || (!query.trim() && !vehicleReg.trim())}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Searching Web...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Consult AI</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Prompts */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-600">Quick queries:</span>
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(q);
                    handleConsult(q);
                  }}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition-colors truncate max-w-xs"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Escalation Success Notice */}
          {escalationSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="block font-bold">Senior Technician Assigned (HITL)</strong>
                <p className="text-emerald-800">{escalationSuccess}</p>
              </div>
            </div>
          )}

          {/* Error Notice */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <strong className="block font-bold">Consultation Issue</strong>
                <p className="text-rose-800">{error}</p>
              </div>
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Search className="w-4 h-4 text-blue-600 animate-spin" />
                </div>
                <div className="space-y-1">
                  <div className="h-4 w-48 bg-slate-200 rounded"></div>
                  <div className="h-3 w-64 bg-slate-100 rounded"></div>
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="h-3 bg-slate-200 rounded w-full"></div>
                <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                <div className="h-3 bg-slate-200 rounded w-4/6"></div>
              </div>
            </div>
          )}

          {/* Results Display */}
          {result && !isLoading && (
            <div className="space-y-6">
              {/* Grounding & Confidence Status Bar */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  result.isFullyGrounded && result.confidenceScore === 100
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50/90 border-amber-300 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  {result.isFullyGrounded && result.confidenceScore === 100 ? (
                    <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">
                        {result.isFullyGrounded && result.confidenceScore === 100
                          ? '100% Grounded & Verified Recommendation'
                          : `Confidence: ${result.confidenceScore}% — Human in the Loop Engaged`}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          result.confidenceScore === 100
                            ? 'bg-emerald-200 text-emerald-900'
                            : 'bg-amber-200 text-amber-900'
                        }`}
                      >
                        Score {result.confidenceScore}/100
                      </span>
                    </div>
                    <p className="text-xs opacity-90 mt-0.5">
                      {result.keyDifferentiator}
                    </p>
                  </div>
                </div>

                {/* HITL Notice if required */}
                {result.humanInTheLoop?.required && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold bg-amber-200/80 px-2.5 py-1 rounded text-amber-950 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-amber-800" />
                      Assigned: {result.humanInTheLoop.technicianAssigned}
                    </span>
                  </div>
                )}
              </div>

              {/* Human In The Loop Escalation Card (Triggered when < 100% grounded) */}
              {result.humanInTheLoop?.required && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold">
                      HITL
                    </div>
                    <div className="flex-1 text-xs text-amber-950 space-y-1">
                      <h4 className="font-bold text-sm text-amber-950 flex items-center gap-2">
                        <span>Technician Safety Deferral Triggered</span>
                        <span className="text-[10px] font-mono bg-amber-200 px-1.5 py-0.5 rounded">
                          Ticket: {result.humanInTheLoop.ticketId}
                        </span>
                      </h4>
                      <p className="leading-relaxed">{result.humanInTheLoop.reason}</p>
                      <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-amber-900">
                        <span>Technician: {result.humanInTheLoop.technicianAssigned}</span>
                        <span>•</span>
                        <span>Estimated Response: {result.humanInTheLoop.estimatedWait}</span>
                        <span>•</span>
                        <span>Depot: {selectedStore.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-200/80 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] text-amber-900">
                      Cymbal Auto guarantees 100% fitment accuracy. Our human technician will verify wheel clearance before workshop fitting.
                    </span>
                    <button
                      onClick={handleManualEscalate}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Confirm Callback Request</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Plain English Advice Text */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs text-slate-700 leading-relaxed">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Plain English Specialist Assessment</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Depot Stock Evaluated: {selectedStore.city}
                  </span>
                </div>

                <div className="whitespace-pre-line prose-sm text-slate-700">
                  {result.groundedAnswer}
                </div>

                {/* Grounding Highlights & Web Sources */}
                {result.groundingSources && result.groundingSources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Live Web Grounding Sources & Independent Test Benchmarks:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {result.groundingSources.map((source, i) => (
                        <a
                          key={i}
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[220px]">{source.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Matching Recommended Tyre Cards */}
              {matchedProducts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600 flex items-center justify-between">
                    <span>Recommended Options in Cymbal Auto Inventory</span>
                    <span className="text-slate-400 text-[10px]">
                      Depot: {selectedStore.name}
                    </span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchedProducts.map((product) => {
                      const stockInfo = product.stockByStore[selectedStore.id] || {
                        state: 'Out of Stock',
                        quantity: 0,
                      };
                      const isOutOfStock = stockInfo.state === 'Out of Stock';

                      return (
                        <div
                          key={product.id}
                          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <StockStatusBadge
                                state={stockInfo.state}
                                quantity={stockInfo.quantity}
                                size="sm"
                              />
                              <div className="text-right">
                                <span className="text-base font-bold text-slate-900 leading-none">
                                  £{product.price.toFixed(2)}
                                </span>
                                <div className="text-[9px] uppercase font-bold text-slate-400">
                                  inc. VAT & fitting
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center shrink-0 p-1">
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  width={60}
                                  height={60}
                                  className="object-contain max-h-14"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                  {product.brand} • {product.season}
                                </span>
                                <h4 className="font-bold text-slate-900 text-sm truncate">
                                  {product.name}
                                </h4>
                                <span className="text-[11px] font-mono font-semibold text-slate-600 block mt-0.5">
                                  Size: {product.tyreSize}
                                </span>
                              </div>
                            </div>

                            <div className="mb-3">
                              <TyreBadge
                                fuel={product.fuelEfficiency}
                                wetGrip={product.wetGrip}
                                noiseDb={product.noiseLevelDb}
                                size="sm"
                              />
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                            {isOutOfStock ? (
                              <button
                                type="button"
                                onClick={() => setSelectedProductForIntent(product)}
                                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 py-2 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                              >
                                <Clock className="w-3.5 h-3.5 text-slate-950" />
                                <span>Buy when back in stock</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleQuickAdd(product.id)}
                                disabled={addingProductId === product.id}
                                className="w-full bg-slate-900 hover:bg-slate-800 active:scale-98 text-white py-2 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-75"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>
                                  {addingProductId === product.id
                                    ? 'Adding...'
                                    : 'Add 2 to Basket'}
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-900 px-5 sm:px-7 py-3 flex items-center justify-between border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Autonomous Grounding Engine Online • Active Hub: {selectedStore.city}</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* AP2 Purchase Intent Modal if triggered */}
      {selectedProductForIntent && (
        <IntentModal
          isOpen={Boolean(selectedProductForIntent)}
          onClose={() => setSelectedProductForIntent(null)}
          product={selectedProductForIntent}
        />
      )}
    </div>
  );
}
