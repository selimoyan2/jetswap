'use client'

import React, { useState } from 'react'
import {
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  Lock,
} from 'lucide-react'
import { ContactRevealState, RevealedContactInfo, TradeHandoffSummary } from '@/lib/offers/types'
import { useLanguage } from '@/i18n'

interface TradeHandoffPanelProps {
  offerId: string
  contactReveal?: ContactRevealState
  contact?: RevealedContactInfo | null
  tradeHandoff?: TradeHandoffSummary
  onApprovalSuccess?: () => void
}

export function TradeHandoffPanel({
  offerId,
  contactReveal,
  contact,
  tradeHandoff,
  onApprovalSuccess,
}: TradeHandoffPanelProps) {
  const { t, language } = useLanguage()
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!contactReveal || !contactReveal.available) {
    return null
  }

  const isRevealed = contactReveal.revealed
  const myApproval = contactReveal.myApproval
  const otherApproval = contactReveal.otherApproval

  const handleApprove = async () => {
    setSubmitting(true)
    setErrorMessage(null)

    try {
      const res = await fetch(`/api/offers/${offerId}/contact-approval`, {
        method: 'POST',
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrorMessage(data.error?.message || 'Onay verilirken bir hata oluştu.')
      } else {
        setIsConfirmModalOpen(false)
        if (onApprovalSuccess) {
          onApprovalSuccess()
        }
      }
    } catch (err: unknown) {
      console.error('Contact approval error:', err)
      setErrorMessage('Ağ bağlantısı sırasında bir sorun oluştu.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl bg-zinc-950/80 border border-zinc-800/80 p-6 space-y-6">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Takas Teslim Aşaması</h3>
          </div>
          <p className="text-xs text-zinc-400">
            Takas şartları kabul edildi. Buluşma veya gönderim detaylarını planlamak için iletişim
            bilgilerinizi karşılıklı olarak paylaşabilirsiniz.
          </p>
        </div>
      </div>

      {/* State 1: Both Approved & Revealed */}
      {isRevealed && contact ? (
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 text-emerald-400 text-xs">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-sm font-semibold text-emerald-300">
                İletişim Bilgileri Açıldı
              </strong>
              <span>
                Her iki taraf da onay verdi. Artık karşı tarafla iletişime geçebilir ve teslimat
                adımlarını koordine edebilirsiniz.
              </span>
            </div>
          </div>

          {/* Contact Card */}
          <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Karşı Taraf İletişim Bilgileri
              </span>
              <span className="text-xs text-zinc-500">Kişisel Bilgiler Korunmaktadır</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1">
                <span className="text-xs text-zinc-500 block">Ad Soyad</span>
                <p className="text-sm font-semibold text-white">{contact.name}</p>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <span className="text-xs text-zinc-500 block">Telefon</span>
                {contact.phone ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{contact.phone}</span>
                    <a
                      href={`tel:${contact.phone}`}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      Ara
                    </a>
                  </div>
                ) : (
                  <span className="text-xs text-zinc-500 italic">Telefon bilgisi eklenmemiş.</span>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1 sm:col-span-2">
                <span className="text-xs text-zinc-500 block">E-posta</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white break-all">{contact.email}</span>
                  <a
                    href={`mailto:${contact.email}`}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
                  >
                    <Mail className="w-3 h-3" />
                    E-posta Gönder
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-500">
              Bu bilgiler yalnızca kabul edilmiş takasın taraflarına gösterilir. JetSwap harici
              yapılan görüşmelerde güvenlik ilkelerine dikkat ediniz.
            </div>
          </div>
        </div>
      ) : (
        /* State 2 & 3: Pending Mutual Approval */
        <div className="space-y-4">
          {/* Status summary banner */}
          {myApproval && !otherApproval ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-amber-300 text-xs">
              <Clock className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
              <div>
                <strong className="block text-sm font-semibold text-amber-200">
                  Onayın alındı.
                </strong>
                <span>
                  İletişim bilgileri, karşı taraf da paylaşımı onayladığında her iki tarafa aynı anda
                  açılacaktır.
                </span>
              </div>
            </div>
          ) : !myApproval && otherApproval ? (
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3 text-blue-300 text-xs">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-400" />
              <div>
                <strong className="block text-sm font-semibold text-blue-200">
                  Karşı taraf iletişim bilgilerini paylaşmayı onayladı.
                </strong>
                <span>
                  İletişim bilgilerinin her iki tarafa açılması için senin de onay vermen gerekiyor.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start gap-3 text-zinc-400 text-xs">
              <Lock className="w-5 h-5 flex-shrink-0 mt-0.5 text-zinc-500" />
              <div>
                <strong className="block text-sm font-semibold text-zinc-200">
                  İletişim Bilgileri Gizli
                </strong>
                <span>
                  Kişisel gizliliğinizi korumak adına iletişim bilgileri (telefon ve e-posta) ancak
                  iki taraf da onayladığında açılır.
                </span>
              </div>
            </div>
          )}

          {/* Action button when user hasn't approved yet */}
          {!myApproval && (
            <div className="pt-2">
              <button
                onClick={() => setIsConfirmModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <ShieldCheck className="w-4 h-4" />
                İletişim Bilgilerimi Paylaşmayı Onaylıyorum
              </button>
            </div>
          )}
        </div>
      )}

      {/* Trade Delivery Guidance (TradeMethod) */}
      {tradeHandoff && (
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/60 space-y-3">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
            Önerilen Teslimat Rehberi
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {tradeHandoff.hasHandToHand && (
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Elden Takas</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Buluşma yerini ve zamanını mesaj veya telefon ile karşılıklı olarak belirleyin.
                  Mümkünse halka açık ve aydınlık bir buluşma noktası tercih edin.
                </p>
              </div>
            )}

            {tradeHandoff.hasCargo && (
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
                  <Truck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Kargo ile Takas</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Gönderim detaylarını, takip numaralarını ve kargo şubesini karşılıklı olarak
                  netleştirin. Ürünü özenle paketleyin.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  İletişim Bilgilerini Paylaşmayı Onaylıyor musun?
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">Karşılıklı Onay İlkesi</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Karşı taraf da onay verdiğinde telefon ve e-posta bilgileriniz birbirinize
              gösterilecektir. JetSwap sıfır-nakit takas ilkesi devam etmektedir.
            </p>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
              >
                Vazgeç
              </button>
              <button
                onClick={handleApprove}
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-colors flex items-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Paylaşmayı Onayla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
