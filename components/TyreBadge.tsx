'use client';

import React from 'react';
import { Fuel, CloudRain, Volume2 } from 'lucide-react';

interface TyreBadgeProps {
  fuel: 'A' | 'B' | 'C' | 'D' | 'E';
  wetGrip: 'A' | 'B' | 'C' | 'D' | 'E';
  noiseDb: number;
  size?: 'sm' | 'md';
}

export function TyreBadge({ fuel, wetGrip, noiseDb, size = 'md' }: TyreBadgeProps) {
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'A':
        return 'bg-emerald-600 text-white';
      case 'B':
        return 'bg-lime-600 text-white';
      case 'C':
        return 'bg-amber-500 text-white';
      case 'D':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-rose-500 text-white';
    }
  };

  const isSmall = size === 'sm';

  return (
    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
      {/* Fuel efficiency */}
      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700" title="EU Fuel Efficiency Rating">
        <Fuel className={`${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-slate-600 dark:text-slate-300`} />
        <span className={`font-bold px-1 rounded text-[10px] ${getRatingColor(fuel)}`}>
          {fuel}
        </span>
      </div>

      {/* Wet grip */}
      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700" title="EU Wet Braking Grip Rating">
        <CloudRain className={`${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-sky-600 dark:text-sky-400`} />
        <span className={`font-bold px-1 rounded text-[10px] ${getRatingColor(wetGrip)}`}>
          {wetGrip}
        </span>
      </div>

      {/* Noise */}
      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700" title="External Rolling Noise (dB)">
        <Volume2 className={`${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-slate-600 dark:text-slate-300`} />
        <span className="font-semibold text-slate-700 dark:text-slate-200 text-[10px]">
          {noiseDb}dB
        </span>
      </div>
    </div>
  );
}
