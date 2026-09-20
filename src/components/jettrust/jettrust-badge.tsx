'use client'

import React, { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { JetTrustLevel, JetTrustResult } from '@/lib/jettrust/types'
import { JetTrustDetailModal } from './jettrust-detail-modal'

interface JetTrustBadgeProps {
  userId?: string
  userName?: string
  score?: number
  level?: JetTrustLevel
  label?: string
  size?: 'xs' | 'sm' | 'md'
  showLabel?: boolean
  interactive?: boolean
  className?: string
}

export function JetTrustBadge({
  userId,
  userName,
  score: initialScore,
  level: initialLevel,
  label: initialLabel,
  size = 'sm',
  showLabel = true,
  interactive = true,
  className = '',
}: JetTrustBadgeProps) {
  const [fetchedData, setFetchedData] = useState<JetTrustResult | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const score = initialScore !== undefined ? initialScore : fetchedData?.score
  const level = initialLevel !== undefined ? initialLevel : fetchedData?.level
  const label = initialLabel !== undefined ? initialLabel : fetchedData?.label

  useEffect(() => {
    if (initialScore !== undefined || !userId) return

    let cancelled = false
    fetch(`/api/users/${userId}/jettrust`)
      .then((res) => res.json())
      .then((resData) => {
        if (!cancelled && resData.success && resData.data) {
          setFetchedData(resData.data)
        }
      })
      .catch(() => {
        // Silent fallback for non-critical badge
      })

    return () => {
      cancelled = true
    }
  }, [userId, initialScore])

  if (score === undefined) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-zinc-400 text-[11px] animate-pulse ${className}`}
      >
        <ShieldCheck className="w-3 h-3 text-zinc-500" />
        <span>JetTrust...</span>
      </span>
    )
  }

  const effectiveLevel = level || 'NEW'
  const effectiveLabel = label || 'Yeni'

  const levelStyles = {
    HIGH_TRUST: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20',
    TRUSTED: 'bg-teal-500/10 text-teal-400 border-teal-500/30 hover:bg-teal-500/20',
    ESTABLISHED: 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20',
    DEVELOPING: 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20',
    NEW: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30 hover:bg-zinc-500/20',
  }[effectiveLevel]

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3.5 py-1.5 gap-2',
  }[size]

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  }[size]

  return (
    <>
      <button
        type="button"
        onClick={() => interactive && setModalOpen(true)}
        disabled={!interactive}
        title={`JetTrust Skoru: ${score}/100 (${effectiveLabel})`}
        className={`inline-flex items-center rounded-full font-bold border transition-all ${
          interactive ? 'cursor-pointer' : 'cursor-default'
        } ${sizeClasses} ${levelStyles} ${className}`}
      >
        <ShieldCheck className={`${iconSizes} shrink-0`} />
        <span>JetTrust {score}</span>
        {showLabel && (
          <>
            <span className="opacity-40">•</span>
            <span className="font-semibold">{effectiveLabel}</span>
          </>
        )}
      </button>

      {interactive && (
        <JetTrustDetailModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          userId={userId}
          initialData={fetchedData}
          userName={userName}
        />
      )}
    </>
  )
}
