'use client'

import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import { X, ArrowLeftRight, ShieldCheck, CheckCircle2, AlertCircle, Plus, Send, AlertTriangle, Shield, Check, Ban } from 'lucide-react'
import { TradeItem, SafeTradeZone } from '@/types'
import { mockMyPortfolio } from '@/data/mockData'
import { detectCashKeywords } from '@/lib/cashFilter'
import { useLanguage } from '@/i18n'
import FairBarterScale from '@/components/fair-barter-scale'
import SafeZonesPicker from '@/components/safe-zones-picker'
import { isUserTradeRestricted } from '@/data/mockReports'

interface TradeOfferModalProps {
  targetItem: TradeItem | null
  initialMyItem?: TradeItem | null
  onClose: () => void
  onSubmitOffer: (targetItem: TradeItem, selectedItems: TradeItem[], note: string, selectedSafeZone?: SafeTradeZone | null) => void
}

export const TradeOfferModal: React.FC<TradeOfferModalProps> = ({
  targetItem,
  initialMyItem,
  onClose,
  onSubmitOffer,
}) => {
  const { t } = useLanguage()
  const [selectedMyItemIds, setSelectedMyItemIds] = useState<string[]>(
    initialMyItem ? [initialMyItem.id] : [mockMyPortfolio[0]?.id || '']
  )
  const [selectedSafeZone, setSelectedSafeZone] = useState<SafeTradeZone | null>(null)
  const [note, setNote] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Selected items from portfolio
  const selectedItems = useMemo(
    () => mockMyPortfolio.filter(item => selectedMyItemIds.includes(item.id)),
    [selectedMyItemIds]
  )

  // PRD Madde 38: Teklif Notunda Nakit Para Engelleme Filtresi
  const cashCheck = useMemo(() => detectCashKeywords(note), [note])

  // Disiplin yaptırımı / Hesap kısıtlama kontrolü
  const tradeRestriction = useMemo(() => isUserTradeRestricted(), [])

  if (!targetItem) return null

  const toggleSelectItem = (id: string) => {
    setSelectedMyItemIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (tradeRestriction.restricted) return
    if (selectedMyItemIds.length === 0) return
    if (cashCheck.hasCashViolation) return

    onSubmitOffer(targetItem, selectedItems, note, selectedSafeZone)
    setIsSubmitted(true)
  }

  const handleResetAndClose = () => {
    setIsSubmitted(false)
    setNote('')
    setSelectedSafeZone(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-zinc-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-zinc-900">{t.tradeOffer.title}</h3>
              <p className="text-xs text-zinc-500">{t.tradeOffer.subtitle}</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-black text-zinc-900">{t.tradeOffer.offerSentSuccess}</h4>
            <p className="text-sm text-zinc-600 max-w-md mx-auto">
              {t.tradeOffer.offerSentDesc}
            </p>

            {/* PRD Madde 16: Teklif Aşamaları Özeti */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 max-w-lg mx-auto text-left">
              <h5 className="text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                {t.tradeOffer.tradeProcessTitle}
              </h5>
              <div className="flex items-center justify-between text-[11px] text-zinc-500 font-medium">
                <span className="text-emerald-700 font-bold">1. {t.statuses.SUBMITTED} ✓</span>
                <span>→</span>
                <span>2. {t.statuses.NEGOTIATING}</span>
                <span>→</span>
                <span>3. {t.statuses.PRE_AGREEMENT}</span>
                <span>→</span>
                <span className="text-amber-700 font-bold">4. {t.statuses.CONTACT_REVEALED}</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 max-w-md mx-auto text-xs text-amber-800 text-left flex gap-2">
              <ShieldCheck className="w-5 h-5 shrink-0 text-amber-600" />
              <span>
                <strong>{t.tradeOffer.privacyBarrierTitle}:</strong> {t.tradeOffer.privacyBarrierDesc}
              </span>
            </div>

            <button
              onClick={handleResetAndClose}
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              {t.createListing.done}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Cash violation alert in offer note */}
            {cashCheck.hasCashViolation && (
              <div className="p-3.5 bg-red-50 border-2 border-red-300 rounded-2xl text-xs text-red-900 flex items-start gap-2.5 animate-pulse">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">{t.createListing.cashBlockedTitle}</strong>
                  {cashCheck.warningMessage}
                  <p className="mt-1 text-[11px] text-red-700">
                    {t.tradeOffer.pureBarterWarning}
                  </p>
                </div>
              </div>
            )}

            {/* Target Item (What you want) */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-2">
                1. {t.tradeOffer.targetItemTitle}
              </label>
              <div className="flex items-center gap-3.5 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <Image
                    src={targetItem.images[0]}
                    alt={targetItem.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-700">{targetItem.user.name}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-1.5 py-0.2 rounded">
                      JetTrust {targetItem.user.jetTrust}/100
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-zinc-900 truncate">{targetItem.title}</h4>
                  <p className="text-xs text-zinc-500 line-clamp-1">{targetItem.city}, {targetItem.country}</p>
                </div>
              </div>
            </div>

            {/* PRD Madde 15: Çoklu Ürün Takası (What you offer) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  2. {t.tradeOffer.selectMyItem}
                </label>
                <span className="text-[11px] text-emerald-600 font-bold">
                  {selectedMyItemIds.length} {t.tradeOffer.itemsSelected}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mockMyPortfolio.map(item => {
                  const isSelected = selectedMyItemIds.includes(item.id)
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleSelectItem(item.id)}
                      className={`relative flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'border-zinc-200 hover:border-zinc-300 bg-white'
                      }`}
                    >
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={item.images[0]}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="font-bold text-xs text-zinc-900 truncate">{item.title}</h5>
                        <span className="text-[10px] text-zinc-500 block truncate">{t.tradeOffer.inYourPortfolio}</span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                          isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-zinc-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  )
                })}
              </div>

              {selectedMyItemIds.length === 0 ? (
                <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {t.tradeOffer.atLeastOneItem}
                </p>
              ) : (
                <div className="mt-4">
                  <FairBarterScale
                    offeredItems={selectedItems}
                    targetItem={targetItem}
                  />
                </div>
              )}
            </div>

            {/* Note to the Owner */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-2">
                3. {t.tradeOffer.offerNoteLabel}
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder={t.tradeOffer.offerNotePlaceholder}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
              />
            </div>

            {/* Step 4: Safe Meetup Zone (Elden Takas Güvenli Noktası) */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-2">
                4. {t.safeZones.title}
              </label>
              <SafeZonesPicker
                selectedZone={selectedSafeZone}
                onSelectZone={setSelectedSafeZone}
                city={targetItem.city}
                district={targetItem.district}
              />
            </div>

            {/* Sanction Restriction Alert Banner */}
            {tradeRestriction.restricted && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-3">
                <Ban className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <strong className="block font-black text-red-900">
                    ⛔ Hesabınızda Aktif Yaptırım Bulunmaktadır ({tradeRestriction.sanction ? (t.moderation.sanctionTypes[tradeRestriction.sanction.type] || tradeRestriction.sanction.type) : 'Askıda'})
                  </strong>
                  <p className="text-[11px] text-red-700">
                    {tradeRestriction.reason || 'Disiplin yaptırımı nedeniyle yeni takas teklifi gönderimi kilitlenmiştir.'}
                  </p>
                </div>
              </div>
            )}

            {/* Privacy Gate Info Card */}
            <div className="p-4 rounded-2xl bg-zinc-900 text-zinc-200 text-xs flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold mb-0.5">{t.tradeOffer.privacyBarrierTitle}</strong>
                {t.tradeOffer.privacyBarrierDesc}
              </div>
            </div>

            {/* Submit & Cancel */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                disabled={selectedMyItemIds.length === 0 || cashCheck.hasCashViolation || tradeRestriction.restricted}
                className={`flex items-center gap-2 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer ${
                  tradeRestriction.restricted
                    ? 'bg-zinc-700 opacity-60 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-emerald-600/20'
                }`}
              >
                {tradeRestriction.restricted ? <Ban className="w-3.5 h-3.5 text-red-400" /> : <Send className="w-3.5 h-3.5" />}
                <span>{tradeRestriction.restricted ? 'Hesap Kısıtlı - Teklif Verilemez' : t.tradeOffer.submitOffer}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
