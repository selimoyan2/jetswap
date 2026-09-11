'use client'

import React from 'react'
import { TradeItem } from '@/types'
import { useLanguage } from '@/i18n'
import { Scale, CheckCircle2, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react'

interface FairBarterScaleProps {
  offeredItems: TradeItem[]
  targetItem: TradeItem
  className?: string
}

const TIER_SCORES: Record<string, number> = {
  LOW: 15,
  MEDIUM: 35,
  HIGH: 70,
  PREMIUM: 120
}

export default function FairBarterScale({ offeredItems, targetItem, className = '' }: FairBarterScaleProps) {
  const { t } = useLanguage()

  const targetScore = TIER_SCORES[targetItem.valueTier || 'MEDIUM'] || 35
  const offeredScore = offeredItems.reduce((acc, item) => acc + (TIER_SCORES[item.valueTier || 'MEDIUM'] || 35), 0)

  // Calculate balance ratio
  const ratio = offeredScore > 0 ? offeredScore / targetScore : 0
  
  let status: 'balanced' | 'generous' | 'underValue' = 'underValue'
  if (ratio >= 0.85 && ratio <= 1.25) {
    status = 'balanced'
  } else if (ratio > 1.25) {
    status = 'generous'
  } else {
    status = 'underValue'
  }

  // Tilt angle (-15 deg to +15 deg)
  // Clamp between -15 (heavy target) and +15 (heavy offer)
  const scoreDiffRatio = targetScore > 0 ? (offeredScore - targetScore) / Math.max(targetScore, offeredScore) : 0
  const tiltAngle = Math.max(-14, Math.min(14, scoreDiffRatio * 14))

  const getTierLabel = (tier?: string) => {
    switch (tier) {
      case 'LOW':
        return t.fairScale.tierLow
      case 'HIGH':
        return t.fairScale.tierHigh
      case 'PREMIUM':
        return t.fairScale.tierPremium
      default:
        return t.fairScale.tierMedium
    }
  }

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${
      status === 'balanced'
        ? 'bg-emerald-500/5 border-emerald-500/30'
        : status === 'generous'
        ? 'bg-blue-500/5 border-blue-500/30'
        : 'bg-amber-500/5 border-amber-500/30'
    } ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            status === 'balanced'
              ? 'bg-emerald-500/20 text-emerald-400'
              : status === 'generous'
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-amber-500/20 text-amber-400'
          }`}>
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
              {t.fairScale.title}
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-neutral-400 font-normal">
                PRD #7 & #10
              </span>
            </h4>
            <p className="text-xs text-neutral-400 line-clamp-1">{t.fairScale.subtitle}</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex-shrink-0">
          {status === 'balanced' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t.fairScale.balanced}
            </span>
          )}
          {status === 'generous' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <TrendingUp className="w-3.5 h-3.5" />
              {t.fairScale.generous}
            </span>
          )}
          {status === 'underValue' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <AlertTriangle className="w-3.5 h-3.5" />
              {t.fairScale.underValue}
            </span>
          )}
        </div>
      </div>

      {/* Dynamic Animated Balance Beam */}
      <div className="bg-black/30 rounded-xl p-3 sm:p-4 mb-3 border border-white/5">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="text-left">
            <span className="text-neutral-400 block text-[11px]">{t.fairScale.yourBundlePoints}</span>
            <span className="text-white font-bold text-base flex items-center gap-1">
              {offeredScore} <span className="text-[10px] text-neutral-500 font-normal">pts</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-white/10 rounded text-cyan-300 font-normal">
                {offeredItems.length} {offeredItems.length === 1 ? 'eşya' : 'eşya (paket)'}
              </span>
            </span>
          </div>

          {/* Visual Tilt Indicator */}
          <div className="flex flex-col items-center justify-center px-4">
            <div 
              className="w-16 h-1 bg-gradient-to-r from-cyan-400 via-white to-amber-400 rounded-full transition-transform duration-500 ease-out origin-center"
              style={{ transform: `rotate(${-tiltAngle}deg)` }}
            />
            <div className="w-2 h-2 rounded-full bg-white/40 mt-0.5" />
          </div>

          <div className="text-right">
            <span className="text-neutral-400 block text-[11px]">{t.fairScale.targetPoints}</span>
            <span className="text-white font-bold text-base flex items-center justify-end gap-1">
              {targetScore} <span className="text-[10px] text-neutral-500 font-normal">pts</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-white/10 rounded text-neutral-300 font-normal">
                {getTierLabel(targetItem.valueTier)}
              </span>
            </span>
          </div>
        </div>

        {/* Progress Comparison Bar */}
        <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden flex">
          <div 
            className={`h-full transition-all duration-500 ${
              status === 'balanced' ? 'bg-emerald-500' : status === 'generous' ? 'bg-blue-500' : 'bg-cyan-500'
            }`}
            style={{ width: `${Math.min(100, Math.round((offeredScore / (offeredScore + targetScore || 1)) * 100))}%` }}
          />
          <div 
            className="h-full bg-neutral-600 transition-all duration-500"
            style={{ width: `${Math.max(0, 100 - Math.min(100, Math.round((offeredScore / (offeredScore + targetScore || 1)) * 100)))}%` }}
          />
        </div>
      </div>

      {/* UnderValue Bundle Recommendation Box */}
      {status === 'underValue' && (
        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <span>{t.fairScale.bundleRecommendation}</span>
        </div>
      )}
    </div>
  )
}
