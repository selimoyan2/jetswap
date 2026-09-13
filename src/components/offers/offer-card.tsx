'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, User, Calendar, MessageSquare } from 'lucide-react'
import { SerializedTradeOffer } from '@/lib/offers/types'
import { OfferStatusBadge } from './offer-status-badge'

interface OfferCardProps {
  offer: SerializedTradeOffer
}

export const OfferCard: React.FC<OfferCardProps> = ({ offer }) => {
  const isSender = offer.viewerRole === 'SENDER'
  const otherParty = isSender ? offer.receiver : offer.sender
  const roleLabel = isSender ? 'Giden Teklif' : 'Gelen Teklif'

  const formattedDate = new Date(offer.createdAt).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  // Show summary count
  const offeredCount = offer.offeredItems.length
  const requestedCount = offer.requestedItems.length

  // Quick primary image
  const primaryRequested = offer.requestedItems[0]
  const primaryOffered = offer.offeredItems[0]

  return (
    <div className="group rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all p-5 flex flex-col justify-between gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[11px] font-medium uppercase tracking-wider px-2 py-0.5 rounded ${
                isSender
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {roleLabel}
            </span>
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden relative flex-shrink-0">
              {otherParty.avatar ? (
                <Image src={otherParty.avatar} alt={otherParty.name} fill className="object-cover" />
              ) : (
                <User className="w-3.5 h-3.5 text-zinc-400 m-auto" />
              )}
            </div>
            <span className="text-sm font-medium text-white">
              {isSender ? `Alıcı: ${otherParty.name}` : `Gönderen: ${otherParty.name}`}
            </span>
          </div>
        </div>

        <OfferStatusBadge status={offer.status} />
      </div>

      {/* Item Exchange Snapshot */}
      <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs">
        <div>
          <span className="text-zinc-500 block mb-1">Teklif Edilen ({offeredCount})</span>
          <p className="font-medium text-zinc-200 line-clamp-1">
            {primaryOffered ? primaryOffered.title : 'Ürün yok'}
            {offeredCount > 1 ? ` (+${offeredCount - 1})` : ''}
          </p>
        </div>
        <div>
          <span className="text-zinc-500 block mb-1">Talep Edilen ({requestedCount})</span>
          <p className="font-medium text-zinc-200 line-clamp-1">
            {primaryRequested ? primaryRequested.title : 'Ürün yok'}
            {requestedCount > 1 ? ` (+${requestedCount - 1})` : ''}
          </p>
        </div>
      </div>

      {/* Note preview if any */}
      {offer.note && (
        <div className="text-xs text-zinc-400 italic bg-zinc-900/40 px-3 py-2 rounded-lg border border-zinc-800/50 line-clamp-2 flex items-start gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-zinc-500 mt-0.5 flex-shrink-0" />
          <span>&ldquo;{offer.note}&rdquo;</span>
        </div>
      )}

      {/* Footer / Action */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
        <span className="text-xs text-zinc-500">
          {offer.status === 'PENDING' ? (
            offer.canAccept ? (
              <span className="text-amber-400 font-medium">Yanıtınız bekleniyor</span>
            ) : (
              <span className="text-zinc-400">Karşı tarafın yanıtı bekleniyor</span>
            )
          ) : (
            `Durum: ${offer.status}`
          )}
        </span>

        <Link
          href={`/offers/${offer.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Detayı Gör
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
