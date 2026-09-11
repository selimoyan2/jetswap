'use client'

import React, { useState } from 'react'
import { TradeOffer, TradeItem } from '@/types'
import { useLanguage } from '@/i18n'
import { Leaf, Check, Share2, Trees, Sparkles, Award, X } from 'lucide-react'

interface EcoImpactModalProps {
  isOpen: boolean
  onClose: () => void
  offer?: TradeOffer | null
  item?: TradeItem | null
}

export default function EcoImpactModal({ isOpen, onClose, offer, item }: EcoImpactModalProps) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const target = item || offer?.requestedItems?.[0] || offer?.offeredItems?.[0]
  const co2 = target?.ecoImpact?.co2SavedKg || 14.5
  const waste = target?.ecoImpact?.wasteDivertedKg || 3.2
  const trees = Math.max(1, Math.round(co2 * 0.15))

  const shareText = `🌿 JetSwap Eko-Takas Karnesi:
🔄 Sıfır Nakit, %100 Eşyadan Eşyaya Takas!
💨 Önlenen CO₂: ${co2} kg
♻️ Kurtarılan Atık: ${waste} kg
🌲 Ağaç Eşdeğeri: ${trees} fidan
Doğaya nefes olmak için sen de eşyalarını satma, JetSwap ile takasla! 👉 jetswap.com.tr`

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Glow Header */}
        <div className="relative p-6 bg-gradient-to-br from-emerald-950/80 via-neutral-900 to-teal-950/60 border-b border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Leaf className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {t.ecoImpact.title}
                </h3>
                <p className="text-xs text-emerald-300/80 mt-0.5">{t.ecoImpact.subtitle}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="p-6 space-y-6">
          {/* Visual Certificate Card */}
          <div className="relative rounded-2xl bg-gradient-to-br from-emerald-900/40 to-black/60 border border-emerald-500/30 p-5 overflow-hidden text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Award className="w-4 h-4 text-emerald-400" />
              {t.ecoImpact.badgeEcoWarrior}
            </div>

            <div>
              <h4 className="text-base font-bold text-white mb-1">
                {target?.title || 'Eşyadan Eşyaya Döngüsel Takas'}
              </h4>
              <p className="text-xs text-neutral-300">
                Sıfır nakit kuralı sayesinde yeni üretim talebi azaltıldı ve karbon ayak izi sıfırlandı.
              </p>
            </div>

            {/* Impact Metric Counters */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-xl bg-black/50 border border-emerald-500/20 flex flex-col items-center">
                <span className="text-xl sm:text-2xl font-black text-emerald-400">{co2}</span>
                <span className="text-[10px] text-neutral-400 mt-1 uppercase font-semibold">kg CO₂</span>
                <span className="text-[9px] text-neutral-500 text-center mt-0.5">Tasarruf</span>
              </div>

              <div className="p-3 rounded-xl bg-black/50 border border-emerald-500/20 flex flex-col items-center">
                <span className="text-xl sm:text-2xl font-black text-teal-400">{waste}</span>
                <span className="text-[10px] text-neutral-400 mt-1 uppercase font-semibold">kg Katı Atık</span>
                <span className="text-[9px] text-neutral-500 text-center mt-0.5">Kurtarılan</span>
              </div>

              <div className="p-3 rounded-xl bg-black/50 border border-emerald-500/20 flex flex-col items-center">
                <span className="text-xl sm:text-2xl font-black text-cyan-400 flex items-center gap-0.5">
                  <Trees className="w-4 h-4 text-cyan-400" />
                  {trees}
                </span>
                <span className="text-[10px] text-neutral-400 mt-1 uppercase font-semibold">Fidan</span>
                <span className="text-[9px] text-neutral-500 text-center mt-0.5">Eşdeğeri</span>
              </div>
            </div>

            <div className="text-[11px] text-emerald-400/80 font-medium flex items-center justify-center gap-1 pt-1">
              <Sparkles className="w-3.5 h-3.5" />
              JetSwap Döngüsel Ekonomi Girişimi Onaylıdır
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleCopy}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
                copied
                  ? 'bg-emerald-500 text-black shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black shadow-emerald-500/20'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  {t.ecoImpact.copied}
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  {t.ecoImpact.copySummary}
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-neutral-400">
              {t.ecoImpact.shareCardDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
