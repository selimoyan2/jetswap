'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Star, MessageSquare, Loader2, CheckCircle2, ShieldCheck, User as UserIcon } from 'lucide-react'
import { ReviewState } from '@/lib/offers/types'
import { TradeOfferStatus } from '@prisma/client'
import { useLanguage } from '@/i18n'
import { formatLocalizedDate } from '@/i18n/helpers'

interface TradeReviewPanelProps {
  offerId: string
  status: TradeOfferStatus
  reviews?: ReviewState
  counterpartName: string
  onReviewSuccess?: () => void
}

export function TradeReviewPanel({
  offerId,
  status,
  reviews,
  counterpartName,
  onReviewSuccess,
}: TradeReviewPanelProps) {
  const { t, language } = useLanguage()
  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Only render on COMPLETED offers
  if (status !== 'COMPLETED') {
    return null
  }

  const myReview = reviews?.myReview
  const otherReview = reviews?.otherReview
  const canReview = reviews?.canReview ?? (!myReview)

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const res = await fetch(`/api/offers/${offerId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || null,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrorMessage(data.error?.message || 'Değerlendirme gönderilirken bir hata oluştu.')
        return
      }

      setSuccessMessage('Değerlendirmeniz başarıyla kaydedildi.')
      if (onReviewSuccess) {
        onReviewSuccess()
      }
    } catch {
      setErrorMessage('Bağlantı hatası oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs p-6 mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Takas Değerlendirmeleri</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Takas deneyimini puanlayarak topluluğun güvenle takas yapmasına katkıda bulun.
          </p>
        </div>
      </div>

      {/* Review Submission Form (if user can review) */}
      {canReview && (
        <form onSubmit={handleSubmitReview} className="mb-6 bg-zinc-50/70 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5">
          <h4 className="font-bold text-sm text-zinc-900 dark:text-white mb-1">
            {counterpartName} ile olan takasını değerlendir
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            Ürün durumu, iletişim ve teslimat sürecini 1 ile 5 yıldız arasında puanlayın.
          </p>

          {/* Accessible Star Rating Control */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Puanınız: <span className="text-amber-600 dark:text-amber-400 font-bold">{hoverRating || rating} / 5</span>
            </label>
            <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Takas Puanı">
              {[1, 2, 3, 4, 5].map((starVal) => {
                const isFilled = starVal <= (hoverRating || rating)
                return (
                  <button
                    key={starVal}
                    type="button"
                    role="radio"
                    aria-checked={rating === starVal}
                    aria-label={`${starVal} yıldız`}
                    onClick={() => setRating(starVal)}
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 rounded-xl hover:bg-amber-100/50 dark:hover:bg-amber-950/40 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        isFilled
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-zinc-300 dark:text-zinc-600 hover:text-amber-300'
                      }`}
                    />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Comment Textarea */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="review-comment" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Yorumunuz (İsteğe bağlı)
              </label>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {comment.length} / 1000
              </span>
            </div>
            <textarea
              id="review-comment"
              rows={3}
              value={comment}
              maxLength={1000}
              disabled={isSubmitting}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Takas süreci nasıldı? Ürün anlatıldığı gibi miydi?"
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none disabled:opacity-50 disabled:bg-zinc-50 dark:disabled:bg-zinc-800"
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>
              Yorumlarda nakit para ve telefon/e-posta gibi iletişim bilgileri paylaşılamaz.
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-xl mb-4 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl mb-4 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {successMessage}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  Değerlendirmeyi Gönder
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Submitted Reviews Display */}
      <div className="space-y-4">
        {/* User's Own Review */}
        {myReview && (
          <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Senin Değerlendirmen</span>
                <span className="text-[11px] text-zinc-400">
                  {formatLocalizedDate(myReview.createdAt, language)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= myReview.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-zinc-200 dark:text-zinc-700'
                    }`}
                  />
                ))}
              </div>
            </div>
            {myReview.comment ? (
              <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
                {myReview.comment}
              </p>
            ) : (
              <p className="text-xs text-zinc-400 italic">
                {language === 'tr' ? 'Yorum yapılmadı.' : 'No comment provided.'}
              </p>
            )}
          </div>
        )}

        {/* Counterpart's Review */}
        {otherReview && (
          <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
                  {otherReview.author.avatar ? (
                    <Image
                      src={otherReview.author.avatar}
                      alt={otherReview.author.name}
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                  )}
                </div>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  {otherReview.author.name}&apos;in Değerlendirmesi
                </span>
                <span className="text-[11px] text-zinc-400">
                  {formatLocalizedDate(otherReview.createdAt, language)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= otherReview.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-zinc-200 dark:text-zinc-700'
                    }`}
                  />
                ))}
              </div>
            </div>
            {otherReview.comment ? (
              <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
                {otherReview.comment}
              </p>
            ) : (
              <p className="text-xs text-zinc-400 italic">Yorum yapılmadı.</p>
            )}
          </div>
        )}

        {!myReview && !otherReview && !canReview && (
          <p className="text-xs text-zinc-400 text-center py-2">
            Henüz yapılmış bir değerlendirme bulunmuyor.
          </p>
        )}
      </div>
    </div>
  )
}
