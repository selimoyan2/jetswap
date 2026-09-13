'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeftRight, Compass, CheckCircle2, ChevronDown, ChevronUp, 
  MapPin, Star, ExternalLink, Tag, Sparkles
} from 'lucide-react'
import { JetMatchResult } from '@/lib/jetmatch'

interface MatchCardProps {
  match: JetMatchResult
  sourceItemTitle?: string
}

const CONDITION_LABELS: Record<string, string> = {
  BRAND_NEW: 'Sıfır / Kutusunda',
  LIKE_NEW: 'Sıfıra Yakın',
  GOOD: 'İyi Durumda',
  FAIR: 'Kullanılmış',
}

const TRADE_METHOD_LABELS: Record<string, string> = {
  HAND_TO_HAND: 'Elden Teslim',
  CARGO_ONLY: 'Kargo İle',
  BOTH: 'Elden veya Kargo',
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  sourceItemTitle,
}) => {
  const [expandedReasons, setExpandedReasons] = useState(false)
  const { candidateItem, matchType, score, label, reasons } = match

  const isMutual = matchType === 'MUTUAL'

  // Determine score badge color
  const getScoreColor = () => {
    if (score >= 90) return 'text-emerald-700 bg-emerald-50 border-emerald-300'
    if (score >= 75) return 'text-teal-700 bg-teal-50 border-teal-300'
    if (score >= 60) return 'text-blue-700 bg-blue-50 border-blue-300'
    return 'text-zinc-700 bg-zinc-100 border-zinc-300'
  }

  const imageSrc =
    candidateItem.images && candidateItem.images.length > 0 && candidateItem.images[0]
      ? candidateItem.images[0]
      : 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'

  const visibleReasons = expandedReasons ? reasons : reasons.slice(0, 3)
  const remainingCount = reasons.length - 3

  return (
    <article
      className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-md ${
        isMutual ? 'border-emerald-300/90 ring-1 ring-emerald-500/20' : 'border-zinc-200 hover:border-zinc-300'
      }`}
    >
      <div>
        {/* Top Match Type Banner */}
        <div
          className={`px-4 py-2.5 flex items-center justify-between border-b ${
            isMutual
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-700'
              : 'bg-zinc-100/90 text-zinc-800 border-zinc-200'
          }`}
        >
          <div className="flex items-center gap-1.5 font-black text-xs tracking-wide">
            {isMutual ? (
              <>
                <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-200" />
                <span>Karşılıklı Eşleşme</span>
              </>
            ) : (
              <>
                <Compass className="w-3.5 h-3.5 text-zinc-500" />
                <span>Keşfet</span>
              </>
            )}
          </div>

          {/* Match Score & Backend Label */}
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
                isMutual ? 'bg-white/20 text-white border-white/30' : getScoreColor()
              }`}
            >
              %{score}
            </span>
            <span
              className={`text-xs font-black ${
                isMutual ? 'text-emerald-100' : 'text-zinc-700'
              }`}
            >
              {label}
            </span>
          </div>
        </div>

        {/* Candidate Item Image & Details */}
        <div className="p-4 sm:p-5 space-y-4">
          <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-100">
            <Image
              src={imageSrc}
              alt={candidateItem.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />

            {/* Badges Overlay */}
            <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
              {candidateItem.category?.nameTr && (
                <span className="text-[10px] font-extrabold bg-white/95 text-zinc-900 px-2 py-0.5 rounded-md shadow-2xs backdrop-blur-xs flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5 text-emerald-600" />
                  {candidateItem.category.nameTr}
                </span>
              )}
              <span className="text-[10px] font-bold bg-zinc-900/80 text-white px-2 py-0.5 rounded-md backdrop-blur-xs">
                {CONDITION_LABELS[candidateItem.condition] || candidateItem.condition}
              </span>
            </div>
          </div>

          {/* Title & Location / Method */}
          <div className="space-y-1.5">
            <h4 className="font-black text-sm text-zinc-900 line-clamp-1">
              {candidateItem.title}
            </h4>

            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                <span className="truncate">{candidateItem.city}, {candidateItem.country}</span>
              </span>
              <span className="text-[11px] font-semibold text-zinc-600 shrink-0">
                {TRADE_METHOD_LABELS[candidateItem.tradeMethod] || candidateItem.tradeMethod}
              </span>
            </div>
          </div>

          {/* Owner Public Summary (STRICT: NO PHONE, NO EMAIL) */}
          <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-200">
                {candidateItem.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-zinc-800 truncate">
                  {candidateItem.user.name}
                </p>
                <p className="text-[10px] text-zinc-400 truncate">
                  İlan Sahibi
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-amber-600 font-extrabold shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{candidateItem.user.rating > 0 ? candidateItem.user.rating.toFixed(1) : 'Yeni'}</span>
              {candidateItem.user.reviewCount > 0 && (
                <span className="text-[10px] text-zinc-400 font-normal">
                  ({candidateItem.user.reviewCount})
                </span>
              )}
            </div>
          </div>

          {/* Barter Exchange Visualization (Senin Eşyan <-> Onun Eşyası) */}
          {sourceItemTitle && isMutual && (
            <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-1.5">
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Karşılıklı Takas Uyumu</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-zinc-800 gap-2">
                <span className="truncate text-emerald-900 font-semibold" title={sourceItemTitle}>
                  {sourceItemTitle}
                </span>
                <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate text-emerald-900 font-semibold text-right" title={candidateItem.title}>
                  {candidateItem.title}
                </span>
              </div>
            </div>
          )}

          {/* Match Reasons ("Neden eşleştiniz?") */}
          <div className="space-y-2 pt-1 border-t border-zinc-100">
            <h5 className="text-xs font-black text-zinc-700 flex items-center justify-between">
              <span>Neden bu eşleşme?</span>
              <span className="text-[10px] font-semibold text-zinc-400">
                {reasons.length} neden
              </span>
            </h5>

            <ul className="space-y-1.5" aria-label="Eşleşme nedenleri">
              {visibleReasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-zinc-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{reason.message}</span>
                </li>
              ))}
            </ul>

            {remainingCount > 0 && (
              <button
                type="button"
                onClick={() => setExpandedReasons(!expandedReasons)}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 pt-1 cursor-pointer"
                aria-expanded={expandedReasons}
              >
                <span>{expandedReasons ? 'Daha az göster' : `+${remainingCount} neden daha`}</span>
                {expandedReasons ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 sm:p-5 pt-0 border-t border-zinc-100 mt-2 space-y-2">
        <div className="flex items-center gap-2">
          {/* Primary Action: İlanı İncele */}
          <Link
            href={`/items/${candidateItem.id}`}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl shadow-xs transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>İlanı İncele</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* Secondary Disabled Action: Takas Teklifi Gönder (Yakında) */}
          <button
            type="button"
            disabled
            className="flex-1 bg-zinc-100 text-zinc-400 border border-zinc-200 font-bold text-xs py-2.5 px-3 rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5"
            title="Takas teklifleri bir sonraki sprintte aktif olacaktır."
          >
            <span>Teklif Gönder</span>
            <span className="text-[9px] bg-zinc-200 text-zinc-600 px-1.5 py-0.2 rounded-md font-extrabold uppercase">
              Yakında
            </span>
          </button>
        </div>
      </div>
    </article>
  )
}
