'use client'

import React, { useState } from 'react'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  CheckCheck,
  Calendar,
} from 'lucide-react'
import { TradeCompletionState } from '@/lib/offers/types'
import { TradeOfferStatus } from '@prisma/client'
import { useLanguage } from '@/i18n'
import { formatLocalizedDate } from '@/i18n/helpers'

interface TradeCompletionPanelProps {
  offerId: string
  status: TradeOfferStatus
  contactRevealed: boolean
  completion?: TradeCompletionState
  onCompletionSuccess?: () => void
}

export function TradeCompletionPanel({
  offerId,
  status,
  contactRevealed,
  completion,
  onCompletionSuccess,
}: TradeCompletionPanelProps) {
  const { t, language } = useLanguage()
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isAccepted = status === 'ACCEPTED'
  const isCompleted = status === 'COMPLETED'

  // Only render if accepted and contact is revealed, OR if completed
  if ((!isAccepted || !contactRevealed) && !isCompleted) {
    return null
  }

  const myConfirmation = completion?.myConfirmation ?? false
  const otherConfirmation = completion?.otherConfirmation ?? false

  const handleConfirmCompletion = async () => {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const res = await fetch(`/api/offers/${offerId}/completion-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrorMessage(data.error?.message || 'İşlem sırasında bir hata oluştu.')
        return
      }

      setShowModal(false)
      if (onCompletionSuccess) {
        onCompletionSuccess()
      }
    } catch {
      setErrorMessage('Bağlantı hatası oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900/60 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isCompleted
                ? 'bg-emerald-500 text-white'
                : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
            }`}
          >
            {isCompleted ? (
              <CheckCheck className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
              {isCompleted ? 'Takas Başarıyla Tamamlandı' : 'Takası Tamamlama Onayı'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {isCompleted
                ? 'Bu takas her iki tarafın onayıyla tamamlandı ve eşyalar takaslandı olarak işaretlendi.'
                : 'Fiziksel takas gerçekleştikten sonra tamamlandığını karşılıklı onaylayın.'}
            </p>
          </div>
        </div>

        {isCompleted && completion?.completedAt && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            {formatLocalizedDate(completion.completedAt, language)}
          </div>
        )}
      </div>

      {/* Completion Status Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <div
          className={`p-4 rounded-2xl border transition-all ${
            myConfirmation
              ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
              : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">
              Senin Onayın
            </span>
            {myConfirmation ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Tamamlandı
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                Bekleniyor
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            {myConfirmation
              ? 'Takasın gerçekleştiğini onayladın.'
              : 'Eşyaları teslim aldığında onay vermen bekleniyor.'}
          </p>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            otherConfirmation
              ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
              : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">
              Karşı Tarafın Onayı
            </span>
            {otherConfirmation ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Tamamlandı
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                Bekleniyor
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            {otherConfirmation
              ? 'Karşı taraf takasın gerçekleştiğini onayladı.'
              : 'Karşı tarafın takas tamamlama onayı bekleniyor.'}
          </p>
        </div>
      </div>

      {/* Info Messages & CTA Button */}
      {!isCompleted && (
        <>
          {myConfirmation && !otherConfirmation && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl mb-4 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Onayın kaydedildi!</p>
                <p className="text-amber-800 dark:text-amber-300 mt-0.5">
                  Takas, karşı taraf da tamamlandığını onayladığında resmen tamamlanacak ve ürünler takaslandı olarak güncellenecektir.
                </p>
              </div>
            </div>
          )}

          {!myConfirmation && otherConfirmation && (
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-2xl mb-4 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Karşı taraf takasın gerçekleştiğini onayladı!</p>
                <p className="text-indigo-800 dark:text-indigo-300 mt-0.5">
                  Eğer eşyaları teslim aldıysan ve takas tamamlandıysa, süreci sonuçlandırmak için aşağıdaki butondan onay ver.
                </p>
              </div>
            </div>
          )}

          {!myConfirmation && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center sm:text-left">
                Yalnızca ürünleri fiziken teslim aldıktan sonra onaylayın.
              </p>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-2xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Takasın Gerçekleştiğini Onaylıyorum
              </button>
            </div>
          )}
        </>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h4 className="font-black text-xl text-zinc-900 dark:text-white mb-2">
              Takasın gerçekten gerçekleştiğini onaylıyor musun?
            </h4>

            <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4 leading-relaxed">
              Bu onay, karşı taraf da takası tamamladığını doğruladığında takasın resmen kapatılması ve eşyaların <strong className="text-zinc-900 dark:text-white">Takaslandı</strong> olarak işaretlenmesi için kullanılacaktır.
            </p>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200/80 dark:border-amber-800/80 mb-5 flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                Eşyaları henüz teslim almadıysanız veya takas sürecinde bir sorun varsa onay vermeyiniz.
              </span>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-2xl mb-4 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-sm rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Vazgeç
              </button>

              <button
                type="button"
                onClick={handleConfirmCompletion}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Onaylanıyor...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Takas Gerçekleşti
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
