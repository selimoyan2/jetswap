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
import { useLanguage } from '@/i18n'
import { getOfferStatusLabel, formatLocalizedDate } from '@/i18n/helpers'

interface OfferHistoryTimelineProps {
  history?: OfferRevisionSummary[]
  currentOfferId: string
  currentStatus: TradeOfferStatus
}

export function OfferHistoryTimeline({
  history,
  currentOfferId,
  currentStatus,
}: OfferHistoryTimelineProps) {
  const { t, language } = useLanguage()

  if (!history || history.length <= 1) {
    return null
  }

  const latestRevision = history[history.length - 1]
  const isViewingSuperseded = currentStatus === 'COUNTER_OFFERED'

  return (
    <div className="rounded-2xl bg-zinc-50/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800/80 p-5 space-y-4">
      {/* Alert when viewing an older superseded revision */}
      {isViewingSuperseded && latestRevision && latestRevision.id !== currentOfferId && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-800 dark:text-amber-300 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              {t.offers.detail.supersededNotice}
            </span>
          </div>
          <Link
            href={`/offers/${latestRevision.id}`}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-black font-semibold text-xs flex items-center gap-1.5 hover:bg-amber-400 transition-colors flex-shrink-0"
          >
            <span>{t.offers.detail.goToLatestRevision}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{t.offers.detail.offerTimelineTitle}</h3>
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          {history.length} {t.offers.detail.revisionCount}
        </span>
      </div>

      {/* Timeline entries */}
      <div className="space-y-3 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
        {history.map((rev) => {
          const isCurrent = rev.id === currentOfferId
          const effectiveStatus = isCurrent ? (currentStatus || rev.status) : rev.status
          const statusLabel = getOfferStatusLabel(effectiveStatus, language)

          let statusColor = 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
          let StatusIcon = Clock

          if (effectiveStatus === 'COUNTER_OFFERED') {
            statusColor = 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20'
            StatusIcon = GitCommit
          } else if (effectiveStatus === 'ACCEPTED' || effectiveStatus === 'COMPLETED') {
            statusColor = 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
            StatusIcon = CheckCircle2
          } else if (effectiveStatus === 'REJECTED') {
            statusColor = 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'
            StatusIcon = XCircle
          } else if (effectiveStatus === 'CANCELLED') {
            statusColor = 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
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
                    : 'bg-white dark:bg-zinc-900 border-zinc-400 dark:border-zinc-600'
                }`}
              />

              <div
                className={`p-3.5 rounded-xl border transition-colors ${
                  isCurrent
                    ? 'bg-white dark:bg-zinc-900/90 border-emerald-500/40 ring-1 ring-emerald-500/20 shadow-xs'
                    : 'bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-2xs'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-200">
                      Rev #{rev.revision}
                    </span>

                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                        {t.offers.detail.currentViewTag}
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
                      className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors font-medium"
                    >
                      <span>{t.offers.detail.inspectRevision}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex items-center justify-center flex-shrink-0 text-zinc-400">
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
                      {language === 'tr' ? 'Teklif Eden:' : 'Offered by:'} <strong className="text-zinc-900 dark:text-zinc-200">{rev.sender.name}</strong>
                    </span>
                  </div>

                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {formatLocalizedDate(rev.createdAt, language)}
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
