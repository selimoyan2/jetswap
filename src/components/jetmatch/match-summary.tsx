'use client'

import React from 'react'
import { ArrowLeftRight, Compass, Layers } from 'lucide-react'

export type MatchFilterType = 'ALL' | 'MUTUAL' | 'ONE_WAY'

interface MatchSummaryProps {
  totalMatches: number
  mutualCount: number
  oneWayCount: number
  activeFilter: MatchFilterType
  onFilterChange: (filter: MatchFilterType) => void
}

export const MatchSummary: React.FC<MatchSummaryProps> = ({
  totalMatches,
  mutualCount,
  oneWayCount,
  activeFilter,
  onFilterChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-y border-zinc-200">
      {/* Title & Match Distribution */}
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-black text-sm text-zinc-900">
            {totalMatches} takas eşleşmesi bulundu
          </h3>
        </div>
        <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
            <ArrowLeftRight className="w-3 h-3 text-emerald-600" />
            {mutualCount} Karşılıklı Eşleşme
          </span>
          <span className="text-zinc-300">•</span>
          <span className="inline-flex items-center gap-1 font-semibold text-zinc-600">
            <Compass className="w-3 h-3 text-zinc-500" />
            {oneWayCount} Keşfet
          </span>
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl self-start sm:self-auto" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeFilter === 'ALL'}
          onClick={() => onFilterChange('ALL')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'ALL'
              ? 'bg-white text-zinc-900 shadow-2xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Tümü</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-zinc-200 rounded-full font-bold">
            {totalMatches}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeFilter === 'MUTUAL'}
          onClick={() => onFilterChange('MUTUAL')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'MUTUAL'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-zinc-600 hover:text-emerald-700 hover:bg-emerald-50/60'
          }`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Karşılıklı</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeFilter === 'MUTUAL' ? 'bg-emerald-700 text-white' : 'bg-zinc-200 text-zinc-700'
            }`}
          >
            {mutualCount}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeFilter === 'ONE_WAY'}
          onClick={() => onFilterChange('ONE_WAY')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'ONE_WAY'
              ? 'bg-zinc-800 text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Keşfet</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeFilter === 'ONE_WAY' ? 'bg-zinc-700 text-white' : 'bg-zinc-200 text-zinc-700'
            }`}
          >
            {oneWayCount}
          </span>
        </button>
      </div>
    </div>
  )
}
