'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  User,
  Calendar,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Ban,
} from 'lucide-react'
import { SerializedTradeOffer } from '@/lib/offers/types'
import { OfferStatusBadge } from '@/components/offers/offer-status-badge'
import { OfferExchangeView } from '@/components/offers/offer-exchange-view'
import { OfferChat } from '@/components/messages'

interface OfferDetailClientProps {
  offerId: string
}

export function OfferDetailClient({ offerId }: OfferDetailClientProps) {
  const [offer, setOffer] = useState<SerializedTradeOffer | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  useEffect(() => {
    let active = true

    fetch(`/api/offers/${offerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return
        if (!data.success) {
          setError(data.error?.message || 'Teklif yüklenemedi.')
          setOffer(null)
        } else {
          setOffer(data.data)
        }
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (!active) return
        console.error('Fetch offer detail error:', err)
        setError('Teklif detayı yüklenirken bir ağ hatası oluştu.')
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [offerId])

  const handleAction = async (action: 'accept' | 'reject' | 'cancel') => {
    if (!offer) return
    setActionLoading(true)
    setActionFeedback(null)

    try {
      const res = await fetch(`/api/offers/${offerId}/${action}`, {
        method: 'POST',
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setActionFeedback({
          type: 'error',
          message: data.error?.message || `İşlem gerçekleştirilemedi.`,
        })
      } else {
        setOffer(data.data)
        setActionFeedback({
          type: 'success',
          message:
            action === 'accept'
              ? 'Takas teklifi kabul edildi! İlgili ilanlar takas sürecine alındı.'
              : action === 'reject'
              ? 'Takas teklifi reddedildi.'
              : 'Takas teklifiniz iptal edildi.',
        })
      }
    } catch (err: unknown) {
      console.error(`Action ${action} error:`, err)
      setActionFeedback({
        type: 'error',
        message: 'İşlem sırasında bir hata oluştu.',
      })
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-3" />
        <p className="text-sm text-zinc-400">Teklif detayları yükleniyor...</p>
      </div>
    )
  }

  if (error || !offer) {
    return (
      <div className="p-8 rounded-3xl bg-zinc-950 border border-zinc-900 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-white">Teklif Görüntülenemedi</h3>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">{error || 'Teklif bulunamadı.'}</p>
        <Link
          href="/offers"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-white hover:border-zinc-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Tekliflerime Dön
        </Link>
      </div>
    )
  }

  const isSender = offer.viewerRole === 'SENDER'
  const otherParty = isSender ? offer.receiver : offer.sender

  const formattedDate = new Date(offer.createdAt).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/offers?type=${isSender ? 'sent' : 'received'}`}
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Teklif Listesine Dön
        </Link>

        <OfferStatusBadge status={offer.status} />
      </div>

      {/* Main Info Card */}
      <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-6">
        {/* Header Profile Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 overflow-hidden relative flex-shrink-0">
              {otherParty.avatar ? (
                <Image src={otherParty.avatar} alt={otherParty.name} fill className="object-cover" />
              ) : (
                <User className="w-6 h-6 text-zinc-400 m-auto mt-3" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-400">
                  {isSender ? 'Teklif Gönderilen Kullanıcı:' : 'Teklifi Gönderen Kullanıcı:'}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {isSender ? 'Alıcı' : 'Gönderen'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">{otherParty.name}</h2>
              {otherParty.city && (
                <p className="text-xs text-zinc-500 mt-0.5">
                  {otherParty.city}
                  {otherParty.country ? `, ${otherParty.country}` : ''}
                </p>
              )}
            </div>
          </div>

          <div className="text-right text-xs text-zinc-500">
            <span className="flex items-center gap-1 sm:justify-end">
              <Calendar className="w-3.5 h-3.5" />
              Oluşturulma:
            </span>
            <p className="text-zinc-400 font-medium mt-0.5">{formattedDate}</p>
          </div>
        </div>

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-center gap-3 ${
              actionFeedback.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}
          >
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
        )}

        {/* Visual Exchange View */}
        <OfferExchangeView
          offeredItems={offer.offeredItems}
          requestedItems={offer.requestedItems}
          viewerRole={offer.viewerRole}
        />

        {/* Offer Note */}
        {offer.note && (
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-1.5">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
              Teklif Notu
            </h4>
            <p className="text-sm text-zinc-300 italic">&ldquo;{offer.note}&rdquo;</p>
          </div>
        )}

        {/* Privacy Notice: Zero Contact Reveal */}
        <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/60 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-zinc-400 leading-relaxed">
            <strong className="text-zinc-200">JetSwap Güvenli Takas İlkesi:</strong> Bu aşamada kişisel
            iletişim bilgileri (telefon, e-posta) gizli tutulmaktadır. Takas teklifleri yalnızca
            sistem üzerinden onaylanır ve yönetilir.
          </div>
        </div>

        {/* Action Buttons */}
        {offer.status === 'PENDING' && (
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            {offer.canCancel && (
              <button
                onClick={() => handleAction('cancel')}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-semibold text-xs transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Ban className="w-4 h-4" />
                )}
                Teklifi İptal Et
              </button>
            )}

            {offer.canReject && (
              <button
                onClick={() => handleAction('reject')}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold text-xs transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Teklifi Reddet
              </button>
            )}

            {offer.canAccept && (
              <button
                onClick={() => handleAction('accept')}
                disabled={actionLoading}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Takası Kabul Et
              </button>
            )}
          </div>
        )}

        {/* Offer Negotiation & Messages Area (Sprint 7) */}
        <div className="pt-2">
          <OfferChat offerId={offer.id} offerStatus={offer.status} />
        </div>
      </div>
    </div>
  )
}
