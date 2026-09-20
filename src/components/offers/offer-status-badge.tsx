'use client'

import React from 'react'
import { TradeOfferStatus } from '@prisma/client'
import { useLanguage } from '@/i18n'
import { getOfferStatusLabel } from '@/i18n/helpers'

interface OfferStatusBadgeProps {
  status: TradeOfferStatus
  className?: string
}

export const OfferStatusBadge: React.FC<OfferStatusBadgeProps> = ({ status, className = '' }) => {
  const { language } = useLanguage()
  const label = getOfferStatusLabel(status, language)

  switch (status) {
    case 'PENDING':
      return (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
          {label}
        </span>
      )
    case 'ACCEPTED':
      return (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
          {label}
        </span>
      )
    case 'REJECTED':
      return (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5" />
          {label}
        </span>
      )
    case 'CANCELLED':
      return (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 ${className}`}
        >
          {label}
        </span>
      )
    case 'COUNTER_OFFERED':
      return (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20 ${className}`}
        >
          {label}
        </span>
      )
    case 'COMPLETED':
      return (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-500 border border-purple-500/20 ${className}`}
        >
          {label}
        </span>
      )
    default:
      return (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 ${className}`}
        >
          {label}
        </span>
      )
  }
}
