'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
  ArrowRightLeft,
  Star,
} from 'lucide-react'
import { JetTrustBadge } from '@/components/jettrust'
import { SerializedTradeOffer } from '@/lib/offers/types'
import {
  OfferStatusBadge,
  OfferExchangeView,
  OfferHistoryTimeline,
  CounterOfferModal,
  TradeHandoffPanel,
  TradeCompletionPanel,
  TradeReviewPanel,
} from '@/components/offers'
import { OfferChat } from '@/components/messages'
import { useLanguage } from '@/i18n'
import { formatLocalizedDate } from '@/i18n/helpers'

interface OfferDetailClientProps {
  offerId: string
}

export function OfferDetailClient({ offerId }: OfferDetailClientProps) {
  const { t, language } = useLanguage()
  const [offer, setOffer] = useState<SerializedTradeOffer | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [isCounterModalOpen, setIsCounterModalOpen] = useState(false)

  const fetchOfferDetail = useCallback(() => {
    fetch(`/api/offers/${offerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setError(data.error?.message || t.common.error)
          setOffer(null)
        } else {
          setOffer(data.data)
        }
        setLoading(false)
      })
      .catch((err: unknown) => {
        console.error('Fetch offer detail error:', err)
        setError(t.common.error)
        setLoading(false)
      })
  }, [offerId, t.common.error])

  useEffect(() => {
    fetchOfferDetail()
  }, [fetchOfferDetail])

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
          message: data.error?.message || t.common.error,
        })
      } else {
        setOffer(data.data)
        setActionFeedback({
          type: 'success',
          message:
            action === 'accept'
              ? (language === 'tr' ? 'Takas teklifi kabul edildi! İlgili ilanlar takas sürecine alındı.' : 'Trade offer accepted! Involved listings are now in trade process.')
              : action === 'reject'
              ? (language === 'tr' ? 'Takas teklifi reddedildi.' : 'Trade offer was rejected.')
              : (language === 'tr' ? 'Takas teklifiniz iptal edildi.' : 'Trade offer cancelled.'),
        })
      }
    } catch (err: unknown) {
      console.error(`Action ${action} error:`, err)
      setActionFeedback({
        type: 'error',
        message: t.common.error,
      })
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        <span className="text-xs text-zinc-500">{t.common.loading}</span>
      </div>
    )
  }

  if (error || !offer) {
    return (
      <div className="p-8 rounded-3xl bg-zinc-950 border border-zinc-900 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-white">{t.common.error}</h3>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">{error || t.common.error}</p>
        <Link
          href="/offers"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-white hover:border-zinc-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.offers.detail.backToOffers}
        </Link>
      </div>
    )
  }

  const isSender = offer.viewerRole === 'SENDER'
  const otherParty = isSender ? offer.receiver : offer.sender

  const formattedDate = formatLocalizedDate(offer.createdAt, language)

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/offers?type=${isSender ? 'sent' : 'received'}`}
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.offers.detail.backToOffers}
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
                  {isSender ? (language === 'tr' ? 'Teklif Gönderilen Kullanıcı:' : 'Offer Sent To:') : (language === 'tr' ? 'Teklifi Gönderen Kullanıcı:' : 'Offer Received From:')}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {isSender ? t.offers.card.receiver : t.offers.card.sender}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <h2 className="text-lg font-bold text-white">{otherParty.name}</h2>
                <JetTrustBadge userId={otherParty.id} userName={otherParty.name} size="xs" />
                {otherParty.rating !== undefined && (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold"
                    title={`Rating: ${otherParty.rating.toFixed(1)} / 5 (${otherParty.reviewCount ?? 0})`}
                  >
                    <Star className="w-3 h-3 fill-current" />
                    <span>{otherParty.rating.toFixed(1)}</span>
                    <span className="text-zinc-500 font-normal">({otherParty.reviewCount ?? 0})</span>
                  </span>
                )}
              </div>
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
              {language === 'tr' ? 'Oluşturulma:' : 'Created:'}
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

        {/* Privacy Notice: Zero Contact Reveal (Shown while contact is not revealed) */}
        {!offer.contactRevealed && (
          <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/60 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-zinc-400 leading-relaxed">
              <strong className="text-zinc-200">JetSwap Güvenli Takas İlkesi:</strong> Bu aşamada kişisel
              iletişim bilgileri (telefon, e-posta) gizli tutulmaktadır. Takas teklifleri karşılıklı olarak onaylanıp iki taraf da iletişim paylaşımını onaylayana kadar sistem üzerinden yönetilir.
            </div>
          </div>
        )}

        {/* Trade Handoff & Contact Reveal Panel (Sprint 9) */}
        {(offer.status === 'ACCEPTED' || offer.status === 'COMPLETED') && offer.contactReveal && (
          <TradeHandoffPanel
            offerId={offer.id}
            contactReveal={offer.contactReveal}
            contact={offer.contact}
            tradeHandoff={offer.tradeHandoff}
            onApprovalSuccess={fetchOfferDetail}
          />
        )}

        {/* Trade Mutual Completion Panel (Sprint 10) */}
        {((offer.status === 'ACCEPTED' && offer.contactRevealed) || offer.status === 'COMPLETED') && (
          <TradeCompletionPanel
            offerId={offer.id}
            status={offer.status}
            contactRevealed={offer.contactRevealed}
            completion={offer.completion}
            onCompletionSuccess={fetchOfferDetail}
          />
        )}

        {/* Mutual Reviews Panel (Sprint 10) */}
        {offer.status === 'COMPLETED' && (
          <TradeReviewPanel
            offerId={offer.id}
            status={offer.status}
            reviews={offer.reviews}
            counterpartName={otherParty.name}
            onReviewSuccess={fetchOfferDetail}
          />
        )}

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
                {t.offers.detail.cancelOffer}
              </button>
            )}

            {offer.canCounter && (
              <button
                onClick={() => setIsCounterModalOpen(true)}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold text-xs transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <ArrowRightLeft className="w-4 h-4" />
                {t.offers.detail.makeCounterOffer}
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
                {t.offers.detail.rejectOffer}
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
                {t.offers.detail.acceptOffer}
              </button>
            )}
          </div>
        )}

        {/* Offer History Timeline (Sprint 8) */}
        {offer.history && offer.history.length > 0 && (
          <OfferHistoryTimeline
            history={offer.history}
            currentOfferId={offer.id}
            currentStatus={offer.status}
          />
        )}

        {/* Offer Negotiation & Messages Area (Sprint 7) */}
        <div className="pt-2">
          <OfferChat offerId={offer.id} offerStatus={offer.status} />
        </div>
      </div>

      {/* Counter Offer Modal (Sprint 8) */}
      <CounterOfferModal
        isOpen={isCounterModalOpen}
        parentOfferId={offer.id}
        counterpartyId={otherParty.id}
        counterpartyName={otherParty.name}
        initialOfferedItemIds={offer.requestedItems.map((i) => i.id)}
        initialRequestedItemIds={offer.offeredItems.map((i) => i.id)}
        onClose={() => setIsCounterModalOpen(false)}
      />
    </div>
  )
}
