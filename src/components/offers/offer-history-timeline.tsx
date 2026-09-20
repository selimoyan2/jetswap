'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  History,
  GitCommit,
  CheckCircle2,
  Clock,
  XCircle,
  Ban,
  ArrowRight,
  AlertTriangle,
  User as UserIcon,
} from 'lucide-react'
import { TradeOfferStatus } from '@prisma/client'
import { OfferRevisionSummary } from '@/lib/offers/types'

interface OfferHistoryTimelineProps {
  history?: OfferRevisionSummary[]
  currentOfferId: string
  currentStatus: TradeOfferStatus
}

function formatRevisionDate(isoString: string): string {
  try {
    const d = new Date(isoString)
    const months = [
      'Oca',
      'Şub',
      'Mar',
      'Nis',
      'May',
      'Haz',
      'Tem',
      'Ağu',
      'Eyl',
      'Eki',
      'Kas',
      'Ara',
    ]
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} ${hours}:${minutes}`
  } catch {
    return ''
  }
}

export function OfferHistoryTimeline({
  history,
  currentOfferId,
  currentStatus,
}: OfferHistoryTimelineProps) {
  if (!history || history.length <= 1) {
    return null
  }

  const latestRevision = history[history.length - 1]
  const isViewingSuperseded = currentStatus === 'COUNTER_OFFERED'

  return (
    <div className="rounded-2xl bg-zinc-950/80 border border-zinc-800/80 p-5 space-y-4">
      {/* Alert when viewing an older superseded revision */}
      {isViewingSuperseded && latestRevision && latestRevision.id !== currentOfferId && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-300 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span>
              Bu revizyon geçmişte kaldı. Güncel teklif şartlarını incelemek için en son revizyona gidebilirsiniz.
            </span>
          </div>
          <Link
            href={`/offers/${latestRevision.id}`}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-black font-semibold text-xs flex items-center gap-1.5 hover:bg-amber-400 transition-colors flex-shrink-0"
          >
            <span>Güncel Teklife Git</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Teklif Geçmişi</h3>
        </div>
        <span className="text-xs text-zinc-400 font-medium">
          {history.length} revizyon
        </span>
      </div>

      {/* Timeline entries */}
      <div className="space-y-3 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-800">
        {history.map((rev) => {
          const isCurrent = rev.id === currentOfferId
          const effectiveStatus = isCurrent ? (currentStatus || rev.status) : rev.status

          let statusLabel = 'Bekliyor'
          let statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20'
          let StatusIcon = Clock

          if (effectiveStatus === 'COUNTER_OFFERED') {
            statusLabel = 'Karşı Teklif Yapıldı'
            statusColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20'
            StatusIcon = GitCommit
          } else if (effectiveStatus === 'ACCEPTED') {
            statusLabel = 'Kabul Edildi'
            statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            StatusIcon = CheckCircle2
          } else if (effectiveStatus === 'COMPLETED') {
            statusLabel = 'Tamamlandı'
            statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            StatusIcon = CheckCircle2
          } else if (effectiveStatus === 'REJECTED') {
            statusLabel = 'Reddedildi'
            statusColor = 'text-red-400 bg-red-500/10 border-red-500/20'
            StatusIcon = XCircle
          } else if (effectiveStatus === 'CANCELLED') {
            statusLabel = 'İptal Edildi'
            statusColor = 'text-zinc-400 bg-zinc-800 border-zinc-700'
            StatusIcon = Ban
          }

          return (
            <div
              key={rev.id}
              className={`relative pl-8 transition-all ${
                isCurrent ? 'opacity-100' : 'opacity-80 hover:opacity-100'
              }`}
            >
              {/* Dot Icon */}
              <div
                className={`absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full border-2 -translate-x-1/2 flex items-center justify-center ${
                  isCurrent
                    ? 'bg-emerald-500 border-emerald-400 ring-4 ring-emerald-500/20'
                    : 'bg-zinc-900 border-zinc-600'
                }`}
              />

              <div
                className={`p-3.5 rounded-xl border transition-colors ${
                  isCurrent
                    ? 'bg-zinc-900/90 border-emerald-500/40 ring-1 ring-emerald-500/20'
                    : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-200">
                      Revizyon #{rev.revision}
                    </span>

                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Şu Anki Görünüm
                      </span>
                    )}

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium border flex items-center gap-1 ${statusColor}`}
                    >
                      <StatusIcon className="w-2.5 h-2.5" />
                      {statusLabel}
                    </span>
                  </div>

                  {!isCurrent && (
                    <Link
                      href={`/offers/${rev.id}`}
                      className="text-xs text-zinc-400 hover:text-emerald-400 flex items-center gap-1 transition-colors font-medium"
                    >
                      <span>İncele</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center flex-shrink-0 text-zinc-400">
                      {rev.sender.avatar ? (
                        <Image
                          src={rev.sender.avatar}
                          alt={rev.sender.name}
                          width={20}
                          height={20}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-3 h-3" />
                      )}
                    </div>
                    <span>
                      Teklif Eden: <strong className="text-zinc-200">{rev.sender.name}</strong>
                    </span>
                  </div>

                  <span className="text-[11px] text-zinc-500">
                    {formatRevisionDate(rev.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
