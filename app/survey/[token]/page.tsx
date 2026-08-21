'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mockCommerceService } from '@/lib/services/mockCommerceService';
import { useCommerce } from '@/components/CommerceContext';
import { Order, SurveyResponse } from '@/lib/types/commerce';
import {
  Star,
  CheckCircle2,
  MapPin,
  HeartHandshake,
  ArrowRight,
  Sparkles,
  Smile,
  Meh,
  Frown,
  Send,
} from 'lucide-react';

export default function SurveyPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { stores, showNotification } = useCommerce();

  const [order, setOrder] = useState<Order | null>(null);
  const [existingSurvey, setExistingSurvey] = useState<SurveyResponse | null>(null);
  const [score, setScore] = useState<number | null>(10);
  const [comment, setComment] = useState<string>('Great service and prompt tyre fitting!');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadSurveyState() {
      try {
        const surveys = await mockCommerceService.getAllSurveys();
        const foundSurvey = surveys.find((s) => s.surveyToken === resolvedParams.token);

        const orders = await mockCommerceService.getOrders();
        const matchingOrder = orders.find((o) => o.surveyToken === resolvedParams.token);

        if (matchingOrder) {
          setOrder(matchingOrder);
        }

        if (foundSurvey) {
          setExistingSurvey(foundSurvey);
          setScore(foundSurvey.score);
          setComment(foundSurvey.comment || '');
          setIsSubmitted(true);
        }
      } catch (err) {
        console.error('Failed to load survey data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSurveyState();
  }, [resolvedParams.token]);

  const targetLocationId = order?.storeId || 'birmingham';
  const targetStore = stores.find((s) => s.id === targetLocationId) || stores[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (score === null) return;
    setIsSubmitting(true);

    try {
      const surveyData: SurveyResponse = {
        surveyToken: resolvedParams.token,
        orderId: order?.orderId || `ord_ref_${resolvedParams.token.substring(0, 8)}`,
        locationId: targetLocationId,
        storeName: targetStore.name,
        score,
        comment: comment.trim(),
        customerName: order?.customer.name || 'Alex Mercer',
        submittedAt: new Date().toISOString(),
      };

      await mockCommerceService.submitSurvey(surveyData);
      setIsSubmitted(true);
      showNotification({
        type: 'success',
        title: '🌟 NPS Survey Recorded',
        message: `Score ${score}/10 submitted for ${targetStore.city}. Emitted commerce.survey.submitted.`,
      });
    } catch (err) {
      console.error('Failed to submit survey:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
        <p className="text-xs text-slate-500 mt-3">Loading feedback form...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-800">
          <HeartHandshake className="w-4 h-4" />
          <span>Customer Voice & NPS Intelligence</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Cymbal Auto Experience Rating
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span>Rating for {targetStore.name} ({targetStore.city})</span>
        </p>
      </div>

      {!isSubmitted ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-8 shadow-xl"
        >
          {/* Question 1: 0-10 Scale */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                How likely are you to recommend this location to a friend or colleague?
              </label>
              <p className="text-xs text-slate-500">
                0 = Not at all likely, 10 = Extremely likely (Standard Net Promoter Score)
              </p>
            </div>

            {/* Scale Selector */}
            <div className="grid grid-cols-11 gap-1 sm:gap-2">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const isSelected = score === num;
                const isPromoter = num >= 9;
                const isPassive = num >= 7 && num <= 8;
                const isDetractor = num <= 6;

                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setScore(num)}
                    className={`py-3 sm:py-4 rounded-xl font-black text-xs sm:text-sm transition-all flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? isPromoter
                          ? 'bg-emerald-600 text-white shadow-lg scale-105 ring-2 ring-emerald-400'
                          : isPassive
                          ? 'bg-amber-500 text-slate-950 shadow-lg scale-105 ring-2 ring-amber-300'
                          : 'bg-rose-600 text-white shadow-lg scale-105 ring-2 ring-rose-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{num}</span>
                  </button>
                );
              })}
            </div>

            {/* NPS Category Indicator */}
            <div className="flex items-center justify-between text-xs pt-1 px-1">
              <div className="flex items-center gap-1 text-rose-600 font-semibold">
                <Frown className="w-3.5 h-3.5" />
                <span>0–6 Detractor</span>
              </div>
              <div className="flex items-center gap-1 text-amber-600 font-semibold">
                <Meh className="w-3.5 h-3.5" />
                <span>7–8 Passive</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                <Smile className="w-3.5 h-3.5" />
                <span>9–10 Promoter</span>
              </div>
            </div>
          </div>

          {/* Question 2: Optional text feedback */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-900 dark:text-white">
              Anything we should know about your experience today? (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Collection took longer than expected, or tyre fitting was quick and friendly."
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Structured format hint */}
          <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <span>
              Structured survey payload feeds into the corporate experience stream for sentiment and location quality tracking.
            </span>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <Link
              href="/shop"
              className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              Skip for now
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center gap-2 disabled:opacity-75"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Recording Response...' : 'Submit Feedback'}</span>
            </button>
          </div>
        </form>
      ) : (
        /* Confirmation Screen */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border-2 border-emerald-300 dark:border-emerald-700">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Thank You For Your Feedback!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Your response has been stored in the survey repository and published to the domain event stream.
            </p>
          </div>

          {/* Structured Payload summary */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left font-mono text-xs space-y-1.5 max-w-md mx-auto">
            <div className="flex justify-between">
              <span className="text-slate-500">Location:</span>
              <span className="text-slate-900 dark:text-white font-bold">{targetStore.city}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Score:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{score} / 10</span>
            </div>
            {comment && (
              <div className="pt-1 text-[11px] text-slate-600 dark:text-slate-300 font-sans border-t border-slate-200 dark:border-slate-700">
                &ldquo;{comment}&rdquo;
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/shop"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors"
            >
              Return to Storefront
            </Link>

            <Link
              href="/demo-controls"
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
            >
              View in Demo Controls
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
