'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Car, Disc, ShieldCheck } from 'lucide-react';

export function TyreSearchWidget() {
  const router = useRouter();
  const [tab, setTab] = useState<'reg' | 'size'>('reg');
  const [regInput, setRegInput] = useState('BK72 XDA');
  const [width, setWidth] = useState('225');
  const [profile, setProfile] = useState('40');
  const [rim, setRim] = useState('18');
  const [isSearching, setIsSearching] = useState(false);

  const handleRegSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      router.push(`/shop?q=${encodeURIComponent(regInput.trim())}`);
    }, 300);
  };

  const handleSizeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/shop?width=${width}&profile=${profile}&rim=${rim}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6 max-w-4xl mx-auto -mt-10 relative z-20">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-5">
        <button
          type="button"
          onClick={() => setTab('reg')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            tab === 'reg'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Search by Vehicle Registration</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('size')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            tab === 'size'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Disc className="w-4 h-4" />
          <span>Search by Tyre Size</span>
        </button>
      </div>

      {tab === 'reg' ? (
        <form onSubmit={handleRegSearch} className="flex flex-col sm:flex-row items-center gap-3">
          {/* UK Plate Look */}
          <div className="relative flex items-center rounded-lg bg-amber-400 p-1 border-2 border-slate-900 shadow-inner w-full sm:w-auto">
            <div className="bg-blue-800 text-white font-bold text-[9px] flex flex-col items-center justify-center px-1.5 py-1.5 rounded-l select-none">
              <span className="text-[7px]">🇬🇧</span>
              <span>UK</span>
            </div>
            <input
              type="text"
              value={regInput}
              onChange={(e) => setRegInput(e.target.value.toUpperCase())}
              placeholder="ENTER REG"
              className="bg-amber-400 text-slate-950 font-mono font-black text-lg tracking-widest uppercase px-3 py-1 outline-none text-center w-full sm:w-44 placeholder-slate-800/60"
              maxLength={8}
            />
          </div>

          <div className="flex-1 w-full text-xs text-slate-500">
            <p className="font-semibold text-slate-800">
              Instant DVLA match & exact fitment verification
            </p>
            <p className="text-[11px] text-slate-400">e.g. BK72 XDA, WP21 TXL, EA70 VBL</p>
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shrink-0"
          >
            {isSearching ? (
              <span>Looking up vehicle...</span>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Find Fitted Tyres</span>
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSizeSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="grid grid-cols-3 gap-2 w-full sm:w-auto flex-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Width
              </label>
              <select
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="205">205 mm</option>
                <option value="225">225 mm</option>
                <option value="245">245 mm</option>
                <option value="255">255 mm</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Profile
              </label>
              <select
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="35">35</option>
                <option value="40">40</option>
                <option value="45">45</option>
                <option value="55">55</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Rim
              </label>
              <select
                value={rim}
                onChange={(e) => setRim(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="16">16&quot;</option>
                <option value="17">17&quot;</option>
                <option value="18">18&quot;</option>
                <option value="19">19&quot;</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto mt-2 sm:mt-5 px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>Search Tyres</span>
          </button>
        </form>
      )}

      {/* Quick reassurance line */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Guaranteed fitment or 100% free swap</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-slate-400">Popular sizes:</span>
          <button
            onClick={() => router.push('/shop?width=225&profile=40&rim=18')}
            className="font-mono text-blue-600 hover:underline"
          >
            225/40 R18
          </button>
          <span>•</span>
          <button
            onClick={() => router.push('/shop?width=205&profile=55&rim=16')}
            className="font-mono text-blue-600 hover:underline"
          >
            205/55 R16
          </button>
        </div>
      </div>
    </div>
  );
}

