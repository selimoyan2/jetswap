'use client'

import React, { useEffect, useState } from 'react'
import {
  ShieldCheck,
  X,
  Calendar,
  UserCheck,
  ArrowLeftRight,
  Star,
  Activity,
  AlertCircle,
  Loader2,
  Info,
} from 'lucide-react'
import { JetTrustResult } from '@/lib/jettrust/types'

interface JetTrustDetailModalProps {
  isOpen: boolean
  onClose: () => void
  userId?: string
  initialData?: JetTrustResult | null
  userName?: string
}

export function JetTrustDetailModal({
  isOpen,
  onClose,
  userId,
  initialData,
  userName,
}: JetTrustDetailModalProps) {
  const [fetchedData, setFetchedData] = useState<JetTrustResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const data = initialData ?? fetchedData
  const loading = !data && !error && Boolean(userId)

  useEffect(() => {
    if (!isOpen || initialData || !userId) return

    let cancelled = false

    fetch(`/api/users/${userId}/jettrust`)
      .then((res) => res.json())
      .then((resData) => {
        if (cancelled) return
        if (resData.success) {
          setFetchedData(resData.data)
        } else {
          setError(resData.error?.message || 'JetTrust bilgisi alınamadı.')
        }
      })
      .catch(() => {
        if (!cancelled) setError('Bağlantı hatası oluştu.')
      })

    return () => {
      cancelled = true
    }
  }, [isOpen, userId, initialData])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-white space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="jettrust-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 id="jettrust-modal-title" className="text-base font-bold text-white">
                JetTrust Güven Profili
              </h3>
              {userName && (
                <p className="text-xs text-zinc-400 font-medium">{userName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        {loading ? (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-400 mx-auto" />
            <p className="text-xs text-zinc-400 font-medium">
              Güven verileri analiz ediliyor...
            </p>
          </div>
        ) : error || !data ? (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error || 'Güven profili yüklenemedi.'}</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Score Banner */}
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Toplam Güven Skoru
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-white">{data.score}</span>
                  <span className="text-sm font-bold text-zinc-500">/ 100</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Güven Seviyesi
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    data.level === 'HIGH_TRUST'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : data.level === 'TRUSTED'
                      ? 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                      : data.level === 'ESTABLISHED'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      : data.level === 'DEVELOPING'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {data.label}
                </span>
              </div>
            </div>

            {/* 5 Component Breakdown */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Puan Dağılımı
              </h4>

              {/* 1. Account Foundation */}
              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-zinc-300">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span>Hesap Geçmişi</span>
                  </div>
                  <span className="font-bold text-white">
                    {data.components.accountFoundation}{' '}
                    <span className="text-zinc-500 font-normal">/ 15</span>
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${(data.components.accountFoundation / 15) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* 2. Profile Completeness */}
              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-zinc-300">
                    <UserCheck className="w-4 h-4 text-teal-400" />
                    <span>Profil Tamlığı</span>
                  </div>
                  <span className="font-bold text-white">
                    {data.components.profileCompleteness}{' '}
                    <span className="text-zinc-500 font-normal">/ 10</span>
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${(data.components.profileCompleteness / 10) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* 3. Completed Trades */}
              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-zinc-300">
                    <ArrowLeftRight className="w-4 h-4 text-indigo-400" />
                    <span>Tamamlanan Takaslar</span>
                  </div>
                  <span className="font-bold text-white">
                    {data.components.completedTrades}{' '}
                    <span className="text-zinc-500 font-normal">/ 35</span>
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${(data.components.completedTrades / 35) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* 4. Review Reputation */}
              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-zinc-300">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span>Değerlendirmeler</span>
                  </div>
                  <span className="font-bold text-white">
                    {data.components.reviewReputation}{' '}
                    <span className="text-zinc-500 font-normal">/ 30</span>
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${(data.components.reviewReputation / 30) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* 5. Trade Reliability */}
              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-zinc-300">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>Takas Sürekliliği</span>
                  </div>
                  <span className="font-bold text-white">
                    {data.components.tradeReliability}{' '}
                    <span className="text-zinc-500 font-normal">/ 10</span>
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${(data.components.tradeReliability / 10) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Explanations List */}
            {data.explanations.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Öne Çıkan Güven Sinyalleri
                </h4>
                <ul className="space-y-1.5 text-xs text-zinc-300">
                  {data.explanations.map((exp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{exp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Platform Disclaimer */}
            <div className="p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 flex items-start gap-2.5 text-[11px] text-zinc-400 leading-relaxed">
              <Info className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
              <span>{data.disclaimer}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
