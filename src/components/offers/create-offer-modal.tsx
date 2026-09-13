'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { X, ArrowRightLeft, Package, Check, AlertCircle, Loader2 } from 'lucide-react'
import { detectCashKeywords } from '@/lib/cashFilter'

export interface TargetItemSummary {
  id: string
  title: string
  images?: string[]
  city?: string
  condition?: string
  userId?: string
}

export interface UserPortfolioItem {
  id: string
  title: string
  images: string[]
  status: string
  city?: string
  condition?: string
  category?: {
    nameTr: string
  }
}

interface CreateOfferModalProps {
  isOpen: boolean
  targetItem: TargetItemSummary | null
  initialOfferedItemId?: string | null
  onClose: () => void
  onSuccess?: (offerId: string) => void
}

export const CreateOfferModal: React.FC<CreateOfferModalProps> = ({
  isOpen,
  targetItem,
  initialOfferedItemId,
  onClose,
  onSuccess,
}) => {
  const [myItems, setMyItems] = useState<UserPortfolioItem[]>([])
  const [selectedMyItemIds, setSelectedMyItemIds] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [loadingItems, setLoadingItems] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Fetch available items of authenticated user
  useEffect(() => {
    if (!isOpen) return

    let active = true

    fetch('/api/items/mine')
      .then((res) => res.json())
      .then((data) => {
        if (!active) return
        if (data.success && Array.isArray(data.data)) {
          // Only AVAILABLE items can be offered
          const available = data.data.filter((item: UserPortfolioItem) => item.status === 'AVAILABLE')
          setMyItems(available)

          if (initialOfferedItemId && available.some((i: UserPortfolioItem) => i.id === initialOfferedItemId)) {
            setSelectedMyItemIds([initialOfferedItemId])
          } else if (available.length > 0) {
            setSelectedMyItemIds([available[0].id])
          } else {
            setSelectedMyItemIds([])
          }
        }
        setLoadingItems(false)
      })
      .catch((err) => {
        if (!active) return
        console.error('Error fetching user items for offer modal:', err)
        setErrorMessage('İlanlarınız yüklenemedi.')
        setLoadingItems(false)
      })

    return () => {
      active = false
    }
  }, [isOpen, initialOfferedItemId])

  // Zero-Cash filter evaluation on note
  const cashCheck = useMemo(() => detectCashKeywords(note), [note])

  if (!isOpen || !targetItem) return null

  const toggleSelectMyItem = (id: string) => {
    setSelectedMyItemIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (selectedMyItemIds.length === 0) {
      setErrorMessage('Lütfen teklif etmek için en az bir eşyanızı seçin.')
      return
    }

    if (cashCheck.hasCashViolation) {
      setErrorMessage('Teklif notunda nakit para, ücret veya satış ifadesi bulunamaz (Sıfır Nakit Kuralı).')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offeredItemIds: selectedMyItemIds,
          requestedItemIds: [targetItem.id],
          note: note.trim() || null,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrorMessage(data.error?.message || 'Teklif gönderilemedi.')
        setSubmitting(false)
        return
      }

      setSuccessMessage('Takas teklifiniz başarıyla gönderildi!')
      setTimeout(() => {
        setSubmitting(false)
        onClose()
        if (onSuccess && data.data?.id) {
          onSuccess(data.data.id)
        }
      }, 1200)
    } catch (err: unknown) {
      console.error('Submit offer error:', err)
      setErrorMessage('Teklif gönderilirken bir ağ hatası oluştu.')
      setSubmitting(false)
    }
  }

  const targetImage = targetItem.images && targetItem.images.length > 0 ? targetItem.images[0] : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Takas Teklifi Oluştur</h3>
              <p className="text-xs text-zinc-400">Birebir veya çoklu eşya takası teklif edin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Target Item (Requested) */}
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
              İstediğiniz İlan (Hedef Eşya)
            </span>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0 border border-zinc-700/50">
                {targetImage ? (
                  <Image src={targetImage} alt={targetItem.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500">
                    <Package className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white line-clamp-1">{targetItem.title}</h4>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                  {targetItem.city && <span>{targetItem.city}</span>}
                  {targetItem.condition && <span>• {targetItem.condition}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* User's Available Items to Offer */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Karşılığında Teklif Edeceğiniz Eşyalarınız ({selectedMyItemIds.length} seçildi)
              </span>
              <span className="text-[11px] text-zinc-500">Birden fazla seçebilirsiniz</span>
            </div>

            {loadingItems ? (
              <div className="py-8 flex items-center justify-center text-zinc-500 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-xs">İlanlarınız yükleniyor...</span>
              </div>
            ) : myItems.length === 0 ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                Takasa açık aktif bir ilanınız bulunmamaktadır. Teklif verebilmek için önce bir ilan oluşturmalısınız.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {myItems.map((item) => {
                  const isSelected = selectedMyItemIds.includes(item.id)
                  const itemImg = item.images && item.images.length > 0 ? item.images[0] : null
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleSelectMyItem(item.id)}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                          : 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0 border border-zinc-700/50">
                        {itemImg ? (
                          <Image src={itemImg} alt={item.title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-500">
                            <Package className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white line-clamp-1">{item.title}</p>
                        <p className="text-[11px] text-zinc-400 line-clamp-1">
                          {item.category?.nameTr || 'Genel'}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                          isSelected
                            ? 'bg-emerald-500 border-emerald-500 text-black'
                            : 'border-zinc-700 bg-zinc-800/50'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Offer Note with Cash Detection */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
              Teklif Notu (İsteğe Bağlı)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Karşı tarafa iletmek istediğiniz takas notu..."
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              maxLength={1000}
            />

            {/* Zero Cash Warning */}
            {cashCheck.hasCashViolation && (
              <div className="mt-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>
                  Sıfır Nakit Kuralı: Notunuzda nakit para veya satış ifadeleri tespit edildi. Lütfen kaldırın.
                </span>
              </div>
            )}
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={
                submitting ||
                selectedMyItemIds.length === 0 ||
                cashCheck.hasCashViolation ||
                myItems.length === 0
              }
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <ArrowRightLeft className="w-4 h-4" />
                  Teklifi Gönder
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
