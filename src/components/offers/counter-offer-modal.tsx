'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  X,
  ArrowRightLeft,
  Package,
  Check,
  AlertCircle,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { detectCashKeywords } from '@/lib/cashFilter'
import { detectContactInfo } from '@/lib/contactFilter'

export interface AvailableSwapItem {
  id: string
  title: string
  images?: string[]
  city?: string
  condition?: string
  status?: string
}

interface CounterOfferModalProps {
  isOpen: boolean
  parentOfferId: string
  counterpartyId: string
  counterpartyName: string
  initialOfferedItemIds?: string[]
  initialRequestedItemIds?: string[]
  onClose: () => void
  onSuccess?: (newOfferId: string) => void
}

export function CounterOfferModal({
  isOpen,
  parentOfferId,
  counterpartyId,
  counterpartyName,
  initialOfferedItemIds = [],
  initialRequestedItemIds = [],
  onClose,
  onSuccess,
}: CounterOfferModalProps) {
  const router = useRouter()
  const [myItems, setMyItems] = useState<AvailableSwapItem[]>([])
  const [theirItems, setTheirItems] = useState<AvailableSwapItem[]>([])
  const [selectedMyItemIds, setSelectedMyItemIds] = useState<string[]>([])
  const [selectedTheirItemIds, setSelectedTheirItemIds] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Fetch available items for both participants
  useEffect(() => {
    if (!isOpen) return

    let active = true
    const timer = setTimeout(() => {
      if (active) {
        setLoading(true)
        setErrorMessage(null)
      }
    }, 0)

    Promise.all([
      fetch('/api/items/mine')
        .then((res) => res.json())
        .catch(() => ({ success: false })),
      fetch(`/api/items?userId=${counterpartyId}`)
        .then((res) => res.json())
        .catch(() => ({ success: false })),
    ])
      .then(([mineRes, theirRes]) => {
        if (!active) return

        if (mineRes.success && Array.isArray(mineRes.data)) {
          const availableMine = mineRes.data.filter(
            (i: AvailableSwapItem) => i.status === 'AVAILABLE'
          )
          setMyItems(availableMine)

          // Pre-select initial items or first item
          if (initialOfferedItemIds.length > 0) {
            setSelectedMyItemIds(
              initialOfferedItemIds.filter((id) =>
                availableMine.some((i: AvailableSwapItem) => i.id === id)
              )
            )
          } else if (availableMine.length > 0) {
            setSelectedMyItemIds([availableMine[0].id])
          }
        }

        if (theirRes.success && Array.isArray(theirRes.data)) {
          const availableTheir = theirRes.data.filter(
            (i: AvailableSwapItem) => i.status === 'AVAILABLE'
          )
          setTheirItems(availableTheir)

          // Pre-select initial items or first item
          if (initialRequestedItemIds.length > 0) {
            setSelectedTheirItemIds(
              initialRequestedItemIds.filter((id) =>
                availableTheir.some((i: AvailableSwapItem) => i.id === id)
              )
            )
          } else if (availableTheir.length > 0) {
            setSelectedTheirItemIds([availableTheir[0].id])
          }
        }

        setLoading(false)
      })
      .catch((err) => {
        if (!active) return
        console.error('Error fetching counter offer items:', err)
        setErrorMessage('Eşyalar yüklenirken bir hata oluştu.')
        setLoading(false)
      })

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [isOpen, counterpartyId, initialOfferedItemIds, initialRequestedItemIds])

  // Live filter validations
  const cashCheck = useMemo(() => detectCashKeywords(note), [note])
  const contactCheck = useMemo(() => detectContactInfo(note), [note])

  const toggleMyItem = (itemId: string) => {
    setSelectedMyItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    )
  }

  const toggleTheirItem = (itemId: string) => {
    setSelectedTheirItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedMyItemIds.length === 0) {
      setErrorMessage('Lütfen vereceğiniz en az bir eşya seçin.')
      return
    }

    if (selectedTheirItemIds.length === 0) {
      setErrorMessage('Lütfen karşı taraftan istediğiniz en az bir eşya seçin.')
      return
    }

    if (cashCheck.hasCashViolation) {
      setErrorMessage(cashCheck.warningMessage || 'Nakit para içeren teklifler kullanılamaz.')
      return
    }

    if (contactCheck.blocked) {
      setErrorMessage(
        contactCheck.warningMessage || 'İletişim bilgileri bu aşamada paylaşılamaz.'
      )
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    try {
      const res = await fetch(`/api/offers/${parentOfferId}/counter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offeredItemIds: selectedMyItemIds,
          requestedItemIds: selectedTheirItemIds,
          note: note.trim() || null,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrorMessage(data.error?.message || 'Karşı teklif oluşturulamadı.')
        setSubmitting(false)
      } else {
        const newOfferId = data.data.id
        if (onSuccess) {
          onSuccess(newOfferId)
        }
        onClose()
        router.push(`/offers/${newOfferId}`)
      }
    } catch (err) {
      console.error('Counter offer submission error:', err)
      setErrorMessage('Karşı teklif gönderilirken bir bağlantı hatası oluştu.')
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Karşı Teklif Oluştur</h2>
              <p className="text-xs text-zinc-400">
                {counterpartyName} ile yeni takas şartlarını belirleyin.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="h-60 flex flex-col items-center justify-center gap-3 text-zinc-500">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              <span className="text-xs">Eşyalar hazırlanıyor...</span>
            </div>
          ) : (
            <>
              {/* Section 1: User's Offered Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Package className="w-4 h-4" />
                    Senin Vereceğin Eşyalar (Portföyünden)
                  </label>
                  <span className="text-xs text-zinc-400">
                    {selectedMyItemIds.length} seçildi
                  </span>
                </div>

                {myItems.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic p-3 rounded-xl bg-zinc-900/40 border border-zinc-800">
                    Portföyünüzde takasa açık (AVAILABLE) eşya bulunmuyor.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {myItems.map((item) => {
                      const isSelected = selectedMyItemIds.includes(item.id)
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleMyItem(item.id)}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-emerald-500/10 border-emerald-500 text-white'
                              : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                          }`}
                        >
                          <div className="relative w-11 h-11 rounded-lg bg-zinc-900 overflow-hidden flex-shrink-0">
                            {item.images?.[0] ? (
                              <Image
                                src={item.images[0]}
                                alt={item.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 m-auto text-zinc-600" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{item.title}</p>
                            <p className="text-[10px] text-zinc-500">
                              {item.condition || 'İyi'} • {item.city || 'İstanbul'}
                            </p>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                              isSelected
                                ? 'bg-emerald-500 border-emerald-500 text-black'
                                : 'border-zinc-700 bg-zinc-950'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Section 2: Counterparty's Requested Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Package className="w-4 h-4" />
                    Karşı Taraftan İstediğin Eşyalar ({counterpartyName})
                  </label>
                  <span className="text-xs text-zinc-400">
                    {selectedTheirItemIds.length} seçildi
                  </span>
                </div>

                {theirItems.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic p-3 rounded-xl bg-zinc-900/40 border border-zinc-800">
                    Karşı tarafın takasa açık başka eşyası bulunmuyor.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {theirItems.map((item) => {
                      const isSelected = selectedTheirItemIds.includes(item.id)
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleTheirItem(item.id)}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-blue-500/10 border-blue-500 text-white'
                              : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                          }`}
                        >
                          <div className="relative w-11 h-11 rounded-lg bg-zinc-900 overflow-hidden flex-shrink-0">
                            {item.images?.[0] ? (
                              <Image
                                src={item.images[0]}
                                alt={item.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 m-auto text-zinc-600" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{item.title}</p>
                            <p className="text-[10px] text-zinc-500">
                              {item.condition || 'İyi'} • {item.city || 'İstanbul'}
                            </p>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                              isSelected
                                ? 'bg-blue-500 border-blue-500 text-black'
                                : 'border-zinc-700 bg-zinc-950'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Note Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Karşı Teklif Notu (İsteğe bağlı)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Örn: Bu ürünle birlikte takas yapabiliriz, kargoyu ben karşılayabilirim..."
                  maxLength={1000}
                  rows={3}
                  className="w-full resize-none rounded-xl bg-zinc-900/70 border border-zinc-800 px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                />

                {/* Live validation feedback */}
                {cashCheck.hasCashViolation && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{cashCheck.warningMessage}</span>
                  </div>
                )}

                {contactCheck.blocked && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{contactCheck.warningMessage}</span>
                  </div>
                )}
              </div>

              {/* Error Callout */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-medium text-xs transition-colors"
            >
              Vazgeç
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                loading ||
                selectedMyItemIds.length === 0 ||
                selectedTheirItemIds.length === 0 ||
                cashCheck.hasCashViolation ||
                contactCheck.blocked
              }
              className="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-black font-bold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-40 disabled:hover:bg-blue-500"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRightLeft className="w-4 h-4" />
              )}
              <span>Karşı Teklifi Gönder</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
